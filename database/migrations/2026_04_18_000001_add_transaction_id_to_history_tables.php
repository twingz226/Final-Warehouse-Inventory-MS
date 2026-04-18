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
        // Add transaction_id to item_history table
        Schema::table('item_history', function (Blueprint $table) {
            $table->string('transaction_id')->nullable()->after('id');
            $table->index('transaction_id');
        });

        // Add transaction_id to purchase_histories table
        Schema::table('purchase_histories', function (Blueprint $table) {
            $table->string('transaction_id')->nullable()->after('id');
            $table->index('transaction_id');
        });

        // Add transaction_id to borrowing_histories table
        Schema::table('borrowing_histories', function (Blueprint $table) {
            $table->string('transaction_id')->nullable()->after('id');
            $table->index('transaction_id');
        });

        // Update the activity_history_unified view to include transaction_id
        DB::statement("DROP VIEW IF EXISTS activity_history_unified");

        DB::statement("
            CREATE VIEW activity_history_unified AS
            SELECT
                id,
                transaction_id,
                'item' as activity_type,
                item_id as entity_id,
                user_id,
                action,
                old_values,
                new_values,
                description,
                created_at,
                updated_at
            FROM item_history

            UNION ALL

            SELECT
                id,
                transaction_id,
                'distribution' as activity_type,
                purchase_id as entity_id,
                user_id,
                action,
                old_values,
                new_values,
                description,
                created_at,
                updated_at
            FROM purchase_histories

            UNION ALL

            SELECT
                id,
                transaction_id,
                'borrowing' as activity_type,
                borrowing_id as entity_id,
                user_id,
                action,
                old_values,
                new_values,
                description,
                created_at,
                updated_at
            FROM borrowing_histories
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop the view first
        DB::statement("DROP VIEW IF EXISTS activity_history_unified");

        // Recreate the view without transaction_id
        DB::statement("
            CREATE VIEW activity_history_unified AS
            SELECT
                id,
                'item' as activity_type,
                item_id as entity_id,
                user_id,
                action,
                old_values,
                new_values,
                description,
                created_at,
                updated_at
            FROM item_history

            UNION ALL

            SELECT
                id,
                'distribution' as activity_type,
                purchase_id as entity_id,
                user_id,
                action,
                old_values,
                new_values,
                description,
                created_at,
                updated_at
            FROM purchase_histories

            UNION ALL

            SELECT
                id,
                'borrowing' as activity_type,
                borrowing_id as entity_id,
                user_id,
                action,
                old_values,
                new_values,
                description,
                created_at,
                updated_at
            FROM borrowing_histories
        ");

        // Remove transaction_id columns
        Schema::table('item_history', function (Blueprint $table) {
            $table->dropIndex(['transaction_id']);
            $table->dropColumn('transaction_id');
        });

        Schema::table('purchase_histories', function (Blueprint $table) {
            $table->dropIndex(['transaction_id']);
            $table->dropColumn('transaction_id');
        });

        Schema::table('borrowing_histories', function (Blueprint $table) {
            $table->dropIndex(['transaction_id']);
            $table->dropColumn('transaction_id');
        });
    }
};
