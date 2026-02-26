<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShipmentApproval extends Model
{
    protected $fillable = [
        'project_site_name',
        'sa_number',
        'quantity',
        'unit',
        'tools_id',
        'description',
        'picture',
        'date',
        'created_by',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
