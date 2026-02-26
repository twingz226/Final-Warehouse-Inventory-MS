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
        Schema::create('shipment_approvals', function (Blueprint $table) {
            $table->id();
            $table->string('project_site_name');
            $table->string('sa_number');
            $table->integer('quantity');
            $table->enum('unit', ['pcs', 'kg']);
            $table->string('tools_id')->nullable();
            $table->text('description')->nullable();
            $table->string('picture')->nullable();
            $table->date('date');
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipment_approvals');
    }
};
