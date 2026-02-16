<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * The Artisan commands provided by your application.
     *
     * @var array
     */
    protected $commands = [
        Commands\UpdateDailyStock::class,
        Commands\UpdateOverdueStatus::class,
        Commands\SendOverdueNotifications::class,
    ];

    /**
     * Define the application's command schedule.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
        $schedule->command('stock:update-daily')->daily();
        
        // Use configurable frequency for overdue status updates
        $frequency = config('borrowing.auto_update_overdue.schedule_frequency', 'hourly');
        $schedule->command('overdue:update-status')->$frequency();
        
        // Send notifications twice daily
        $schedule->command('overdue:send-notifications')->twiceDaily(9, 17);
    }

    /**
     * Register the commands for the application.
     *
     * @return void
     */
    protected function commands()
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
