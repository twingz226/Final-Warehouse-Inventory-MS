<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// Item search route for autocomplete (temporarily public for testing)
Route::get('/items/search', [\App\Http\Controllers\ItemController::class, 'searchItems'])->name('items.search');

// Inventory management routes
Route::get('/inventory', [\App\Http\Controllers\InventoryController::class, 'index'])->name('inventory.index');

Route::middleware('auth')->group(function () {
    // Profile routes
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Items routes
    Route::resource('items', \App\Http\Controllers\ItemController::class)->only([
        'index', 'create', 'store', 'show', 'edit', 'update', 'destroy'
    ]);
    
    // Item History routes
    Route::get('items/{item}/history', [\App\Http\Controllers\ItemHistoryController::class, 'index'])->name('items.history');
    
    // Global Activity History routes
    Route::get('activity-history', [\App\Http\Controllers\ActivityHistoryController::class, 'index'])->name('activity-history.index');
    
    // Arrival routes
    Route::get('/arrival', [\App\Http\Controllers\ItemController::class, 'index'])->name('arrival.index');
    
    // Purchase routes  
    Route::resource('purchases', \App\Http\Controllers\PurchaseController::class)->only([
        'index', 'create', 'store', 'show', 'edit', 'update', 'destroy'
    ]);
    
    // Redirect old purchase route to new purchases index
    Route::get('/purchase', function () {
        return redirect()->route('purchases.index');
    })->name('purchase.index');
    
    // Additional routes for items if needed
    // Route::get('items/export', [ItemController::class, 'export'])->name('items.export');
});

require __DIR__.'/auth.php';
