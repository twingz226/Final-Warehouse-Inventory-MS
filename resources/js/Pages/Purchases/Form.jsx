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
        status: purchase?.status || 'pending',
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
        
        if (value.length < 2) {
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
        if (searchQuery.length >= 2) {
            setShowDropdown(true);
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
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Destination Information Section */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Destination Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="supplier_name" className="block text-sm font-medium text-gray-700">
                                            Destination Name *
                                        </label>
                                        <input
                                            type="text"
                                            id="supplier_name"
                                            value={data.supplier_name}
                                            onChange={(e) => setData('supplier_name', e.target.value)}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            required
                                        />
                                        {errors.supplier_name && (
                                            <p className="mt-2 text-sm text-red-600">{errors.supplier_name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="supplier_email" className="block text-sm font-medium text-gray-700">
                                            Destination Email
                                        </label>
                                        <input
                                            type="email"
                                            id="supplier_email"
                                            value={data.supplier_email}
                                            onChange={(e) => setData('supplier_email', e.target.value)}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                        {errors.supplier_email && (
                                            <p className="mt-2 text-sm text-red-600">{errors.supplier_email}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="supplier_phone" className="block text-sm font-medium text-gray-700">
                                            Destination Phone
                                        </label>
                                        <input
                                            type="tel"
                                            id="supplier_phone"
                                            value={data.supplier_phone}
                                            onChange={(e) => setData('supplier_phone', e.target.value)}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                        {errors.supplier_phone && (
                                            <p className="mt-2 text-sm text-red-600">{errors.supplier_phone}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Tools & Materials Section */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Tools & Materials</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="searchable-dropdown relative">
                                        <label htmlFor="item_name" className="block text-sm font-medium text-gray-700">
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
                                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                                            {showDropdown && searchResults.length > 0 && (
                                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                                                    {searchResults.map((item) => (
                                                        <button
                                                            key={item.id}
                                                            type="button"
                                                            onClick={() => handleItemSelect(item)}
                                                            className="w-full px-4 py-3 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none border-b border-gray-100 last:border-b-0"
                                                        >
                                                            <div className="flex flex-col">
                                                                <div className="font-medium text-gray-900">{item.name}</div>
                                                                {item.description && (
                                                                    <div className="text-sm text-gray-500">{item.description}</div>
                                                                )}
                                                            </div>
                                                        </button>
                                                    ))}
                                                    {searchResults.length === 0 && !isSearching && (
                                                        <div className="px-4 py-3 text-sm text-gray-500">
                                                            No results found
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        {errors.item_name && (
                                            <p className="mt-2 text-sm text-red-600">{errors.item_name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                                            Quantity *
                                        </label>
                                        <input
                                            type="number"
                                            id="quantity"
                                            value={data.quantity}
                                            onChange={(e) => setData('quantity', parseInt(e.target.value) || 0)}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            min="1"
                                            required
                                        />
                                        {errors.quantity && (
                                            <p className="mt-2 text-sm text-red-600">{errors.quantity}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="project_name" className="block text-sm font-medium text-gray-700">
                                            Name of Project
                                        </label>
                                        <input
                                            type="text"
                                            id="project_name"
                                            value={data.project_name}
                                            onChange={(e) => setData('project_name', e.target.value)}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                        {errors.project_name && (
                                            <p className="mt-2 text-sm text-red-600">{errors.project_name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="project_type" className="block text-sm font-medium text-gray-700">
                                            Type of Project
                                        </label>
                                        <input
                                            type="text"
                                            id="project_type"
                                            value={data.project_type}
                                            onChange={(e) => setData('project_type', e.target.value)}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                        {errors.project_type && (
                                            <p className="mt-2 text-sm text-red-600">{errors.project_type}</p>
                                        )}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                            Description
                                        </label>
                                        <textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            rows={3}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            placeholder="Enter item description or specifications..."
                                        />
                                        {errors.description && (
                                            <p className="mt-2 text-sm text-red-600">{errors.description}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Purchase Details Section */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Distribution Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="purchase_date" className="block text-sm font-medium text-gray-700">
                                            Distribution Date *
                                        </label>
                                        <input
                                            type="date"
                                            id="purchase_date"
                                            value={data.purchase_date}
                                            onChange={(e) => setData('purchase_date', e.target.value)}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            required
                                        />
                                        {errors.purchase_date && (
                                            <p className="mt-2 text-sm text-red-600">{errors.purchase_date}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                                            Status *
                                        </label>
                                        <select
                                            id="status"
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value)}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            required
                                        >
                                            {Object.entries(statusOptions).map(([value, label]) => (
                                                <option key={value} value={value}>
                                                    {label}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.status && (
                                            <p className="mt-2 text-sm text-red-600">{errors.status}</p>
                                        )}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                                            Notes
                                        </label>
                                        <textarea
                                            id="notes"
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            rows={3}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            placeholder="Enter any additional notes or special instructions..."
                                        />
                                        {errors.notes && (
                                            <p className="mt-2 text-sm text-red-600">{errors.notes}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                                <Link
                                    href={route('purchases.index')}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150 disabled:opacity-50"
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
