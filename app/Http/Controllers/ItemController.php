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
    private function logHistory(Item $item, string $action, ?array $oldValues = null, ?array $newValues = null, ?string $description = null): void
    {
        ItemHistory::create([
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
        $date = $request->input('date', now()->toDateString());
        $sort = $request->input('sort', 'name');
        $direction = $request->input('direction', 'asc');

        // Validate sort column and direction for security
        $allowedSorts = ['name', 'quantity', 'date_time', 'created_at'];
        $sort = in_array($sort, $allowedSorts) ? $sort : 'name';
        $direction = in_array(strtolower($direction), ['asc', 'desc']) ? $direction : 'asc';

        $query = Item::query();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                    ->orWhere('description', 'like', '%' . $search . '%');
            });
        }

        if ($date) {
            $query->where(function ($q) use ($date) {
                $q->whereDate('date_time', $date)
                  ->orWhereHas('history', function ($q2) use ($date) {
                      $q2->whereIn('action', ['created', 'stock_added'])
                         ->whereDate('created_at', $date);
                  });
            });
            $query->with(['history' => function ($historyQuery) use ($date) {
                $historyQuery->whereIn('action', ['created', 'stock_added'])
                             ->whereDate('created_at', $date)
                             ->latest();
            }]);
        }

        // Apply sorting
        $query->orderBy($sort, $direction);

        $items = $query->paginate(10)->withQueryString();

        if ($date) {
            $items->getCollection()->transform(function ($item) use ($date) {
                if (!$item->date_time || $item->date_time->format('Y-m-d') !== $date) {
                    // Use eager-loaded history
                    $matchingHistory = $item->history->first();
                    if ($matchingHistory) {
                        $item->date_time = $matchingHistory->created_at;
                        // For 'stock_added', calculate the difference. For 'created', use 'new_values.quantity'
                        if ($matchingHistory->action === 'stock_added' && isset($matchingHistory->new_values['quantity'], $matchingHistory->old_values['quantity'])) {
                            $item->quantity = $matchingHistory->new_values['quantity'] - $matchingHistory->old_values['quantity'];
                        } elseif ($matchingHistory->action === 'created' && isset($matchingHistory->new_values['quantity'])) {
                            $item->quantity = $matchingHistory->new_values['quantity'];
                        }
                    }
                }
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
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:items,name',
            'description' => 'nullable|string',
            'category' => 'required|in:tool,material',
            'quantity' => 'required|numeric|min:0',
            'unit' => 'required|in:Quantity,Kg',
            'date_time' => 'nullable|string',
        ]);

        // Always set current datetime since frontend field is read-only
        $validated['date_time'] = now();

        $item = Item::create($validated);

        $unit = $item->unit === 'Kg' ? 'kg' : 'pcs';
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
            'unit' => 'required|in:Quantity,Kg',
            'date_time' => 'nullable|string',
        ]);

        // Always set current datetime when updating
        $validated['date_time'] = now();

        $item->update($validated);

        // Generate description based on what changed
        $changes = [];
        if ($oldValues['name'] !== $validated['name']) {
            $changes[] = "• Name: \"{$oldValues['name']}\" → \"{$validated['name']}\"";
        }
        if ($oldValues['quantity'] != $validated['quantity']) {
            $unit = $validated['unit'] === 'Kg' ? 'kg' : 'pcs';
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

        $query = Item::query();

        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                    ->orWhere('description', 'like', '%' . $search . '%');
            });
        }

        $items = $query->take(50)->get()->map(function ($item) {
            $totalDistributed = Purchase::where('item_name', $item->name)
                ->where('status', 'received')
                ->sum('quantity');

            $available = $item->quantity - $totalDistributed;

            if ($available <= 0) {
                return null; // Skip items with no available stock
            }

            return [
                'id' => $item->id,
                'name' => $item->name,
                'description' => $item->description,
                'quantity' => $available,
            ];
        })->filter()->values();

        return response()->json($items);
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
     * Import items from Excel file.
     */
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls|max:2048',
        ]);

        try {
            DB::transaction(function () use ($request) {
                Excel::import(new ItemsImport, $request->file('file'));
            });

            // Log activity
            ActivityHistory::create([
                'user_id' => Auth::id(),
                'action' => 'import',
                'description' => 'Imported items from Excel file',
            ]);

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
