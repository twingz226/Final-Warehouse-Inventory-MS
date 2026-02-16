<?php

namespace App\Console\Commands;

use App\Models\Item;
use App\Models\ItemHistory;
use Illuminate\Console\Command;

class UpdateDailyStock extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'stock:update-daily';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update daily stock by setting total stock to previous day\'s available stock';

    public function handle()
    {
        $items = Item::all();
        $updatedCount = 0;

        foreach ($items as $item) {
            $available = $item->quantity - $item->total_distributed;

            if ($available != $item->quantity) {
                $oldValues = $item->toArray();
                $item->quantity = $available;
                $item->save();

                ItemHistory::create([
                    'item_id' => $item->id,
                    'user_id' => null, // System action
                    'action' => 'daily_update',
                    'old_values' => $oldValues,
                    'new_values' => $item->toArray(),
                    'description' => "Daily stock update: carried over available stock {$available}",
                ]);

                $updatedCount++;
            }
        }

        $this->info("Daily stock update completed. Updated {$updatedCount} items.");
    }
}
