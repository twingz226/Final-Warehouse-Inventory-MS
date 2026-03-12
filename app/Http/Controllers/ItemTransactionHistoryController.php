<?php

namespace App\Http\Controllers;

use App\Models\Purchase;
use App\Models\Item;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ItemTransactionHistoryController extends Controller
{
    /**
     * Display a listing of the item transactions.
     */
    public function index(Request $request)
    {
        $itemName = $request->input('item_name');
        
        $query = Purchase::select('id', 'item_name', 'quantity', 'supplier_name', 'project_name', 'created_at', 'purchase_date')
            ->whereIn('status', ['received', 'completed']);
        
        if ($itemName) {
            $query->where('item_name', $itemName);
        }

        $transactions = $query->latest('created_at')->paginate(20)->withQueryString();

        $items = Item::orderBy('name')->get();

        $item = null;
        if ($itemName) {
            $item = Item::where('name', $itemName)->first();
        }

        return Inertia::render('ItemTransactionHistory', [
            'transactions' => $transactions,
            'items' => $items,
            'filters' => $request->only(['item_name']),
            'item' => $item,
        ]);
    }
}
