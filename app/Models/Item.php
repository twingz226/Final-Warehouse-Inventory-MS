<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class Item extends Model
{
    protected $fillable = [
        'name',
        'description',
        'category',
        'quantity',
        'date_time',
    ];

    protected $casts = [
        'date_time' => 'datetime',
        'quantity' => 'integer',
    ];

    /**
     * The validation rules for the model.
     *
     * @var array
     */
    public static $rules = [
        'name' => 'required|string|max:255',
        'description' => 'nullable|string',
        'category' => 'required|in:tool,material',
        'quantity' => 'required|integer|min:0',
        'date_time' => 'nullable|date',
    ];

    /**
     * Get the history records for the item.
     */
    public function history(): HasMany
    {
        return $this->hasMany(ItemHistory::class)->latest();
    }

    /**
     * Calculate total distributed quantity from purchases.
     */
    public function getTotalDistributedAttribute(): int
    {
        return \App\Models\Purchase::where('item_name', $this->name)
            ->where('status', 'received')
            ->sum('quantity');
    }

    /**
     * Calculate available stock.
     */
    public function getAvailableStockAttribute(): int
    {
        return $this->quantity - $this->total_distributed;
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
