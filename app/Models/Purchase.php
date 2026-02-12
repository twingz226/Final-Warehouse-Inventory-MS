<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class Purchase extends Model
{
    protected $fillable = [
        'supplier_name',
        'supplier_email',
        'supplier_phone',
        'item_name',
        'description',
        'quantity',
        'purchase_date',
        'status',
        'notes',
        'project_type',
        'project_name',
        'created_by',
    ];

    protected $casts = [
        'purchase_date' => 'date',
        'quantity' => 'integer',
    ];

    /**
     * The validation rules for the model.
     *
     * @var array
     */
    public static $rules = [
        'supplier_name' => 'required|string|max:255',
        'supplier_email' => 'nullable|email|max:255',
        'supplier_phone' => 'nullable|string|max:20',
        'item_name' => 'required|string|max:255',
        'description' => 'nullable|string',
        'quantity' => 'required|integer|min:1',
        'purchase_date' => 'required|date',
        'status' => 'required|in:pending,ordered,received,cancelled',
        'notes' => 'nullable|string',
        'project_type' => 'nullable|string|max:255',
        'project_name' => 'nullable|string|max:255',
    ];

    /**
     * Get the history records for the purchase.
     */
    public function histories(): HasMany
    {
        return $this->hasMany(PurchaseHistory::class)->latest();
    }

    /**
     * Get the user who created the purchase.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }


    /**
     * Get status options for dropdown.
     */
    public static function getStatusOptions(): array
    {
        return [
            'pending' => 'Pending',
            'ordered' => 'Ordered',
            'received' => 'Received',
            'cancelled' => 'Cancelled',
        ];
    }

    /**
     * Get status color for UI.
     */
    public function getStatusColor(): string
    {
        return match($this->status) {
            'pending' => 'yellow',
            'ordered' => 'blue',
            'received' => 'green',
            'cancelled' => 'red',
            default => 'gray',
        };
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
