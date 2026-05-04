<?php

namespace App\Http\Controllers;

use App\Models\Purchase;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProjectController extends Controller
{
    /**
     * Display a listing of projects (aggregated from received purchases).
     */
    public function index(Request $request)
    {
        // 1. Get unique project names (destinations) that are received/completed
        $projectQuery = Purchase::whereIn('status', ['received', 'completed'])
            ->distinct()
            ->select('supplier_name')
            ->orderBy('supplier_name', 'asc');

        // Handle search if any (matching frontend search behavior)
        if ($request->query('search')) {
            $search = $request->query('search');
            $projectQuery->where(function($q) use ($search) {
                $q->where('supplier_name', 'like', "%{$search}%")
                  ->orWhere('project_name', 'like', "%{$search}%");
            });
        }

        // 2. Paginate the project names (10 projects per page)
        $projectPaginator = $projectQuery->paginate(10)->withQueryString();

        // 3. Fetch all items for these specific projects
        $items = Purchase::leftJoin('items', 'purchases.item_name', '=', 'items.name')
            ->select('purchases.*', 'items.category as item_category', 'items.unit as item_unit')
            ->whereIn('purchases.status', ['received', 'completed'])
            ->whereIn('purchases.supplier_name', $projectPaginator->pluck('supplier_name'))
            ->orderBy('purchases.supplier_name', 'asc')
            ->orderBy('purchases.purchase_date', 'desc')
            ->get();

        // 4. Set the items as the collection for the paginator
        // This ensures the frontend receives items but pagination is based on project count
        $purchases = $projectPaginator->setCollection($items);

        return Inertia::render('Projects/Index', [
            'purchases' => $purchases,
        ]);
    }
}
