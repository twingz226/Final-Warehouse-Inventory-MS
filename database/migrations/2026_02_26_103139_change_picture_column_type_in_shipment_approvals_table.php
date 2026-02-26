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
        // 1. Fetch existing non-null pictures
        $records = \Illuminate\Support\Facades\DB::table('shipment_approvals')
            ->whereNotNull('picture')
            ->get(['id', 'picture']);

        // 2. Temporarily set to null so the alter table can succeed
        \Illuminate\Support\Facades\DB::table('shipment_approvals')->update(['picture' => null]);

        // 3. Alter the column to JSON
        Schema::table('shipment_approvals', function (Blueprint $table) {
            $table->json('picture')->nullable()->change();
        });

        // 4. Restore the data as JSON arrays
        foreach ($records as $record) {
            // Avoid double encoding if it's already JSON (just in case)
            $decoded = json_decode($record->picture, true);
            $pictures = is_array($decoded) ? $decoded : [$record->picture];
            
            \Illuminate\Support\Facades\DB::table('shipment_approvals')
                ->where('id', $record->id)
                ->update(['picture' => json_encode($pictures)]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // 1. Fetch existing non-null JSON pictures
        $records = \Illuminate\Support\Facades\DB::table('shipment_approvals')
            ->whereNotNull('picture')
            ->get(['id', 'picture']);

        // 2. Temporarily set to null
        \Illuminate\Support\Facades\DB::table('shipment_approvals')->update(['picture' => null]);

        // 3. Alter the column back to string
        Schema::table('shipment_approvals', function (Blueprint $table) {
            $table->string('picture')->nullable()->change();
        });

        // 4. Restore the data as strings (taking only the first picture)
        foreach ($records as $record) {
            $pictures = json_decode($record->picture, true);
            $firstPicture = is_array($pictures) && count($pictures) > 0 ? $pictures[0] : null;

            if ($firstPicture) {
                \Illuminate\Support\Facades\DB::table('shipment_approvals')
                    ->where('id', $record->id)
                    ->update(['picture' => $firstPicture]);
            }
        }
    }
};
