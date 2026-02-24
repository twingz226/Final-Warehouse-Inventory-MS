<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DailyStockRollover extends Model
{
    protected $fillable = [
        'triggered_by_user_id',
        'records_affected',
    ];

    public function triggerUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'triggered_by_user_id');
    }
}
