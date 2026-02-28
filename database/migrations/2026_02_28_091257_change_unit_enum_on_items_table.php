<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Safe cross-compatible way to modify MySQL ENUM
        \Illuminate\Support\Facades\DB::statement("ALTER TABLE items MODIFY COLUMN unit ENUM('Quantity', 'Kg', 'pcs') DEFAULT 'pcs'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        \Illuminate\Support\Facades\DB::statement("ALTER TABLE items MODIFY COLUMN unit ENUM('Quantity', 'Kg') DEFAULT 'Quantity'");
    }
};
