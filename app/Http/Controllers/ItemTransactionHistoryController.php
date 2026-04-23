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
        $searchQuery = $request->input('search');
        
        $query = Purchase::select('id', 'item_name', 'quantity', 'supplier_name', 'project_name', 'issued_to', 'created_at', 'purchase_date')
            ->whereIn('status', ['received', 'completed'])
            ->distinct();
        
        if ($itemName) {
            $query->where('item_name', $itemName);
        }

        if ($searchQuery) {
            $query->where(function($q) use ($searchQuery) {
                $q->where('item_name', 'like', '%' . $searchQuery . '%')
                  ->orWhere('supplier_name', 'like', '%' . $searchQuery . '%')
                  ->orWhere('project_name', 'like', '%' . $searchQuery . '%');
            });
        }

        $transactions = $query->groupBy('id', 'item_name', 'quantity', 'supplier_name', 'project_name', 'issued_to', 'created_at', 'purchase_date')
            ->oldest('created_at')
            ->paginate(20)
            ->withQueryString();

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
            'filters' => $request->only(['item_name', 'search']),
            'item' => $item,
        ]);
    }
}
