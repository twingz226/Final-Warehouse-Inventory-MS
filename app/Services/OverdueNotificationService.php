<?php

namespace App\Services;

use App\Models\Borrowing;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Config;

class OverdueNotificationService
{
    /**
     * Send notifications for overdue items.
     */
    public function sendOverdueNotifications(): int
    {
        if (!config('borrowing.notifications.enabled', false)) {
            return 0;
        }

        $overdueItems = Borrowing::overdue()->get();
        $notificationCount = 0;

        foreach ($overdueItems as $borrowing) {
            if ($this->shouldSendNotification($borrowing)) {
                $this->sendNotification($borrowing);
                $notificationCount++;
            }
        }

        return $notificationCount;
    }

    /**
     * Check if notification should be sent for this borrowing.
     */
    private function shouldSendNotification(Borrowing $borrowing): bool
    {
        // Only send for items marked as overdue
        if ($borrowing->status !== 'overdue') {
            return false;
        }

        // Check if we've already notified recently (avoid spam)
        $lastNotification = $borrowing->histories()
            ->where('action', 'notification_sent')
            ->latest()
            ->first();

        if ($lastNotification && $lastNotification->created_at->diffInHours(now()) < 24) {
            return false;
        }

        return true;
    }

    /**
     * Send notification for a specific borrowing.
     */
    private function sendNotification(Borrowing $borrowing): void
    {
        try {
            // Log the notification (in a real app, this would send email/SMS)
            Log::info("Overdue notification sent for borrowing #{$borrowing->id}: {$borrowing->item_name} borrowed by {$borrowing->borrower_name}");

            // Create history record for notification
            $borrowing->histories()->create([
                'user_id' => 1, // System user
                'action' => 'notification_sent',
                'old_values' => null,
                'new_values' => null,
                'description' => "Overdue notification sent for {$borrowing->item_name} (borrowed by {$borrowing->borrower_name})",
            ]);

            // Here you would integrate with email/SMS services
            // Mail::to($borrowing->borrower_email)->send(new OverdueNotification($borrowing));

        } catch (\Exception $e) {
            Log::error("Failed to send overdue notification for borrowing #{$borrowing->id}: " . $e->getMessage());
        }
    }

    /**
     * Send reminder notifications for items due soon.
     */
    public function sendReminderNotifications(): int
    {
        if (!config('borrowing.notifications.overdue_reminder', true)) {
            return 0;
        }

        $hoursBefore = config('borrowing.notifications.reminder_hours_before', 24);
        $reminderTime = now()->addHours($hoursBefore);

        $dueSoonItems = Borrowing::where('status', 'borrowed')
            ->whereBetween('expected_return_date', [now(), $reminderTime])
            ->get();

        $notificationCount = 0;

        foreach ($dueSoonItems as $borrowing) {
            if ($this->shouldSendReminder($borrowing)) {
                $this->sendReminder($borrowing);
                $notificationCount++;
            }
        }

        return $notificationCount;
    }

    /**
     * Check if reminder should be sent.
     */
    private function shouldSendReminder(Borrowing $borrowing): bool
    {
        $lastReminder = $borrowing->histories()
            ->where('action', 'reminder_sent')
            ->latest()
            ->first();

        if ($lastReminder && $lastReminder->created_at->diffInHours(now()) < 12) {
            return false;
        }

        return true;
    }

    /**
     * Send reminder notification.
     */
    private function sendReminder(Borrowing $borrowing): void
    {
        try {
            Log::info("Reminder notification sent for borrowing #{$borrowing->id}: {$borrowing->item_name} due on {$borrowing->expected_return_date->format('M j, Y g:i A')}");

            $borrowing->histories()->create([
                'user_id' => 1, // System user
                'action' => 'reminder_sent',
                'old_values' => null,
                'new_values' => null,
                'description' => "Reminder sent for {$borrowing->item_name} due on {$borrowing->expected_return_date->format('M j, Y g:i A')}",
            ]);

        } catch (\Exception $e) {
            Log::error("Failed to send reminder for borrowing #{$borrowing->id}: " . $e->getMessage());
        }
    }
}
