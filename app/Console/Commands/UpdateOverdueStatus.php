<?php

namespace App\Console\Commands;

use App\Models\Borrowing;
use App\Models\BorrowingHistory;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Config;

class UpdateOverdueStatus extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'overdue:update-status';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update overdue borrowed items to overdue status';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        if (!config('borrowing.auto_update_overdue.enabled', true)) {
            $this->info('Automatic overdue updates are disabled.');
            return 0;
        }

        $this->info('Checking for overdue borrowed items...');

        $gracePeriod = config('borrowing.grace_period', 0);
        if ($gracePeriod > 0) {
            $this->info("Using {$gracePeriod} minute grace period.");
        }

        // Find all borrowed items with effective due time in the past
        $overdueItems = Borrowing::where('status', 'borrowed')
            ->get()
            ->filter(function ($borrowing) {
                return $borrowing->isActuallyOverdue();
            });

        $updatedCount = 0;

        foreach ($overdueItems as $borrowing) {
            $oldValues = $borrowing->toArray();
            $oldStatus = $borrowing->status;

            // Update the status to overdue
            $borrowing->update(['status' => 'overdue']);

            // Log the automatic status change (use user_id = 1 for system actions)
            BorrowingHistory::create([
                'borrowing_id' => $borrowing->id,
                'user_id' => 1, // System user ID
                'action' => 'system_update',
                'old_values' => $oldValues,
                'new_values' => $borrowing->toArray(),
                'description' => 'System automatically marked item as overdue (expected return: ' . $borrowing->expected_return_date->format('M j, Y g:i A') . ')',
            ]);

            $this->line("Updated borrowing #{$borrowing->id}: {$borrowing->item_name} borrowed by {$borrowing->borrower_name}");
            $updatedCount++;
        }

        if ($updatedCount === 0) {
            $this->info('No overdue items found.');
        } else {
            $this->info("Successfully updated {$updatedCount} overdue items.");
        }

        return 0;
    }
}
