<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BorrowingHistory extends Model
{
    protected $fillable = [
        'transaction_id',
        'borrowing_id',
        'user_id',
        'action',
        'old_values',
        'new_values',
        'description',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
    ];

    /**
     * Get the borrowing that owns the history.
     */
    public function borrowing(): BelongsTo
    {
        return $this->belongsTo(Borrowing::class);
    }

    /**
     * Get the user that performed the action.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get action options for dropdown.
     */
    public static function getActionOptions(): array
    {
        return [
            'created' => 'Created',
            'updated' => 'Updated',
            'deleted' => 'Deleted',
            'status_changed' => 'Status Changed',
            'system_update' => 'System Update',
            'notification_sent' => 'Notification Sent',
            'reminder_sent' => 'Reminder Sent',
        ];
    }

    /**
     * Get action color for UI.
     */
    public function getActionColor(): string
    {
        return match($this->action) {
            'created' => 'green',
            'updated' => 'blue',
            'deleted' => 'red',
            'status_changed' => 'yellow',
            'system_update' => 'orange',
            'notification_sent' => 'purple',
            'reminder_sent' => 'indigo',
            default => 'gray',
        };
    }
}
