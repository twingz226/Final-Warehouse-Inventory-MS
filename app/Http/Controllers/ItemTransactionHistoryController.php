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

        $transactions = $query->oldest('created_at')->paginate(20)->withQueryString();

        $items = Item::orderBy('name')->get()->map(function ($item) {
            $totalDistributed = Purchase::where('item_name', $item->name)
                ->whereIn('status', ['received', 'completed'])
                ->sum('quantity');
            
            return [
                'id' => $item->id,
                'name' => $item->name,
                'description' => $item->description,
                'category' => $item->category,
                'total_stock' => $item->quantity,
                'unit' => $item->unit,
                'total_distributed' => $totalDistributed,
                'available_stock' => $item->quantity - $totalDistributed,
                'date_time' => $item->date_time,
                'created_at' => $item->created_at,
                'updated_at' => $item->updated_at,
            ];
        });

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
