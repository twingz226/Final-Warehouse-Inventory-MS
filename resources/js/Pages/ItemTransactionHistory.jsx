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
    WrenchIcon
} from '@heroicons/react/24/outline';

export default function ItemTransactionHistory({ auth, transactions, items, filters }) {
    const [selectedItem, setSelectedItem] = useState(filters.item_name || '');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedGroups, setExpandedGroups] = useState({});

    // Trigger router GET when item changes
    useEffect(() => {
        if (selectedItem !== filters.item_name) {
            router.get(
                route('item-transaction-history.index'),
                { item_name: selectedItem },
                { preserveState: true, preserveScroll: true }
            );
        }
    }, [selectedItem]);

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

    const filteredGroups = groups.filter(group =>
        group.groupName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        group.items.some(item => 
            (item.supplier_name && item.supplier_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (item.project_name && item.project_name.toLowerCase().includes(searchQuery.toLowerCase()))
        )
    );

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

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* Filters Section */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
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
                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white flex items-center">
                            <Bars3CenterLeftIcon className="h-5 w-5 mr-2 text-indigo-500" />
                            History for: <span className="ml-1 font-bold text-indigo-600 dark:text-indigo-400">{selectedItem}</span>
                        </h3>
                    )}

                    {/* Projects Overview Style Layout */}
                    {filteredGroups.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6 text-center text-gray-500 dark:text-gray-400">
                            No transactions found matching your filters.
                        </div>
                    ) : (
                        filteredGroups.map((group, index) => {
                            const isExpanded = expandedGroups[group.groupName] || false;

                            return (
                                <div key={index} className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                                    {/* Header / Summary Row */}
                                    <div
                                        className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 flex items-center justify-between"
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
                                            <div>
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
                                            <div className="overflow-x-auto pb-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-gray-100 dark:[&::-webkit-scrollbar-track]:bg-gray-800 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-500 [&::-webkit-scrollbar-thumb]:rounded-full">
                                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                    <thead className="bg-blue-600/70 dark:bg-blue-900/80">
                                                        <tr>
                                                            {selectedItem ? (
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                                                    <div className="flex items-center">
                                                                        <ClockIcon className="h-4 w-4 mr-1" /> Time
                                                                    </div>
                                                                </th>
                                                            ) : (
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                                                    <div className="flex items-center">
                                                                        <CalendarIcon className="h-4 w-4 mr-1" /> Date
                                                                    </div>
                                                                </th>
                                                            )}
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                                                Quantity
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                                                Project Site / Destination
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 text-black">
                                                        {group.items.map((item, idx) => (
                                                            <tr key={idx} className="odd:bg-white even:bg-gray-200 dark:odd:bg-gray-800 dark:even:bg-gray-700 hover:bg-blue-200 dark:hover:bg-gray-600 transition-colors duration-200 border-b border-gray-300 dark:border-gray-600">
                                                                {selectedItem ? (
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-medium">
                                                                        {formatTime(item.created_at)}
                                                                    </td>
                                                                ) : (
                                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-medium whitespace-nowrap">
                                                                        <div className="flex flex-col">
                                                                            <span>{formatDate(item.created_at)}</span>
                                                                            <span className="text-xs text-gray-500 dark:text-gray-400">{formatTime(item.created_at)}</span>
                                                                        </div>
                                                                    </td>
                                                                )}
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-bold">
                                                                    {item.quantity}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                                    <span className="font-medium">{item.supplier_name || '-'}</span>
                                                                    {item.project_name && (
                                                                        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                                                            Proj: {item.project_name}
                                                                        </span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
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
                        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg overflow-hidden mt-6 mb-6">
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
