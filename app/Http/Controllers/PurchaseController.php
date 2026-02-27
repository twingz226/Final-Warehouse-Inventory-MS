<?php

namespace App\Http\Controllers;

use App\Models\Purchase;
use App\Models\PurchaseHistory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Pagination\LengthAwarePaginator;

class PurchaseController extends Controller
{
    /**
     * Log purchase history.
     */
    private function logHistory(Purchase $purchase, string $action, ?array $oldValues = null, ?array $newValues = null, ?string $description = null): void
    {
        PurchaseHistory::create([
            'purchase_id' => $purchase->id,
            'user_id' => Auth::id(),
            'action' => $action,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'description' => $description,
        ]);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $date = $request->input('date');
        
        // 1. First, paginate the distinct project groups
        $groupQuery = Purchase::select('purchases.supplier_name', 'purchases.purchase_date')
            ->groupBy('purchases.supplier_name', 'purchases.purchase_date')
            ->orderBy('purchases.purchase_date', 'desc')
            ->orderBy('purchases.supplier_name', 'asc');
        
        if ($search) {
            $groupQuery->where(function($q) use ($search) {
                $q->where('purchases.supplier_name', 'like', '%' . $search . '%')
                  ->orWhere('purchases.item_name', 'like', '%' . $search . '%')
                  ->orWhere('purchases.description', 'like', '%' . $search . '%');
            });
        }
        
        if ($date) {
            $groupQuery->whereDate('purchases.purchase_date', $date);
        }
        
        $paginatedGroups = $groupQuery->paginate(10);
        $groups = $paginatedGroups->items();

        // 2. Fetch all items matching the groups on this specific page
        $purchasesForGroups = collect();
        if (count($groups) > 0) {
            $itemQuery = Purchase::with('creator')
                ->leftJoin('items', 'purchases.item_name', '=', 'items.name')
                ->select('purchases.*', 'items.category as item_category', 'items.unit as item_unit')
                ->where(function($q) use ($groups) {
                    foreach ($groups as $group) {
                        $q->orWhere(function($sq) use ($group) {
                            $sq->where('purchases.supplier_name', $group->supplier_name)
                               ->where('purchases.purchase_date', $group->purchase_date);
                        });
                    }
                })
                ->orderBy('purchases.purchase_date', 'desc')
                ->orderBy('purchases.supplier_name', 'asc');
            
            $purchasesForGroups = $itemQuery->get();
        }

        // 3. Instead of returning individuals, wrap the items into a paginator 
        // that preserves the total page values from the distinct group paginator
        $purchases = new LengthAwarePaginator(
            $purchasesForGroups,
            $paginatedGroups->total(),
            $paginatedGroups->perPage(),
            $paginatedGroups->currentPage(),
            ['path' => LengthAwarePaginator::resolveCurrentPath(), 'query' => $request->query()]
        );

        return Inertia::render('Purchases/Index', [
            'purchases' => $purchases,
            'status' => session('status'),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Purchases/Form');
    }

    /**
     * Store a newly created resource in storage.
     * Accepts an 'items' array to create multiple Purchase records in one submission.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'supplier_name'          => 'required|string|max:255',
            'os'                     => 'nullable|string|max:255',
            'issued_by'              => 'nullable|string|max:255',
            'issued_to'              => 'nullable|string|max:255',
            'purchase_date'          => 'required|date',
            'notes'                  => 'nullable|string',
            'project_type'           => 'nullable|string|max:255',
            'project_name'           => 'nullable|string|max:255',
            'items'                  => 'required|array|min:1',
            'items.*.item_name'      => 'required|string|max:255',
            'items.*.quantity'       => 'required|integer|min:1',
            'items.*.description'    => 'nullable|string',
        ]);

        $shared = [
            'supplier_name'  => $validated['supplier_name'],
            'os'             => $validated['os'] ?? null,
            'issued_by'      => $validated['issued_by'] ?? null,
            'issued_to'      => $validated['issued_to'] ?? null,
            'purchase_date'  => $validated['purchase_date'],
            'notes'          => $validated['notes'] ?? null,
            'project_type'   => $validated['project_type'] ?? null,
            'project_name'   => $validated['project_name'] ?? null,
            'status'         => 'received',
            'created_by'     => Auth::id(),
        ];

        DB::transaction(function () use ($shared, $validated) {
            foreach ($validated['items'] as $itemRow) {
                $data = array_merge($shared, [
                    'item_name'   => $itemRow['item_name'],
                    'quantity'    => $itemRow['quantity'],
                    'description' => $itemRow['description'] ?? null,
                ]);

                $purchase = Purchase::create($data);

                $this->logHistory(
                    $purchase,
                    'created',
                    null,
                    $data,
                    "Created distribution order for '{$purchase->item_name}' to {$purchase->supplier_name}"
                );
            }
        });

        return redirect()
            ->route('purchases.index')
            ->with('status', 'Distribution order created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Purchase $purchase)
    {
        $purchase->load(['creator', 'histories.user']);
        
        $groupItems = Purchase::where('purchases.supplier_name', $purchase->supplier_name)
            ->where('purchases.purchase_date', $purchase->purchase_date)
            ->leftJoin('items', 'purchases.item_name', '=', 'items.name')
            ->select('purchases.*', 'items.category as item_category', 'items.unit as item_unit')
            ->get();

        return Inertia::render('Purchases/Show', [
            'purchase' => $purchase,
            'groupItems' => $groupItems,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Purchase $purchase)
    {
        return Inertia::render('Purchases/Form', [
            'purchase' => $purchase,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Purchase $purchase)
    {
        $oldValues = $purchase->toArray();
        
        $validated = $request->validate([
            'supplier_name' => 'required|string|max:255',
            'os' => 'nullable|string|max:255',
            'issued_by' => 'nullable|string|max:255',
            'issued_to' => 'nullable|string|max:255',
            'item_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'quantity' => 'required|integer|min:1',
            'purchase_date' => 'required|date',
            'notes' => 'nullable|string',
            'project_type' => 'nullable|string|max:255',
            'project_name' => 'nullable|string|max:255',
        ]);

        $purchase->update($validated);

        // Generate description based on what changed
        $changes = [];
        if ($oldValues['supplier_name'] !== $validated['supplier_name']) {
            $changes[] = "destination from '{$oldValues['supplier_name']}' to '{$validated['supplier_name']}'";
        }
        if ($oldValues['item_name'] !== $validated['item_name']) {
            $changes[] = "item from '{$oldValues['item_name']}' to '{$validated['item_name']}'";
        }
        
        $description = count($changes) > 0 ? "Updated " . implode(', ', $changes) : "Updated distribution";
        
        $this->logHistory($purchase, 'updated', $oldValues, $validated, $description);

        return redirect()
            ->route('purchases.index')
            ->with('status', 'Distribution order updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Purchase $purchase)
    {
        $oldValues = $purchase->toArray();
        $itemName = $purchase->item_name;
        $supplierName = $purchase->supplier_name;
        
        // Log history before deleting
        $this->logHistory($purchase, 'deleted', $oldValues, null, "Deleted distribution order for '{$itemName}' to {$supplierName}");
        
        $purchase->delete();

        return redirect()
            ->route('purchases.index')
            ->with('status', 'Distribution order deleted successfully.');
    }
}
