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
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }
        
        // Apply category filter
        if ($request->filled('category')) {
            $category = $request->input('category');
            if ($category !== 'all') {
                $query->where('category', $category);
            }
        }
        
        // Apply stock level filter
        if ($request->filled('stock_level')) {
            $stockLevel = $request->input('stock_level');
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
            $query->whereDate('date_time', '>=', $request->input('date_from'));
        }
        
        if ($request->filled('date_to')) {
            $query->whereDate('date_time', '<=', $request->input('date_to'));
        }
        
        // Apply sorting
        $sortBy = $request->input('sort_by', 'name');
        $sortOrder = $request->input('sort_order', 'asc');
        
        $validSortFields = ['name', 'category', 'quantity', 'date_time', 'created_at'];
        if (in_array($sortBy, $validSortFields)) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->orderBy('name', 'asc');
        }
        
        $items = $query->paginate(10)->through(function ($item) {
            $totalDistributed = Purchase::where('item_name', $item->name)
                ->where('status', 'received')
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

        // Fetch ALL low-stock items across all pages for the alert banner efficiently using DB
        $allLowStockItems = Item::select('id', 'name', 'unit', 'quantity')
            ->get()
            ->map(function ($item) {
                // Calculate total distributed using raw SQL
                $totalDistributed = Purchase::where('item_name', $item->name)
                    ->where('status', 'received')
                    ->sum('quantity');

                $availableStock = $item->quantity - $totalDistributed;

                if ($availableStock <= 10) {
                    return [
                        'id' => $item->id,
                        'name' => $item->name,
                        'unit' => $item->unit,
                        'available_stock' => $availableStock,
                    ];
                }
                return null;
            })->filter()->values();
        
        // Calculate summary metrics efficiently directly inside the database
        $totalItems = Item::count();
        $totalTools = Item::where('category', 'tool')->count();
        $totalMaterials = Item::where('category', 'material')->count();
        $totalQuantitySum = Item::sum('quantity');
        $totalDistributed = Purchase::where('status', 'received')->sum('quantity');
        
        $summary = [
            'total_items' => $totalItems,
            'total_tools' => $totalTools,
            'total_materials' => $totalMaterials,
            'total_distributed' => $totalDistributed,
            'total_available_stock' => $totalQuantitySum - $totalDistributed,
        ];
        
        return inertia('Inventory/Index', [
            'items' => $items,
            'low_stock_items' => $allLowStockItems,
            'summary' => $summary,
            'filters' => [
                'search' => $request->input('search', ''),
                'category' => $request->input('category', 'all'),
                'stock_level' => $request->input('stock_level', 'all'),
                'date_from' => $request->input('date_from', ''),
                'date_to' => $request->input('date_to', ''),
                'sort_by' => $request->input('sort_by', 'name'),
                'sort_order' => $request->input('sort_order', 'asc'),
            ],
        ]);
    }
}
