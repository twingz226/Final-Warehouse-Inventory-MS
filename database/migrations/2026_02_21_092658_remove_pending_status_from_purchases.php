<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // First, update all existing 'pending' records to 'ordered'
        DB::table('purchases')->where('status', 'pending')->update(['status' => 'ordered']);

        // Then modify the enum to remove 'pending' and change default
        Schema::table('purchases', function (Blueprint $table) {
            $table->enum('status', ['ordered', 'received', 'cancelled'])->default('ordered')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Change back to include 'pending' and set default to 'pending'
        Schema::table('purchases', function (Blueprint $table) {
            $table->enum('status', ['pending', 'ordered', 'received', 'cancelled'])->default('pending')->change();
        });

        // Update 'ordered' back to 'pending' for records that were migrated
        DB::table('purchases')->where('status', 'ordered')->where('updated_at', '>', now()->subMinutes(5))->update(['status' => 'pending']);
    }
};
