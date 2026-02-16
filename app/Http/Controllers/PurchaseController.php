<?php

namespace App\Http\Controllers;

use App\Models\Purchase;
use App\Models\PurchaseHistory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class PurchaseController extends Controller
{
    /**
     * Log purchase history.
     */
    private function logHistory(Purchase $purchase, string $action, ?array $oldValues = null, ?array $newValues = null, ?string $description = null): void
    {
        PurchaseHistory::create([
            'purchase_id' => $purchase->id,
            'user_id' => Auth::id(),
            'action' => $action,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'description' => $description,
        ]);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $date = $request->input('date');
        $status = $request->input('status');
        
        $query = Purchase::with('creator')
            ->leftJoin('items', 'purchases.item_name', '=', 'items.name')
            ->select('purchases.*', 'items.category as item_category')
            ->latest();
        
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('purchases.supplier_name', 'like', '%' . $search . '%')
                  ->orWhere('purchases.item_name', 'like', '%' . $search . '%')
                  ->orWhere('purchases.description', 'like', '%' . $search . '%');
            });
        }
        
        if ($date) {
            $query->whereDate('purchases.purchase_date', $date);
        }
        
        if ($status) {
            $query->where('purchases.status', $status);
        }
        
        $purchases = $query->paginate(10)->withQueryString();

        return Inertia::render('Purchases/Index', [
            'purchases' => $purchases,
            'status' => session('status'),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Purchases/Form');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_name' => 'required|string|max:255',
            'supplier_email' => 'nullable|email|max:255',
            'supplier_phone' => 'nullable|string|max:20',
            'item_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'quantity' => 'required|integer|min:1',
            'purchase_date' => 'required|date',
            'notes' => 'nullable|string',
            'project_type' => 'nullable|string|max:255',
            'project_name' => 'nullable|string|max:255',
        ]);

        $validated['created_by'] = Auth::id();

        $purchase = Purchase::create($validated);

        $this->logHistory($purchase, 'created', null, $validated, "Created distribution order for '{$purchase->item_name}' to {$purchase->supplier_name}");

        return redirect()
            ->route('purchases.index')
            ->with('status', 'Distribution order created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Purchase $purchase)
    {
        $purchase->load(['creator', 'histories.user']);

        return Inertia::render('Purchases/Show', [
            'purchase' => $purchase,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Purchase $purchase)
    {
        return Inertia::render('Purchases/Form', [
            'purchase' => $purchase,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Purchase $purchase)
    {
        $oldValues = $purchase->toArray();
        
        $validated = $request->validate([
            'supplier_name' => 'required|string|max:255',
            'supplier_email' => 'nullable|email|max:255',
            'supplier_phone' => 'nullable|string|max:20',
            'item_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'quantity' => 'required|integer|min:1',
            'purchase_date' => 'required|date',
            'notes' => 'nullable|string',
            'project_type' => 'nullable|string|max:255',
            'project_name' => 'nullable|string|max:255',
        ]);

        $purchase->update($validated);

        // Generate description based on what changed
        $changes = [];
        if ($oldValues['supplier_name'] !== $validated['supplier_name']) {
            $changes[] = "destination from '{$oldValues['supplier_name']}' to '{$validated['supplier_name']}'";
        }
        if ($oldValues['item_name'] !== $validated['item_name']) {
            $changes[] = "item from '{$oldValues['item_name']}' to '{$validated['item_name']}'";
        }
        
        $description = count($changes) > 0 ? "Updated " . implode(', ', $changes) : "Updated distribution";
        
        $this->logHistory($purchase, 'updated', $oldValues, $validated, $description);

        return redirect()
            ->route('purchases.index')
            ->with('status', 'Distribution order updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Purchase $purchase)
    {
        $oldValues = $purchase->toArray();
        $itemName = $purchase->item_name;
        $supplierName = $purchase->supplier_name;
        
        // Log history before deleting
        $this->logHistory($purchase, 'deleted', $oldValues, null, "Deleted distribution order for '{$itemName}' to {$supplierName}");
        
        $purchase->delete();

        return redirect()
            ->route('purchases.index')
            ->with('status', 'Distribution order deleted successfully.');
    }
}
