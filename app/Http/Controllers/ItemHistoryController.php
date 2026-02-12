<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\ItemHistory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ItemHistoryController extends Controller
{
    /**
     * Display the history for a specific item.
     */
    public function index(Request $request, Item $item)
    {
        $search = $request->input('search');
        $action = $request->input('action');
        
        $query = $item->history()->with('user');
        
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('description', 'like', '%' . $search . '%')
                  ->orWhere('action', 'like', '%' . $search . '%');
            });
        }
        
        if ($action) {
            $query->where('action', $action);
        }
        
        $history = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('Items/History', [
            'item' => $item,
            'history' => $history,
            'filters' => $request->only(['search', 'action']),
        ]);
    }
}
