<?php

namespace App\Http\Controllers;

use App\Models\ActivityHistory;
use App\Models\Borrowing;
use App\Models\Item;
use App\Models\Purchase;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Collection;

class DashboardController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function index(Request $request): Response
    {
        $receivedDistributedByItemName = Purchase::where('status', 'received')
            ->selectRaw('item_name, COALESCE(SUM(quantity), 0) as distributed')
            ->groupBy('item_name')
            ->pluck('distributed', 'item_name');

        $totalStock = Item::sum('quantity');
        $distributedStock = Purchase::where('status', 'received')->sum('quantity');

        $data = [
            'totalItems' => Item::count(),
            'totalStock' => $totalStock,
            'distributedStock' => $distributedStock,
            'availableStock' => $totalStock - $distributedStock,
            'lowStockItems' => $this->getLowStockCount(),
            'lowStockDetails' => $this->getLowStockDetails($receivedDistributedByItemName),
            'pendingPurchases' => Purchase::where('status', 'pending')->count(),
            'activeBorrowings' => Borrowing::whereIn('status', ['borrowed', 'overdue'])->count(),
            'overdueBorrowings' => Borrowing::where('status', 'overdue')->count(),
            'borrowedItemsDetails' => $this->getBorrowedItemsDetails(),
            'recentActivities' => ActivityHistory::with('user')->latest()->limit(5)->get(),
            'itemsByCategory' => $this->getItemsByCategory(),
            'stockDistribution' => [
                'available' => $totalStock - $distributedStock,
                'distributed' => $distributedStock,
                'total' => $totalStock,
            ],
            'weeklyBorrowings' => $this->getWeeklyBorrowings(),
            'items' => $this->getItemsWithStats(),
            'summary' => $this->getSummary(),
        ];

        return Inertia::render('Dashboard', $data);
    }

    private function getLowStockCount(): int
    {
        return Item::whereRaw('quantity - (SELECT COALESCE(SUM(quantity), 0) FROM purchases WHERE item_name = items.name AND status = "received") <= 10')->count();
    }

    private function getLowStockDetails(Collection $receivedDistributedByItemName): array
    {
        return Item::select('id', 'name', 'unit', 'quantity')
            ->get()
            ->map(function ($item) use ($receivedDistributedByItemName) {
                $distributed = (int) ($receivedDistributedByItemName[$item->name] ?? 0);
                $availableStock = (int) $item->quantity - $distributed;

                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'unit' => $item->unit,
                    'available_stock' => $availableStock,
                ];
            })
            ->filter(fn($item) => $item['available_stock'] <= 10)
            ->sortBy('available_stock')
            ->values()
            ->take(10)
            ->toArray();
    }

    private function getBorrowedItemsDetails(): Collection
    {
        return Borrowing::query()
            ->whereIn('status', ['borrowed', 'overdue'])
            ->orderByDesc('expected_return_date')
            ->limit(10)
            ->get()
            ->map(function ($borrowing) {
                $expectedReturn = $borrowing->expected_return_date;

                return [
                    'id' => $borrowing->id,
                    'borrower_name' => $borrowing->borrower_name,
                    'item_name' => $borrowing->item_name,
                    'tool_id' => $borrowing->tool_id,
                    'quantity' => $borrowing->quantity,
                    'status' => $borrowing->status,
                    'borrow_date' => $borrowing->borrow_date,
                    'expected_return_date' => $expectedReturn,
                    'days_until_return' => $expectedReturn ? now()->diffInDays($expectedReturn, false) : null,
                ];
            });
    }

    private function getItemsByCategory(): array
    {
        return [
            'tools' => Item::where('category', 'tool')->count(),
            'materials' => Item::where('category', 'material')->count(),
        ];
    }

    private function getWeeklyBorrowings(): Collection
    {
        return Borrowing::selectRaw('YEAR(created_at) as year, WEEK(created_at, 1) as week, MIN(created_at) as min_date, COUNT(*) as count')
            ->where('created_at', '>=', now()->subWeeks(12))
            ->groupBy('year', 'week')
            ->orderBy('year')
            ->orderBy('week')
            ->get()
            ->map(function ($item) {
                return [
                    'week' => Carbon::parse($item->min_date)->startOfWeek()->format('M d'),
                    'count' => $item->count
                ];
            });
    }

    private function getItemsWithStats(): Collection
    {
        return Item::all()->map(function ($item) {
            $totalDistributed = Purchase::where('item_name', $item->name)
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
        });
    }

    private function getSummary(): array
    {
        return [
            'total_items' => Item::count(),
            'total_tools' => Item::where('category', 'tool')->count(),
            'total_materials' => Item::where('category', 'material')->count(),
            'total_distributed' => Purchase::where('status', 'received')->sum('quantity'),
        ];
    }
}
