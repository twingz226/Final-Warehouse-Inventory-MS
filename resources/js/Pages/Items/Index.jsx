// resources/js/Pages/Items/Index.jsx
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState, useEffect, useRef } from 'react';
import { PlusIcon, EyeIcon, TrashIcon, PencilSquareIcon, MagnifyingGlassIcon, TableCellsIcon, Squares2X2Icon, DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import ImportModal from '@/Components/ImportModal';
import SearchInput from '@/Components/SearchInput';

export default function Index({ auth, items, status }) {
    const [confirmingItemDeletion, setConfirmingItemDeletion] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isBulkDelete, setIsBulkDelete] = useState(false);
    const [search, setSearch] = useState('');
    const searchInputRef = useRef(null);
    const searchRef = useRef(null);
    const [searchTimeout, setSearchTimeout] = useState(null);
    const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 });
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'
    const [sortColumn, setSortColumn] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc'); // 'asc' or 'desc'
    const [selectedItems, setSelectedItems] = useState([]);
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [date, setDate] = useState('');
    const [showImportModal, setShowImportModal] = useState(false);

    const formatDateDisplay = (dateStr) => {
        if (!dateStr) return '';
        const [y, m, d] = dateStr.split('-');
        return `${m}/${d}/${y}`;
    };

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const initialSearch = urlParams.get('search') || '';
        const initialSort = urlParams.get('sort') || 'name';
        const initialDirection = urlParams.get('direction') || 'asc';
        const initialDate = urlParams.get('date') || '';

        setSearch(initialSearch);
        setSortColumn(initialSort);
        setSortDirection(initialDirection);
        setDate(initialDate);
    }, []);

    const handleSearchSubmit = () => {
        const params = new URLSearchParams(window.location.search);
        if (search) {
            params.set('search', search);
        } else {
            params.delete('search');
        }
        params.delete('date');
        params.set('page', '1');
        router.get(`${window.location.pathname}?${params.toString()}`, {}, { preserveScroll: true });
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearch(value);
        clearTimeout(searchTimeout);
        setSearchTimeout(setTimeout(handleSearchSubmit, 500));
    };

    const handleDateChange = (value) => {
        setDate(value);

        const params = new URLSearchParams(window.location.search);
        if (value) {
            params.set('date', value);
        } else {
            params.delete('date');
        }
        params.set('page', '1');

        router.get(`${window.location.pathname}?${params.toString()}`, {}, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const handleSort = (column) => {
        const newDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortColumn(column);
        setSortDirection(newDirection);

        const params = new URLSearchParams(window.location.search);
        params.set('sort', column);
        params.set('direction', newDirection);
        params.set('page', '1');

        router.get(`${window.location.pathname}?${params.toString()}`, {}, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const getSortIcon = (column) => {
        if (sortColumn !== column) {
            return (
                <svg className="ml-1 h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
            );
        }
        return (
            <svg className={`ml-1 h-4 w-4 text-indigo-600 dark:text-indigo-400 ${sortDirection === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
            </svg>
        );
    };

    const handleSelectItem = (itemId) => {
        setSelectedItems(prev =>
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    const handleSelectAll = () => {
        if (selectedItems.length === items.data.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(items.data.map(item => item.id));
        }
    };

    const handleBulkDelete = () => {
        if (selectedItems.length === 0) return;

        setIsBulkDelete(true);
        setConfirmingItemDeletion(true);
    };

    const getItemStatus = (quantity) => {
        const qty = parseFloat(quantity) || 0;
        if (qty === 0) return { status: 'Out of Stock', color: 'red', bgColor: 'bg-red-100 dark:bg-red-900/20', textColor: 'text-red-800 dark:text-red-200' };
        if (qty <= 10) return { status: 'Low Stock', color: 'yellow', bgColor: 'bg-yellow-100 dark:bg-yellow-900/20', textColor: 'text-yellow-800 dark:text-yellow-200' };
        return { status: 'In Stock', color: 'green', bgColor: 'bg-green-100 dark:bg-green-900/20', textColor: 'text-green-800 dark:text-gray-200' };
    };

    const formatQuantity = (quantity, unit) => {
        const qty = parseFloat(quantity) || 0;

        // Format the number based on unit type
        if (unit === 'Quantity') {
            return `${Math.floor(qty)} pcs.`;
        } else if (unit.toLowerCase().includes('kg') || unit.toLowerCase().includes('kilogram')) {
            return `${qty.toFixed(2)} kg`;
        } else if (unit.toLowerCase().includes('liter') || unit.toLowerCase().includes('litre') || unit.toLowerCase().includes('l')) {
            return `${qty.toFixed(2)} L`;
        } else if (unit.toLowerCase().includes('meter') || unit.toLowerCase().includes('metre') || unit.toLowerCase().includes('m')) {
            return `${qty.toFixed(2)} m`;
        } else {
            // For custom units, keep as is
            return `${qty} ${unit}`;
        }
    };

    const deleteItem = (id) => {
        router.delete(route('items.destroy', id), {
            preserveScroll: true,
            onSuccess: () => setConfirmingItemDeletion(false),
        });
    };

    return (
        <>
            <style>{`
            @keyframes electric-flicker {
                0%   { box-shadow: 0 0 4px 1px #818cf8, 0 0 10px 2px #6366f1; opacity: 1; }
                10%  { box-shadow: 0 0 2px 1px #818cf8, 0 0 6px 1px #6366f1;  opacity: 0.85; }
                20%  { box-shadow: 0 0 8px 3px #a5b4fc, 0 0 18px 5px #6366f1; opacity: 1; }
                30%  { box-shadow: 0 0 3px 1px #818cf8, 0 0 8px 2px #6366f1;  opacity: 0.9; }
                40%  { box-shadow: 0 0 10px 4px #c7d2fe, 0 0 22px 6px #6366f1;opacity: 1; }
                50%  { box-shadow: 0 0 2px 1px #818cf8, 0 0 5px 1px #6366f1;  opacity: 0.8; }
                60%  { box-shadow: 0 0 9px 3px #a5b4fc, 0 0 20px 5px #6366f1; opacity: 1; }
                70%  { box-shadow: 0 0 3px 1px #818cf8, 0 0 7px 2px #6366f1;  opacity: 0.88; }
                80%  { box-shadow: 0 0 11px 4px #c7d2fe, 0 0 24px 7px #6366f1;opacity: 1; }
                90%  { box-shadow: 0 0 2px 1px #818cf8, 0 0 6px 1px #6366f1;  opacity: 0.82; }
                100% { box-shadow: 0 0 4px 1px #818cf8, 0 0 10px 2px #6366f1; opacity: 1; }
            }
            @keyframes electric-flicker-emerald {
                0%   { box-shadow: 0 0 4px 1px #6ee7b7, 0 0 10px 2px #10b981; opacity: 1; }
                10%  { box-shadow: 0 0 2px 1px #6ee7b7, 0 0 6px 1px #10b981;  opacity: 0.85; }
                20%  { box-shadow: 0 0 8px 3px #a7f3d0, 0 0 18px 5px #10b981; opacity: 1; }
                30%  { box-shadow: 0 0 3px 1px #6ee7b7, 0 0 8px 2px #10b981;  opacity: 0.9; }
                40%  { box-shadow: 0 0 10px 4px #d1fae5, 0 0 22px 6px #10b981;opacity: 1; }
                50%  { box-shadow: 0 0 2px 1px #6ee7b7, 0 0 5px 1px #10b981;  opacity: 0.8; }
                60%  { box-shadow: 0 0 9px 3px #a7f3d0, 0 0 20px 5px #10b981; opacity: 1; }
                70%  { box-shadow: 0 0 3px 1px #6ee7b7, 0 0 7px 2px #10b981;  opacity: 0.88; }
                80%  { box-shadow: 0 0 11px 4px #d1fae5, 0 0 24px 7px #10b981;opacity: 1; }
                90%  { box-shadow: 0 0 2px 1px #6ee7b7, 0 0 6px 1px #10b981;  opacity: 0.82; }
                100% { box-shadow: 0 0 4px 1px #6ee7b7, 0 0 10px 2px #10b981; opacity: 1; }
            }
            @keyframes electric-flicker-toggle {
                0%   { box-shadow: 0 0 3px 1px #818cf8, 0 0 8px 2px #6366f1;  opacity: 1; }
                15%  { box-shadow: 0 0 1px 0px #818cf8, 0 0 4px 1px #6366f1;  opacity: 0.8; }
                30%  { box-shadow: 0 0 6px 2px #a5b4fc, 0 0 14px 4px #6366f1; opacity: 1; }
                50%  { box-shadow: 0 0 1px 0px #818cf8, 0 0 3px 1px #6366f1;  opacity: 0.75; }
                70%  { box-shadow: 0 0 7px 3px #a5b4fc, 0 0 16px 4px #6366f1; opacity: 1; }
                85%  { box-shadow: 0 0 2px 1px #818cf8, 0 0 5px 1px #6366f1;  opacity: 0.85; }
                100% { box-shadow: 0 0 3px 1px #818cf8, 0 0 8px 2px #6366f1;  opacity: 1; }
            }
            .electric-btn-indigo:hover {
                animation: electric-flicker 0.18s step-end infinite;
                outline: none;
            }
            .electric-btn-emerald:hover {
                animation: electric-flicker-emerald 0.18s step-end infinite;
                outline: none;
            }
            .electric-btn-toggle:hover {
                animation: electric-flicker-toggle 0.22s step-end infinite;
                outline: none;
            }
        `}</style>
            <AuthenticatedLayout
                user={auth.user}
                header={
                    <div className="flex sm:flex-row justify-between items-center gap-4 w-full">
                        <h2 className="font-semibold text-xl text-gray-800 dark:text-white leading-tight truncate">
                            Incoming Items
                        </h2>
                        <div className="flex flex-row items-center gap-2 sm:gap-4 flex-shrink-0">
                            {/* Desktop View Toggle */}
                            <div className="hidden sm:flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode('table')}
                                    className={`electric-btn-toggle p-2 rounded-md transition-colors ${viewMode === 'table'
                                        ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                                        }`}
                                    title="Table View"
                                >
                                    <TableCellsIcon className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => setViewMode('card')}
                                    className={`electric-btn-toggle p-2 rounded-md transition-colors ${viewMode === 'card'
                                        ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                                        }`}
                                    title="Card View"
                                >
                                    <Squares2X2Icon className="h-5 w-5" />
                                </button>
                            </div>
                            {/* Mobile View Toggle */}
                            <div className="sm:hidden flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode('table')}
                                    className={`electric-btn-toggle p-2 rounded-md transition-colors ${viewMode === 'table'
                                        ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                                        }`}
                                    title="Table View"
                                >
                                    <TableCellsIcon className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => setViewMode('card')}
                                    className={`electric-btn-toggle p-2 rounded-md transition-colors ${viewMode === 'card'
                                        ? 'bg-white dark:bg-gray-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                                        }`}
                                    title="Card View"
                                >
                                    <Squares2X2Icon className="h-5 w-5" />
                                </button>
                            </div>
                            <Link
                                href={route('items.create')}
                                className="electric-btn-indigo inline-flex items-center justify-center p-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                onMouseEnter={(e) => { const rect = e.currentTarget.getBoundingClientRect(); setTooltip({ show: true, text: 'Add New Tool/Material', x: rect.left + rect.width / 2, y: rect.bottom + 10 }); }}
                                onMouseLeave={() => setTooltip({ show: false, text: '', x: 0, y: 0 })}
                            >
                                <PlusIcon className="h-5 w-5" />
                            </Link>
                            <Link
                                href={route('items.add-stock')}
                                className="electric-btn-emerald inline-flex items-center justify-center p-2 bg-emerald-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-emerald-700 focus:bg-emerald-700 active:bg-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                onMouseEnter={(e) => { const rect = e.currentTarget.getBoundingClientRect(); setTooltip({ show: true, text: 'Add Incoming Stock', x: rect.left + rect.width / 2, y: rect.bottom + 10 }); }}
                                onMouseLeave={() => setTooltip({ show: false, text: '', x: 0, y: 0 })}
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </Link>
                            <button
                                onClick={() => setShowImportModal(true)}
                                className="electric-btn-indigo inline-flex items-center justify-center p-2 bg-purple-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-purple-700 focus:bg-purple-700 active:bg-purple-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                onMouseEnter={(e) => { const rect = e.currentTarget.getBoundingClientRect(); setTooltip({ show: true, text: 'Import from Excel', x: rect.left + rect.width / 2, y: rect.bottom + 10 }); }}
                                onMouseLeave={() => setTooltip({ show: false, text: '', x: 0, y: 0 })}
                            >
                                <DocumentArrowUpIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                }
            >
                <Head title="Incoming Items" />

                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        {status && (
                            <div className="mb-4 p-4 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded">
                                {status}
                            </div>
                        )}
                        <div className="mb-6">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <SearchInput />
                                </div>
                                <div className="sm:w-48">
                                    <div className="relative">
                                        {/* Single native date input — color:transparent hides OS-formatted text, picker icon/calendar remain fully functional */}
                                        <input
                                            type="date"
                                            value={date}
                                            onChange={(e) => handleDateChange(e.target.value)}
                                            style={{ color: 'transparent', caretColor: 'transparent' }}
                                            className="block w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 sm:text-sm transition duration-150 ease-in-out cursor-pointer"
                                        />
                                        {/* Overlay div — shows date as MM/DD/YYYY (or placeholder), pointer-events-none so clicks pass through to the date input */}
                                        <div className="absolute inset-y-0 left-0 right-8 px-3 flex items-center pointer-events-none">
                                            {date
                                                ? <span className="text-gray-900 dark:text-white sm:text-sm">{formatDateDisplay(date)}</span>
                                                : <span className="text-gray-400 dark:text-gray-500 sm:text-sm">MM/DD/YYYY</span>
                                            }
                                        </div>
                                        {date && (
                                            <button
                                                onClick={() => handleDateChange('')}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center z-10"
                                            >
                                                <svg className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bulk Actions Bar */}
                        {selectedItems.length > 0 && (
                            <div className="mb-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <span className="text-sm font-medium text-indigo-800 dark:text-indigo-200">
                                            {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
                                        </span>
                                        <button
                                            onClick={() => setSelectedItems([])}
                                            className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 underline"
                                        >
                                            Clear selection
                                        </button>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={handleBulkDelete}
                                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                        >
                                            <TrashIcon className="h-4 w-4 mr-1" />
                                            Delete Selected
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                            {viewMode === 'table' ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-blue-600/70 dark:bg-blue-900/80">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedItems.length === items.data.length && items.data.length > 0}
                                                        onChange={handleSelectAll}
                                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                    />
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                                    <button
                                                        onClick={() => handleSort('name')}
                                                        className="group flex items-center hover:text-white/80 transition-colors"
                                                    >
                                                        Item
                                                        {getSortIcon('name')}
                                                    </button>
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                                    <button
                                                        onClick={() => handleSort('quantity')}
                                                        className="group flex items-center hover:text-white/80 transition-colors"
                                                    >
                                                        Quantity
                                                        {getSortIcon('quantity')}
                                                    </button>
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                                    <button
                                                        onClick={() => handleSort('date_time')}
                                                        className="group flex items-center hover:text-white/80 transition-colors"
                                                    >
                                                        Date & Time
                                                        {getSortIcon('date_time')}
                                                    </button>
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {items.data.length > 0 ? (
                                                items.data.map((item, index) => (
                                                    <tr key={item.id} className={`${selectedItems.includes(item.id) ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'odd:bg-white even:bg-gray-200 dark:odd:bg-gray-800 dark:even:bg-gray-700'} hover:bg-blue-200 dark:hover:bg-gray-600 border-b border-gray-300 dark:border-gray-600 transition-colors duration-200`}>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedItems.includes(item.id)}
                                                                onChange={() => handleSelectItem(item.id)}
                                                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                {items.from + index}. {item.name}
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
                                                            <div className="flex items-center space-x-2">
                                                                <span>{formatQuantity(item.quantity, item.unit)}</span>
                                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getItemStatus(item.quantity).bgColor} ${getItemStatus(item.quantity).textColor}`}>
                                                                    {getItemStatus(item.quantity).status}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                            {item.date_time ? new Date(item.date_time).toLocaleString('en-US') : 'N/A'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                            <div className="flex space-x-2">
                                                                <Link
                                                                    href={route('items.show', item.id)}
                                                                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                                                                    onMouseEnter={(e) => { const rect = e.currentTarget.getBoundingClientRect(); setTooltip({ show: true, text: 'View', x: rect.left + rect.width / 2, y: rect.bottom + 10 }); }}
                                                                    onMouseLeave={() => setTooltip({ show: false, text: '', x: 0, y: 0 })}
                                                                >
                                                                    <EyeIcon className="h-5 w-5" />
                                                                </Link>
                                                                <Link
                                                                    href={route('items.edit', item.id)}
                                                                    className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-900 dark:hover:text-yellow-300"
                                                                    onMouseEnter={(e) => { const rect = e.currentTarget.getBoundingClientRect(); setTooltip({ show: true, text: 'Edit', x: rect.left + rect.width / 2, y: rect.bottom + 10 }); }}
                                                                    onMouseLeave={() => setTooltip({ show: false, text: '', x: 0, y: 0 })}
                                                                >
                                                                    <PencilSquareIcon className="h-5 w-5" />
                                                                </Link>
                                                                <button
                                                                    onClick={() => {
                                                                        setItemToDelete(item);
                                                                        setConfirmingItemDeletion(true);
                                                                    }}
                                                                    className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                                                                    onMouseEnter={(e) => { const rect = e.currentTarget.getBoundingClientRect(); setTooltip({ show: true, text: 'Delete', x: rect.left + rect.width / 2, y: rect.bottom + 10 }); }}
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
                                                    <td colSpan="5" className="px-6 py-12 text-center">
                                                        <div className="flex flex-col items-center">
                                                            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                                                                <MagnifyingGlassIcon className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                                                            </div>
                                                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                                                {search ? 'No items found' : 'No tools and materials yet'}
                                                            </h3>
                                                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-sm">
                                                                {search
                                                                    ? `We couldn't find any items matching "${search}". Try adjusting your search terms or clear the search to see all items.`
                                                                    : 'Get started by adding your first tool or material to the inventory. You can track quantities, manage borrowing, and keep everything organized.'
                                                                }
                                                            </p>
                                                            <div className="hidden flex space-x-3">
                                                                {search && (
                                                                    <button
                                                                        onClick={() => handleSearch('')}
                                                                        className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                                                    >
                                                                        Clear search
                                                                    </button>
                                                                )}
                                                                <Link
                                                                    href={route('items.create')}
                                                                    className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                                                >
                                                                    <PlusIcon className="h-4 w-4 mr-2" />
                                                                    Add First Item
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                // Card View for mobile and alternative view
                                <div className="p-6">
                                    {items.data.length > 0 ? (
                                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                            {items.data.map((item, index) => (
                                                <div key={item.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div className="flex-1">
                                                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                                                                {items.from + index}. {item.name}
                                                            </h3>
                                                            {item.description && (
                                                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                                                    {item.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="flex space-x-2 ml-4">
                                                            <Link
                                                                href={route('items.show', item.id)}
                                                                className="p-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-md transition-colors"
                                                                title="View"
                                                            >
                                                                <EyeIcon className="h-5 w-5" />
                                                            </Link>
                                                            <Link
                                                                href={route('items.edit', item.id)}
                                                                className="p-2 text-yellow-600 dark:text-yellow-400 hover:text-yellow-900 dark:hover:text-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-md transition-colors"
                                                                title="Edit"
                                                            >
                                                                <PencilSquareIcon className="h-5 w-5" />
                                                            </Link>
                                                            <button
                                                                onClick={() => {
                                                                    setItemToDelete(item);
                                                                    setConfirmingItemDeletion(true);
                                                                }}
                                                                className="p-2 text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                                                                title="Delete"
                                                            >
                                                                <TrashIcon className="h-5 w-5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Quantity:</span>
                                                            <div className="flex items-center space-x-2">
                                                                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                                    {formatQuantity(item.quantity, item.unit)}
                                                                </span>
                                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getItemStatus(item.quantity).bgColor} ${getItemStatus(item.quantity).textColor}`}>
                                                                    {getItemStatus(item.quantity).status}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Date & Time:</span>
                                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                                {item.date_time ? new Date(item.date_time).toLocaleString('en-US') : 'N/A'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-16">
                                            <div className="w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6 mx-auto">
                                                <MagnifyingGlassIcon className="h-16 w-16 text-gray-400 dark:text-gray-500" />
                                            </div>
                                            <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-3">
                                                {search ? 'No items found' : 'No tools and materials yet'}
                                            </h3>
                                            <p className="text-gray-500 dark:text-gray-400 text-base mb-8 max-w-md mx-auto">
                                                {search
                                                    ? `We couldn't find any items matching "${search}". Try adjusting your search terms or clear the search to see all items.`
                                                    : 'Get started by adding your first tool or material to the inventory. You can track quantities, manage borrowing, and keep everything organized in an easy-to-browse card layout.'
                                                }
                                            </p>
                                            <div className="flex justify-center space-x-4">
                                                {search && (
                                                    <button
                                                        onClick={() => handleSearch('')}
                                                        className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-base font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                                    >
                                                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                        Clear search
                                                    </button>
                                                )}
                                                <Link
                                                    href={route('items.create')}
                                                    className="inline-flex items-center px-6 py-3 bg-indigo-600 border border-transparent rounded-lg text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-sm"
                                                >
                                                    <PlusIcon className="h-5 w-5 mr-2" />
                                                    Add First Item
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
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
                                                    className={`px-3 py-2 text-sm rounded-md ${link.active
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
                                {isBulkDelete ? 'Delete Selected Items' : 'Delete Tool/Material'}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                {isBulkDelete
                                    ? `Are you sure you want to delete ${selectedItems.length} selected item(s)? This action cannot be undone.`
                                    : `Are you sure you want to delete "${itemToDelete?.name}"? This action cannot be undone.`}
                            </p>
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => {
                                        setConfirmingItemDeletion(false);
                                        setItemToDelete(null);
                                        setIsBulkDelete(false);
                                    }}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        if (isBulkDelete) {
                                            selectedItems.forEach(itemId => {
                                                router.delete(route('items.destroy', itemId), {
                                                    preserveScroll: true,
                                                });
                                            });
                                            setSelectedItems([]);
                                            setConfirmingItemDeletion(false);
                                            setIsBulkDelete(false);
                                        } else if (itemToDelete) {
                                            deleteItem(itemToDelete.id);
                                        }
                                    }}
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
                <ImportModal show={showImportModal} onClose={() => setShowImportModal(false)} />
            </AuthenticatedLayout>
        </>
    );
}