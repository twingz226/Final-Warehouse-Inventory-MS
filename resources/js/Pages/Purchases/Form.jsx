// resources/js/Pages/Purchases/Form.jsx
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// ── Helper for capitalizing first letter of each word ──────────────────────
const capitalizeWords = (str) => {
    if (!str) return str;
    return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

// ── Helper to parse 'YYYY-MM-DD' to local Date ─────────────────────────────
const parseLocalDate = (dateStr) => {
    if (!dateStr) return new Date();
    // Assuming YYYY-MM-DD format
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length === 3) {
        return new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
    }
    return new Date();
};

// ── Per-row search state factory ──────────────────────────────────────────────
const emptyRowSearch = () => ({
    query: '',
    results: [],
    showDropdown: false,
    isSearching: false,
    timeout: null,
});

export default function Form({ auth, purchase, groupItems, statusOptions }) {
    // ── Shared form data (Inertia) ─────────────────────────────────────────────
    const { data, setData, post, put, processing, errors, reset, transform } = useForm({
        supplier_name: purchase?.supplier_name || '',
        supplier_phone: purchase?.supplier_phone || '',
        purchase_date: purchase?.purchase_date ? new Date(purchase.purchase_date).toLocaleDateString('en-CA') : new Date().toLocaleDateString('en-CA'),
        notes: purchase?.notes || '',
        project_type: purchase?.project_type || '',
        project_name: purchase?.project_name || '',
        os: purchase?.os || '',
        issued_by: purchase?.issued_by || '',
        issued_to: purchase?.issued_to || '',
        // For CREATE: array of rows. For EDIT: all grouped items.
        items: (groupItems && groupItems.length > 0)
            ? groupItems.map(g => ({ item_name: g.item_name, quantity: g.quantity, description: g.description || '', available_quantity: null }))
            : purchase
                ? [{ item_name: purchase.item_name, quantity: purchase.quantity, description: purchase.description || '', available_quantity: null }]
                : [{ item_name: '', quantity: '', description: '', available_quantity: null }],
    });

    // ── Per-row search UI state ────────────────────────────────────────────────
    const [rowSearches, setRowSearches] = useState(() => {
        if (groupItems && groupItems.length > 0) {
            return groupItems.map(g => ({ ...emptyRowSearch(), query: g.item_name || '' }));
        }
        if (purchase) {
            return [{ ...emptyRowSearch(), query: purchase.item_name || '' }];
        }
        return [emptyRowSearch()];
    });

    const containerRef = useRef(null);

    // ── Close all dropdowns on outside click ──────────────────────────────────
    useEffect(() => {
        const handler = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setRowSearches(prev => prev.map(r => ({ ...r, showDropdown: false })));
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // ── Helpers ───────────────────────────────────────────────────────────────
    const updateRowSearch = (index, patch) =>
        setRowSearches(prev => prev.map((r, i) => i === index ? { ...r, ...patch } : r));

    const updateItem = (index, patch) =>
        setData('items', data.items.map((item, i) => i === index ? { ...item, ...patch } : item));

    const handleSearch = (index, value) => {
        const prev = rowSearches[index];
        if (prev.timeout) clearTimeout(prev.timeout);

        updateRowSearch(index, { query: value, showDropdown: true, isSearching: value.length >= 2 });
        updateItem(index, { item_name: value });

        if (value.length < 2) {
            updateRowSearch(index, { results: [], isSearching: false });
            return;
        }

        const timeout = setTimeout(async () => {
            try {
                const response = await axios.get(route('items.search'), { params: { search: value } });

                // Filter out items already selected in other rows
                const selectedNames = data.items.map((item, i) => i !== index ? item.item_name : null).filter(Boolean);
                const filteredResults = response.data.filter(item => !selectedNames.includes(item.name));

                updateRowSearch(index, { results: filteredResults, isSearching: false });
            } catch {
                updateRowSearch(index, { results: [], isSearching: false });
            }
        }, 300);

        updateRowSearch(index, { timeout });
    };

    const handleItemSelect = (index, item) => {
        updateItem(index, { item_name: item.name, description: item.description || '', available_quantity: item.quantity });
        updateRowSearch(index, { query: item.name, showDropdown: false, results: [] });
    };

    const handleFocus = (index) => {
        updateRowSearch(index, { showDropdown: true });
        if (rowSearches[index].query.length < 2) handleSearch(index, '');
    };

    const addRow = () => {
        setData('items', [...data.items, { item_name: '', quantity: '', description: '', available_quantity: null }]);
        setRowSearches(prev => [...prev, emptyRowSearch()]);
    };

    const removeRow = (index) => {
        setData('items', data.items.filter((_, i) => i !== index));
        setRowSearches(prev => prev.filter((_, i) => i !== index));
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = (e) => {
        e.preventDefault();
        if (purchase) {
            // Edit: flatten the first (only) item row back to top-level fields
            transform((data) => ({
                ...data,
                item_name: data.items[0].item_name,
                quantity: data.items[0].quantity,
                description: data.items[0].description,
            }));
            put(route('purchases.update', purchase.id), {
                onSuccess: () => reset(),
            });
        } else {
            post(route('purchases.store'), { onSuccess: () => reset() });
        }
    };

    // ── Shared input class ────────────────────────────────────────────────────
    const inputCls = "mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 sm:text-sm";

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
                        <form onSubmit={handleSubmit} className="p-6 space-y-6" ref={containerRef}>

                            {/* ── Destination Information ─────────────────── */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Destination Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="supplier_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Name of Project *
                                        </label>
                                        <input
                                            type="text"
                                            id="supplier_name"
                                            value={data.supplier_name}
                                            onChange={(e) => setData('supplier_name', capitalizeWords(e.target.value))}
                                            className={inputCls}
                                            required
                                        />
                                        {errors.supplier_name && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.supplier_name}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="project_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Type of Project
                                        </label>
                                        <input
                                            type="text"
                                            id="project_type"
                                            value={data.project_type}
                                            onChange={(e) => setData('project_type', capitalizeWords(e.target.value))}
                                            className={inputCls}
                                        />
                                        {errors.project_type && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.project_type}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="os" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            O.S
                                        </label>
                                        <input
                                            type="text"
                                            id="os"
                                            value={data.os}
                                            onChange={(e) => setData('os', e.target.value)}
                                            className={inputCls}
                                        />
                                        {errors.os && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.os}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="issued_by" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Issued By:
                                        </label>
                                        <input
                                            type="text"
                                            id="issued_by"
                                            value={data.issued_by}
                                            onChange={(e) => setData('issued_by', capitalizeWords(e.target.value))}
                                            className={inputCls}
                                        />
                                        {errors.issued_by && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.issued_by}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="issued_to" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Issued To:
                                        </label>
                                        <input
                                            type="text"
                                            id="issued_to"
                                            value={data.issued_to}
                                            onChange={(e) => setData('issued_to', capitalizeWords(e.target.value))}
                                            className={inputCls}
                                        />
                                        {errors.issued_to && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.issued_to}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* ── Tools & Materials ───────────────────────── */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Tools &amp; Materials</h3>

                                <div className="space-y-4">
                                    {data.items.map((item, index) => {
                                        const rs = rowSearches[index] || emptyRowSearch();
                                        return (
                                            <div
                                                key={index}
                                                className="relative border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50"
                                            >
                                                {/* Row header */}
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                                                        Item {index + 1}
                                                    </span>
                                                    {data.items.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeRow(index)}
                                                            className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 font-medium transition-colors"
                                                        >
                                                            ✕ Remove
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {/* Item name (searchable) */}
                                                    <div className="searchable-dropdown relative">
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            Tools &amp; Materials Name *
                                                        </label>
                                                        <div className="relative">
                                                            <input
                                                                type="text"
                                                                value={rs.query || item.item_name}
                                                                onChange={(e) => handleSearch(index, e.target.value)}
                                                                onFocus={() => handleFocus(index)}
                                                                onClick={() => handleFocus(index)}
                                                                className={inputCls}
                                                                required
                                                                placeholder="Search item..."
                                                            />
                                                            {rs.isSearching && (
                                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                                    <svg className="animate-spin h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24">
                                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12V4zm2 12.297a7.001 7.001 0 01-14 0 7.001 7.001 0 0114 0z" />
                                                                    </svg>
                                                                </div>
                                                            )}
                                                            {rs.showDropdown && (rs.isSearching || rs.results.length > 0 || rs.query.length >= 2) && (
                                                                <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black dark:ring-gray-600 ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                                                                    {rs.isSearching ? (
                                                                        <div className="px-4 py-2 text-gray-500 dark:text-gray-400">Searching...</div>
                                                                    ) : rs.results.length > 0 ? (
                                                                        rs.results.map((result) => (
                                                                            <div
                                                                                key={result.id}
                                                                                className="cursor-pointer select-none relative py-2 pl-3 pr-9 bg-gray-50 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-md transition-colors duration-200"
                                                                                onMouseDown={(e) => { e.preventDefault(); handleItemSelect(index, result); }}
                                                                            >
                                                                                <div className="flex items-center">
                                                                                    <span className="font-normal ml-3 block truncate text-gray-900 dark:text-gray-100">
                                                                                        {result.name}
                                                                                    </span>
                                                                                    <span className="text-gray-500 dark:text-gray-400 ml-2 text-xs">
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
                                                                    ) : (
                                                                        <div className="px-4 py-2 text-gray-500 dark:text-gray-400">No items found</div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                        {errors[`items.${index}.item_name`] && (
                                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors[`items.${index}.item_name`]}</p>
                                                        )}
                                                    </div>

                                                    {/* Quantity */}
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            Quantity *
                                                        </label>
                                                        <input
                                                            type="number"
                                                            value={item.quantity}
                                                            onChange={(e) => updateItem(index, { quantity: parseInt(e.target.value) || '' })}
                                                            className={`${inputCls} ${item.available_quantity === null ? 'bg-gray-100 dark:bg-gray-600 cursor-not-allowed opacity-60' : ''}`}
                                                            min="1"
                                                            max={item.available_quantity !== null ? item.available_quantity : undefined}
                                                            required
                                                            disabled={item.available_quantity === null}
                                                        />
                                                        {item.available_quantity === null && (
                                                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                                Please select a valid item from the dropdown first
                                                            </p>
                                                        )}
                                                        {item.available_quantity !== null && item.quantity > item.available_quantity && (
                                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                                                Exceeds available stock ({item.available_quantity}).
                                                            </p>
                                                        )}
                                                        {errors[`items.${index}.quantity`] && (
                                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors[`items.${index}.quantity`]}</p>
                                                        )}
                                                    </div>

                                                    {/* Description (full width) */}
                                                    <div className="md:col-span-2">
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                            Description
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={item.description}
                                                            onChange={(e) => updateItem(index, { description: capitalizeWords(e.target.value) })}
                                                            className={inputCls}
                                                            placeholder="Enter item description or specifications..."
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Add row button — only on create */}
                                {!purchase && (
                                    <button
                                        type="button"
                                        onClick={addRow}
                                        className="mt-4 flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 border border-dashed border-indigo-400 dark:border-indigo-500 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                                    >
                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        Add Another Item
                                    </button>
                                )}


                            </div>

                            {/* ── Distribution Details ─────────────────────── */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Distribution Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="purchase_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Distribution Date *
                                        </label>
                                        <div className="w-full">
                                            <DatePicker
                                                id="purchase_date"
                                                selected={parseLocalDate(data.purchase_date)}
                                                onChange={(date) => {
                                                    if (date) {
                                                        const y = date.getFullYear();
                                                        const m = String(date.getMonth() + 1).padStart(2, '0');
                                                        const d = String(date.getDate()).padStart(2, '0');
                                                        setData('purchase_date', `${y}-${m}-${d}`);
                                                    } else {
                                                        setData('purchase_date', '');
                                                    }
                                                }}
                                                dateFormat="MM-dd-yyyy"
                                                className={inputCls}
                                                required
                                            />
                                        </div>
                                        {errors.purchase_date && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.purchase_date}</p>}
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
                                            className={inputCls}
                                            placeholder="Enter any additional notes or special instructions..."
                                        />
                                        {errors.notes && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.notes}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* ── Form Actions ─────────────────────────────── */}
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
