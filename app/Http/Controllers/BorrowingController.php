<?php

namespace App\Http\Controllers;

use App\Models\Borrowing;
use App\Models\BorrowingHistory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class BorrowingController extends Controller
{
    /**
     * Log borrowing history.
     */
    private function logHistory(Borrowing $borrowing, string $action, ?array $oldValues = null, ?array $newValues = null, ?string $description = null): void
    {
        BorrowingHistory::create([
            'borrowing_id' => $borrowing->id,
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
        $status = $request->input('status');

        $query = Borrowing::with('creator')
            ->latest();

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('borrowings.borrower_name', 'like', '%' . $search . '%')
                  ->orWhere('borrowings.item_name', 'like', '%' . $search . '%');
            });
        }

        if ($date) {
            $query->whereDate('borrowings.borrow_date', $date);
        }

        if ($status) {
            if ($status === 'active') {
                $query->whereIn('borrowings.status', ['borrowed', 'overdue']);
            } else {
                $query->where('borrowings.status', $status);
            }
        }

        $borrowings = $query->paginate(10)->withQueryString();

        return Inertia::render('Borrowed/Index', [
            'borrowings' => $borrowings,
            'status' => session('status'),
            'statusOptions' => ['' => 'All Status'] + Borrowing::getStatusOptions(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Borrowed/Form', [
            'statusOptions' => Borrowing::getStatusOptions(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'borrower_name' => 'required|string|max:255',
            'items' => 'required|array|min:1',
            'items.*.item_name' => 'required|string|max:255',
            'items.*.tool_id' => 'nullable|string|max:255',
            'items.*.quantity' => 'required|integer|min:1',
            'borrow_date' => 'required|date',
            'expected_return_date' => 'required|date|after_or_equal:borrow_date',
            'status' => 'required|in:borrowed,returned,overdue',
        ]);

        $validated['created_by'] = Auth::id();

        foreach ($validated['items'] as $itemData) {
            $borrowingData = array_merge(
                // Remove the items array from the base array
                collect($validated)->except('items')->toArray(),
                $itemData
            );

            $borrowing = Borrowing::create($borrowingData);

            $this->logHistory($borrowing, 'created', null, $borrowingData, "Created borrowing record for '{$borrowing->item_name}' by {$borrowing->borrower_name}");
        }

        return redirect()
            ->route('borrowings.index')
            ->with('status', 'Borrowing record created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Borrowing $borrowing)
    {
        $borrowing->load(['creator', 'histories.user']);

        return Inertia::render('Borrowed/Show', [
            'borrowing' => $borrowing,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Borrowing $borrowing)
    {
        return Inertia::render('Borrowed/Form', [
            'borrowing' => $borrowing,
            'statusOptions' => Borrowing::getStatusOptions(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Borrowing $borrowing)
    {
        $oldValues = $borrowing->toArray();

        $validated = $request->validate([
            'borrower_name' => 'required|string|max:255',
            'items' => 'required|array|min:1',
            'items.*.item_name' => 'required|string|max:255',
            'items.*.tool_id' => 'nullable|string|max:255',
            'items.*.quantity' => 'required|integer|min:1',
            'borrow_date' => 'required|date',
            'expected_return_date' => 'required|date|after_or_equal:borrow_date',
            'actual_return_date' => 'nullable|date|after_or_equal:borrow_date',
            'status' => 'required|in:borrowed,returned,overdue',
        ]);

        $oldStatus = $borrowing->status;
        $updateData = collect($validated)->except('items')->toArray();
        // For updates, since the form passes the single array, we merge that item 0
        $updateData = array_merge($updateData, $validated['items'][0]);
        $borrowing->update($updateData);

        // Generate description based on what changed
        $changes = [];
        if ($oldValues['borrower_name'] !== $updateData['borrower_name']) {
            $changes[] = "borrower from '{$oldValues['borrower_name']}' to '{$updateData['borrower_name']}'";
        }
        if ($oldValues['item_name'] !== $updateData['item_name']) {
            $changes[] = "item from '{$oldValues['item_name']}' to '{$updateData['item_name']}'";
        }
        if ($oldStatus !== $updateData['status']) {
            $changes[] = "status from {$oldStatus} to {$updateData['status']}";
        }

        $action = $oldStatus !== $updateData['status'] ? 'status_changed' : 'updated';
        $description = count($changes) > 0 ? ucfirst($action) . " " . implode(', ', $changes) : ucfirst($action) . " borrowing record";

        $this->logHistory($borrowing, $action, $oldValues, $updateData, $description);

        return redirect()
            ->route('borrowings.index')
            ->with('status', 'Borrowing record updated successfully.');
    }

    /**
     * Return a borrowed item.
     */
    public function returnItem(Borrowing $borrowing)
    {
        if ($borrowing->status !== 'borrowed') {
            return redirect()
                ->route('borrowings.index')
                ->with('error', 'Only borrowed items can be returned.');
        }

        $oldValues = $borrowing->toArray();
        $oldStatus = $borrowing->status;

        $borrowing->update([
            'status' => 'returned',
            'actual_return_date' => now(),
        ]);

        $newValues = $borrowing->toArray();
        $this->logHistory($borrowing, 'status_changed', $oldValues, $newValues, "Status changed from {$oldStatus} to returned");

        return redirect()
            ->route('borrowings.index')
            ->with('status', 'Item returned successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Borrowing $borrowing)
    {
        $oldValues = $borrowing->toArray();
        $itemName = $borrowing->item_name;
        $borrowerName = $borrowing->borrower_name;

        // Log history before deleting
        $this->logHistory($borrowing, 'deleted', $oldValues, null, "Deleted borrowing record for '{$itemName}' by {$borrowerName}");

        $borrowing->delete();

        return redirect()
            ->route('borrowings.index')
            ->with('status', 'Borrowing record deleted successfully.');
    }
}
