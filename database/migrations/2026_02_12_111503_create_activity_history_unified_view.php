<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("DROP VIEW IF EXISTS activity_history_unified");
        
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
            FROM borrowing_history
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("DROP VIEW IF EXISTS activity_history_unified");
    }
};
