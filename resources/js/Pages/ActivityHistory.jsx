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
    CalendarIcon
} from '@heroicons/react/24/outline';

export default function ActivityHistory({ auth, history, items, distributions, filters, activityTypes, actions }) {
    const [search, setSearch] = useState(filters.search || '');
    const [action, setAction] = useState(filters.action || '');
    const [activityType, setActivityType] = useState(filters.activity_type || '');
    const [searchTimeout, setSearchTimeout] = useState(null);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        setSearch(urlParams.get('search') || '');
        setAction(urlParams.get('action') || '');
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
            
            if (action) {
                params.set('action', action);
            } else {
                params.delete('action');
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
    }, [search, action, activityType]);

    const clearFilters = () => {
        setSearch('');
        setAction('');
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
                return 'text-green-600 bg-green-100 border-green-200';
            case 'updated':
                return 'text-blue-600 bg-blue-100 border-blue-200';
            case 'deleted':
                return 'text-red-600 bg-red-100 border-red-200';
            default:
                return 'text-gray-600 bg-gray-100 border-gray-200';
        }
    };

    const getActivityTypeColor = (activityType) => {
        switch (activityType) {
            case 'item':
                return 'text-blue-600 bg-blue-100 border-blue-200';
            case 'distribution':
                return 'text-green-600 bg-green-100 border-green-200';
            default:
                return 'text-gray-600 bg-gray-100 border-gray-200';
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
                        Activity History
                    </h2>
                    <div className="text-sm text-gray-500">
                        All activities across items and distributions
                    </div>
                </div>
            }
        >
            <Head title="Activity History" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Advanced Filters */}
                    <div className="mb-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center mb-4">
                            <FunnelIcon className="h-5 w-5 text-gray-500 mr-2" />
                            <h3 className="text-lg font-medium text-gray-900">Filters</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {/* Search */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Search
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search activities..."
                                        className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                    {search && (
                                        <button
                                            onClick={() => setSearch('')}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        >
                                            <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            {/* Action Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Action Type
                                </label>
                                <select
                                    value={action}
                                    onChange={(e) => setAction(e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                >
                                    <option value="">All Actions</option>
                                    {Object.entries(actions).map(([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            {/* Activity Type Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Activity Type
                                </label>
                                <select
                                    value={activityType}
                                    onChange={(e) => setActivityType(e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    </div>

                    {/* Activity Timeline */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        {history.data.length > 0 ? (
                            <div className="p-6">
                                <div className="relative">
                                    {/* Timeline Line */}
                                    <div className="hidden sm:block absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                                    
                                    {/* Mobile Timeline Line */}
                                    <div className="sm:hidden absolute left-4 top-8 bottom-0 w-0.5 bg-gray-200"></div>
                                    
                                    {/* Timeline Items */}
                                    {history.data.map((record, index) => {
                                        const changes = formatChanges(record.old_values, record.new_values);
                                        return (
                                            <div key={record.id} className="relative flex items-start mb-8 last:mb-0">
                                                {/* Timeline Dot */}
                                                <div className={`flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 ${getActionColor(record.action)} z-10 flex-shrink-0`}>
                                                    {getActionIcon(record.action)}
                                                </div>
                                                
                                                {/* Content */}
                                                <div className="ml-4 sm:ml-6 flex-1 min-w-0">
                                                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200">
                                                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 space-y-2 sm:space-y-0">
                                                            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3">
                                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(record.action)}`}>
                                                                    {record.action_label}
                                                                </span>
                                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActivityTypeColor(record.activity_type)}`}>
                                                                    {record.activity_type === 'item' ? 'Item' : 'Distribution'}
                                                                </span>
                                                                <span className="text-xs sm:text-sm text-gray-500 break-words">
                                                                    {new Date(record.created_at).toLocaleString()}
                                                                </span>
                                                            </div>
                                                            {record.user && (
                                                                <div className="flex items-center text-xs sm:text-sm text-gray-500">
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
                                                                className="text-indigo-600 hover:text-indigo-900 font-medium text-xs sm:text-sm break-words"
                                                            >
                                                                {record.item.name}
                                                            </Link>
                                                            {record.item.quantity !== undefined && (
                                                                <span className="ml-2 text-xs sm:text-sm text-gray-500">
                                                                    (Qty: {record.item.quantity})
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                    
                                                    {record.activity_type === 'distribution' && record.purchase && (
                                                        <div className="mb-2">
                                                            <Link
                                                                href={route('purchases.show', record.purchase.id)}
                                                                className="text-indigo-600 hover:text-indigo-900 font-medium text-xs sm:text-sm break-words"
                                                            >
                                                                {record.purchase.item_name}
                                                            </Link>
                                                            <span className="ml-2 text-xs sm:text-sm text-gray-500">
                                                                (To: {record.purchase.supplier_name})
                                                            </span>
                                                            {record.purchase.quantity !== undefined && (
                                                                <span className="ml-2 text-xs sm:text-sm text-gray-500">
                                                                    (Qty: {record.purchase.quantity})
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                        
                                                        {record.description && (
                                                            <p className="text-gray-700 text-xs sm:text-sm mb-3 break-words">{record.description}</p>
                                                        )}
                                                        
                                                        {changes && changes.length > 0 && (
                                                            <div className="space-y-2">
                                                                {changes.map((change, idx) => (
                                                                    <div key={idx} className="bg-white p-2 sm:p-3 rounded border border-gray-100">
                                                                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
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
                                <ClockIcon className="h-8 w-8 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 text-xs sm:text-sm">
                                    {search || action || activityType 
                                        ? 'No activities found matching your filters' 
                                        : 'No activities found'}
                                </p>
                                {(search || action || activityType) && (
                                    <button
                                        onClick={clearFilters}
                                        className="mt-2 text-indigo-600 hover:text-indigo-800 text-xs sm:text-sm font-medium"
                                    >
                                        Clear filters
                                    </button>
                                )}
                            </div>
                        )}
                        
                        {/* Pagination */}
                        {history.links && (
                            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-white border-t border-gray-200">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
                                    <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
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
                                                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
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
