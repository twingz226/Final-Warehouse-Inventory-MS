// resources/js/Pages/Items/Index.jsx
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState, useEffect } from 'react';
import { PlusIcon, EyeIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function Index({ auth, items, status }) {
    const [confirmingItemDeletion, setConfirmingItemDeletion] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [search, setSearch] = useState('');
    const [searchTimeout, setSearchTimeout] = useState(null);
    const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 });

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const initialSearch = urlParams.get('search') || '';
        setSearch(initialSearch);
    }, []);

    const handleSearch = (value) => {
        setSearch(value);
        
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        
        const timeout = setTimeout(() => {
            const params = new URLSearchParams(window.location.search);
            if (value) {
                params.set('search', value);
            } else {
                params.delete('search');
            }
            params.set('page', '1');
            
            router.get(`${window.location.pathname}?${params.toString()}`, {}, {
                preserveScroll: true,
                preserveState: true,
            });
        }, 300);
        
        setSearchTimeout(timeout);
    };

    const deleteItem = (id) => {
        router.delete(route('items.destroy', id), {
            preserveScroll: true,
            onSuccess: () => setConfirmingItemDeletion(false),
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Tools & Materials
                    </h2>
                    <Link
                        href={route('items.create')}
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                    >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add New Tool/Material
                    </Link>
                </div>
            }
        >
            <Head title="Tools & Materials" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {status && (
                        <div className="mb-4 p-4 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded">
                            {status}
                        </div>
                    )}
                    <div className="mb-6">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                            </div>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                placeholder="Search tools and materials..."
                                className="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:placeholder-gray-400 dark:focus:placeholder-gray-500 focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 sm:text-sm transition duration-150 ease-in-out"
                            />
                            {search && (
                                <button
                                    onClick={() => handleSearch('')}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    <svg className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Quantity
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Date & Time
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {items.data.length > 0 ? (
                                        items.data.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {item.name}
                                                </div>
                                                {item.description && (
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {item.description.length > 50
                                                            ? `${item.description.substring(0, 50)}...`
                                                            : item.description}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {item.unit === 'Quantity' ? Math.floor(item.quantity) : item.quantity} {item.unit === 'Quantity' ? 'pcs.' : item.unit}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {item.date_time ? new Date(item.date_time).toLocaleString() : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <Link
                                                        href={route('items.show', item.id)}
                                                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                                                        onMouseEnter={(e) => { const rect = e.currentTarget.getBoundingClientRect(); setTooltip({ show: true, text: 'View', x: rect.left + rect.width / 2, y: rect.top - 30 }); }}
                                                        onMouseLeave={() => setTooltip({ show: false, text: '', x: 0, y: 0 })}
                                                    >
                                                        <EyeIcon className="h-5 w-5" />
                                                    </Link>
                                                    <button
                                                        onClick={() => {
                                                            setItemToDelete(item);
                                                            setConfirmingItemDeletion(true);
                                                        }}
                                                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                                                        onMouseEnter={(e) => { const rect = e.currentTarget.getBoundingClientRect(); setTooltip({ show: true, text: 'Delete', x: rect.left + rect.width / 2, y: rect.top - 30 }); }}
                                                        onMouseLeave={() => setTooltip({ show: false, text: '', x: 0, y: 0 })}
                                                    >
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center">
                                                    <MagnifyingGlassIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
                                                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                                                        {search ? `No results found for "${search}"` : 'No tools and materials found'}
                                                    </p>
                                                    {search && (
                                                        <button
                                                            onClick={() => handleSearch('')}
                                                            className="mt-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-medium"
                                                        >
                                                            Clear search
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {items.links && (
                            <div className="px-6 py-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between items-center">
                                    <div className="text-sm text-gray-700 dark:text-gray-300">
                                        Showing {items.from} to {items.to} of {items.total} results
                                    </div>
                                    <div className="flex space-x-1">
                                        {items.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={`px-3 py-2 text-sm rounded-md ${
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

            {/* Delete Confirmation Modal */}
            {confirmingItemDeletion && (
                <div className="fixed inset-0 bg-gray-500 dark:bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                            Delete Tool/Material
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Are you sure you want to delete "{itemToDelete?.name}"? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setConfirmingItemDeletion(false)}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => deleteItem(itemToDelete.id)}
                                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Tooltip */}
            {tooltip.show && (
                <div
                    className="fixed z-50 bg-gray-800 dark:bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none transform -translate-x-1/2"
                    style={{ left: tooltip.x, top: tooltip.y }}
                >
                    {tooltip.text}
                </div>
            )}
        </AuthenticatedLayout>
    );
}