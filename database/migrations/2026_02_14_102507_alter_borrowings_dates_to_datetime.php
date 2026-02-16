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
        Schema::table('borrowings', function (Blueprint $table) {
            $table->datetime('borrow_date')->change();
            $table->datetime('expected_return_date')->change();
            $table->datetime('actual_return_date')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('borrowings', function (Blueprint $table) {
            $table->date('borrow_date')->change();
            $table->date('expected_return_date')->change();
            $table->date('actual_return_date')->nullable()->change();
        });
    }
};
