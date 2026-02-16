<?php

namespace App\Console\Commands;

use App\Services\OverdueNotificationService;
use Illuminate\Console\Command;

class SendOverdueNotifications extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'overdue:send-notifications';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send notifications for overdue and soon-to-be-due items';

    /**
     * Execute the console command.
     */
    public function handle(OverdueNotificationService $notificationService)
    {
        $this->info('Sending overdue notifications...');

        $overdueCount = $notificationService->sendOverdueNotifications();
        $reminderCount = $notificationService->sendReminderNotifications();

        $this->info("Sent {$overdueCount} overdue notifications and {$reminderCount} reminder notifications.");

        return 0;
    }
}
