<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Config;

class Borrowing extends Model
{
    protected $fillable = [
        'borrower_name',
        'borrower_email',
        'borrower_phone',
        'item_name',
        'description',
        'quantity',
        'borrow_date',
        'expected_return_date',
        'actual_return_date',
        'status',
        'notes',
        'project_type',
        'project_name',
        'created_by',
    ];

    protected $casts = [
        'borrow_date' => 'datetime',
        'expected_return_date' => 'datetime',
        'actual_return_date' => 'datetime',
        'quantity' => 'integer',
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        // Check and update overdue status when retrieving borrowed items
        static::retrieved(function ($borrowing) {
            if (config('borrowing.auto_update_overdue.enabled', true) && 
                config('borrowing.auto_update_overdue.check_on_retrieve', true)) {
                if ($borrowing->status === 'borrowed' && $borrowing->isActuallyOverdue()) {
                    $borrowing->updateOverdueStatus();
                }
            }
        });
    }

    /**
     * The validation rules for the model.
     *
     * @var array
     */
    public static $rules = [
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
    ];

    /**
     * Get the history records for the borrowing.
     */
    public function histories(): HasMany
    {
        return $this->hasMany(BorrowingHistory::class)->latest();
    }

    /**
     * Get the user who created the borrowing.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Check if the borrowing is overdue.
     */
    public function isOverdue(): bool
    {
        return $this->status === 'borrowed' && $this->expected_return_date->isPast();
    }

    /**
     * Check if the borrowing is actually overdue considering grace period.
     */
    public function isActuallyOverdue(): bool
    {
        if ($this->status !== 'borrowed') {
            return false;
        }

        $gracePeriod = config('borrowing.grace_period', 0);
        $effectiveDueTime = $this->expected_return_date->addMinutes($gracePeriod);
        
        return $effectiveDueTime->isPast();
    }

    /**
     * Get the effective due time considering grace period.
     */
    public function getEffectiveDueTime()
    {
        $gracePeriod = config('borrowing.grace_period', 0);
        return $this->expected_return_date->addMinutes($gracePeriod);
    }

    /**
     * Update status to overdue if past due date (for real-time updates).
     */
    public function updateOverdueStatus(): bool
    {
        if ($this->isActuallyOverdue()) {
            $oldValues = $this->toArray();
            $this->update(['status' => 'overdue']);

            // Log the automatic status change
            BorrowingHistory::create([
                'borrowing_id' => $this->id,
                'user_id' => 1, // System user ID
                'action' => 'system_update',
                'old_values' => $oldValues,
                'new_values' => $this->toArray(),
                'description' => 'System automatically marked item as overdue (expected return: ' . $this->expected_return_date->format('M j, Y g:i A') . ')',
            ]);

            return true;
        }

        return false;
    }

    /**
     * Scope to get overdue items.
     */
    public function scopeOverdue($query)
    {
        return $query->where('status', 'overdue')
            ->orWhere(function($q) {
                $q->where('status', 'borrowed')
                  ->where('expected_return_date', '<', now());
            });
    }

    /**
     * Get status options for dropdown.
     */
    public static function getStatusOptions(): array
    {
        return [
            'borrowed' => 'Borrowed',
            'returned' => 'Returned',
            'overdue' => 'Overdue',
        ];
    }

    /**
     * Get status color for UI.
     */
    public function getStatusColor(): string
    {
        return match($this->status) {
            'borrowed' => 'blue',
            'returned' => 'green',
            'overdue' => 'red',
            default => 'gray',
        };
    }

    /**
     * Get days until expected return or days overdue.
     */
    public function getDaysUntilReturn(): int
    {
        if ($this->status === 'returned') {
            return 0;
        }

        return now()->diffInDays($this->expected_return_date, false);
    }

    /**
     * Validate the model attributes against the validation rules.
     *
     * @return void
     * @throws \Illuminate\Validation\ValidationException
     */
    public function validate()
    {
        $validator = Validator::make($this->attributes, static::$rules);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }
    }
}
