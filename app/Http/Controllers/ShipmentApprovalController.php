<?php

namespace App\Http\Controllers;

use App\Models\ShipmentApproval;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ShipmentApprovalController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $date = $request->input('date');

        $query = ShipmentApproval::with('creator')->latest();

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('project_site_name', 'like', '%' . $search . '%')
                  ->orWhere('sa_number', 'like', '%' . $search . '%')
                  ->orWhere('description', 'like', '%' . $search . '%');
            });
        }

        $shipmentApprovals = $query->paginate(10)->withQueryString();

        return Inertia::render('ShipmentApproval/Index', [
            'shipmentApprovals' => $shipmentApprovals,
            'status' => session('status'),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $projectSiteNames = \App\Models\Purchase::whereNotNull('supplier_name')
            ->where('supplier_name', '!=', '')
            ->distinct()
            ->pluck('supplier_name');

        return Inertia::render('ShipmentApproval/Form', [
            'projectSiteNames' => $projectSiteNames
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function getProjectData($projectName)
    {
        $purchases = \App\Models\Purchase::where('supplier_name', $projectName)
            ->leftJoin('items', 'purchases.item_name', '=', 'items.name')
            ->latest('purchases.purchase_date')
            ->get([
                'purchases.id', 
                'purchases.item_name', 
                'purchases.quantity', 
                'purchases.purchase_date', 
                'purchases.created_at',
                'items.unit'
            ]);

        return response()->json($purchases);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'project_site_name' => 'required|string|max:255',
            'sa_number' => 'required|string|max:255',
            'tools_id' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'picture' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $picturePath = null;
        if ($request->hasFile('picture')) {
            $picturePath = $request->file('picture')->store('shipment-approvals', 'public');
        }

        ShipmentApproval::create([
            'project_site_name' => $validated['project_site_name'],
            'sa_number' => $validated['sa_number'],
            'tools_id' => $validated['tools_id'],
            'description' => $validated['description'],
            'picture' => $picturePath,
            'created_by' => Auth::id(),
        ]);

        return redirect()
            ->route('shipment-approvals.index')
            ->with('status', 'Shipment approval created successfully.');
    }
}
