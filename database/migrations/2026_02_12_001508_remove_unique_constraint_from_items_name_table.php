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
        // Check if the unique constraint exists and drop it
        $indexes = DB::select("SHOW INDEX FROM items WHERE Key_name = 'items_name_unique'");
        if (!empty($indexes)) {
            DB::statement('ALTER TABLE items DROP INDEX items_name_unique');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('items', function (Blueprint $table) {
            $table->unique('name');
        });
    }
};
