// resources/js/Pages/ActivityHistory.jsx
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState, useEffect, useRef } from 'react';
import {
    ArrowPathIcon,
    MagnifyingGlassIcon,
    XMarkIcon,
    ClockIcon,
    CheckCircleIcon,
    PencilSquareIcon,
    TrashIcon,
    UserIcon,
    FunnelIcon,
    CalendarIcon,
    ExclamationTriangleIcon,
    EyeIcon
} from '@heroicons/react/24/outline';

export default function ActivityHistory({ auth, history, groupedHistory, items, distributions, filters, activityTypes, actions }) {
    const [search, setSearch] = useState(filters.search || '');
    const [activityType, setActivityType] = useState(filters.activity_type || '');
    const [date, setDate] = useState(filters.date || '');
    const [searchTimeout, setSearchTimeout] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const isFirstRender = useRef(true);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        setSearch(urlParams.get('search') || '');
        setActivityType(urlParams.get('activity_type') || '');
        setDate(urlParams.get('date') || '');
    }, []);

    const performSearch = () => {
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        const timeout = setTimeout(() => {
            const params = new URLSearchParams(window.location.search);

            if (search) {
                params.set('search', search);
            } else {
                params.delete('search');
            }

            if (activityType) {
                params.set('activity_type', activityType);
            } else {
                params.delete('activity_type');
            }

            if (date) {
                params.set('date', date);
            } else {
                params.delete('date');
            }

            params.set('page', '1');

            router.get(`/activity-history?${params.toString()}`, {}, {
                preserveScroll: true,
                preserveState: true,
            });
        }, 300);

        setSearchTimeout(timeout);
    };

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        performSearch();
    }, [search, activityType, date]);

    const clearFilters = () => {
        setSearch('');
        setActivityType('');
        setDate('');
    };

    const getActionIcon = (action) => {
        switch (action) {
            case 'created':
                return <CheckCircleIcon className="h-5 w-5" />;
            case 'updated':
                return <PencilSquareIcon className="h-5 w-5" />;
            case 'deleted':
                return <TrashIcon className="h-5 w-5" />;
            default:
                return <ClockIcon className="h-5 w-5" />;
        }
    };

    const getActivityTypeBadgeStyle = (record) => {
        switch (record.activity_type) {
            case 'item':
                return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
            case 'distribution':
                return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';
            case 'borrowing':
                return 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
            default:
                return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600';
        }
    };

    const getActionColor = (action) => {
        switch (action) {
            case 'created':
                return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900 border-green-200 dark:border-green-800';
            case 'updated':
                return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900 border-blue-200 dark:border-blue-800';
            case 'deleted':
                return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900 border-red-200 dark:border-red-800';
            default:
                return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-gray-800';
        }
    };

    const getActivityTypeColor = (record) => {
        const activityType = record.activity_type;
        if (activityType === 'borrowing') {
            switch (record.borrowing?.status) {
                case 'returned':
                    return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900 border-green-200 dark:border-green-800';
                case 'overdue':
                    return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900 border-red-200 dark:border-red-800';
                default:
                    return 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900 border-purple-200 dark:border-purple-800';
            }
        } else {
            switch (activityType) {
                case 'item':
                    return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900 border-blue-200 dark:border-blue-800';
                case 'distribution':
                    return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900 border-green-200 dark:border-green-800';
                default:
                    return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-gray-800';
            }
        }
    };

    const formatUnit = (unit) => {
        if (!unit) return '';
        const map = {
            'Quantity': 'pcs',
            'Kg': 'kg',
        };
        return map[unit] || unit.toLowerCase();
    };

    const formatQuantity = (quantity) => {
        return parseFloat(quantity).toString();
    };

    const formatChanges = (oldValues, newValues) => {
        if (!oldValues && !newValues) return null;

        const changes = [];

        if (oldValues && newValues) {
            Object.keys(newValues).forEach(key => {
                if (oldValues[key] !== newValues[key]) {
                    changes.push({
                        field: key,
                        old: oldValues[key],
                        new: newValues[key]
                    });
                }
            });
        }

        return changes;
    };

    const formatChangeValue = (value, field) => {
        if (!value) return 'empty';
        
        // Format timestamp fields in user-friendly way
        if (field === 'updated_at' || field === 'date_time' || field === 'created_at') {
            try {
                const date = new Date(value);
                return date.toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                });
            } catch (e) {
                return value;
            }
        }
        
        return value;
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-white leading-tight">
                        Activity Log
                    </h2>
                </div>
            }
        >
            <Head title="Activity Log" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Advanced Filters */}
                    <div className="mb-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center mb-4">
                            <FunnelIcon className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Filters</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                            {/* Search */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Search
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                    </div>
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search activities..."
                                        className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                    {search && (
                                        <button
                                            onClick={() => setSearch('')}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        >
                                            <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Activity Type Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Activity Type
                                </label>
                                <select
                                    value={activityType}
                                    onChange={(e) => setActivityType(e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                >
                                    <option value="">All Types</option>
                                    {Object.entries(activityTypes).map(([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Date Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <span className="flex items-center gap-1">
                                        <CalendarIcon className="h-4 w-4" />
                                        Date
                                    </span>
                                </label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    </div>

                    {/* Activity Timeline */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        {Object.keys(groupedHistory || {}).length > 0 ? (
                            <div className="p-6">
                                <div className="relative">
                                    {/* Timeline Line */}
                                    <div className="hidden sm:block absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

                                    {/* Mobile Timeline Line */}
                                    <div className="sm:hidden absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>

                                    {/* Timeline Items - Grouped by transaction */}
                                    {Object.entries(groupedHistory || {}).map(([transactionId, records], groupIndex) => {
                                        const isGrouped = records.length > 1;
                                        const firstRecord = records[0];
                                        return (
                                            <div key={`group-${transactionId}`} className="relative flex items-start mb-8 last:mb-0">
                                                {/* Timeline Dot */}
                                                <div className={`flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 ${getActionColor(firstRecord.action)} z-10 flex-shrink-0`}>
                                                    {getActionIcon(firstRecord.action)}
                                                </div>

                                                {/* Content */}
                                                <div className="ml-4 sm:ml-6 flex-1 min-w-0">
                                                    <div className={`rounded-xl p-4 sm:p-5 border transition-all duration-200 border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-600 ${groupIndex % 2 === 1
                                                        ? 'bg-gray-50 dark:bg-gray-800/50'
                                                        : 'bg-white dark:bg-gray-800'
                                                        }`}>
                                                        {/* Header */}
                                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                                                                {/* Transaction Badge */}
                                                                {isGrouped && (
                                                                    <div className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-sm">
                                                                        <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                                                        </svg>
                                                                        {records.length} items
                                                                    </div>
                                                                )}

                                                                {/* Activity Type Badge */}
                                                                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${getActivityTypeBadgeStyle(firstRecord)}`}>
                                                                    {firstRecord.activity_type === 'item' ? 'Item' : firstRecord.activity_type === 'distribution' ? 'Distribution' : 'Borrowing'}
                                                                </span>

                                                                {/* Destination for distribution */}
                                                                {firstRecord.activity_type === 'distribution' && firstRecord.purchase && (
                                                                    <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                                                        To: {firstRecord.purchase.supplier_name}
                                                                    </span>
                                                                )}

                                                                {/* Date */}
                                                                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                                                    {new Date(firstRecord.created_at).toLocaleDateString()}
                                                                </span>
                                                            </div>

                                                            {/* User */}
                                                            {firstRecord.user && (
                                                                <div className="flex items-center text-xs sm:text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-full">
                                                                    <UserIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
                                                                    <span className="font-medium">{firstRecord.user.name}</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* View Button */}
                                                        <div className="flex justify-end mb-4">
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedActivity(firstRecord);
                                                                    setShowModal(true);
                                                                }}
                                                                className="inline-flex items-center px-4 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg transition-all duration-200 hover:shadow-sm"
                                                            >
                                                                <EyeIcon className="h-4 w-4 mr-1.5" />
                                                                View Details
                                                            </button>
                                                        </div>

                                                        {/* Display all records in the transaction */}
                                                        <div className="space-y-2">
                                                            {records.map((record, recordIndex) => {
                                                                const changes = formatChanges(record.old_values, record.new_values);
                                                                return (
                                                                    <div key={`record-${record.id}`} className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-100 dark:border-gray-600 hover:border-indigo-200 dark:hover:border-indigo-700 transition-colors">
                                                                        {/* Entity Link */}
                                                                        {record.activity_type === 'item' && record.item && (
                                                                            <div className="mb-2">
                                                                                <Link
                                                                                    href={route('items.show', record.item.id)}
                                                                                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 font-semibold text-sm break-words"
                                                                                >
                                                                                    {record.item.name}
                                                                                </Link>
                                                                                {record.item.quantity !== undefined && (
                                                                                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                                                                        Qty: {formatQuantity(record.item.quantity)}{record.item.unit ? ` ${formatUnit(record.item.unit)}` : ''}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        )}

                                                                        {record.activity_type === 'distribution' && record.purchase && (
                                                                            <div className="mb-2">
                                                                                <Link
                                                                                    href={route('purchases.show', record.purchase.id)}
                                                                                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 font-semibold text-sm break-words"
                                                                                >
                                                                                    {record.purchase.item_name}
                                                                                </Link>
                                                                                {record.purchase.quantity !== undefined && (
                                                                                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                                                                        Qty: {formatQuantity(record.purchase.quantity)}{record.purchase.unit ? ` ${formatUnit(record.purchase.unit)}` : ''}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        )}

                                                                        {record.activity_type === 'borrowing' && record.borrowing && (
                                                                            <div className="mb-2">
                                                                                <Link
                                                                                    href={route('borrowings.show', record.borrowing.id)}
                                                                                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 font-semibold text-sm break-words"
                                                                                >
                                                                                    {record.borrowing.item_name}
                                                                                </Link>
                                                                                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                                                                    By: {record.borrowing.borrower_name}
                                                                                </span>
                                                                                {record.borrowing.quantity !== undefined && (
                                                                                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                                                                                        Qty: {formatQuantity(record.borrowing.quantity)}{record.borrowing.unit ? ` ${formatUnit(record.borrowing.unit)}` : ''}
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        )}

                                                                        {changes && changes.length > 0 && (
                                                                            <div className="mt-2 space-y-2">
                                                                                {changes.filter(change => !['updated_at', 'date_time'].includes(change.field)).map((change, idx) => (
                                                                                    <div key={idx} className="bg-gray-50 dark:bg-gray-800 p-2 rounded border border-gray-100 dark:border-gray-700">
                                                                                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                                                                            {change.field}
                                                                                        </div>
                                                                                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 text-xs">
                                                                                            <span className="text-red-600 line-through break-words">
                                                                                                {change.field === 'quantity' && !isNaN(change.old) ? formatQuantity(change.old) : (change.old || 'empty')}
                                                                                            </span>
                                                                                            <ArrowPathIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                                                                                            <span className="text-green-600 break-words">
                                                                                                {change.field === 'quantity' && !isNaN(change.new) ? formatQuantity(change.new) : (change.new || 'empty')}
                                                                                            </span>
                                                                                        </div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="p-8 sm:p-12 text-center">
                                <ClockIcon className="h-8 w-8 sm:h-12 sm:w-12 text-gray-300 dark:text-gray-500 mx-auto mb-3" />
                                <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                                    {search || activityType
                                        ? 'No activities found matching your filters'
                                        : 'No activities found'}
                                </p>
                                {(search || activityType) && (
                                    <button
                                        onClick={clearFilters}
                                        className="mt-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-xs sm:text-sm font-medium"
                                    >
                                        Clear filters
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Pagination */}
                        {history.links && (
                            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
                                    <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 text-center sm:text-left">
                                        Showing {history.from} to {history.to} of {history.total} activities
                                    </div>
                                    <div className="flex flex-wrap justify-center sm:justify-start space-x-1 sm:space-x-1">
                                        {history.links.map((link, index) => (
                                            <Link
                                                key={link.url || link.label + '-' + index}
                                                href={link.url || '#'}
                                                className={`px-2 sm:px-3 py-2 text-xs sm:text-sm rounded-md ${link.active
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                                                    } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Activity Detail Modal */}
            {showModal && selectedActivity && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowModal(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                    Activity Details
                                </h3>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                        </div>

                        <div className="px-6 py-4 space-y-5">
                            {/* Header Card - Transaction Info */}
                            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-5 border border-indigo-100 dark:border-indigo-800">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            {selectedActivity.activity_type === 'item' && (
                                                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                                                    <PencilSquareIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                                </div>
                                            )}
                                            {selectedActivity.activity_type === 'distribution' && (
                                                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                                                    <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                                                </div>
                                            )}
                                            {selectedActivity.activity_type === 'borrowing' && (
                                                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                                                    <ExclamationTriangleIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                                </div>
                                            )}
                                            <div>
                                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    {selectedActivity.activity_type === 'item' ? 'Item Activity' :
                                                     selectedActivity.activity_type === 'distribution' ? 'Distribution' :
                                                     selectedActivity.activity_type === 'borrowing' ? 'Borrowing' : 'Activity'}
                                                </h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    {selectedActivity.action_label || 'Recorded'}
                                                </p>
                                            </div>
                                        </div>
                                        {selectedActivity.transaction_id && (
                                            <div className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700">
                                                <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                                </svg>
                                                {selectedActivity.transaction_id}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Created</p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {new Date(selectedActivity.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                            <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Activity ID</p>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">#{selectedActivity.id}</p>
                                        </div>
                                    </div>
                                </div>
                                {selectedActivity.user && (
                                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                                <UserIcon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">User</p>
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{selectedActivity.user.name}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Related Entities */}
                            {(() => {
                                const transactionId = selectedActivity.transaction_id;
                                const relatedRecords = transactionId
                                    ? Object.values(groupedHistory || {}).flat().filter(r => r.transaction_id && r.transaction_id === transactionId)
                                    : [selectedActivity];

                                return (
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                            </svg>
                                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                                Related Items ({relatedRecords.length})
                                            </h4>
                                        </div>
                                        <div className="grid grid-cols-1 gap-3">
                                            {relatedRecords.map((record, idx) => (
                                                <div key={record.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors">
                                                    {record.activity_type === 'item' && record.item && (
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex items-start gap-3">
                                                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                                                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                                    </svg>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{record.item.name}</p>
                                                                    {record.item.quantity !== undefined && (
                                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                                            Quantity: {formatQuantity(record.item.quantity)}{record.item.unit ? ` ${formatUnit(record.item.unit)}` : ''}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {record.activity_type === 'distribution' && record.purchase && (
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex items-start gap-3">
                                                                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                                                    <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                    </svg>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{record.purchase.item_name}</p>
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                                        To: {record.purchase.supplier_name}
                                                                    </p>
                                                                    {record.purchase.quantity !== undefined && (
                                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                                            Quantity: {formatQuantity(record.purchase.quantity)}{record.purchase.unit ? ` ${formatUnit(record.purchase.unit)}` : ''}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {record.activity_type === 'borrowing' && record.borrowing && (
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex items-start gap-3">
                                                                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                                                    <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                                    </svg>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{record.borrowing.item_name}</p>
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                                        By: {record.borrowing.borrower_name}
                                                                    </p>
                                                                    {record.borrowing.quantity !== undefined && (
                                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                                            Quantity: {formatQuantity(record.borrowing.quantity)}{record.borrowing.unit ? ` ${formatUnit(record.borrowing.unit)}` : ''}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Changes */}
                            {(() => {
                                const allChanges = formatChanges(selectedActivity.old_values, selectedActivity.new_values);
                                return allChanges && allChanges.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Changes</label>
                                        <div className="space-y-3">
                                            {allChanges.map((change, idx) => (
                                                <div key={idx} className="bg-gray-50 dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600">
                                                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                                        {change.field}
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 text-sm">
                                                        <span className="text-red-600 line-through break-words">
                                                            {formatChangeValue(change.old, change.field)}
                                                        </span>
                                                        <ArrowPathIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                                        <span className="text-green-600 break-words">
                                                            {formatChangeValue(change.new, change.field)}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>

                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
