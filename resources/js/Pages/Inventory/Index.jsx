import { Head, Link, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, CubeIcon, WrenchIcon, TruckIcon, ChartBarIcon, FunnelIcon, ChevronUpDownIcon, ArrowPathIcon, ExclamationTriangleIcon, PrinterIcon } from '@heroicons/react/24/outline';

import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import InventoryCharts from '@/Components/InventoryCharts';

export default function InventoryIndex({ auth, items, low_stock_items, summary, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [category, setCategory] = useState(filters.category || 'all');
    const [stockLevel, setStockLevel] = useState(filters.stock_level || 'all');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'name');
    const [sortOrder, setSortOrder] = useState(filters.sort_order || 'asc');
    const [showFilters, setShowFilters] = useState(false);
    const [searchTimeout, setSearchTimeout] = useState(null);
    const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 });
    const [confirmingRollover, setConfirmingRollover] = useState(false);
    const [showLowStockItems, setShowLowStockItems] = useState(false);
    const [showPrintModal, setShowPrintModal] = useState(false);
    const [printOption, setPrintOption] = useState('current');
    const [printStartPage, setPrintStartPage] = useState(1);
    const [printEndPage, setPrintEndPage] = useState(1);
    const [printing, setPrinting] = useState(false);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ['items', 'summary', 'low_stock_items'], preserveScroll: true, preserveState: true });
        }, 15000);
        return () => clearInterval(interval);
    }, []);

    const toggleLowStockDropdown = () => {
        setShowLowStockItems(!showLowStockItems);
    };

    const performSearch = (searchTerm) => {
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        const timeout = setTimeout(() => {
            applyFilters({ search: searchTerm });
        }, 500);

        setSearchTimeout(timeout);
    };

    const applyFilters = (overrides = {}) => {
        const params = new URLSearchParams();

        const s = overrides.search !== undefined ? overrides.search : search;
        const c = overrides.category !== undefined ? overrides.category : category;
        const sl = overrides.stockLevel !== undefined ? overrides.stockLevel : stockLevel;
        const df = overrides.dateFrom !== undefined ? overrides.dateFrom : dateFrom;
        const dt = overrides.dateTo !== undefined ? overrides.dateTo : dateTo;
        const sb = overrides.sortBy !== undefined ? overrides.sortBy : sortBy;
        const so = overrides.sortOrder !== undefined ? overrides.sortOrder : sortOrder;

        if (s) params.set('search', s);
        if (c !== 'all') params.set('category', c);
        if (sl !== 'all') params.set('stock_level', sl);
        if (df) params.set('date_from', df);
        if (dt) params.set('date_to', dt);
        if (sb !== 'name') params.set('sort_by', sb);
        if (so !== 'asc') params.set('sort_order', so);
        params.set('page', '1');

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
        router.visit('/inventory?page=1', {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const toggleSort = (field) => {
        let newSortOrder = 'asc';
        if (sortBy === field) {
            newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
            setSortOrder(newSortOrder);
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
        applyFilters({ sortBy: field, sortOrder: newSortOrder });
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

    const handlePrintClick = () => {
        setTotalPages(items.last_page);
        setPrintStartPage(items.current_page);
        setPrintEndPage(items.current_page);
        setPrintOption('current');
        setShowPrintModal(true);
    };

    const confirmPrint = async () => {
        setPrinting(true);

        const params = new URLSearchParams();
        params.append('print_option', printOption);
        params.append('per_page', items.per_page);
        params.append('page', items.current_page);
        params.append('search', search);
        params.append('category', category);
        params.append('stock_level', stockLevel);
        params.append('sort_by', sortBy);
        params.append('sort_order', sortOrder);

        if (printOption === 'range') {
            params.append('start_page', printStartPage);
            params.append('end_page', printEndPage);
        }

        try {
            const response = await fetch(`/inventory/print?${params.toString()}`);
            const data = await response.json();

            const printWindow = window.open('', '_blank', 'height=600,width=800');

            const tableRows = data.items.map((item) => `
                <tr style="${isLowStock(item.available_stock) ? 'background-color: #fee2e2;' : ''}">
                    <td style="padding: 8px; border: 1px solid #ddd;">${item.number}. ${item.name}</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${item.category}</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${item.unit === 'Quantity' ? Math.floor(item.total_stock) : item.total_stock} ${item.unit === 'Quantity' ? 'pcs' : item.unit}</td>
                    <td style="padding: 8px; border: 1px solid #ddd;">${item.unit === 'Quantity' ? Math.floor(item.total_distributed) : item.total_distributed} ${item.unit === 'Quantity' ? 'pcs' : item.unit}</td>
                    <td style="padding: 8px; border: 1px solid #ddd; ${isLowStock(item.available_stock) ? 'color: red; font-weight: bold;' : ''}">
                        ${item.unit === 'Quantity' ? Math.floor(item.available_stock) : item.available_stock} ${item.unit === 'Quantity' ? 'pcs' : item.unit}
                        ${isLowStock(item.available_stock) ? ' (Low Stock)' : ''}
                    </td>
                </tr>
            `).join('');

            const pageLabel = printOption === 'current' ? `Page ${data.start_page} of ${data.total_pages}` :
                             printOption === 'all' ? `All ${data.total_pages} pages` :
                             `Pages ${data.start_page} - ${data.end_page}`;

            const html = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Inventory Report - ${new Date().toLocaleDateString()}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        h1 { color: #333; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th { background-color: #2563eb; color: white; padding: 10px; text-align: left; }
                        .print-date { color: #666; font-size: 12px; margin-bottom: 10px; }
                        @media print {
                            body { -webkit-print-color-adjust: exact; }
                        }
                    </style>
                </head>
                <body>
                    <h1>Inventory Items Report</h1>
                    <p class="print-date">Generated on: ${new Date().toLocaleString()}</p>
                    <table>
                        <thead>
                            <tr>
                                <th>Item Name</th>
                                <th>Category</th>
                                <th>Total Stock</th>
                                <th>Distributed</th>
                                <th>Available</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRows}
                        </tbody>
                    </table>
                    <p style="margin-top: 20px; color: #666; font-size: 12px;">Total Items: ${data.total_items} | Showing: ${pageLabel}</p>
                </body>
                </html>
            `;
            printWindow.document.write(html);
            printWindow.document.close();
            printWindow.print();
        } catch (error) {
            console.error('Print error:', error);
            alert('Failed to load print data. Please try again.');
        } finally {
            setPrinting(false);
            setShowPrintModal(false);
        }
    };

    const lowStockItems = low_stock_items || [];

    const { post, processing } = useForm();

    const handleRollover = () => {
        setConfirmingRollover(true);
    };

    const performRollover = () => {
        post(route('stock.rollover'), {
            onSuccess: () => setConfirmingRollover(false),
        });
    };

    const closeModal = () => {
        setConfirmingRollover(false);
    };

    return (
        <>
            <style>{`
            @keyframes electric-flicker-rollover {
                0%   { box-shadow: 0 0 4px 1px #6366f1, 0 0 10px 2px #4f46e5; opacity: 1; }
                10%  { box-shadow: 0 0 2px 1px #6366f1, 0 0 5px 1px #4f46e5;  opacity: 0.82; }
                25%  { box-shadow: 0 0 8px 3px #a5b4fc, 0 0 18px 5px #4f46e5; opacity: 1; }
                40%  { box-shadow: 0 0 2px 1px #6366f1, 0 0 4px 1px #4f46e5;  opacity: 0.78; }
                55%  { box-shadow: 0 0 10px 4px #c7d2fe, 0 0 22px 6px #4f46e5;opacity: 1; }
                70%  { box-shadow: 0 0 2px 1px #6366f1, 0 0 5px 1px #4f46e5;  opacity: 0.85; }
                85%  { box-shadow: 0 0 7px 3px #a5b4fc, 0 0 16px 4px #4f46e5; opacity: 1; }
                100% { box-shadow: 0 0 4px 1px #6366f1, 0 0 10px 2px #4f46e5; opacity: 1; }
            }
            .electric-rollover:hover { animation: electric-flicker-rollover 0.2s step-end infinite; }
        `}</style>
            <AuthenticatedLayout
                user={auth.user}
                header={
                    <div className="flex justify-between items-center">
                        <h2 className="font-semibold text-xl text-gray-800 dark:text-white leading-tight">
                            Inventory Management
                        </h2>
                        <button
                            onClick={handleRollover}
                            disabled={processing}
                            onMouseEnter={(e) => { const rect = e.currentTarget.getBoundingClientRect(); setTooltip({ show: true, text: 'Run End-of-Day Rollover', x: rect.left + rect.width / 2, y: rect.bottom + 10 }); }}
                            onMouseLeave={() => setTooltip({ show: false, text: '', x: 0, y: 0 })}
                            className="electric-rollover inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150 shadow-sm"
                        >
                            {processing ? <ArrowPathIcon className="h-4 w-4 animate-spin" /> : <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                            </svg>}
                        </button>
                    </div>
                }
            >
                <Head title="Inventory Management" />

                <div className="py-6">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

                        {/* Low Stock Alert */}
                        {lowStockItems.length > 0 && (
                            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6 transition-all duration-300">
                                <div
                                    className="flex justify-between items-center cursor-pointer"
                                    onClick={toggleLowStockDropdown}
                                >
                                    <div className="flex items-center">
                                        <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400 mr-2" />
                                        <h3 className="text-lg font-medium text-red-800 dark:text-red-400">
                                            Low Stock Alert ({lowStockItems.length} items)
                                        </h3>
                                    </div>
                                    <button
                                        type="button"
                                        className="text-red-800 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 focus:outline-none transition-colors"
                                    >
                                        <div className={`transform transition-transform duration-200 ${showLowStockItems ? 'rotate-180' : ''}`}>
                                            <ChevronUpDownIcon className="h-5 w-5" />
                                        </div>
                                    </button>
                                </div>

                                {showLowStockItems && (
                                    <div className="mt-4 pt-4 border-t border-red-200 dark:border-red-800 animate-fadeIn">
                                        <p className="text-sm text-red-700 dark:text-red-300 mb-2">The following items are running low on stock:</p>
                                        <div className="max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-red-200 dark:scrollbar-thumb-red-800">
                                            <ol className="list-decimal list-inside text-sm text-red-700 dark:text-red-300 space-y-1">
                                                {lowStockItems.map(item => (
                                                    <li key={item.id} className="p-1 hover:bg-red-100 dark:hover:bg-red-900/50 rounded transition-colors">
                                                        <span className="font-medium">{item.name}</span> - {item.unit === 'Quantity' ? Math.floor(item.available_stock) : item.available_stock} {item.unit === 'Quantity' ? 'pcs.' : item.unit} available
                                                    </li>
                                                ))}
                                            </ol>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

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
                                                    performSearch(e.target.value);
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
                                                    applyFilters({ category: e.target.value });
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
                                                    applyFilters({ stockLevel: e.target.value });
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
                                                    applyFilters({ dateFrom: e.target.value });
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
                                                    applyFilters({ dateTo: e.target.value });
                                                }}
                                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Inventory Charts */}
                        <InventoryCharts items={items.data} summary={summary} />

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
                                    <button
                                        onClick={handlePrintClick}
                                        className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        title="Print Inventory"
                                    >
                                        <PrinterIcon className="h-5 w-5 mr-2" />
                                        Print
                                    </button>
                                </div>
                            </div>


                            {items.data.length > 0 ? (
                                <div className="block lg:hidden">
                                    {/* Mobile Card View */}
                                    <div className="space-y-4">
                                        {items.data.map((item, index) => (
                                            <div key={item.id} className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 border ${isLowStock(item.available_stock) ? 'border-red-200 dark:border-red-800' : 'border-gray-200 dark:border-gray-700'
                                                }`}>
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                            {items.from + index}. {item.name}
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
                            {items.data.length > 0 ? (
                                <div className="hidden lg:block overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-blue-600/70 dark:bg-blue-900/80">
                                            <tr>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-blue-700/50 dark:hover:bg-blue-800/50 transition-colors"
                                                    onClick={() => toggleSort('name')}
                                                >
                                                    <div className="flex items-center">
                                                        Item Name
                                                        {sortBy === 'name' && (
                                                            <ChevronUpDownIcon className="ml-1 h-4 w-4 text-white" />
                                                        )}
                                                    </div>
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-blue-700/50 dark:hover:bg-blue-800/50 transition-colors"
                                                    onClick={() => toggleSort('category')}
                                                >
                                                    <div className="flex items-center">
                                                        Category
                                                        {sortBy === 'category' && (
                                                            <ChevronUpDownIcon className="ml-1 h-4 w-4 text-white" />
                                                        )}
                                                    </div>
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-blue-700/50 dark:hover:bg-blue-800/50 transition-colors"
                                                    onClick={() => toggleSort('quantity')}
                                                >
                                                    <div className="flex items-center">
                                                        Total Stocks
                                                        {sortBy === 'quantity' && (
                                                            <ChevronUpDownIcon className="ml-1 h-4 w-4 text-white" />
                                                        )}
                                                    </div>
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                                    Total Distributed
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                                    Available Stocks
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {items.data.map((item, index) => (
                                                <tr
                                                    key={item.id}
                                                    className={`odd:bg-white even:bg-gray-200 dark:odd:bg-gray-800 dark:even:bg-gray-700 hover:bg-blue-200 dark:hover:bg-gray-600 border-b border-gray-300 dark:border-gray-600 transition-colors duration-200 ${isLowStock(item.available_stock) ? '!bg-red-200 dark:!bg-red-900 border-red-300 dark:border-red-800' : ''}`}
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                            {items.from + index}. {item.name}
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
                                                        {(item.unit === 'Quantity' || item.unit === 'pcs') ? Math.floor(item.total_stock) : item.total_stock} {(item.unit === 'Quantity' || item.unit === 'pcs') ? 'pcs' : item.unit}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                        {(item.unit === 'Quantity' || item.unit === 'pcs') ? Math.floor(item.total_distributed) : item.total_distributed} {(item.unit === 'Quantity' || item.unit === 'pcs') ? 'pcs' : item.unit}
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

                            {/* Pagination */}
                            {items.last_page > 1 && (
                                <div className="px-6 py-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                                        <div className="text-sm text-gray-700 dark:text-gray-300">
                                            Showing {items.from} to {items.to} of {items.total} results
                                        </div>
                                        <div className="flex flex-wrap justify-center gap-1">
                                            {items.links.map((link, index) => (
                                                <Link
                                                    key={index}
                                                    href={link.url || '#'}
                                                    className={`px-3 py-2 text-sm rounded-md ${link.active
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                                                        } ${!link.url ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                    preserveScroll
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
            {tooltip.show && (
                <div
                    className="fixed z-50 bg-gray-900 text-white text-sm px-2 py-1 rounded shadow-lg pointer-events-none"
                    style={{ left: tooltip.x - 50, top: tooltip.y }}
                >
                    {tooltip.text}
                </div>
            )}
            <Modal show={confirmingRollover} onClose={closeModal}>
                <div className="p-6 bg-red-50 dark:bg-red-950">
                    <div className="flex items-center mb-4">
                        <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400 mr-3" />
                        <h2 className="text-lg font-medium text-red-800 dark:text-red-200">
                            Finalize Today's Stock?
                        </h2>
                    </div>
                    <p className="text-sm text-red-700 dark:text-red-300 mb-6">
                        Are you sure you want to finalize today's stock and start a new day? This will update the primary stock values and lock today's distributions.
                    </p>
                    <div className="flex justify-end">
                        <SecondaryButton onClick={closeModal}>
                            Cancel
                        </SecondaryButton>
                        <DangerButton className="ms-3" onClick={performRollover} disabled={processing}>
                            {processing ? 'Finalizing...' : 'Finalize'}
                        </DangerButton>
                    </div>
                </div>
            </Modal>

            {/* Print Options Modal */}
            <Modal show={showPrintModal} onClose={() => setShowPrintModal(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                        Print Inventory
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Select pages to print:
                            </label>
                            <div className="space-y-2">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="printOption"
                                        value="current"
                                        checked={printOption === 'current'}
                                        onChange={(e) => setPrintOption(e.target.value)}
                                        className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                        Current Page (Page {items.current_page} of {items.last_page})
                                    </span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="printOption"
                                        value="all"
                                        checked={printOption === 'all'}
                                        onChange={(e) => setPrintOption(e.target.value)}
                                        className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                        All Pages (All {items.last_page} pages)
                                    </span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="printOption"
                                        value="range"
                                        checked={printOption === 'range'}
                                        onChange={(e) => setPrintOption(e.target.value)}
                                        className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                                        Page Range
                                    </span>
                                </label>
                            </div>
                        </div>

                        {printOption === 'range' && (
                            <div className="flex items-center gap-4 ml-6">
                                <div>
                                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                                        From:
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max={totalPages}
                                        value={printStartPage}
                                        onChange={(e) => setPrintStartPage(parseInt(e.target.value) || 1)}
                                        className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                                        To:
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max={totalPages}
                                        value={printEndPage}
                                        onChange={(e) => setPrintEndPage(parseInt(e.target.value) || 1)}
                                        className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    />
                                </div>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    (Max: {totalPages})
                                </span>
                            </div>
                        )}

                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                            {printOption === 'current' && `Will print items from page ${items.current_page} only.`}
                            {printOption === 'all' && `Will print all ${items.total} items across ${items.last_page} pages.`}
                            {printOption === 'range' && `Will print pages ${printStartPage} to ${printEndPage}.`}
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setShowPrintModal(false)}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton
                            onClick={confirmPrint}
                            disabled={printing}
                            className={printing ? 'opacity-50' : ''}
                        >
                            {printing ? 'Printing...' : 'Print'}
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>
        </>);
}
