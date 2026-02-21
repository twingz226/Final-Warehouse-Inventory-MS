// resources/js/Pages/ActivityHistory.jsx
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState, useEffect } from 'react';
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
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function ActivityHistory({ auth, history, items, distributions, filters, activityTypes, actions }) {
    const [search, setSearch] = useState(filters.search || '');
    const [activityType, setActivityType] = useState(filters.activity_type || '');
    const [searchTimeout, setSearchTimeout] = useState(null);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        setSearch(urlParams.get('search') || '');
        setActivityType(urlParams.get('activity_type') || '');
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
            
            params.set('page', '1');
            
            router.get(`/activity-history?${params.toString()}`, {}, {
                preserveScroll: true,
                preserveState: true,
            });
        }, 300);
        
        setSearchTimeout(timeout);
    };

    useEffect(() => {
        performSearch();
    }, [search, activityType]);

    const clearFilters = () => {
        setSearch('');
        setActivityType('');
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

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
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
                        {history.data.length > 0 ? (
                            <div className="p-6">
                                <div className="relative">
                                    {/* Timeline Line */}
                                    <div className="hidden sm:block absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                                    
                                    {/* Mobile Timeline Line */}
                                    <div className="sm:hidden absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                                    
                                    {/* Timeline Items */}
                                    {history.data.map((record, index) => {
                                        const changes = formatChanges(record.old_values, record.new_values);
                                        return (
                                            <div key={`activity-${record.id}-${index}`} className="relative flex items-start mb-8 last:mb-0">
                                                {/* Timeline Dot */}
                                                <div className={`flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 ${getActionColor(record.action)} z-10 flex-shrink-0`}>
                                                    {getActionIcon(record.action)}
                                                </div>
                                                
                                                {/* Content */}
                                                <div className="ml-4 sm:ml-6 flex-1 min-w-0">
                                                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-600">
                                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 space-y-2 sm:space-y-0">
                                                            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3">
                                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(record.action)}`}>
                                                                    {record.action_label}
                                                                </span>
                                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActivityTypeColor(record)}`}>
                                                                    {record.activity_type === 'item' ? 'Item' : record.activity_type === 'distribution' ? 'Distribution' : (
                                                                        <>
                                                                            {record.borrowing?.status === 'returned' && <CheckCircleIcon className="h-3 w-3 mr-1" />}
                                                                            {record.borrowing?.status === 'overdue' && <ExclamationTriangleIcon className="h-3 w-3 mr-1" />}
                                                                            {record.borrowing?.status.charAt(0).toUpperCase() + record.borrowing?.status.slice(1)}
                                                                        </>
                                                                    )}
                                                                </span>
                                                                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 break-words">
                                                                    {new Date(record.created_at).toLocaleString()}
                                                                </span>
                                                            </div>
                                                            {record.user && (
                                                                <div className="flex items-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                                                    <UserIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                                                    <span className="break-words">{record.user.name}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        {/* Entity Link */}
                                                    {record.activity_type === 'item' && record.item && (
                                                        <div className="mb-2">
                                                            <Link
                                                                href={route('items.show', record.item.id)}
                                                                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 font-medium text-xs sm:text-sm break-words"
                                                            >
                                                                {record.item.name}
                                                            </Link>
                                                            {record.item.quantity !== undefined && (
                                                                <span className="ml-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                                                    (Qty: {record.item.quantity})
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                    
                                                    {record.activity_type === 'distribution' && record.purchase && (
                                                        <div className="mb-2">
                                                            <Link
                                                                href={route('purchases.show', record.purchase.id)}
                                                                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 font-medium text-xs sm:text-sm break-words"
                                                            >
                                                                {record.purchase.item_name}
                                                            </Link>
                                                            <span className="ml-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                                                (To: {record.purchase.supplier_name})
                                                            </span>
                                                            {record.purchase.quantity !== undefined && (
                                                                <span className="ml-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                                                    (Qty: {record.purchase.quantity})
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                    
                                                    {record.activity_type === 'borrowing' && record.borrowing && (
                                                        <div className="mb-2">
                                                            <Link
                                                                href={route('borrowings.show', record.borrowing.id)}
                                                                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 font-medium text-xs sm:text-sm break-words"
                                                            >
                                                                {record.borrowing.item_name}
                                                            </Link>
                                                            <span className="ml-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                                                (Borrower: {record.borrowing.borrower_name})
                                                            </span>
                                                            {record.borrowing.quantity !== undefined && (
                                                                <span className="ml-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                                                    (Qty: {record.borrowing.quantity})
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                        
                                                        {record.description && (
                                                            <p className="text-gray-700 dark:text-gray-300 text-xs sm:text-sm mb-3 break-words">{record.description}</p>
                                                        )}
                                                        
                                                        {changes && changes.length > 0 && (
                                                            <div className="space-y-2">
                                                                {changes.filter(change => !['updated_at', 'date_time'].includes(change.field)).map((change, idx) => (
                                                                    <div key={idx} className="bg-white dark:bg-gray-800 p-2 sm:p-3 rounded border border-gray-100 dark:border-gray-700">
                                                                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                                                            {change.field}
                                                                        </div>
                                                                        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 text-xs sm:text-sm">
                                                                            <span className="text-red-600 line-through break-words">
                                                                                {change.old || 'empty'}
                                                                            </span>
                                                                            <ArrowPathIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0" />
                                                                            <span className="text-green-600 break-words">
                                                                                {change.new || 'empty'}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
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
                                                className={`px-2 sm:px-3 py-2 text-xs sm:text-sm rounded-md ${
                                                    link.active
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
        </AuthenticatedLayout>
    );
}
