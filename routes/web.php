<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\LogoController;
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

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    // Item search route for autocomplete
    Route::get('/items/search', [\App\Http\Controllers\ItemController::class, 'searchItems'])->name('items.search');

    // Real-time name uniqueness check
    Route::get('/items/check-name', [\App\Http\Controllers\ItemController::class, 'checkName'])->name('items.check-name');

    // Inventory management routes
    Route::get('/inventory', [\App\Http\Controllers\InventoryController::class, 'index'])->name('inventory.index');
    Route::get('/inventory/print', [\App\Http\Controllers\InventoryController::class, 'print'])->name('inventory.print');

    // Profile routes
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Items routes
    // Add stock routes
    Route::get('items/add-stock', [\App\Http\Controllers\ItemController::class, 'addStock'])->name('items.add-stock');
    Route::post('items/add-stock', [\App\Http\Controllers\ItemController::class, 'storeStock'])->name('items.store-stock');
    
    Route::resource('items', \App\Http\Controllers\ItemController::class)->only([
        'index', 'create', 'store', 'show', 'edit', 'update', 'destroy'
    ]);
    
    // Import route
    Route::post('items/import', [\App\Http\Controllers\ItemController::class, 'import'])->name('items.import');
    
    // Item History routes
    Route::get('items/{item}/history', [\App\Http\Controllers\ItemHistoryController::class, 'index'])->name('items.history');
    
    // Global Activity History routes
    Route::get('activity-history', [\App\Http\Controllers\ActivityHistoryController::class, 'index'])->name('activity-history.index');
    
    // Arrival routes
    Route::get('/arrival', [\App\Http\Controllers\ItemController::class, 'index'])->name('arrival.index');
    
    // Borrowed routes
    Route::resource('borrowings', \App\Http\Controllers\BorrowingController::class)->only([
        'index', 'create', 'store', 'show', 'edit', 'update', 'destroy'
    ]);
    
    // Return item route
    Route::post('borrowings/{borrowing}/return', [\App\Http\Controllers\BorrowingController::class, 'returnItem'])->name('borrowings.return');
    
    // Purchase suggestions route
    Route::get('purchases/suggestions', [\App\Http\Controllers\Api\PurchaseSearchController::class, 'suggestions'])->name('purchases.suggestions');
    
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

    // Projects (aggregated received purchases/distributions)
    Route::get('/projects', [\App\Http\Controllers\ProjectController::class, 'index'])->name('projects.index');

    // Shipment Approval routes
    Route::get('shipment-approvals/project-data/{projectName}', [\App\Http\Controllers\ShipmentApprovalController::class, 'getProjectData'])
        ->name('shipment-approvals.project-data');
    Route::resource('shipment-approvals', \App\Http\Controllers\ShipmentApprovalController::class)->only([
        'index', 'store', 'edit', 'update', 'destroy'
    ]);

    // Item Transaction History route
    Route::get('/item-transaction-history', [\App\Http\Controllers\ItemTransactionHistoryController::class, 'index'])
        ->name('item-transaction-history.index');

    // Daily Stock Rollover
    Route::post('/inventory/rollover', [\App\Http\Controllers\RolloverController::class, 'store'])->name('stock.rollover');

    // Logo Management
    Route::get('/logo', [LogoController::class, 'index'])->name('logo.index');
    Route::post('/logo/update', [LogoController::class, 'update'])->name('logo.update');
});

// API Routes (outside web middleware)
Route::get('/logo/current', [LogoController::class, 'getCurrentLogo'])->name('logo.current');

require __DIR__.'/auth.php';
