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
                  ->orWhere('borrowings.item_name', 'like', '%' . $search . '%')
                  ->orWhere('borrowings.description', 'like', '%' . $search . '%');
            });
        }

        if ($date) {
            $query->whereDate('borrowings.borrow_date', $date);
        }

        if ($status) {
            $query->where('borrowings.status', $status);
        }

        $borrowings = $query->paginate(10)->withQueryString();

        return Inertia::render('Borrowed/Index', [
            'borrowings' => $borrowings,
            'status' => session('status'),
            'statusOptions' => ['' => 'All Statuses'] + Borrowing::getStatusOptions(),
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
            'borrower_email' => 'nullable|email|max:255',
            'borrower_phone' => 'nullable|string|max:20',
            'item_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'quantity' => 'required|integer|min:1',
            'borrow_date' => 'required|date',
            'expected_return_date' => 'required|date|after_or_equal:borrow_date',
            'status' => 'required|in:borrowed,returned,overdue',
            'notes' => 'nullable|string',
            'project_type' => 'nullable|string|max:255',
            'project_name' => 'nullable|string|max:255',
        ]);

        $validated['created_by'] = Auth::id();

        $borrowing = Borrowing::create($validated);

        $this->logHistory($borrowing, 'created', null, $validated, "Created borrowing record for '{$borrowing->item_name}' by {$borrowing->borrower_name}");

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
            'borrower_email' => 'nullable|email|max:255',
            'borrower_phone' => 'nullable|string|max:20',
            'item_name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'quantity' => 'required|integer|min:1',
            'borrow_date' => 'required|date',
            'expected_return_date' => 'required|date|after_or_equal:borrow_date',
            'actual_return_date' => 'nullable|date|after_or_equal:borrow_date',
            'status' => 'required|in:borrowed,returned,overdue',
            'notes' => 'nullable|string',
            'project_type' => 'nullable|string|max:255',
            'project_name' => 'nullable|string|max:255',
        ]);

        $oldStatus = $borrowing->status;
        $borrowing->update($validated);

        // Generate description based on what changed
        $changes = [];
        if ($oldValues['borrower_name'] !== $validated['borrower_name']) {
            $changes[] = "borrower from '{$oldValues['borrower_name']}' to '{$validated['borrower_name']}'";
        }
        if ($oldValues['item_name'] !== $validated['item_name']) {
            $changes[] = "item from '{$oldValues['item_name']}' to '{$validated['item_name']}'";
        }
        if ($oldStatus !== $validated['status']) {
            $changes[] = "status from {$oldStatus} to {$validated['status']}";
        }

        $action = $oldStatus !== $validated['status'] ? 'status_changed' : 'updated';
        $description = count($changes) > 0 ? ucfirst($action) . " " . implode(', ', $changes) : ucfirst($action) . " borrowing record";

        $this->logHistory($borrowing, $action, $oldValues, $validated, $description);

        return redirect()
            ->route('borrowings.index')
            ->with('status', 'Borrowing record updated successfully.');
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
