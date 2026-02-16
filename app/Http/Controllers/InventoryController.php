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
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }
        
        // Apply category filter
        if ($request->filled('category')) {
            $category = $request->get('category');
            if ($category !== 'all') {
                $query->where('category', $category);
            }
        }
        
        // Apply stock level filter
        if ($request->filled('stock_level')) {
            $stockLevel = $request->get('stock_level');
            $query->where('quantity', '>=', 0); // Base condition
            
            switch ($stockLevel) {
                case 'out_of_stock':
                    $query->where('quantity', '=', 0);
                    break;
                case 'low_stock':
                    $query->where('quantity', '>', 0)->where('quantity', '<=', 10);
                    break;
                case 'normal_stock':
                    $query->where('quantity', '>', 5)->where('quantity', '<=', 50);
                    break;
                case 'high_stock':
                    $query->where('quantity', '>', 50);
                    break;
            }
        }
        
        // Apply date range filter
        if ($request->filled('date_from')) {
            $query->whereDate('date_time', '>=', $request->get('date_from'));
        }
        
        if ($request->filled('date_to')) {
            $query->whereDate('date_time', '<=', $request->get('date_to'));
        }
        
        // Apply sorting
        $sortBy = $request->get('sort_by', 'name');
        $sortOrder = $request->get('sort_order', 'asc');
        
        $validSortFields = ['name', 'category', 'quantity', 'date_time', 'created_at'];
        if (in_array($sortBy, $validSortFields)) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->orderBy('name', 'asc');
        }
        
        $items = $query->get()->map(function ($item) {
            $totalDistributed = Purchase::where('item_name', $item->name)
                ->sum('quantity');
            
            return (object) [
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
                'stock_level' => $request->get('stock_level', 'all'),
                'date_from' => $request->get('date_from', ''),
                'date_to' => $request->get('date_to', ''),
                'sort_by' => $request->get('sort_by', 'name'),
                'sort_order' => $request->get('sort_order', 'asc'),
            ],
        ]);
    }
}
