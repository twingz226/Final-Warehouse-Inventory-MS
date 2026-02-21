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
        $sort = $request->input('sort', 'date_time');
        $direction = $request->input('direction', 'desc');
        
        // Validate sort column and direction for security
        $allowedSorts = ['name', 'quantity', 'date_time', 'created_at'];
        $sort = in_array($sort, $allowedSorts) ? $sort : 'date_time';
        $direction = in_array(strtolower($direction), ['asc', 'desc']) ? $direction : 'desc';
        
        $query = Item::query();
        
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                  ->orWhere('description', 'like', '%' . $search . '%');
            });
        }
        
        if ($date) {
            $query->whereDate('date_time', $date);
        }
        
        // Apply sorting
        $query->orderBy($sort, $direction);
        
        $items = $query->paginate(10)->withQueryString();

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
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'required|in:tool,material',
            'quantity' => 'required|numeric|min:0',
            'unit' => 'required|in:Quantity,Kg',
            'date_time' => 'nullable|string',
        ]);

        // Always set current datetime since frontend field is read-only
        $validated['date_time'] = now();

        $item = Item::create($validated);

        $this->logHistory($item, 'created', null, $validated, "Created '{$item->name}' with quantity {$item->quantity}");

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
            'name' => 'required|string|max:255',
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
            $changes[] = "name from '{$oldValues['name']}' to '{$validated['name']}'";
        }
        if ($oldValues['quantity'] != $validated['quantity']) {
            $changes[] = "quantity from {$oldValues['quantity']} to {$validated['quantity']}";
        }
        if ($oldValues['description'] !== $validated['description']) {
            $changes[] = "description";
        }
        if ($oldValues['category'] !== $validated['category']) {
            $changes[] = "category from '{$oldValues['category']}' to '{$validated['category']}'";
        }
        if ($oldValues['unit'] !== $validated['unit']) {
            $changes[] = "unit from '{$oldValues['unit']}' to '{$validated['unit']}'";
        }
        
        $description = count($changes) > 0 ? "Updated " . implode(', ', $changes) : "Updated item";
        
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
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                  ->orWhere('description', 'like', '%' . $search . '%');
            });
        }
        
        $items = $query->get()->map(function ($item) {
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
        })->filter()->take(50)->values();
                
        return response()->json($items);
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
        $this->logHistory($item, 'deleted', $oldValues, null, "Deleted '{$itemName}'");
        
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
            'items' => Item::select('id', 'name', 'description', 'quantity', 'unit')->get(),
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
            "Added {$validated['quantity']} {$item->unit} to stock. Quantity changed from {$oldQuantity} to {$item->quantity}"
        );

        return redirect()
            ->route('items.index')
            ->with('status', "Stock added successfully. {$item->name} now has {$item->quantity} {$item->unit}.");
    }
}
