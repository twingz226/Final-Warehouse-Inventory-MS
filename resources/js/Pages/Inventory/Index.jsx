import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState } from 'react';
import { MagnifyingGlassIcon, CubeIcon, WrenchIcon, TruckIcon, ChartBarIcon } from '@heroicons/react/24/outline';

export default function InventoryIndex({ auth, items, summary, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [searchTimeout, setSearchTimeout] = useState(null);

    const performSearch = () => {
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        const timeout = setTimeout(() => {
            const params = new URLSearchParams();
            
            if (search) {
                params.set('search', search);
            }

            const url = params.toString() ? `/inventory?${params.toString()}` : '/inventory';
            router.visit(url, {
                preserveState: true,
                preserveScroll: true,
            });
        }, 500);

        setSearchTimeout(timeout);
    };

    const clearFilters = () => {
        setSearch('');
        router.visit('/inventory', {
            preserveState: true,
            preserveScroll: true,
        });
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
        return availableStock <= 5;
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <ChartBarIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                                Total Items
                                            </dt>
                                            <dd className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                {summary.total_items}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <WrenchIcon className="h-6 w-6 text-blue-400 dark:text-blue-500" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                                Total Tools
                                            </dt>
                                            <dd className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                                                {summary.total_tools}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <CubeIcon className="h-6 w-6 text-green-400 dark:text-green-500" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                                Total Materials
                                            </dt>
                                            <dd className="text-lg font-semibold text-green-600 dark:text-green-400">
                                                {summary.total_materials}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <TruckIcon className="h-6 w-6 text-orange-400 dark:text-orange-500" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                                Total Distributed
                                            </dt>
                                            <dd className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                                                {summary.total_distributed}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <CubeIcon className="h-6 w-6 text-purple-400 dark:text-purple-500" />
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                                Available Stock
                                            </dt>
                                            <dd className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                                                {summary.total_available_stock}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg mb-6">
                        <div className="px-4 py-5 sm:p-6">
                            <div className="flex flex-col sm:flex-row gap-4">
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
                            </div>
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
                            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                                Inventory Items
                            </h3>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                                Real-time inventory status with stock levels and distribution tracking
                            </p>
                        </div>
                        
                        {items.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Item Name
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Category
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                Total Stocks
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
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        item.category === 'tool' 
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
                                                        <span className={`text-sm font-medium ${
                                                            isLowStock(item.available_stock) 
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
                                <div className="mt-6">
                                    <Link
                                        href={route('items.create')}
                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        Add Item
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
