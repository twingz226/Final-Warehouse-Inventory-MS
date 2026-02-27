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
            $table->dropColumn([
                'borrower_email',
                'borrower_phone',
                'description',
                'notes',
                'project_type',
                'project_name'
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('borrowings', function (Blueprint $table) {
            $table->string('borrower_email')->nullable();
            $table->string('borrower_phone')->nullable();
            $table->text('description')->nullable();
            $table->text('notes')->nullable();
            $table->string('project_type')->nullable();
            $table->string('project_name')->nullable();
        });
    }
};
