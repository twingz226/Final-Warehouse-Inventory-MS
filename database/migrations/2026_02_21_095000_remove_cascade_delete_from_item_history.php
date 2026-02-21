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
        Schema::table('item_history', function (Blueprint $table) {
            // First make the column nullable
            $table->foreignId('item_id')->nullable()->change();
            
            // Drop the existing foreign key constraint with cascade delete
            $table->dropForeign(['item_id']);

            // Recreate the foreign key constraint without cascade delete
            $table->foreign('item_id')->references('id')->on('items')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('item_history', function (Blueprint $table) {
            // Drop the foreign key constraint
            $table->dropForeign(['item_id']);

            // Recreate with cascade delete (original behavior)
            $table->foreign('item_id')->references('id')->on('items')->onDelete('cascade');
        });
    }
};
