<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class DailyStockRollover extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'stock:rollover {--user= : ID of the user triggering manual rollover}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Rollover daily stock: Finalize distributions and set total stock to available stock.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $userId = $this->option('user') ?: null;
        $items = \App\Models\Item::all();
        $updatedItemsCount = 0;
        $updatedPurchasesCount = 0;

        foreach ($items as $item) {
            $distributed = $item->total_distributed;
            
            if ($distributed > 0) {
                $available = $item->quantity - $distributed;
                $oldQuantity = $item->quantity;

                // 1. Update the Total stock to be the Available stock
                $item->quantity = $available;
                $item->save();

                // Log Item History
                \App\Models\ItemHistory::create([
                    'item_id' => $item->id,
                    'user_id' => $userId,
                    'action' => 'daily_rollover',
                    'old_values' => ['quantity' => $oldQuantity],
                    'new_values' => ['quantity' => $available],
                    'description' => "End of day rollover: Finalized {$distributed} distributions. New starting stock: {$available}",
                ]);

                $updatedItemsCount++;

                // 2. Mark the corresponding Purchases as 'completed' so they don't get counted again
                /** @var \App\Models\Purchase[] $purchases */
                $purchases = \App\Models\Purchase::where('item_name', $item->name)
                    ->where('status', 'received')
                    ->get();

                foreach ($purchases as $purchase) {
                    $oldStatus = $purchase->status;
                    $purchase->status = 'completed';
                    $purchase->save();

                    \App\Models\PurchaseHistory::create([
                        'purchase_id' => $purchase->id,
                        'user_id' => $userId,
                        'action' => 'status_updated',
                        'old_values' => ['status' => $oldStatus],
                        'new_values' => ['status' => 'completed'],
                        'description' => "Marked as completed during end of day stock rollover",
                    ]);
                    
                    $updatedPurchasesCount++;
                }
            }
        }

        // 3. Log the overall execution if any items were rolled over
        if ($updatedItemsCount > 0) {
            \App\Models\DailyStockRollover::create([
                'triggered_by_user_id' => $userId,
                'records_affected' => $updatedItemsCount,
            ]);
        }

        $this->info("Stock rollover complete! Updated {$updatedItemsCount} items and finalized {$updatedPurchasesCount} distribution records.");
    }
}
