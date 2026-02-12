// resources/js/Pages/Items/History.jsx
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
    UserIcon
} from '@heroicons/react/24/outline';
import { PlusIcon, EyeIcon } from '@heroicons/react/24/outline';

export default function History({ auth, item, history, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [action, setAction] = useState(filters.action || '');
    const [searchTimeout, setSearchTimeout] = useState(null);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const initialSearch = urlParams.get('search') || '';
        const initialAction = urlParams.get('action') || '';
        
        setSearch(initialSearch);
        setAction(initialAction);
    }, []);

    const handleSearch = (value) => {
        setSearch(value);
        performSearch(value, action);
    };

    const handleActionFilter = (value) => {
        setAction(value);
        performSearch(search, value);
    };

    const performSearch = (searchValue, actionValue) => {
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        
        const timeout = setTimeout(() => {
            const params = new URLSearchParams(window.location.search);
            
            if (searchValue) {
                params.set('search', searchValue);
            } else {
                params.delete('search');
            }
            
            if (actionValue) {
                params.set('action', actionValue);
            } else {
                params.delete('action');
            }
            
            params.set('page', '1');
            
            router.get(`${window.location.pathname}?${params.toString()}`, {}, {
                preserveScroll: true,
                preserveState: true,
            });
        }, 300);
        
        setSearchTimeout(timeout);
    };

    const clearFilters = () => {
        setSearch('');
        setAction('');
        performSearch('', '');
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
                    <div className="flex items-center space-x-4">
                        <Link
                            href={route('items.index')}
                            className="text-gray-600 hover:text-gray-900 flex items-center"
                        >
                            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Items
                        </Link>
                        <div className="border-l border-gray-300 h-6"></div>
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            History: {item.name}
                        </h2>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>Current Quantity:</span>
                        <span className="font-semibold text-gray-700">{item.quantity}</span>
                    </div>
                </div>
            }
        >
            <Head title={`History: ${item.name}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Filters */}
                    <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex flex-wrap gap-4 items-end">
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Search History
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        placeholder="Search descriptions..."
                                        className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                    {search && (
                                        <button
                                            onClick={() => handleSearch('')}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        >
                                            <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            <div className="min-w-[150px]">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Action Type
                                </label>
                                <select
                                    value={action}
                                    onChange={(e) => handleActionFilter(e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                >
                                    <option value="">All Actions</option>
                                    <option value="created">Created</option>
                                    <option value="updated">Updated</option>
                                    <option value="deleted">Deleted</option>
                                </select>
                            </div>
                            
                            <button
                                onClick={clearFilters}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>

                    {/* History Timeline */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        {history.data.length > 0 ? (
                            <div className="p-6">
                                <div className="relative">
                                    {/* Timeline Line */}
                                    <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                                    
                                    {/* Timeline Items */}
                                    {history.data.map((record, index) => {
                                        const changes = formatChanges(record.old_values, record.new_values);
                                        return (
                                            <div key={record.id} className="relative flex items-start mb-8 last:mb-0">
                                                {/* Timeline Dot */}
                                                <div className={`flex items-center justify-center w-16 h-16 rounded-full border-2 ${getActionColor(record.action)} z-10 flex-shrink-0`}>
                                                    {getActionIcon(record.action)}
                                                </div>
                                                
                                                {/* Content */}
                                                <div className="ml-6 flex-1">
                                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div className="flex items-center space-x-3">
                                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(record.action)}`}>
                                                                    {record.action_label}
                                                                </span>
                                                                <span className="text-sm text-gray-500">
                                                                    {new Date(record.created_at).toLocaleString()}
                                                                </span>
                                                            </div>
                                                            {record.user && (
                                                                <div className="flex items-center text-sm text-gray-500">
                                                                    <UserIcon className="h-4 w-4 mr-1" />
                                                                    {record.user.name}
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        {record.description && (
                                                            <p className="text-gray-700 text-sm mb-3">{record.description}</p>
                                                        )}
                                                        
                                                        {changes && changes.length > 0 && (
                                                            <div className="space-y-2">
                                                                {changes.map((change, idx) => (
                                                                    <div key={idx} className="bg-white p-3 rounded border border-gray-100">
                                                                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                                                                            {change.field}
                                                                        </div>
                                                                        <div className="flex items-center space-x-2 text-sm">
                                                                            <span className="text-red-600 line-through">
                                                                                {change.old || 'empty'}
                                                                            </span>
                                                                            <ArrowPathIcon className="h-4 w-4 text-gray-400" />
                                                                            <span className="text-green-600">
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
                            <div className="p-12 text-center">
                                <ClockIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 text-sm">
                                    {search || action ? 'No history records found matching your filters' : 'No history records found for this item'}
                                </p>
                                {(search || action) && (
                                    <button
                                        onClick={clearFilters}
                                        className="mt-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                                    >
                                        Clear filters
                                    </button>
                                )}
                            </div>
                        )}
                        
                        {/* Pagination */}
                        {history.links && (
                            <div className="px-6 py-4 bg-white border-t border-gray-200">
                                <div className="flex justify-between items-center">
                                    <div className="text-sm text-gray-700">
                                        Showing {history.from} to {history.to} of {history.total} records
                                    </div>
                                    <div className="flex space-x-1">
                                        {history.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={`px-3 py-2 text-sm rounded-md ${
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
