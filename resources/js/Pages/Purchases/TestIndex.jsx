// resources/js/Pages/Items/Index.jsx
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState, useEffect } from 'react';
import { PlusIcon, EyeIcon, TrashIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function Index({ auth, items, status }) {
    const [confirmingItemDeletion, setConfirmingItemDeletion] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [search, setSearch] = useState('');
    const [searchTimeout, setSearchTimeout] = useState(null);
    const [date, setDate] = useState(null);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const initialSearch = urlParams.get('search') || '';
        const initialDate = urlParams.get('date') || null;
        
        setSearch(initialSearch);
        if (initialDate) {
            // Parse the date as UTC to match how we send it
            const date = new Date(initialDate + 'T00:00:00Z');
            setDate(date);
        }
    }, []);

    const handleSearch = (value) => {
        setSearch(value);
        performSearch(value, date);
    };

    const handleDateFilter = (selectedDate) => {
        setDate(selectedDate);
        performSearch(search, selectedDate);
    };

    const performSearch = (searchValue, selectedDate) => {
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
            
            if (selectedDate) {
                // Convert to UTC date to match database storage
                const utcDate = new Date(Date.UTC(
                    selectedDate.getFullYear(),
                    selectedDate.getMonth(),
                    selectedDate.getDate()
                ));
                params.set('date', utcDate.toISOString().split('T')[0]);
            } else {
                params.delete('date');
            }
            
            params.set('page', '1');
            
            router.get(`${window.location.pathname}?${params.toString()}`, {}, {
                preserveScroll: true,
                preserveState: true,
            });
        }, 300);
        
        setSearchTimeout(timeout);
    };

    const clearDateFilter = () => {
        handleDateFilter(null);
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
                        className="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
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
                        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
                            {status}
                        </div>
                    )}
                    <div className="mb-6">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => handleSearch(e.target.value)}
                                placeholder="Search tools and materials..."
                                className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                            />
                            {search && (
                                <button
                                    onClick={() => handleSearch('')}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                        
                        <div className="mt-4">
                            <div className="max-w-xs">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Filter by Date
                                </label>
                                <div className="relative">
                                    <DatePicker
                                        selected={date}
                                        onChange={handleDateFilter}
                                        placeholderText="Select date"
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        isClearable
                                    />
                                </div>
                                {date && (
                                    <button
                                        onClick={clearDateFilter}
                                        className="mt-2 inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        <XMarkIcon className="h-3 w-3 mr-1" />
                                        Clear Date
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Quantity
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date & Time
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {items.data.length > 0 ? (
                                        items.data.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {item.name}
                                                </div>
                                                {item.description && (
                                                    <div className="text-sm text-gray-500">
                                                        {item.description.length > 50
                                                            ? `${item.description.substring(0, 50)}...`
                                                            : item.description}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {item.quantity}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {item.date_time ? new Date(item.date_time).toLocaleString() : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <Link
                                                        href={route('items.show', item.id)}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                        title="View Item"
                                                    >
                                                        <EyeIcon className="h-5 w-5" />
                                                    </Link>
                                                    <button
                                                        onClick={() => {
                                                            setItemToDelete(item);
                                                            setConfirmingItemDeletion(true);
                                                        }}
                                                        className="text-red-600 hover:text-red-900"
                                                        title="Delete Item"
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
                                                    <MagnifyingGlassIcon className="h-12 w-12 text-gray-300 mb-3" />
                                                    <p className="text-gray-500 text-sm">
                                                        {search ? `No results found for "${search}"` : 'No tools and materials found'}
                                                        {date && (
                                                            <span className="block mt-1 text-xs text-gray-400">
                                                                Date filter: {date.toLocaleDateString()}
                                                            </span>
                                                        )}
                                                    </p>
                                                    {search && (
                                                        <button
                                                            onClick={() => handleSearch('')}
                                                            className="mt-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
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
                            <div className="px-6 py-4 bg-white border-t border-gray-200">
                                <div className="flex justify-between items-center">
                                    <div className="text-sm text-gray-700">
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

            {/* Delete Confirmation Modal */}
            {confirmingItemDeletion && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Delete Tool/Material
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete "{itemToDelete?.name}"? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setConfirmingItemDeletion(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
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
        </AuthenticatedLayout>
    );
}