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
        items: borrowing ? [{ item_name: borrowing.item_name, quantity: borrowing.quantity, description: borrowing.description }] : [{ item_name: '', quantity: '', description: '' }],
        borrow_date: borrowing?.borrow_date || new Date().toISOString().slice(0, 16),
        expected_return_date: borrowing?.expected_return_date || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        status: borrowing?.status || 'borrowed',
        notes: borrowing?.notes || '',
        project_type: borrowing?.project_type || '',
        project_name: borrowing?.project_name || '',
    });

    const [searchState, setSearchState] = useState(
        borrowing ? [{ query: borrowing.item_name, results: [], show: false, isSearching: false }] : [{ query: '', results: [], show: false, isSearching: false }]
    );
    const [searchTimeout, setSearchTimeout] = useState(null);

    // Handle search with debouncing
    const handleSearch = async (value, index) => {
        const newSearchState = [...searchState];
        newSearchState[index].query = value;
        newSearchState[index].show = true;
        setSearchState(newSearchState);

        const newItems = [...data.items];
        newItems[index].item_name = value;
        setData('items', newItems);

        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        if (value.length > 0 && value.length < 2) {
            newSearchState[index].results = [];
            newSearchState[index].isSearching = false;
            setSearchState(newSearchState);
            return;
        }

        newSearchState[index].isSearching = true;
        setSearchState(newSearchState);

        const timeout = setTimeout(async () => {
            // Need to create a fresh copy inside the timeout to avoid stale state issues, or we can use functional updates if needed
            try {
                const response = await axios.get(route('items.search'), {
                    params: { search: value }
                });
                setSearchState(prevState => {
                    const newState = [...prevState];
                    // Double check if this index still exists
                    if (newState[index]) {
                        newState[index].results = response.data;
                        newState[index].isSearching = false;
                    }
                    return newState;
                });
            } catch (error) {
                console.error('Error searching items:', error);
                setSearchState(prevState => {
                    const newState = [...prevState];
                    if (newState[index]) {
                        newState[index].results = [];
                        newState[index].isSearching = false;
                    }
                    return newState;
                });
            }
        }, 300);

        setSearchTimeout(timeout);
    };

    // Handle item selection from dropdown
    const handleItemSelect = (item, index) => {
        const newItems = [...data.items];
        newItems[index].item_name = item.name;
        if (item.description) {
            newItems[index].description = item.description;
        }
        setData('items', newItems);

        const newSearchState = [...searchState];
        newSearchState[index].query = item.name;
        newSearchState[index].show = false;
        newSearchState[index].results = [];
        setSearchState(newSearchState);
    };

    // Handle input focus
    const handleInputFocus = (index) => {
        const newSearchState = [...searchState];
        newSearchState[index].show = true;
        setSearchState(newSearchState);
        if (newSearchState[index].query.length < 2) {
            handleSearch('', index);
        }
    };

    const handleQuantityChange = (value, index) => {
        const newItems = [...data.items];
        newItems[index].quantity = value;
        setData('items', newItems);
    };

    const addItem = () => {
        setData('items', [...data.items, { item_name: '', quantity: '', description: '' }]);
        setSearchState([...searchState, { query: '', results: [], show: false, isSearching: false }]);
    };

    const removeItem = (indexToRemove) => {
        setData('items', data.items.filter((_, index) => index !== indexToRemove));
        setSearchState(searchState.filter((_, index) => index !== indexToRemove));
    };

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.searchable-dropdown')) {
                setSearchState(prevState => prevState.map(state => ({ ...state, show: false })));
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
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-xl sm:rounded-lg">
                        <form onSubmit={handleSubmit} className="p-6 lg:p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Borrower Information */}
                                <div className="md:col-span-2">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Borrower Information</h3>
                                </div>

                                <div>
                                    <label htmlFor="borrower_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Borrower Name *
                                    </label>
                                    <input
                                        id="borrower_name"
                                        type="text"
                                        value={data.borrower_name}
                                        onChange={(e) => setData('borrower_name', e.target.value)}
                                        className="mt-1 block w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                                        required
                                    />
                                    {errors.borrower_name && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.borrower_name}</p>}
                                </div>

                                <div>
                                    <label htmlFor="borrower_email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Email
                                    </label>
                                    <input
                                        id="borrower_email"
                                        type="email"
                                        value={data.borrower_email}
                                        onChange={(e) => setData('borrower_email', e.target.value)}
                                        className="mt-1 block w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                                    />
                                    {errors.borrower_email && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.borrower_email}</p>}
                                </div>

                                <div>
                                    <label htmlFor="borrower_phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Phone
                                    </label>
                                    <input
                                        id="borrower_phone"
                                        type="tel"
                                        value={data.borrower_phone}
                                        onChange={(e) => setData('borrower_phone', e.target.value)}
                                        className="mt-1 block w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                                    />
                                    {errors.borrower_phone && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.borrower_phone}</p>}
                                </div>

                                {/* Item Information */}
                                <div className="md:col-span-2 flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                        Item Information
                                    </h3>
                                    {!borrowing && (
                                        <button
                                            type="button"
                                            onClick={addItem}
                                            className="text-sm bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-800 font-medium py-1 px-3 rounded"
                                        >
                                            + Add Item
                                        </button>
                                    )}
                                </div>

                                {data.items.map((item, index) => (
                                    <div key={index} className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600 relative">
                                        {!borrowing && data.items.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeItem(index)}
                                                className="absolute top-2 right-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        )}
                                        <div className="md:col-span-2">
                                            <label htmlFor={`item_name_${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Item Name *
                                            </label>
                                            <div className="relative searchable-dropdown">
                                                <input
                                                    id={`item_name_${index}`}
                                                    type="text"
                                                    value={searchState[index]?.query || ''}
                                                    onChange={(e) => handleSearch(e.target.value, index)}
                                                    onFocus={() => handleInputFocus(index)}
                                                    onClick={() => handleInputFocus(index)}
                                                    className="mt-1 block w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                                                    placeholder="Search for an item..."
                                                    required
                                                />
                                                {searchState[index]?.show && (
                                                    <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black dark:ring-gray-600 ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                                                        {searchState[index]?.isSearching ? (
                                                            <div className="px-4 py-2 text-gray-500 dark:text-gray-400">Searching...</div>
                                                        ) : searchState[index]?.results?.length > 0 ? (
                                                            searchState[index].results.map((result) => (
                                                                <div
                                                                    key={result.id}
                                                                    className="cursor-pointer select-none relative py-2 pl-3 pr-9 bg-gray-50 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-md transition-colors duration-200"
                                                                    onClick={() => handleItemSelect(result, index)}
                                                                >
                                                                    <div className="flex items-center">
                                                                        <span className="font-normal ml-3 block truncate text-gray-900 dark:text-gray-100">
                                                                            {result.name}
                                                                        </span>
                                                                        <span className="text-gray-500 dark:text-gray-400 ml-2">
                                                                            ({result.quantity} available)
                                                                        </span>
                                                                    </div>
                                                                    {result.description && (
                                                                        <span className="text-gray-400 dark:text-gray-500 ml-3 block truncate text-sm">
                                                                            {result.description}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            ))
                                                        ) : searchState[index]?.query?.length >= 2 ? (
                                                            <div className="px-4 py-2 text-gray-500 dark:text-gray-400">No items found</div>
                                                        ) : null}
                                                    </div>
                                                )}
                                            </div>
                                            {errors[`items.${index}.item_name`] && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors[`items.${index}.item_name`]}</p>}
                                        </div>

                                        <div>
                                            <label htmlFor={`quantity_${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Quantity *
                                            </label>
                                            <input
                                                id={`quantity_${index}`}
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => handleQuantityChange(e.target.value, index)}
                                                className="mt-1 block w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                                                required
                                            />
                                            {errors[`items.${index}.quantity`] && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors[`items.${index}.quantity`]}</p>}
                                        </div>

                                        {/* Description mapping to the specific item if we want it to be per-item, otherwise we can keep it global. Let's keep it global as it was for now and just set one description if needed. Or we can just drop it per item. The previous form had a single global description anyway. */}
                                    </div>
                                ))}

                                <div>
                                    <label htmlFor="borrow_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Borrow Date *
                                    </label>
                                    <input
                                        id="borrow_date"
                                        type="datetime-local"
                                        value={data.borrow_date}
                                        onChange={(e) => setData('borrow_date', e.target.value)}
                                        className="mt-1 block w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                                        required
                                    />
                                    {errors.borrow_date && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.borrow_date}</p>}
                                </div>

                                <div>
                                    <label htmlFor="expected_return_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Expected Return Date *
                                    </label>
                                    <input
                                        id="expected_return_date"
                                        type="datetime-local"
                                        value={data.expected_return_date}
                                        onChange={(e) => setData('expected_return_date', e.target.value)}
                                        className="mt-1 block w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                                        required
                                    />
                                    {errors.expected_return_date && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.expected_return_date}</p>}
                                </div>

                                {borrowing && (
                                    <div>
                                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Status *
                                        </label>
                                        <select
                                            id="status"
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value)}
                                            className="mt-1 block w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                                            required
                                        >
                                            {Object.entries(statusOptions).map(([value, label]) => (
                                                <option key={value} value={value}>{label}</option>
                                            ))}
                                        </select>
                                        {errors.status && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.status}</p>}
                                    </div>
                                )}

                                {/* Project Information */}
                                <div className="md:col-span-2">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Project Information (Optional)</h3>
                                </div>

                                <div>
                                    <label htmlFor="project_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Project Type
                                    </label>
                                    <input
                                        id="project_type"
                                        type="text"
                                        value={data.project_type}
                                        onChange={(e) => setData('project_type', e.target.value)}
                                        className="mt-1 block w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                                    />
                                    {errors.project_type && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.project_type}</p>}
                                </div>

                                <div>
                                    <label htmlFor="project_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Project Name
                                    </label>
                                    <input
                                        id="project_name"
                                        type="text"
                                        value={data.project_name}
                                        onChange={(e) => setData('project_name', e.target.value)}
                                        className="mt-1 block w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                                    />
                                    {errors.project_name && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.project_name}</p>}
                                </div>

                                <div className="md:col-span-2">
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Description
                                    </label>
                                    <textarea
                                        id="description"
                                        value={data.items[0]?.description || ''}
                                        onChange={(e) => {
                                            const newItems = [...data.items];
                                            if (newItems.length > 0) newItems[0].description = e.target.value;
                                            setData('items', newItems);
                                        }}
                                        rows={3}
                                        className="mt-1 block w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                                        placeholder="Description (Optional)"
                                    />
                                    {errors.description && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.description}</p>}
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
                                        className="mt-1 block w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400"
                                    />
                                    {errors.notes && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.notes}</p>}
                                </div>
                            </div>

                            <div className="flex items-center justify-end mt-6 space-x-4">
                                <Link
                                    href={route('borrowings.index')}
                                    className="bg-gray-500 dark:bg-gray-600 hover:bg-gray-700 dark:hover:bg-gray-800 text-white font-bold py-2 px-4 rounded"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
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
