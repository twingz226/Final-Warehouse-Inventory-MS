import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
} from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import InventoryCharts from '@/Components/InventoryCharts';

// Register Chart.js components
ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
);

export default function Dashboard({
    totalItems,
    totalStock,
    availableStock,
    lowStockItems,
    lowStockDetails,
    activeBorrowings,
    overdueBorrowings,
    borrowedItemsDetails,
    recentActivities,
    itemsByCategory,
    stockDistribution,
    weeklyBorrowings,
    items,
    summary
}) {
    // Prepare data for pie chart (items by category)
    const pieData = {
        labels: ['Tools', 'Materials'],
        datasets: [{
            data: [itemsByCategory?.tools || 0, itemsByCategory?.materials || 0],
            backgroundColor: [
                'rgba(59, 130, 246, 0.8)', // Blue
                'rgba(16, 185, 129, 0.8)', // Green
            ],
            borderColor: [
                'rgba(59, 130, 246, 1)',
                'rgba(16, 185, 129, 1)',
            ],
            borderWidth: 1,
        }],
    };

    // Prepare data for bar chart (stock distribution)
    const barData = {
        labels: ['Available Stock', 'Distributed Stock', 'Total Stock'],
        datasets: [{
            label: 'Stock Quantity',
            data: [
                stockDistribution?.available || 0,
                stockDistribution?.distributed || 0,
                stockDistribution?.total || 0
            ],
            backgroundColor: [
                'rgba(34, 197, 94, 0.8)', // Green for available
                'rgba(251, 146, 60, 0.8)', // Orange for distributed
                'rgba(139, 69, 19, 0.8)', // Brown for total
            ],
            borderColor: [
                'rgba(34, 197, 94, 1)',
                'rgba(251, 146, 60, 1)',
                'rgba(139, 69, 19, 1)',
            ],
            borderWidth: 1,
        }],
    };

    // Prepare data for line chart (weekly borrowings)
    const lineData = {
        labels: weeklyBorrowings?.map(item => item.week) || [],
        datasets: [{
            label: 'Borrowings',
            data: weeklyBorrowings?.map(item => item.count) || [],
            borderColor: 'rgba(147, 51, 234, 1)', // Purple
            backgroundColor: 'rgba(147, 51, 234, 0.1)',
            tension: 0.4,
            fill: true,
        }],
    };

    const pieOptions = {
        responsive: true,
        animation: {
            duration: 1000,
            easing: 'easeOutQuart',
        },
        plugins: {
            legend: {
                position: 'bottom',
            },
            title: {
                display: true,
                text: 'Items by Category',
            },
        },
    };

    const barOptions = {
        responsive: true,
        animation: {
            duration: 1000,
            easing: 'easeOutQuart',
        },
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Stock Distribution',
            },
        },
    };

    const lineOptions = {
        responsive: true,
        animation: {
            duration: 1000,
            easing: 'easeOutQuart',
        },
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Weekly Borrowing trends',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                },
            },
        },
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <svg className="h-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                                Total Items
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                                {totalItems}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                                Available Stock
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                                {availableStock}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                                Low Stock Items
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                                {lowStockItems}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                                Active Borrowings
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                                {activeBorrowings}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Additional Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                                Overdue Borrowings
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                                {overdueBorrowings}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                                Total Stock
                                            </dt>
                                            <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                                {totalStock}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Inventory Charts from Inventory Page */}
                    <InventoryCharts items={items} summary={summary} />

                    {/* Low Stock Details + Borrowed Items Details */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Low Stock Items Details */}
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                        Low Stock Items
                                    </h3>
                                    <Link
                                        href={route('inventory.index', { stock_level: 'low_stock' })}
                                        className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                                    >
                                        View all
                                    </Link>
                                </div>

                                {(lowStockDetails?.length || 0) > 0 ? (
                                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {lowStockDetails.map((item) => (
                                            <div key={item.id} className="py-3 flex items-center justify-between">
                                                <div className="min-w-0">
                                                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                                                        {item.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        ID: {item.id}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-semibold text-red-600 dark:text-red-400">
                                                        {item.available_stock} {item.unit}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        Available
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">No low stock items</p>
                                )}
                            </div>
                        </div>

                        {/* Borrowed Items Details */}
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                        Borrowed Items
                                    </h3>
                                    <Link
                                        href={route('borrowings.index', { status: 'active' })}
                                        className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                                    >
                                        View all
                                    </Link>
                                </div>

                                {(borrowedItemsDetails?.length || 0) > 0 ? (
                                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {borrowedItemsDetails.map((b) => (
                                            <div key={b.id} className="py-3 flex items-start justify-between gap-4">
                                                <div className="min-w-0 flex-1">
                                                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                                                        {b.item_name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        Borrower: {b.borrower_name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        Qty: {b.quantity}{b.tool_id ? ` • Tool ID: ${b.tool_id}` : ''}
                                                    </div>
                                                </div>

                                                <div className="text-right flex-shrink-0">
                                                    <div className={
                                                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ' +
                                                        (b.status === 'overdue'
                                                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                                                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300')
                                                    }>
                                                        {b.status}
                                                    </div>
                                                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                        Due: {b.expected_return_date ? new Date(b.expected_return_date).toLocaleDateString() : '—'}
                                                    </div>
                                                    {b.days_until_return !== null && b.days_until_return !== undefined && (
                                                        <div className={
                                                            'text-xs font-medium ' +
                                                            (b.days_until_return < 0
                                                                ? 'text-red-600 dark:text-red-400'
                                                                : 'text-gray-600 dark:text-gray-300')
                                                        }>
                                                            {b.days_until_return < 0
                                                                ? `${Math.abs(b.days_until_return)} day(s) overdue`
                                                                : `${b.days_until_return} day(s) left`}
                                                        </div>
                                                    )}
                                                    <div className="mt-1">
                                                        <Link
                                                            href={route('borrowings.show', b.id)}
                                                            className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                        >
                                                            Details
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">No active borrowings</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {/* Pie Chart - Items by Category */}
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="h-80">
                                    <Pie data={pieData} options={pieOptions} />
                                </div>
                            </div>
                        </div>

                        {/* Bar Chart - Stock Distribution */}
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="h-80">
                                    <Bar data={barData} options={barOptions} />
                                </div>
                            </div>
                        </div>

                        {/* Line Chart - Weekly Borrowing trends */}
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="h-80">
                                    <Line data={lineData} options={lineOptions} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activities */}
                    <div className="hidden bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                                Recent Activities
                            </h3>
                            {recentActivities.length > 0 ? (
                                <div className="space-y-4">
                                    {recentActivities.map((activity) => (
                                        <div key={activity.id} className="flex items-start space-x-3">
                                            <div className="flex-shrink-0">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activity.activity_type === 'item' ? 'bg-blue-100 text-blue-600' :
                                                    activity.activity_type === 'distribution' ? 'bg-green-100 text-green-600' :
                                                        activity.activity_type === 'borrowing' ? 'bg-purple-100 text-purple-600' :
                                                            'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {activity.activity_type === 'item' ? 'I' :
                                                        activity.activity_type === 'distribution' ? 'D' :
                                                            activity.activity_type === 'borrowing' ? 'B' : '?'}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-gray-900 dark:text-gray-100">
                                                    {activity.description}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {activity.user?.name} • {new Date(activity.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400">No recent activities</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
