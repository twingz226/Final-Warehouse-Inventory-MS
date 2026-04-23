import React, { useState, useEffect } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
    ClockIcon, 
    CalendarIcon,
    MagnifyingGlassIcon,
    Bars3CenterLeftIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    WrenchIcon,
    PrinterIcon
} from '@heroicons/react/24/outline';

export default function ItemTransactionHistory({ auth, transactions, items, filters, item }) {
    const [selectedItem, setSelectedItem] = useState(filters.item_name || '');
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [expandedGroups, setExpandedGroups] = useState({});
    const [printingGroup, setPrintingGroup] = useState(null);

    // Trigger router GET when item changes
    useEffect(() => {
        if (selectedItem !== filters.item_name) {
            router.get(
                route('item-transaction-history.index'),
                { item_name: selectedItem, search: searchQuery },
                { preserveState: true, preserveScroll: true }
            );
        }
    }, [selectedItem]);

    // Trigger router GET when search query changes
    useEffect(() => {
        if (searchQuery !== filters.search) {
            router.get(
                route('item-transaction-history.index'),
                { item_name: selectedItem, search: searchQuery },
                { preserveState: true, preserveScroll: true }
            );
        }
    }, [searchQuery]);

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-CA'); // YYYY-MM-DD format
    };

    const toggleGroup = (key) => {
        setExpandedGroups(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handlePrint = (e, groupKey) => {
        e.stopPropagation();

        setExpandedGroups({
            [groupKey]: true
        });

        setPrintingGroup(groupKey);

        setTimeout(() => {
            window.print();
            setTimeout(() => setPrintingGroup(null), 100);
        }, 300);
    };

    // Group transactions by Date if a specific item is selected, or by Item Name if no item is selected
    const dataToGroup = transactions.data || transactions;
    
    // Using reduce to group
    const groupedData = dataToGroup.reduce((acc, transaction) => {
        const groupKey = selectedItem ? formatDate(transaction.created_at) : transaction.item_name;
        
        if (!acc[groupKey]) {
            acc[groupKey] = {
                groupName: groupKey,
                items: [],
                totalItems: 0,
            };
        }
        acc[groupKey].items.push(transaction);
        acc[groupKey].totalItems += 1;
        return acc;
    }, {});

    const groups = Object.values(groupedData);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-white leading-tight">
                    Item Transaction History
                </h2>
            }
        >
            <Head title="Item Transaction History" />

            <div className="py-12 print:py-0">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6 print:space-y-0">

                    {/* Filters Section */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 print:hidden">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Item Filter */}
                            <div>
                                <label htmlFor="itemSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Filter by Item
                                </label>
                                <select
                                    id="itemSelect"
                                    value={selectedItem}
                                    onChange={(e) => setSelectedItem(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-colors duration-200"
                                >
                                    <option value="">-- All Items --</option>
                                    {items.map((item) => (
                                        <option key={item.id} value={item.name}>
                                            {item.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            {/* Modern Search Bar */}
                            <div>
                                <label htmlFor="searchQuery" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Search Transactions
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                    </div>
                                    <input
                                        id="searchQuery"
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder={selectedItem ? "Search by project or destination..." : "Search by item, project, or destination..."}
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Selected Item Title */}
                    {selectedItem && (
                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white flex items-center print:hidden">
                            <Bars3CenterLeftIcon className="h-5 w-5 mr-2 text-indigo-500" />
                            History for: <span className="ml-1 font-bold text-indigo-600 dark:text-indigo-400">{selectedItem}</span>
                        </h3>
                    )}

                    {/* Projects Overview Style Layout */}
                    {groups.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6 text-center text-gray-500 dark:text-gray-400">
                            No transactions found matching your filters.
                        </div>
                    ) : (
                        groups.map((group, index) => {
                            const isExpanded = expandedGroups[group.groupName] || false;

                            return (
                                <div key={index} className={`bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg ${printingGroup && printingGroup !== group.groupName ? 'print:hidden' : ''}`}>
                                    {/* Header / Summary Row */}
                                    <div
                                        className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 flex items-center justify-between print:hidden"
                                        onClick={() => toggleGroup(group.groupName)}
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="flex-shrink-0 bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-lg">
                                                {selectedItem ? (
                                                    <CalendarIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                                ) : (
                                                    <WrenchIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                                    {group.groupName}
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                    {group.totalItems} transaction(s) recorded
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center text-gray-400 space-x-4">
                                            <button
                                                onClick={(e) => handlePrint(e, group.groupName)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg transition-colors print:hidden"
                                                title={`Print ${group.groupName} details`}
                                            >
                                                <PrinterIcon className="h-4 w-4" />
                                                <span className="hidden sm:inline">Print</span>
                                            </button>
                                            <div className="print:hidden">
                                                {isExpanded ? (
                                                    <ChevronUpIcon className="h-6 w-6" />
                                                ) : (
                                                    <ChevronDownIcon className="h-6 w-6" />
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Details - Table of Items */}
                                    {isExpanded && (
                                        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-6 print:p-0 print:border-none print:bg-white text-black">
                                            {/* Print header showing project name in the print output */}
                                            <div className="hidden print:block mb-3">
                                                <div className="flex items-center justify-center gap-4">
                                                    <img src="/images/warlen.png" alt="Warlen Logo" className="h-16 w-auto object-contain" />
                                                    <h1 className="text-2xl font-bold tracking-wide text-black uppercase leading-none">WARLEN INDUSTRIAL SALES CORPORATION</h1>
                                                </div>
                                                <div className="text-center -mt-4 mb-4">
                                                    <h2 className="text-xl font-bold uppercase text-black leading-none">Transaction History</h2>
                                                </div>
                                                <div className="text-left">
                                                    {selectedItem ? (
                                                        <p className="text-black font-semibold text-lg">Item: {selectedItem} | Date: {group.groupName}</p>
                                                    ) : (
                                                        <p className="text-black font-semibold text-lg">Item: {group.groupName}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="overflow-x-auto pb-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-gray-100 dark:[&::-webkit-scrollbar-track]:bg-gray-800 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-500 [&::-webkit-scrollbar-thumb]:rounded-full print:overflow-visible">
                                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 print:border-collapse print:border print:border-black print:divide-y-0">
                                                    <thead className="bg-blue-600/70 dark:bg-blue-900/80 print:bg-blue-600/70 print:dark:bg-blue-900/80 print:[print-color-adjust:exact]">
                                                        <tr>
                                                            {selectedItem ? (
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider print:border print:border-black print:p-2 print:text-white print:font-bold">
                                                                    <div className="flex items-center">
                                                                        <ClockIcon className="h-4 w-4 mr-1" /> Time
                                                                    </div>
                                                                </th>
                                                            ) : (
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider print:border print:border-black print:p-2 print:text-white print:font-bold">
                                                                    <div className="flex items-center">
                                                                        <CalendarIcon className="h-4 w-4 mr-1 print:hidden" /> Date
                                                                    </div>
                                                                </th>
                                                            )}
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider print:border print:border-black print:p-2 print:text-white print:font-bold">
                                                                Project Site / Destination
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider print:border print:border-black print:p-2 print:text-white print:font-bold">
                                                                Issued To
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider print:border print:border-black print:p-2 print:text-white print:font-bold">
                                                                Total Stocks
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider print:border print:border-black print:p-2 print:text-white print:font-bold">
                                                                Quantity
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider print:border print:border-black print:p-2 print:text-white print:font-bold">
                                                                Available Stocks
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 text-black print:divide-y-0">
                                                        {(() => {
                                                            let previousAvailableStock = null;
                                                            return group.items.map((transaction, idx) => {
                                                                const itemData = items.find(item => item.name === transaction.item_name);
                                                                const initialStock = itemData?.total_stock || 0;
                                                                let totalStocksValue = initialStock;
                                                                let availableStock = initialStock;
                                                                
                                                                if (idx > 0) {
                                                                    // For subsequent rows, Total Stocks = previous Available Stocks
                                                                    totalStocksValue = previousAvailableStock;
                                                                    availableStock = totalStocksValue - transaction.quantity;
                                                                } else {
                                                                    // First row: Available Stocks = Total Stocks - Quantity
                                                                    availableStock = initialStock - transaction.quantity;
                                                                }
                                                                
                                                                previousAvailableStock = availableStock;
                                                                
                                                                return (
                                                                    <tr key={idx} className="odd:bg-white even:bg-gray-200 dark:odd:bg-gray-800 dark:even:bg-gray-700 hover:bg-blue-200 dark:hover:bg-gray-600 transition-colors duration-200 border-b border-gray-300 dark:border-gray-600 print:bg-white print:odd:bg-white print:even:bg-white print:border-none print:[print-color-adjust:exact]">
                                                                        {selectedItem ? (
                                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-medium print:border print:border-black print:p-2 print:text-black">
                                                                                {formatTime(transaction.created_at)}
                                                                            </td>
                                                                        ) : (
                                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-medium whitespace-nowrap print:border print:border-black print:p-2 print:text-black">
                                                                                <div className="flex flex-col">
                                                                                    <span>{formatDate(transaction.created_at)}</span>
                                                                                    <span className="text-xs text-gray-500 dark:text-gray-400 print:text-gray-800">{formatTime(transaction.created_at)}</span>
                                                                                </div>
                                                                            </td>
                                                                        )}
                                                                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 print:border print:border-black print:p-2 print:text-black">
                                                                            <span className="font-medium">{transaction.supplier_name || '-'}</span>
                                                                            {transaction.project_name && (
                                                                                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 print:bg-transparent print:p-0 px-2 py-1 rounded print:text-black print:font-normal">
                                                                                    Proj: {transaction.project_name}
                                                                                </span>
                                                                            )}
                                                                        </td>
                                                                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 print:border print:border-black print:p-2 print:text-black">
                                                                            <span className="font-medium">{transaction.issued_to || '-'}</span>
                                                                        </td>
                                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-bold print:border print:border-black print:p-2 print:text-black">
                                                                            {itemData?.unit === 'Quantity' ? Math.floor(Number(totalStocksValue)) : totalStocksValue}
                                                                        </td>
                                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-bold print:border print:border-black print:p-2 print:text-black">
                                                                            {transaction.quantity}
                                                                        </td>
                                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-bold print:border print:border-black print:p-2 print:text-black">
                                                                            {availableStock}
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            });
                                                        })()}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}

                    {/* Pagination */}
                    {transactions.last_page > 1 && (
                        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg overflow-hidden mt-6 mb-6 print:hidden">
                            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                                    <div className="text-sm text-gray-700 dark:text-gray-300">
                                        Showing <span className="font-medium">{transactions.from}</span> to <span className="font-medium">{transactions.to}</span> of{' '}
                                        <span className="font-medium">{transactions.total}</span> results
                                    </div>
                                    <div className="flex flex-wrap justify-center gap-1">
                                        {transactions.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={`px-3 py-2 text-sm rounded-md ${link.active
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                                                    } ${!link.url ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                                preserveScroll
                                                preserveState
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
