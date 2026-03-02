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
    $data = [
        'totalItems' => \App\Models\Item::count(),
        'totalStock' => \App\Models\Item::sum('quantity'),
        'distributedStock' => \App\Models\Purchase::where('status', 'received')->sum('quantity'),
        'availableStock' => \App\Models\Item::sum('quantity') - \App\Models\Purchase::where('status', 'received')->sum('quantity'),
        'lowStockItems' => \App\Models\Item::whereRaw('quantity - (SELECT COALESCE(SUM(quantity), 0) FROM purchases WHERE item_name = items.name AND status = "received") <= 10')->count(),
        'pendingPurchases' => \App\Models\Purchase::where('status', 'pending')->count(),
        'activeBorrowings' => \App\Models\Borrowing::whereIn('status', ['borrowed', 'overdue'])->count(),
        'overdueBorrowings' => \App\Models\Borrowing::where('status', 'overdue')->count(),
        'recentActivities' => \App\Models\ActivityHistory::with('user')->latest()->limit(5)->get(),
        // Additional data for graphs
        'itemsByCategory' => [
            'tools' => \App\Models\Item::where('category', 'tool')->count(),
            'materials' => \App\Models\Item::where('category', 'material')->count(),
        ],
        'stockDistribution' => [
            'available' => \App\Models\Item::sum('quantity') - \App\Models\Purchase::where('status', 'received')->sum('quantity'),
            'distributed' => \App\Models\Purchase::where('status', 'received')->sum('quantity'),
            'total' => \App\Models\Item::sum('quantity'),
        ],
        'weeklyBorrowings' => \App\Models\Borrowing::selectRaw('YEAR(created_at) as year, WEEK(created_at, 1) as week, MIN(created_at) as min_date, COUNT(*) as count')
            ->where('created_at', '>=', now()->subWeeks(12))
            ->groupBy('year', 'week')
            ->orderBy('year')
            ->orderBy('week')
            ->get()
            ->map(function ($item) {
                return [
                    'week' => \Carbon\Carbon::parse($item->min_date)->startOfWeek()->format('M d'),
                    'count' => $item->count
                ];
            }),
        'items' => \App\Models\Item::all()->map(function ($item) {
            $totalDistributed = \App\Models\Purchase::where('item_name', $item->name)
                ->where('status', 'received')
                ->sum('quantity');
            return [
                'id' => $item->id,
                'name' => $item->name,
                'category' => $item->category,
                'total_stock' => $item->quantity,
                'total_distributed' => $totalDistributed,
                'available_stock' => $item->quantity - $totalDistributed,
            ];
        }),
        'summary' => [
            'total_items' => \App\Models\Item::count(),
            'total_tools' => \App\Models\Item::where('category', 'tool')->count(),
            'total_materials' => \App\Models\Item::where('category', 'material')->count(),
            'total_distributed' => \App\Models\Purchase::where('status', 'received')->sum('quantity'),
        ],
    ];
    return Inertia::render('Dashboard', $data);
})->middleware(['auth', 'verified'])->name('dashboard');

// Item search route for autocomplete (temporarily public for testing)
Route::get('/items/search', [\App\Http\Controllers\ItemController::class, 'searchItems'])->name('items.search');

// Real-time name uniqueness check
Route::get('/items/check-name', [\App\Http\Controllers\ItemController::class, 'checkName'])->name('items.check-name');

// Inventory management routes
Route::get('/inventory', [\App\Http\Controllers\InventoryController::class, 'index'])->name('inventory.index');

Route::middleware('auth')->group(function () {
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

    // Daily Stock Rollover
    Route::post('/inventory/rollover', [\App\Http\Controllers\RolloverController::class, 'store'])->name('stock.rollover');
});

require __DIR__.'/auth.php';
