// resources/js/Pages/Borrowed/Form.jsx
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Form({ auth, borrowing, statusOptions }) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        borrower_name: borrowing?.borrower_name || '',
        borrower_email: borrowing?.borrower_email || '',
        borrower_phone: borrowing?.borrower_phone || '',
        item_name: borrowing?.item_name || '',
        description: borrowing?.description || '',
        quantity: borrowing?.quantity || '',
        borrow_date: borrowing?.borrow_date || new Date().toISOString().slice(0,16),
        expected_return_date: borrowing?.expected_return_date || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0,16),
        status: borrowing?.status || 'borrowed',
        notes: borrowing?.notes || '',
        project_type: borrowing?.project_type || '',
        project_name: borrowing?.project_name || '',
    });

    const [searchQuery, setSearchQuery] = useState(borrowing?.item_name || '');
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

        if (borrowing) {
            put(route('borrowings.update', borrowing.id), {
                onSuccess: () => reset(),
            });
        } else {
            post(route('borrowings.store'), {
                onSuccess: () => reset(),
            });
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        {borrowing ? 'Edit Borrowing Record' : 'Create Borrowing Record'}
                    </h2>
                    <Link
                        href={route('borrowings.index')}
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Back to List
                    </Link>
                </div>
            }
        >
            <Head title={borrowing ? 'Edit Borrowing Record' : 'Create Borrowing Record'} />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-xl sm:rounded-lg">
                        <form onSubmit={handleSubmit} className="p-6 lg:p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Borrower Information */}
                                <div className="md:col-span-2">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Borrower Information</h3>
                                </div>

                                <div>
                                    <label htmlFor="borrower_name" className="block text-sm font-medium text-gray-700">
                                        Borrower Name *
                                    </label>
                                    <input
                                        id="borrower_name"
                                        type="text"
                                        value={data.borrower_name}
                                        onChange={(e) => setData('borrower_name', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                    {errors.borrower_name && <p className="mt-2 text-sm text-red-600">{errors.borrower_name}</p>}
                                </div>

                                <div>
                                    <label htmlFor="borrower_email" className="block text-sm font-medium text-gray-700">
                                        Email
                                    </label>
                                    <input
                                        id="borrower_email"
                                        type="email"
                                        value={data.borrower_email}
                                        onChange={(e) => setData('borrower_email', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    {errors.borrower_email && <p className="mt-2 text-sm text-red-600">{errors.borrower_email}</p>}
                                </div>

                                <div>
                                    <label htmlFor="borrower_phone" className="block text-sm font-medium text-gray-700">
                                        Phone
                                    </label>
                                    <input
                                        id="borrower_phone"
                                        type="tel"
                                        value={data.borrower_phone}
                                        onChange={(e) => setData('borrower_phone', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    {errors.borrower_phone && <p className="mt-2 text-sm text-red-600">{errors.borrower_phone}</p>}
                                </div>

                                {/* Item Information */}
                                <div className="md:col-span-2">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Item Information</h3>
                                </div>

                                <div className="md:col-span-2">
                                    <label htmlFor="item_name" className="block text-sm font-medium text-gray-700">
                                        Item Name *
                                    </label>
                                    <div className="relative searchable-dropdown">
                                        <input
                                            id="item_name"
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => handleSearch(e.target.value)}
                                            onFocus={handleInputFocus}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Search for an item..."
                                            required
                                        />
                                        {showDropdown && (
                                            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                                                {isSearching ? (
                                                    <div className="px-4 py-2 text-gray-500">Searching...</div>
                                                ) : searchResults.length > 0 ? (
                                                    searchResults.map((item) => (
                                                        <div
                                                            key={item.id}
                                                            className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100"
                                                            onClick={() => handleItemSelect(item)}
                                                        >
                                                            <div className="flex items-center">
                                                                <span className="font-normal ml-3 block truncate">
                                                                    {item.name}
                                                                </span>
                                                                <span className="text-gray-500 ml-2">
                                                                    ({item.quantity} available)
                                                                </span>
                                                            </div>
                                                            {item.description && (
                                                                <span className="text-gray-400 ml-3 block truncate text-sm">
                                                                    {item.description}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ))
                                                ) : searchQuery.length >= 2 ? (
                                                    <div className="px-4 py-2 text-gray-500">No items found</div>
                                                ) : null}
                                            </div>
                                        )}
                                    </div>
                                    {errors.item_name && <p className="mt-2 text-sm text-red-600">{errors.item_name}</p>}
                                </div>

                                <div>
                                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                                        Quantity *
                                    </label>
                                    <input
                                        id="quantity"
                                        type="number"
                                        min="1"
                                        value={data.quantity}
                                        onChange={(e) => setData('quantity', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                    {errors.quantity && <p className="mt-2 text-sm text-red-600">{errors.quantity}</p>}
                                </div>

                                <div>
                                    <label htmlFor="borrow_date" className="block text-sm font-medium text-gray-700">
                                        Borrow Date *
                                    </label>
                                    <input
                                        id="borrow_date"
                                        type="datetime-local"
                                        value={data.borrow_date}
                                        onChange={(e) => setData('borrow_date', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                    {errors.borrow_date && <p className="mt-2 text-sm text-red-600">{errors.borrow_date}</p>}
                                </div>

                                <div>
                                    <label htmlFor="expected_return_date" className="block text-sm font-medium text-gray-700">
                                        Expected Return Date *
                                    </label>
                                    <input
                                        id="expected_return_date"
                                        type="datetime-local"
                                        value={data.expected_return_date}
                                        onChange={(e) => setData('expected_return_date', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                    {errors.expected_return_date && <p className="mt-2 text-sm text-red-600">{errors.expected_return_date}</p>}
                                </div>

                                <div>
                                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                                        Status *
                                    </label>
                                    <select
                                        id="status"
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    >
                                        {Object.entries(statusOptions).map(([value, label]) => (
                                            <option key={value} value={value}>{label}</option>
                                        ))}
                                    </select>
                                    {errors.status && <p className="mt-2 text-sm text-red-600">{errors.status}</p>}
                                </div>

                                {/* Project Information */}
                                <div className="md:col-span-2">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Project Information (Optional)</h3>
                                </div>

                                <div>
                                    <label htmlFor="project_type" className="block text-sm font-medium text-gray-700">
                                        Project Type
                                    </label>
                                    <input
                                        id="project_type"
                                        type="text"
                                        value={data.project_type}
                                        onChange={(e) => setData('project_type', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    {errors.project_type && <p className="mt-2 text-sm text-red-600">{errors.project_type}</p>}
                                </div>

                                <div>
                                    <label htmlFor="project_name" className="block text-sm font-medium text-gray-700">
                                        Project Name
                                    </label>
                                    <input
                                        id="project_name"
                                        type="text"
                                        value={data.project_name}
                                        onChange={(e) => setData('project_name', e.target.value)}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    {errors.project_name && <p className="mt-2 text-sm text-red-600">{errors.project_name}</p>}
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
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    {errors.description && <p className="mt-2 text-sm text-red-600">{errors.description}</p>}
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
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    {errors.notes && <p className="mt-2 text-sm text-red-600">{errors.notes}</p>}
                                </div>
                            </div>

                            <div className="flex items-center justify-end mt-6 space-x-4">
                                <Link
                                    href={route('borrowings.index')}
                                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                                >
                                    {processing ? 'Saving...' : (borrowing ? 'Update Borrowing Record' : 'Create Borrowing Record')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
