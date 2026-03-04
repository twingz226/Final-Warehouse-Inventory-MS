// resources/js/Pages/Items/AddStock.jsx
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import { useEffect, useState, useRef } from 'react';
import { Combobox } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon, FunnelIcon, XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function AddStock({ auth }) {
    const [query, setQuery] = useState('');
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
    const buttonRef = useRef(null);

    // Per-row search state factory
    const emptyRowSearch = () => ({
        query: '',
        results: [],
        showDropdown: false,
        isSearching: false,
        timeout: null,
    });

    // Per-row search state
    const [rowSearches, setRowSearches] = useState([emptyRowSearch()]);

    const { data, setData, post, put, processing, errors, reset, transform } = useForm({
        items: [{ item_id: '', quantity: '' }],
    });

    const isLowStock = (availableStock) => availableStock <= 10;

    const getLowStockColor = (availableStock) => {
        return isLowStock(availableStock) ? 'text-red-600' : 'text-gray-600';
    };

    const formatItemDisplay = (item) => {
        const categoryLabel = item.category === 'tool' ? 'Tool' : 'Material';
        return `${item.name} - ${categoryLabel} - Current: ${item.available_stock} ${item.unit === 'Quantity' ? 'pcs' : item.unit}`;
    };

    // Helpers
    const updateRowSearch = (index, patch) =>
        setRowSearches(prev => prev.map((r, i) => i === index ? { ...r, ...patch } : r));

    const updateItem = (index, patch) =>
        setData('items', data.items.map((item, i) => i === index ? { ...item, ...patch } : item));

    const addRow = () => {
        setData('items', [...data.items, { item_id: '', quantity: '' }]);
        setRowSearches(prev => [...prev, emptyRowSearch()]);
    };

    const removeRow = (index) => {
        if (data.items.length > 1) {
            setData('items', data.items.filter((_, i) => i !== index));
            setRowSearches(prev => prev.filter((_, i) => i !== index));
        }
    };

    useEffect(() => {
        const fetchItems = async () => {
            if (query === '' && selectedCategory === '') {
                setItems([]);
                return;
            }

            setIsLoading(true);
            try {
                const params = {};
                if (query) params.search = query;
                if (selectedCategory) params.category = selectedCategory;
                
                const response = await window.axios.get(route('items.search'), { params });
                setItems(response.data);
            } catch (error) {
                console.error("Error fetching items:", error);
            } finally {
                setIsLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchItems();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query, selectedCategory]);

    const handleSearch = (index, value) => {
        const prev = rowSearches[index];
        if (prev.timeout) clearTimeout(prev.timeout);

        updateRowSearch(index, { query: value, showDropdown: true, isSearching: value.length >= 2 });
        updateItem(index, { item_id: '' }); // Clear item_id when searching

        if (value.length < 2) {
            updateRowSearch(index, { results: [], isSearching: false });
            return;
        }

        const timeout = setTimeout(async () => {
            try {
                const params = { search: value };
                if (selectedCategory) params.category = selectedCategory;
                
                const response = await window.axios.get(route('items.search'), { params });

                // Filter out items already selected in other rows
                const selectedItemIds = data.items.map((item, i) => i !== index ? item.item_id : null).filter(Boolean);
                const filteredResults = response.data.filter(item => !selectedItemIds.includes(item.id));

                updateRowSearch(index, { results: filteredResults, isSearching: false });
            } catch {
                updateRowSearch(index, { results: [], isSearching: false });
            }
        }, 300);

        updateRowSearch(index, { timeout });
    };

    const handleItemSelect = (index, item) => {
        updateItem(index, { item_id: item.id });
        updateRowSearch(index, { query: item.name, showDropdown: false, results: [] });
    };

    const handleFocus = (index) => {
        updateRowSearch(index, { showDropdown: true });
        if (rowSearches[index].query.length < 2) handleSearch(index, '');
    };

    const submit = (e) => {
        e.preventDefault();
        
        const validItems = data.items.filter(item => item.item_id && item.quantity && parseFloat(item.quantity) > 0);
        if (validItems.length === 0) {
            return;
        }
        
        const itemsData = validItems.map(item => ({
            item_id: item.item_id,
            quantity: parseFloat(item.quantity)
        }));
        
        setData('items', itemsData);
        post(route('items.store-stock'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Add Incoming Stock
                </h2>
            }
        >
            <Head title="Add Incoming Stock" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                            <form onSubmit={submit} className="space-y-6">
                                {/* Category Filter */}
                                <div className="flex items-center space-x-4">
                                    <div className="flex-1">
                                        <InputLabel htmlFor="category" value="Filter by Category" />
                                        <select
                                            id="category"
                                            value={selectedCategory}
                                            onChange={(e) => setSelectedCategory(e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm"
                                        >
                                            <option value="">All Categories</option>
                                            <option value="tool">Tools</option>
                                            <option value="material">Materials</option>
                                        </select>
                                    </div>
                                    {selectedCategory && (
                                        <button
                                            type="button"
                                            onClick={() => setSelectedCategory('')}
                                            className="mt-6 inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                            <FunnelIcon className="h-4 w-4 mr-1" />
                                            Clear Filter
                                        </button>
                                    )}
                                </div>
                                {/* Items Section */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                                        <svg className="h-5 w-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4m0 8l8-4m-8 4v10m0-10a2 2 0 002 2v6a2 2 0 002-2V6a2 2 0 00-2-2z" />
                                        </svg>
                                        Items to Add Stock
                                    </h3>
                                    <div className="space-y-4">
                                        {data.items.map((item, index) => (
                                            <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-700 dark:to-gray-800 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-indigo-300 dark:hover:border-indigo-600">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex-1">
                                                        <InputLabel htmlFor={`item-search-${index}`} value="Search Item" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2" />
                                                        <div className="relative mt-1">
                                                            <Combobox
                                                                value={rowSearches[index].query}
                                                                onChange={(item) => handleItemSelect(index, item)}
                                                            >
                                                                <div className="relative">
                                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                                        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                                        </svg>
                                                                    </div>
                                                                    <Combobox.Input
                                                                        id={`item-search-${index}`}
                                                                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-3 pl-10 pr-10 text-left shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-400 sm:text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200"
                                                                        displayValue={() => rowSearches[index].query}
                                                                        onChange={(event) => handleSearch(index, event.target.value)}
                                                                        onFocus={() => handleFocus(index)}
                                                                        placeholder="Search for an item..."
                                                                    />
                                                                    <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
                                                                        <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                                                    </Combobox.Button>
                                                                </div>
                                                                {rowSearches[index].showDropdown && (
                                                                    <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                                                        {rowSearches[index].isSearching ? (
                                                                            <div className="relative cursor-default select-none py-2 px-4 text-gray-700 dark:text-gray-300">
                                                                                Loading...
                                                                            </div>
                                                                        ) : rowSearches[index].results.length === 0 && rowSearches[index].query !== '' ? (
                                                                            <div className="relative cursor-default select-none py-2 px-4 text-gray-700 dark:text-gray-300">
                                                                                Nothing found.
                                                                            </div>
                                                                        ) : (
                                                                            rowSearches[index].results.map((result) => {
                                                                                return (
                                                                                    <Combobox.Option
                                                                                        key={result.id}
                                                                                        value={result}
                                                                                        className={({ active }) =>
                                                                                            `relative cursor-default select-none py-3 pl-3 pr-9 ${
                                                                                                active ? 'bg-indigo-600 text-white' : 'text-gray-900 dark:text-gray-100'
                                                                                            }`
                                                                                        }
                                                                                    >
                                                                                        {({ active }) => (
                                                                                            <>
                                                                                                <div className="flex items-start justify-between">
                                                                                                    <div className="flex-1 min-w-0">
                                                                                                        <div className="flex items-center space-x-2">
                                                                                                            <span className={`block truncate font-medium`}>
                                                                                                                {result.name}
                                                                                                            </span>
                                                                                                        </div>
                                                                                                        <div className={`text-sm mt-1 ${active ? 'text-indigo-200' : getLowStockColor(result.available_stock)}`}>
                                                                                                            <span className="capitalize">{result.category}</span>
                                                                                                            <span className="mx-1">•</span>
                                                                                                            <span>Stock: {result.available_stock} {result.unit === 'Quantity' ? 'pcs' : result.unit}</span>
                                                                                                        </div>
                                                                                                        {result.description && (
                                                                                                            <div className={`text-xs mt-1 truncate ${active ? 'text-indigo-300' : 'text-gray-400 dark:text-gray-500'}`}>
                                                                                                                {result.description}
                                                                                                            </div>
                                                                                                        )}
                                                                                                    </div>
                                                                                                </div>
                                                                                            </>
                                                                                        )}
                                                                                    </Combobox.Option>
                                                                                );
                                                                            })
                                                                        )}
                                                                    </Combobox.Options>
                                                                )}
                                                            </Combobox>
                                                        </div>
                                                    </div>
                                                    {data.items.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeRow(index)}
                                                            className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 group"
                                                            title="Remove this item"
                                                        >
                                                            <XMarkIcon className="h-5 w-5 transition-transform group-hover:scale-110" />
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <InputLabel htmlFor={`quantity-${index}`} value="Additional Quantity" />
                                                        <div className="flex space-x-2">
                                                            <TextInput
                                                                id={`quantity-${index}`}
                                                                type="number"
                                                                min="0.01"
                                                                step="0.01"
                                                                className="mt-1 block flex-1 rounded-lg border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all duration-200"
                                                                value={item.quantity}
                                                                onChange={(e) => updateItem(index, { quantity: e.target.value })}
                                                                placeholder="Enter quantity to add"
                                                            />
                                                            {rowSearches[index].results.find(r => r.id === item.item_id) && (
                                                                <div className="mt-1 flex items-center px-3 py-2 bg-gray-100 dark:bg-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                    {rowSearches[index].results.find(r => r.id === item.item_id)?.unit}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <InputError message={errors.items?.[index]?.quantity} className="mt-2" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {/* Add Another Item button */}
                                    <button
                                        type="button"
                                        onClick={addRow}
                                        className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 border border-indigo-600 dark:from-indigo-500 dark:to-indigo-600 dark:hover:from-indigo-600 dark:hover:to-indigo-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                                    >
                                        <PlusIcon className="h-5 w-5" />
                                        Add Another Item
                                    </button>
                                </div>

                                <div className="flex items-center justify-end space-x-4">
                                    <Link
                                        href={route('items.index')}
                                        className="inline-flex items-center px-4 py-2 bg-gray-500 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150"
                                    >
                                        Cancel
                                    </Link>
                                    <PrimaryButton
                                        type="submit"
                                        disabled={processing || data.items.filter(item => item.item_id && item.quantity).length === 0}
                                        className="ml-4"
                                    >
                                        Add Stock to {data.items.filter(item => item.item_id && item.quantity).length} Item{data.items.filter(item => item.item_id && item.quantity).length !== 1 ? 's' : ''}
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
