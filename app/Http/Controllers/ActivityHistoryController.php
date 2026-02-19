<?php

namespace App\Http\Controllers;

use App\Models\ActivityHistory;
use App\Models\Item;
use App\Models\Purchase;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ActivityHistoryController extends Controller
{
    /**
     * Display the global activity history for all items and distributions.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $activityType = $request->input('activity_type');
        $date_from = $request->input('date_from');
        $date_to = $request->input('date_to');
        
        $query = ActivityHistory::with(['user', 'item', 'purchase', 'borrowing']);
        
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('description', 'like', '%' . $search . '%')
                  ->orWhere('action', 'like', '%' . $search . '%')
                  ->orWhereHas('item', function($itemQuery) use ($search) {
                      $itemQuery->where('name', 'like', '%' . $search . '%');
                  })
                  ->orWhereHas('purchase', function($purchaseQuery) use ($search) {
                      $purchaseQuery->where('item_name', 'like', '%' . $search . '%')
                                   ->orWhere('supplier_name', 'like', '%' . $search . '%');
                  })
                  ->orWhereHas('borrowing', function($borrowingQuery) use ($search) {
                      $borrowingQuery->where('borrower_name', 'like', '%' . $search . '%')
                                   ->orWhere('item_name', 'like', '%' . $search . '%');
                  });
            });
        }
        
        if ($activityType) {
            $query->where('activity_type', $activityType);
        }
        
        if ($date_from) {
            $query->whereDate('created_at', '>=', $date_from);
        }
        
        if ($date_to) {
            $query->whereDate('created_at', '<=', $date_to);
        }
        
        $history = $query->latest()->paginate(25)->withQueryString();
        
        // Get all items for filter dropdown
        $items = Item::orderBy('name')->get(['id', 'name']);
        
        // Get all distributions for filter dropdown
        $distributions = Purchase::orderBy('item_name')->get(['id', 'item_name', 'supplier_name']);

        return Inertia::render('ActivityHistory', [
            'history' => $history,
            'items' => $items,
            'distributions' => $distributions,
            'filters' => $request->only(['search', 'activity_type', 'date_from', 'date_to']),
            'activityTypes' => ActivityHistory::getActivityTypeOptions(),
        ]);
    }
}
