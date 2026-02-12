<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\Purchase;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    /**
     * Display the inventory management dashboard.
     */
    public function index(Request $request)
    {
        $query = Item::query();
        
        // Apply search filter
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where('name', 'like', "%{$search}%");
        }
        
        // Apply category filter
        if ($request->filled('category')) {
            $category = $request->get('category');
            if ($category !== 'all') {
                $query->where('category', $category);
            }
        }
        
        $items = $query->get()->map(function ($item) {
            $totalDistributed = Purchase::where('item_name', $item->name)
                ->where('status', 'received')
                ->sum('quantity');
            
            return (object) [
                'id' => $item->id,
                'name' => $item->name,
                'description' => $item->description,
                'category' => $item->category,
                'total_stock' => $item->quantity,
                'total_distributed' => $totalDistributed,
                'available_stock' => $item->quantity - $totalDistributed,
                'date_time' => $item->date_time,
                'created_at' => $item->created_at,
                'updated_at' => $item->updated_at,
            ];
        });
        
        // Calculate summary metrics
        $allItems = Item::all();
        $summary = [
            'total_items' => $allItems->count(),
            'total_tools' => $allItems->where('category', 'tool')->count(),
            'total_materials' => $allItems->where('category', 'material')->count(),
            'total_distributed' => Purchase::where('status', 'received')->sum('quantity'),
            'total_available_stock' => $items->sum('available_stock'),
        ];
        
        return inertia('Inventory/Index', [
            'items' => $items,
            'summary' => $summary,
            'filters' => [
                'search' => $request->get('search', ''),
                'category' => $request->get('category', 'all'),
            ],
        ]);
    }
}
