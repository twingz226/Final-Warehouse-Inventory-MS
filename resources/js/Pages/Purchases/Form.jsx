// resources/js/Pages/Purchases/Form.jsx
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Form({ auth, purchase, statusOptions }) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        supplier_name: purchase?.supplier_name || '',
        supplier_email: purchase?.supplier_email || '',
        supplier_phone: purchase?.supplier_phone || '',
        item_name: purchase?.item_name || '',
        description: purchase?.description || '',
        quantity: purchase?.quantity || '',
        purchase_date: purchase?.purchase_date || new Date().toISOString().split('T')[0],
        notes: purchase?.notes || '',
        project_type: purchase?.project_type || '',
        project_name: purchase?.project_name || '',
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [searchTimeout, setSearchTimeout] = useState(null);

    // Handle search with debouncing
    const handleSearch = async (value) => {
        setSearchQuery(value);
        setShowDropdown(true);
        
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        
        if (value.length > 0 && value.length < 2) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }
        
        setIsSearching(true);
        
        const timeout = setTimeout(async () => {
            try {
                const response = await axios.get(route('items.search'), {
                    params: { search: value }
                });
                setSearchResults(response.data);
            } catch (error) {
                console.error('Error searching items:', error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 300);
        
        setSearchTimeout(timeout);
    };

    // Handle item selection from dropdown
    const handleItemSelect = (item) => {
        setData('item_name', item.name);
        if (item.description) {
            setData('description', item.description);
        }
        setSearchQuery(item.name);
        setShowDropdown(false);
        setSearchResults([]);
    };

    // Handle input focus
    const handleInputFocus = () => {
        setShowDropdown(true);
        if (searchQuery.length < 2) {
            handleSearch('');
        }
    };

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.searchable-dropdown')) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (purchase) {
            put(route('purchases.update', purchase.id), {
                onSuccess: () => reset(),
            });
        } else {
            post(route('purchases.store'), {
                onSuccess: () => reset(),
            });
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    {purchase ? 'Edit Distribution Order' : 'Create Distribution Order'}
                </h2>
            }
        >
            <Head title={purchase ? 'Edit Distribution Order' : 'Create Distribution Order'} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Destination Information Section */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Destination Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="supplier_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Destination Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="supplier_name"
                                            value={data.supplier_name}
                                            onChange={(e) => setData('supplier_name', e.target.value)}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 sm:text-sm"
                                            required
                                        />
                                        {errors.supplier_name && (
                                            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.supplier_name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="supplier_email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Destination Email
                                        </label>
                                        <input
                                            type="email"
                                            id="supplier_email"
                                            value={data.supplier_email}
                                            onChange={(e) => setData('supplier_email', e.target.value)}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 sm:text-sm"
                                        />
                                        {errors.supplier_email && (
                                            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.supplier_email}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="supplier_phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Destination Phone
                                        </label>
                                        <input
                                            type="tel"
                                            id="supplier_phone"
                                            value={data.supplier_phone}
                                            onChange={(e) => setData('supplier_phone', e.target.value)}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 sm:text-sm"
                                        />
                                        {errors.supplier_phone && (
                                            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.supplier_phone}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Tools & Materials Section */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Tools & Materials</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="searchable-dropdown relative">
                                        <label htmlFor="item_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Tools & Materials Name *
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                id="item_name"
                                                value={searchQuery || data.item_name}
                                                onChange={(e) => {
                                                    setData('item_name', e.target.value);
                                                    handleSearch(e.target.value);
                                                }}
                                                onFocus={handleInputFocus}
                                                onClick={handleInputFocus}
                                                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 sm:text-sm"
                                                required
                                            />
                                            {isSearching && (
                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                                                    <svg className="animate-spin h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12V4zm2 12.297a7.001 7.001 0 01-14 0 7.001 7.001 0 0114 0z"></path>
                                                    </svg>
                                                </div>
                                            )}
                                            {showDropdown && (
                                                <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black dark:ring-gray-600 ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                                                    {isSearching ? (
                                                        <div className="px-4 py-2 text-gray-500 dark:text-gray-400">Searching...</div>
                                                    ) : searchResults.length > 0 ? (
                                                        searchResults.map((item) => (
                                                            <div
                                                                key={item.id}
                                                                className="cursor-pointer select-none relative py-2 pl-3 pr-9 bg-gray-50 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-md transition-colors duration-200"
                                                                onClick={() => handleItemSelect(item)}
                                                            >
                                                                <div className="flex items-center">
                                                                    <span className="font-normal ml-3 block truncate text-gray-900 dark:text-gray-100">
                                                                        {item.name}
                                                                    </span>
                                                                    <span className="text-gray-500 dark:text-gray-400 ml-2">
                                                                        ({item.quantity} available)
                                                                    </span>
                                                                </div>
                                                                {item.description && (
                                                                    <span className="text-gray-400 dark:text-gray-500 ml-3 block truncate text-sm">
                                                                        {item.description}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ))
                                                    ) : searchQuery.length >= 2 ? (
                                                        <div className="px-4 py-2 text-gray-500 dark:text-gray-400">No items found</div>
                                                    ) : null}
                                                </div>
                                            )}
                                        </div>
                                        {errors.item_name && (
                                            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.item_name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Quantity *
                                        </label>
                                        <input
                                            type="number"
                                            id="quantity"
                                            value={data.quantity}
                                            onChange={(e) => setData('quantity', parseInt(e.target.value) || 0)}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 sm:text-sm"
                                            min="1"
                                            required
                                        />
                                        {errors.quantity && (
                                            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.quantity}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="project_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Name of Project
                                        </label>
                                        <input
                                            type="text"
                                            id="project_name"
                                            value={data.project_name}
                                            onChange={(e) => setData('project_name', e.target.value)}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 sm:text-sm"
                                        />
                                        {errors.project_name && (
                                            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.project_name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="project_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Type of Project
                                        </label>
                                        <input
                                            type="text"
                                            id="project_type"
                                            value={data.project_type}
                                            onChange={(e) => setData('project_type', e.target.value)}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 sm:text-sm"
                                        />
                                        {errors.project_type && (
                                            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.project_type}</p>
                                        )}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Description
                                        </label>
                                        <textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            rows={3}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 sm:text-sm"
                                            placeholder="Enter item description or specifications..."
                                        />
                                        {errors.description && (
                                            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Purchase Details Section */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Distribution Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="purchase_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Distribution Date *
                                        </label>
                                        <input
                                            type="date"
                                            id="purchase_date"
                                            value={data.purchase_date}
                                            onChange={(e) => setData('purchase_date', e.target.value)}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 sm:text-sm"
                                            required
                                        />
                                        {errors.purchase_date && (
                                            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.purchase_date}</p>
                                        )}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Notes
                                        </label>
                                        <textarea
                                            id="notes"
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            rows={3}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 sm:text-sm"
                                            placeholder="Enter any additional notes or special instructions..."
                                        />
                                        {errors.notes && (
                                            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.notes}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                                <Link
                                    href={route('purchases.index')}
                                    className="px-4 py-2 bg-gray-500 border border-transparent rounded-md text-sm font-medium text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150 disabled:opacity-50"
                                >
                                    {processing ? 'Saving...' : (purchase ? 'Update Distribution' : 'Create Distribution')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
