import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState } from 'react';
import { MagnifyingGlassIcon, CubeIcon, WrenchIcon, TruckIcon, ChartBarIcon, FunnelIcon, ChevronUpDownIcon } from '@heroicons/react/24/outline';
import InventoryCharts from '@/Components/InventoryCharts';

export default function InventoryIndex({ auth, items, summary, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [category, setCategory] = useState(filters.category || 'all');
    const [stockLevel, setStockLevel] = useState(filters.stock_level || 'all');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'name');
    const [sortOrder, setSortOrder] = useState(filters.sort_order || 'asc');
    const [showFilters, setShowFilters] = useState(false);
    const [searchTimeout, setSearchTimeout] = useState(null);

    const performSearch = () => {
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        const timeout = setTimeout(() => {
            applyFilters();
        }, 500);

        setSearchTimeout(timeout);
    };

    const applyFilters = () => {
        const params = new URLSearchParams();

        if (search) params.set('search', search);
        if (category !== 'all') params.set('category', category);
        if (stockLevel !== 'all') params.set('stock_level', stockLevel);
        if (dateFrom) params.set('date_from', dateFrom);
        if (dateTo) params.set('date_to', dateTo);
        if (sortBy !== 'name') params.set('sort_by', sortBy);
        if (sortOrder !== 'asc') params.set('sort_order', sortOrder);

        const url = params.toString() ? `/inventory?${params.toString()}` : '/inventory';
        router.visit(url, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setCategory('all');
        setStockLevel('all');
        setDateFrom('');
        setDateTo('');
        setSortBy('name');
        setSortOrder('asc');
        router.visit('/inventory', {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const toggleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
        applyFilters();
    };


    const getCategoryIcon = (category) => {
        return category === 'tool' ?
            <WrenchIcon className="h-4 w-4" /> :
            <CubeIcon className="h-4 w-4" />;
    };

    const getCategoryColor = (category) => {
        return category === 'tool' ? 'blue' : 'green';
    };

    const isLowStock = (availableStock) => {
        return availableStock <= 10;
    };

    const sortedItems = [...items].sort((a, b) => {
        const aLow = isLowStock(a.available_stock);
        const bLow = isLowStock(b.available_stock);
        if (aLow && !bLow) return -1;
        if (!aLow && bLow) return 1;
        return 0;
    });

    const lowStockItems = sortedItems.filter(item => isLowStock(item.available_stock));

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Inventory Management
                </h2>
            }
        >
            <Head title="Inventory Management" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 lg:gap-4 mb-6">
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                            <div className="p-3 lg:p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <ChartBarIcon className="h-5 w-5 lg:h-6 lg:w-6 text-gray-400 dark:text-gray-500" />
                                    </div>
                                    <div className="ml-3 lg:ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-xs lg:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                                Total Items
                                            </dt>
                                            <dd className="text-base lg:text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                {summary.total_items}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                            <div className="p-3 lg:p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <WrenchIcon className="h-5 w-5 lg:h-6 lg:w-6 text-blue-400 dark:text-blue-500" />
                                    </div>
                                    <div className="ml-3 lg:ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-xs lg:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                                Total Tools
                                            </dt>
                                            <dd className="text-base lg:text-lg font-semibold text-blue-600 dark:text-blue-400">
                                                {summary.total_tools}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                            <div className="p-3 lg:p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <CubeIcon className="h-5 w-5 lg:h-6 lg:w-6 text-green-400 dark:text-green-500" />
                                    </div>
                                    <div className="ml-3 lg:ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-xs lg:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                                Total Materials
                                            </dt>
                                            <dd className="text-base lg:text-lg font-semibold text-green-600 dark:text-green-400">
                                                {summary.total_materials}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                            <div className="p-3 lg:p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <TruckIcon className="h-5 w-5 lg:h-6 lg:w-6 text-orange-400 dark:text-orange-500" />
                                    </div>
                                    <div className="ml-3 lg:ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-xs lg:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                                Total Distributed
                                            </dt>
                                            <dd className="text-base lg:text-lg font-semibold text-orange-600 dark:text-orange-400">
                                                {summary.total_distributed}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg col-span-2 lg:col-span-1">
                            <div className="p-3 lg:p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <CubeIcon className="h-5 w-5 lg:h-6 lg:w-6 text-purple-400 dark:text-purple-500" />
                                    </div>
                                    <div className="ml-3 lg:ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-xs lg:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                                Available Stock
                                            </dt>
                                            <dd className="text-base lg:text-lg font-semibold text-purple-600 dark:text-purple-400">
                                                {summary.total_available_stock}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Inventory Charts */}
                    <InventoryCharts items={items} summary={summary} />

                    {/* Enhanced Filters */}
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-6">
                        <div className="px-4 py-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Filters & Search</h3>
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    <FunnelIcon className="h-4 w-4 mr-2" />
                                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                                </button>
                            </div>

                            {/* Basic Search */}
                            <div className="flex flex-col gap-3 mb-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                        </div>
                                        <input
                                            type="text"
                                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 dark:focus:placeholder-gray-500 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            placeholder="Search items..."
                                            value={search}
                                            onChange={(e) => {
                                                setSearch(e.target.value);
                                                performSearch();
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Quick Filter Presets */}
                                <div className="flex justify-end">
                                    <button
                                        onClick={clearFilters}
                                        className="px-3 py-2 text-sm bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-800"
                                    >
                                        Clear All
                                    </button>
                                </div>
                            </div>

                            {/* Advanced Filters */}
                            {showFilters && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    {/* Category Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Category
                                        </label>
                                        <select
                                            value={category}
                                            onChange={(e) => {
                                                setCategory(e.target.value);
                                                applyFilters();
                                            }}
                                            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            <option value="all">All Categories</option>
                                            <option value="tool">Tools</option>
                                            <option value="material">Materials</option>
                                        </select>
                                    </div>

                                    {/* Stock Level Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Stock Level
                                        </label>
                                        <select
                                            value={stockLevel}
                                            onChange={(e) => {
                                                setStockLevel(e.target.value);
                                                applyFilters();
                                            }}
                                            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            <option value="all">All Levels</option>
                                            <option value="out_of_stock">Out of Stock</option>
                                            <option value="low_stock">Low Stock (≤10)</option>
                                            <option value="normal_stock">Normal Stock (5-50)</option>
                                            <option value="high_stock">High Stock (&gt;50)</option>
                                        </select>
                                    </div>

                                    {/* Date From Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Date From
                                        </label>
                                        <input
                                            type="date"
                                            value={dateFrom}
                                            onChange={(e) => {
                                                setDateFrom(e.target.value);
                                                applyFilters();
                                            }}
                                            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>

                                    {/* Date To Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Date To
                                        </label>
                                        <input
                                            type="date"
                                            value={dateTo}
                                            onChange={(e) => {
                                                setDateTo(e.target.value);
                                                applyFilters();
                                            }}
                                            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Low Stock Alert */}
                    {lowStockItems.length > 0 && (
                        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
                            <h3 className="text-lg font-medium text-red-800 dark:text-red-400">Low Stock Alert</h3>
                            <p className="text-sm text-red-700 dark:text-red-300 mb-2">The following items are running low on stock:</p>
                            <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300">
                                {lowStockItems.map(item => (
                                    <li key={item.id}>
                                        {item.name} - {item.unit === 'Quantity' ? Math.floor(item.available_stock) : item.available_stock} {item.unit === 'Quantity' ? 'pcs.' : item.unit} available
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Items Table */}
                    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
                        <div className="px-4 py-5 sm:px-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                                        Inventory Items
                                    </h3>
                                    <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                                        Real-time inventory status with stock levels and distribution tracking
                                    </p>
                                </div>
                            </div>
                        </div>


                        {items.length > 0 ? (
                            <div className="block lg:hidden">
                                {/* Mobile Card View */}
                                <div className="space-y-4">
                                    {sortedItems.map((item) => (
                                        <div key={item.id} className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 border ${isLowStock(item.available_stock) ? 'border-red-200 dark:border-red-800' : 'border-gray-200 dark:border-gray-700'
                                            }`}>
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        {item.name}
                                                    </h4>
                                                    {item.description && (
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                            {item.description}
                                                        </p>
                                                    )}
                                                </div>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.category === 'tool'
                                                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                                                        : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                                    }`}>
                                                    {getCategoryIcon(item.category)}
                                                    <span className="ml-1">{item.category}</span>
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 mb-3">
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Stock</p>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        {item.unit === 'Quantity' ? Math.floor(item.total_stock) : item.total_stock} {item.unit === 'Quantity' ? 'pcs.' : item.unit}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Distributed</p>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        {item.unit === 'Quantity' ? Math.floor(item.total_distributed) : item.total_distributed} {item.unit === 'Quantity' ? 'pcs.' : item.unit}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mr-2">Available:</p>
                                                    <span className={`text-sm font-medium ${isLowStock(item.available_stock)
                                                            ? 'text-red-600 dark:text-red-400'
                                                            : 'text-green-600 dark:text-green-400'
                                                        }`}>
                                                        {item.unit === 'Quantity' ? Math.floor(item.available_stock) : item.available_stock} {item.unit === 'Quantity' ? 'pcs.' : item.unit}
                                                    </span>
                                                    {isLowStock(item.available_stock) && (
                                                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                                                            Low Stock
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : null}

                        {/* Desktop Table View */}
                        {items.length > 0 ? (
                            <div className="hidden lg:block overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                                                onClick={() => toggleSort('name')}
                                            >
                                                <div className="flex items-center">
                                                    Item Name
                                                    {sortBy === 'name' && (
                                                        <ChevronUpDownIcon className="ml-1 h-4 w-4 text-indigo-500" />
                                                    )}
                                                </div>
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                                                onClick={() => toggleSort('category')}
                                            >
                                                <div className="flex items-center">
                                                    Category
                                                    {sortBy === 'category' && (
                                                        <ChevronUpDownIcon className="ml-1 h-4 w-4 text-indigo-500" />
                                                    )}
                                                </div>
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                                                onClick={() => toggleSort('quantity')}
                                            >
                                                <div className="flex items-center">
                                                    Total Stocks
                                                    {sortBy === 'quantity' && (
                                                        <ChevronUpDownIcon className="ml-1 h-4 w-4 text-indigo-500" />
                                                    )}
                                                </div>
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Total Distributed
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Available Stocks
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {sortedItems.map((item) => (
                                            <tr
                                                key={item.id}
                                                className={isLowStock(item.available_stock) ? 'bg-red-200 dark:bg-red-900' : ''}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        {item.name}
                                                    </div>
                                                    {item.description && (
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            {item.description}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.category === 'tool'
                                                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                                                            : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                                        }`}>
                                                        {getCategoryIcon(item.category)}
                                                        <span className="ml-1">{item.category}</span>
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                    {item.unit === 'Quantity' ? Math.floor(item.total_stock) : item.total_stock} {item.unit === 'Quantity' ? 'pcs.' : item.unit}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                    {item.unit === 'Quantity' ? Math.floor(item.total_distributed) : item.total_distributed} {item.unit === 'Quantity' ? 'pcs.' : item.unit}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <span className={`text-sm font-medium ${isLowStock(item.available_stock)
                                                                ? 'text-red-600 dark:text-red-400'
                                                                : 'text-green-600 dark:text-green-400'
                                                            }`}>
                                                            {item.unit === 'Quantity' ? Math.floor(item.available_stock) : item.available_stock} {item.unit === 'Quantity' ? 'pcs.' : item.unit}
                                                        </span>
                                                        {isLowStock(item.available_stock) && (
                                                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                                                                Low Stock
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <CubeIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No items found</h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    {search
                                        ? 'Try adjusting your search.'
                                        : 'Get started by adding items to your inventory.'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
