<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShipmentApproval extends Model
{
    protected $fillable = [
        'project_site_name',
        'sa_number',
        'tools_id',
        'description',
        'picture',
        'created_by',
    ];

    protected $casts = [
        'picture' => 'array',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
