<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Purchase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
class PurchaseSearchController extends Controller
{
    public function suggestions(Request $request)
    {
        $search = $request->input('q');

        if (!$search || strlen($search) < 1) {
            return response()->json([]);
        }

        // Search in items, suppliers (projects), and descriptions
        // Get unique project names that match
        $projects = Purchase::select('supplier_name as text', DB::raw("'project' as type"))
            ->where('supplier_name', 'like', '%' . $search . '%')
            ->distinct()
            ->limit(5)
            ->get();

        // Get unique item names that match
        $items = Purchase::select('item_name as text', DB::raw("'item' as type"))
            ->where('item_name', 'like', '%' . $search . '%')
            ->distinct()
            ->limit(5)
            ->get();

        $results = $projects->concat($items)->unique('text')->values();

        return response()->json($results);
    }
}
