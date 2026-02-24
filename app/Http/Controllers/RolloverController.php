<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Auth;

class RolloverController extends Controller
{
    /**
     * Manually trigger the daily stock rollover.
     */
    public function store(Request $request)
    {
        // Execute the rollover command
        Artisan::call('stock:rollover', [
            '--user' => Auth::id(),
        ]);

        $output = Artisan::output();

        return redirect()->back()->with('status', 'End-of-day stock rollover completed successfully.');
    }
}
