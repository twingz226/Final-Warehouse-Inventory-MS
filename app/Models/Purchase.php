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
        'os',
        'issued_by',
        'issued_to',
        'item_name',
        'description',
        'quantity',
        'purchase_date',
        'notes',
        'project_type',
        'project_name',
        'status',
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
        'os' => 'nullable|string|max:255',
        'issued_by' => 'nullable|string|max:255',
        'issued_to' => 'nullable|string|max:255',
        'item_name' => 'required|string|max:255',
        'description' => 'nullable|string',
        'quantity' => 'required|integer|min:1',
        'purchase_date' => 'required|date',
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
