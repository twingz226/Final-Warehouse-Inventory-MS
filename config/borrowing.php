<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Borrowing Settings
    |--------------------------------------------------------------------------
    |
    | Configuration settings for the borrowing system including grace periods,
    | timezone handling, and notification settings.
    |
    */

    'grace_period' => env('BORROWING_GRACE_PERIOD', 0), // in minutes

    'timezone' => env('BORROWING_TIMEZONE', config('app.timezone')),

    'notifications' => [
        'enabled' => env('BORROWING_NOTIFICATIONS_ENABLED', false),
        'overdue_reminder' => env('BORROWING_OVERDUE_REMINDER', true),
        'reminder_hours_before' => env('BORROWING_REMINDER_HOURS_BEFORE', 24),
    ],

    'auto_update_overdue' => [
        'enabled' => env('BORROWING_AUTO_UPDATE_OVERDUE', true),
        'check_on_retrieve' => env('BORROWING_CHECK_ON_RETRIEVE', true),
        'schedule_frequency' => env('BORROWING_SCHEDULE_FREQUENCY', 'hourly'),
    ],
];
