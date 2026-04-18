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
        // Drop the view first
        DB::statement("DROP VIEW IF EXISTS activity_history_unified");

        // Add transaction_id to item_history table
        if (!Schema::hasColumn('item_history', 'transaction_id')) {
            Schema::table('item_history', function (Blueprint $table) {
                $table->string('transaction_id')->nullable()->after('id');
                $table->index('transaction_id');
            });
        }

        // Add transaction_id to purchase_histories table
        if (!Schema::hasColumn('purchase_histories', 'transaction_id')) {
            Schema::table('purchase_histories', function (Blueprint $table) {
                $table->string('transaction_id')->nullable()->after('id');
                $table->index('transaction_id');
            });
        }

        // Fix borrowing_histories table - rename transactid to transaction_id if it exists
        if (Schema::hasColumn('borrowing_histories', 'transactid')) {
            Schema::table('borrowing_histories', function (Blueprint $table) {
                $table->renameColumn('transactid', 'transaction_id');
            });
        } elseif (!Schema::hasColumn('borrowing_histories', 'transaction_id')) {
            Schema::table('borrowing_histories', function (Blueprint $table) {
                $table->string('transaction_id')->nullable()->after('id');
                $table->index('transaction_id');
            });
        }

        // Recreate the activity_history_unified view with transaction_id
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
        // Drop the view
        DB::statement("DROP VIEW IF EXISTS activity_history_unified");

        // Remove transaction_id columns
        Schema::table('item_history', function (Blueprint $table) {
            if (Schema::hasColumn('item_history', 'transaction_id')) {
                $table->dropIndex(['transaction_id']);
                $table->dropColumn('transaction_id');
            }
        });

        Schema::table('purchase_histories', function (Blueprint $table) {
            if (Schema::hasColumn('purchase_histories', 'transaction_id')) {
                $table->dropIndex(['transaction_id']);
                $table->dropColumn('transaction_id');
            }
        });

        Schema::table('borrowing_histories', function (Blueprint $table) {
            if (Schema::hasColumn('borrowing_histories', 'transaction_id')) {
                $table->dropIndex(['transaction_id']);
                $table->dropColumn('transaction_id');
            }
        });

        // Recreate the view without transaction_id
        DB::statement("
            CREATE VIEW activity_history_unified AS
            SELECT
                id,
                NULL as transaction_id,
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
                NULL as transaction_id,
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
                NULL as transaction_id,
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
};
