<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\ItemHistory;
use App\Models\Purchase;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\ItemsImport;
use App\Models\ActivityHistory;

class ItemController extends Controller
{
    /**
     * Log item history.
     */
    private function logHistory(Item $item, string $action, ?array $oldValues = null, ?array $newValues = null, ?string $description = null, ?string $transactionId = null): void
    {
        ItemHistory::create([
            'transaction_id' => $transactionId,
            'item_id' => $item->id,
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
        // Get date from request, default to today if not provided
        $date = $request->input('date', now()->toDateString());
        $sort = $request->input('sort', 'name');
        $direction = $request->input('direction', 'asc');

        // Debug logging
        \Illuminate\Support\Facades\Log::info('ItemController::index called', [
            'search' => $search,
            'date' => $date,
            'sort' => $sort,
            'direction' => $direction
        ]);

        // Validate sort column and direction for security
        $allowedSorts = ['name', 'quantity', 'date_time', 'created_at'];
        $sort = in_array($sort, $allowedSorts) ? $sort : 'name';
        $direction = in_array(strtolower($direction), ['asc', 'desc']) ? $direction : 'asc';

        $query = Item::query();

        if ($search) {
            // When searching, don't filter by date - search across all items
            $query->with(['history' => function ($historyQuery) {
                $historyQuery->whereIn('action', ['created', 'stock_added', 'updated'])
                             ->latest();
            }]);
        } else {
            // No search - filter by date as before
            $query->whereHas('history', function ($historyQuery) use ($date) {
                $historyQuery->whereIn('action', ['created', 'stock_added', 'updated'])
                             ->whereDate('created_at', $date);
            });

            $query->with(['history' => function ($historyQuery) use ($date) {
                $historyQuery->whereIn('action', ['created', 'stock_added', 'updated'])
                             ->whereDate('created_at', $date)
                             ->latest();
            }]);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                    ->orWhere('description', 'like', '%' . $search . '%');
            });
            \Illuminate\Support\Facades\Log::info('Search query applied', ['search' => $search]);
        }

        // Apply sorting
        $query->orderBy($sort, $direction);

        $items = $query->paginate(10)->withQueryString();

        \Illuminate\Support\Facades\Log::info('Query results', [
            'total_items' => $items->total(),
            'current_page' => $items->currentPage(),
            'per_page' => $items->perPage()
        ]);

        if ($search) {
            // When searching, use the most recent history record for each item
            $items->getCollection()->transform(function ($item) {
                $mostRecentHistory = $item->history->first(); // Already sorted by latest()
                
                // Calculate available stock same as Inventory menu
                $totalDistributed = \App\Models\Purchase::where('item_name', $item->name)
                    ->whereIn('status', ['received', 'completed'])
                    ->sum('quantity');
                $availableStock = $item->quantity - $totalDistributed;

                if ($mostRecentHistory) {
                    $item->date_time = $mostRecentHistory->created_at;
                    // For 'stock_added', calculate the difference. For 'created' or 'updated', use 'new_values.quantity'
                    if ($mostRecentHistory->action === 'stock_added' && isset($mostRecentHistory->new_values['quantity'], $mostRecentHistory->old_values['quantity'])) {
                        $item->quantity = $mostRecentHistory->new_values['quantity'] - $mostRecentHistory->old_values['quantity'];
                    } elseif (in_array($mostRecentHistory->action, ['created', 'updated']) && isset($mostRecentHistory->new_values['quantity'])) {
                        $item->quantity = $mostRecentHistory->new_values['quantity'];
                    }
                }
                // Add total_stock field for badge calculation (using available stock)
                $item->total_stock = $availableStock;
                return $item;
            });
        } elseif ($date) {
            // When not searching, filter by specific date with new logic for same-day multiple actions
            $items->getCollection()->transform(function ($item) use ($date) {
                // Get all history records for the specific date
                $dateHistory = $item->history->filter(function ($history) use ($date) {
                    return $history->created_at->format('Y-m-d') === $date;
                });
                
                // Calculate available stock same as Inventory menu
                $totalDistributed = \App\Models\Purchase::where('item_name', $item->name)
                    ->whereIn('status', ['received', 'completed'])
                    ->sum('quantity');
                $availableStock = $item->quantity - $totalDistributed;

                if ($dateHistory->isNotEmpty()) {
                    $mostRecentHistory = $dateHistory->first(); // Most recent action for this date
                    $item->date_time = $mostRecentHistory->created_at;

                    // Calculate cumulative stock added on this date
                    $totalAddedOnDate = 0;
                    foreach ($dateHistory as $history) {
                        if ($history->action === 'stock_added' && isset($history->new_values['quantity'], $history->old_values['quantity'])) {
                            $totalAddedOnDate += ($history->new_values['quantity'] - $history->old_values['quantity']);
                        } elseif (in_array($history->action, ['created', 'updated']) && isset($history->new_values['quantity'])) {
                            $totalAddedOnDate = $history->new_values['quantity'];
                        }
                    }
                    $item->quantity = $totalAddedOnDate;
                }
                // Add total_stock field for badge calculation (using available stock)
                $item->total_stock = $availableStock;
                return $item;
            });
        }

        return Inertia::render('Items/Index', [
            'items' => $items,
            'status' => session('status'),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Items/Form');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        if ($request->has('items')) {
            $validated = $request->validate([
                'items' => 'required|array|min:1',
                'items.*.name' => 'required|string|max:255|unique:items,name|distinct',
                'items.*.description' => 'nullable|string',
                'items.*.category' => 'required|in:tool,material',
                'items.*.quantity' => 'required|numeric|min:0',
                'items.*.unit' => 'required|in:Quantity,Kg,pcs',
            ]);

            $createdCount = 0;
            DB::transaction(function () use ($validated, &$createdCount) {
                foreach ($validated['items'] as $itemData) {
                    $itemData['date_time'] = now();
                    $item = Item::create($itemData);

                    $unit = in_array($item->unit, ['Quantity', 'pcs']) ? 'pcs' : 'kg';
                    $this->logHistory($item, 'created', null, $itemData, "New item '{$item->name}' added — {$item->quantity} {$unit} in stock.");
                    $createdCount++;
                }
            });

            $msg = $createdCount > 1 
                ? "{$createdCount} items created successfully."
                : "Item created successfully.";

            return redirect()
                ->route('items.index')
                ->with('status', $msg);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:items,name',
            'description' => 'nullable|string',
            'category' => 'required|in:tool,material',
            'quantity' => 'required|numeric|min:0',
            'unit' => 'required|in:Quantity,Kg,pcs',
            'date_time' => 'nullable|string',
        ]);

        // Always set current datetime since frontend field is read-only
        $validated['date_time'] = now();

        $item = Item::create($validated);

        $unit = in_array($item->unit, ['Quantity', 'pcs']) ? 'pcs' : 'kg';
        $this->logHistory($item, 'created', null, $validated, "New item '{$item->name}' added — {$item->quantity} {$unit} in stock.");

        return redirect()
            ->route('items.index')
            ->with('status', 'Item created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Item $item)
    {
        return Inertia::render('Items/Show', [
            'item' => $item,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Item $item)
    {
        return Inertia::render('Items/Form', [
            'item' => $item,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Item $item)
    {
        $oldValues = $item->toArray();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('items', 'name')->ignore($item->id)],
            'description' => 'nullable|string',
            'category' => 'required|in:tool,material',
            'quantity' => 'required|numeric|min:0',
            'unit' => 'required|in:Quantity,Kg,pcs',
            'date_time' => 'nullable|string',
        ]);

        // Always set current datetime when updating
        $validated['date_time'] = now();

        DB::transaction(function () use ($item, $validated, $oldValues) {
            $item->update($validated);

            // If name changed, update all related records in other tables
            // This is critical for data synchronization across the system
            if ($oldValues['name'] !== $validated['name']) {
                DB::table('purchases')
                    ->where('item_name', $oldValues['name'])
                    ->update(['item_name' => $validated['name']]);

                DB::table('borrowings')
                    ->where('item_name', $oldValues['name'])
                    ->update(['item_name' => $validated['name']]);
            }
        });

        // Generate description based on what changed
        $changes = [];
        if ($oldValues['name'] !== $validated['name']) {
            $changes[] = "• Name: \"{$oldValues['name']}\" → \"{$validated['name']}\"";
        }
        if ($oldValues['quantity'] != $validated['quantity']) {
            $unit = in_array($validated['unit'], ['Quantity', 'pcs']) ? 'pcs' : 'kg';
            $changes[] = "• Quantity: {$oldValues['quantity']} → {$validated['quantity']} {$unit}";
        }
        if ($oldValues['description'] !== $validated['description']) {
            $changes[] = "• Description updated";
        }
        if ($oldValues['category'] !== $validated['category']) {
            $changes[] = "• Category: {$oldValues['category']} → {$validated['category']}";
        }
        if ($oldValues['unit'] !== $validated['unit']) {
            $changes[] = "• Unit: {$oldValues['unit']} → {$validated['unit']}";
        }

        $description = count($changes) > 0
            ? "'{$item->name}' was updated:\n" . implode("\n", $changes)
            : "'{$item->name}' details reviewed — no changes made.";

        $this->logHistory($item, 'updated', $oldValues, $validated, $description);

        return redirect()
            ->route('items.index')
            ->with('status', 'Item updated successfully.');
    }

    /**
     * Search items for autocomplete dropdown.
     */
    public function searchItems(Request $request)
    {
        $search = $request->input('search');
        $category = $request->input('category');

        $query = Item::query();

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                  ->orWhere('description', 'like', '%' . $search . '%')
                  ->orWhere('category', 'like', '%' . $search . '%');
            });
        }

        if (!empty($category) && in_array($category, ['tool', 'material'])) {
            $query->where('category', $category);
        }

        $items = $query->orderBy('name')->take(50)->get()->map(function ($item) {
            $totalDistributed = Purchase::where('item_name', $item->name)
                ->where('status', 'received')
                ->sum('quantity');

            $available = $item->quantity - $totalDistributed;

            return [
                'id' => $item->id,
                'name' => $item->name,
                'description' => $item->description,
                'category' => $item->category,
                'quantity' => $available,
                'available_stock' => $available,
                'unit' => $item->unit,
                'stock_level' => $this->getStockLevel($available),
            ];
        })->values();

        return response()->json($items);
    }

    /**
     * Determine stock level for visual indicators.
     */
    private function getStockLevel(int $available)
    {
        if ($available <= 5) return 'critical';
        if ($available <= 10) return 'low';
        if ($available <= 25) return 'medium';
        return 'high';
    }

    /**
     * Check if an item name already exists (for real-time validation).
     */
    public function checkName(Request $request)
    {
        $name    = $request->input('name', '');
        $ignoreId = $request->input('ignore_id'); // current item ID when editing

        $query = Item::whereRaw('LOWER(name) = ?', [strtolower(trim($name))]);

        if ($ignoreId) {
            $query->where('id', '!=', $ignoreId);
        }

        return response()->json(['exists' => $query->exists()]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Item $item)
    {
        $oldValues = $item->toArray();
        $itemName = $item->name;
        $itemId = $item->id;

        // Log history before deleting
        $this->logHistory($item, 'deleted', $oldValues, null, "\u2018{$itemName}\u2019 has been removed from inventory.");

        $item->delete();

        return redirect()
            ->route('items.index')
            ->with('status', 'Item deleted successfully.');
    }

    /**
     * Show the form for adding incoming stock to an existing item.
     */
    public function addStock()
    {
        return Inertia::render('Items/AddStock', [
            // Don't pass all items at once to avoid memory crash. 
            // We pass an empty array because we'll shift the combobox to an async search endpoint.
            'items' => [],
        ]);
    }

    /**
     * Store the incoming stock addition.
     */
    public function storeStock(Request $request)
    {
        // Check if this is a single item or multiple items submission
        if ($request->has('items')) {
            return $this->storeMultipleStock($request);
        }
        
        // Single item validation and processing
        $validated = $request->validate([
            'item_id' => 'required|exists:items,id',
            'quantity' => 'required|numeric|min:0.01',
        ]);

        $item = Item::findOrFail($validated['item_id']);
        $oldValues = $item->toArray();
        $oldQuantity = $item->quantity;

        // Add the incoming quantity to the existing quantity
        $item->quantity += $validated['quantity'];
        $item->date_time = now();
        $item->save();

        $newValues = $item->toArray();

        $this->logHistory(
            $item,
            'stock_added',
            $oldValues,
            $newValues,
            (function() use ($validated, $item, $oldQuantity) {
                $unit = $item->unit === 'Kg' ? 'kg' : 'pcs';
                return "+{$validated['quantity']} {$unit} added to '{$item->name}' — stock updated from {$oldQuantity} to {$item->quantity} {$unit}.";
            })()
        );

        return redirect()
            ->route('items.index')
            ->with('status', "Stock added successfully. {$item->name} now has {$item->quantity} {$item->unit}.");
    }

    /**
     * Store multiple stock additions.
     */
    private function storeMultipleStock(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.item_id' => 'required|exists:items,id',
            'items.*.quantity' => 'required|numeric|min:0.01',
        ]);

        $processedItems = [];
        $errors = [];
        // Generate a unique transaction ID for this batch operation
        $transactionId = 'STOCK-' . strtoupper(uniqid());

        DB::transaction(function () use ($validated, &$processedItems, &$errors, $transactionId) {
            foreach ($validated['items'] as $index => $itemData) {
                try {
                    $item = Item::findOrFail($itemData['item_id']);
                    $oldValues = $item->toArray();
                    $oldQuantity = $item->quantity;

                    // Add the incoming quantity to the existing quantity
                    $item->quantity += $itemData['quantity'];
                    $item->date_time = now();
                    $item->save();

                    $newValues = $item->toArray();

                    $this->logHistory(
                        $item,
                        'stock_added',
                        $oldValues,
                        $newValues,
                        (function() use ($itemData, $item, $oldQuantity) {
                            $unit = $item->unit === 'Kg' ? 'kg' : 'pcs';
                            return "+{$itemData['quantity']} {$unit} added to '{$item->name}' — stock updated from {$oldQuantity} to {$item->quantity} {$unit}.";
                        })(),
                        $transactionId
                    );

                    $processedItems[] = [
                        'name' => $item->name,
                        'old_quantity' => $oldQuantity,
                        'added_quantity' => $itemData['quantity'],
                        'new_quantity' => $item->quantity,
                        'unit' => $item->unit,
                    ];
                } catch (\Exception $e) {
                    $errors[] = "Failed to update item at position " . ($index + 1) . ": " . $e->getMessage();
                }
            }
        });

        if (!empty($errors)) {
            return redirect()
                ->route('items.add-stock')
                ->withErrors(['items' => implode(', ', $errors)])
                ->withInput();
        }

        $message = "Stock added successfully to " . count($processedItems) . " item(s):";
        foreach ($processedItems as $processed) {
            $unit = $processed['unit'] === 'Kg' ? 'kg' : 'pcs';
            $message .= " {$processed['name']} ({$processed['old_quantity']} → {$processed['new_quantity']} {$unit}),";
        }
        $message = rtrim($message, ',');

        return redirect()
            ->route('items.index')
            ->with('status', $message);
    }

    /**
     * Import items from Excel file.
     */
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls|max:2048',
        ]);

        try {
            DB::transaction(function () use ($request) {
                $file = $request->file('file');
                $headingRow = 1;

                // Auto-detect heading row by scanning the first 30 rows
                $rows = Excel::toArray(new class implements \Maatwebsite\Excel\Concerns\ToArray {
                    public function array(array $array) { return $array; }
                }, $file)[0] ?? [];

                foreach ($rows as $index => $row) {
                    if ($index > 30) break;
                    // Ignore empty rows
                    if (empty(array_filter($row))) continue;
                    
                    $rowStr = strtolower(implode(' ', array_filter(array_map('trim', $row))));
                    // Stricter check: needs 'description', or both 'item' and 'name'
                    if (strpos($rowStr, 'description') !== false || (strpos($rowStr, 'item') !== false && strpos($rowStr, 'name') !== false)) {
                        $headingRow = $index + 1; // 1-based index
                        break;
                    }
                }

                Excel::import(new ItemsImport($headingRow), $file);
            });

            // Items import handles creating/updating items.
            // Further history logging can be implemented on an item-by-item basis.

            return redirect()->route('items.index')->with('status', 'Items imported successfully.');
        } catch (\Maatwebsite\Excel\Validators\ValidationException $e) {
            $failures = $e->failures();
            $errors = [];
            foreach ($failures as $failure) {
                $errors[] = "Row {$failure->row()}: " . implode(', ', $failure->errors());
            }
            return redirect()->back()->withErrors(['import' => implode('; ', $errors)]);
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['import' => 'Import failed: ' . $e->getMessage()]);
        }
    }
}
