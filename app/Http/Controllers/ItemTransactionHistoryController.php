<?php

namespace App\Http\Controllers;

use App\Models\Purchase;
use App\Models\Item;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ItemTransactionHistoryController extends Controller
{
    /**
     * Display a listing of the item transactions.
     *
     * Pagination is applied to the GROUPS (by item_name or by date),
     * not to individual transaction rows. This prevents the same item
     * from appearing as a duplicate group across different pages.
     */
    public function index(Request $request)
    {
        $itemName = $request->input('item_name');
        $searchQuery = $request->input('search');

        // ── Step 1: Build a query for the groups and paginate them ──────────

        if ($itemName) {
            // When a specific item is selected, group by date
            $groupQuery = Purchase::selectRaw('DATE(created_at) as group_key, COUNT(*) as transaction_count')
                ->whereIn('status', ['received', 'completed'])
                ->where('item_name', $itemName);

            if ($searchQuery) {
                $groupQuery->where(function ($q) use ($searchQuery) {
                    $q->where('supplier_name', 'like', '%' . $searchQuery . '%')
                      ->orWhere('project_name', 'like', '%' . $searchQuery . '%');
                });
            }

            $paginatedGroups = $groupQuery
                ->groupBy('group_key')
                ->orderBy('group_key')
                ->paginate(20)
                ->withQueryString();

            $groupKeys = collect($paginatedGroups->items())->pluck('group_key');

            // ── Step 2: Fetch ALL transactions for the groups on this page ──
            $transactionQuery = Purchase::select('id', 'item_name', 'quantity', 'supplier_name', 'project_name', 'issued_to', 'created_at', 'purchase_date')
                ->whereIn('status', ['received', 'completed'])
                ->where('item_name', $itemName)
                ->whereIn(DB::raw('DATE(created_at)'), $groupKeys->toArray());

            if ($searchQuery) {
                $transactionQuery->where(function ($q) use ($searchQuery) {
                    $q->where('supplier_name', 'like', '%' . $searchQuery . '%')
                      ->orWhere('project_name', 'like', '%' . $searchQuery . '%');
                });
            }

            $transactions = $transactionQuery->oldest('created_at')->get();

        } else {
            // When no item is selected, group by item_name
            $groupQuery = Purchase::select('item_name', DB::raw('COUNT(*) as transaction_count'))
                ->whereIn('status', ['received', 'completed']);

            if ($searchQuery) {
                $groupQuery->where(function ($q) use ($searchQuery) {
                    $q->where('item_name', 'like', '%' . $searchQuery . '%')
                      ->orWhere('supplier_name', 'like', '%' . $searchQuery . '%')
                      ->orWhere('project_name', 'like', '%' . $searchQuery . '%');
                });
            }

            $paginatedGroups = $groupQuery
                ->groupBy('item_name')
                ->orderBy('item_name')
                ->paginate(20)
                ->withQueryString();

            $groupKeys = collect($paginatedGroups->items())->pluck('item_name');

            // ── Step 2: Fetch ALL transactions for the items on this page ──
            $transactionQuery = Purchase::select('id', 'item_name', 'quantity', 'supplier_name', 'project_name', 'issued_to', 'created_at', 'purchase_date')
                ->whereIn('status', ['received', 'completed'])
                ->whereIn('item_name', $groupKeys->toArray());

            if ($searchQuery) {
                $transactionQuery->where(function ($q) use ($searchQuery) {
                    $q->where('item_name', 'like', '%' . $searchQuery . '%')
                      ->orWhere('supplier_name', 'like', '%' . $searchQuery . '%')
                      ->orWhere('project_name', 'like', '%' . $searchQuery . '%');
                });
            }

            $transactions = $transactionQuery->oldest('created_at')->get();
        }

        // ── Extract pagination metadata (without the group summary data) ──
        $paginationData = $paginatedGroups->toArray();
        unset($paginationData['data']);

        // ── Items with stock info ──────────────────────────────────────────
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
            'pagination' => $paginationData,
            'items' => $items,
            'filters' => $request->only(['item_name', 'search']),
            'item' => $item,
        ]);
    }
}
