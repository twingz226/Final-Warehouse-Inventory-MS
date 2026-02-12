<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityHistory extends Model
{
    protected $table = 'activity_history_unified';
    
    protected $fillable = [
        'activity_type',
        'entity_id',
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
     * Get the user that performed the action.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the related item (for item activities).
     */
    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class, 'entity_id');
    }

    /**
     * Get the related purchase (for distribution activities).
     */
    public function purchase(): BelongsTo
    {
        return $this->belongsTo(Purchase::class, 'entity_id');
    }

    /**
     * Get the related entity based on activity type.
     */
    public function getEntityAttribute()
    {
        return $this->activity_type === 'item' ? $this->item : $this->purchase;
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
        ];
    }

    /**
     * Get activity type options for dropdown.
     */
    public static function getActivityTypeOptions(): array
    {
        return [
            'item' => 'Items',
            'distribution' => 'Distributions',
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
            default => 'gray',
        };
    }

    /**
     * Get activity type color for UI.
     */
    public function getActivityTypeColor(): string
    {
        return match($this->activity_type) {
            'item' => 'blue',
            'distribution' => 'green',
            default => 'gray',
        };
    }

    /**
     * Get the route for the related entity.
     */
    public function getEntityRoute(): string
    {
        return $this->activity_type === 'item' 
            ? route('items.show', $this->entity_id)
            : route('purchases.show', $this->entity_id);
    }

    /**
     * Get the display name for the entity.
     */
    public function getEntityName(): string
    {
        if ($this->activity_type === 'item') {
            return $this->item?->name ?? 'Unknown Item';
        }
        
        return $this->purchase?->item_name ?? 'Unknown Distribution';
    }
}
