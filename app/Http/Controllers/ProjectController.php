<?php

namespace App\Http\Controllers;

use App\Models\Purchase;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProjectController extends Controller
{
    /**
     * Display a listing of projects (aggregated from received purchases).
     */
    public function index(Request $request)
    {
        // Fetch all received purchases ordered by destination (supplier) and then by date desc
        // We will group them visually on the frontend. We load items' categories as before.
        $purchases = Purchase::leftJoin('items', 'purchases.item_name', '=', 'items.name')
            ->select('purchases.*', 'items.category as item_category', 'items.unit as item_unit')
            ->whereIn('purchases.status', ['received', 'completed'])
            ->orderBy('purchases.supplier_name', 'asc')
            ->orderBy('purchases.purchase_date', 'asc')
            ->get();

        return Inertia::render('Projects/Index', [
            'purchases' => $purchases,
        ]);
    }
}
