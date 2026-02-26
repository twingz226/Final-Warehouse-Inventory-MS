import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, BuildingOfficeIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function Index({ auth, purchases }) {
    const [expandedGroups, setExpandedGroups] = useState({});
    const [searchQuery, setSearchQuery] = useState('');

    const toggleGroup = (key) => {
        setExpandedGroups(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    // Group purchases by Destination Name (supplier_name)
    // The query ordered them by supplier_name asc, purchase_date desc
    const groupedData = purchases.reduce((acc, purchase) => {
        const dest = purchase.supplier_name || 'Unknown Destination';
        if (!acc[dest]) {
            acc[dest] = {
                destinationName: dest,
                projectName: purchase.project_name, // Taking the first encountered project name for context if any
                items: [],
                totalItems: 0,
            };
        }
        acc[dest].items.push(purchase);
        acc[dest].totalItems += 1;
        return acc;
    }, {});

    const groups = Object.values(groupedData);

    const filteredGroups = groups.filter(group =>
        group.destinationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (group.projectName && group.projectName.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Projects Overview
                </h2>
            }
        >
            <Head title="Projects" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Modern Search Bar */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by destination or project name..."
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                            />
                        </div>
                    </div>

                    {filteredGroups.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6 text-center text-gray-500 dark:text-gray-400">
                            No active projects or distributions found.
                        </div>
                    ) : (
                        filteredGroups.map((group, index) => {
                            const isExpanded = expandedGroups[group.destinationName] || false;

                            // Get unique dates for this destination to show as a summary
                            const uniqueDates = [...new Set(group.items.map(i => new Date(i.purchase_date).toLocaleDateString()))];

                            return (
                                <div key={index} className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                                    {/* Header / Summary Row */}
                                    <div
                                        className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 flex items-center justify-between"
                                        onClick={() => toggleGroup(group.destinationName)}
                                    >
                                        <div className="flex items-center space-x-4">
                                            <div className="flex-shrink-0 bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-lg">
                                                <BuildingOfficeIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                                    {group.destinationName}
                                                </h3>
                                                {group.projectName && (
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        Project: {group.projectName}
                                                    </p>
                                                )}
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                    {group.totalItems} items distributed across {uniqueDates.length} date(s)
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center text-gray-400">
                                            {isExpanded ? (
                                                <ChevronUpIcon className="h-6 w-6" />
                                            ) : (
                                                <ChevronDownIcon className="h-6 w-6" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Expanded Details - Table of Items */}
                                    {isExpanded && (
                                        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-6">
                                            <div className="overflow-x-auto pb-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-gray-100 dark:[&::-webkit-scrollbar-track]:bg-gray-800 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-500 [&::-webkit-scrollbar-thumb]:rounded-full">
                                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                                    <thead className="bg-gray-100 dark:bg-gray-700">
                                                        <tr>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                                Date Distributed
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                                Item Name
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                                Category
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                                OS #
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                                Type of Project
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                                Issued By
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                                Issued To
                                                            </th>
                                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                                Quantity
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                                Material Description
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                                        {group.items.map((item, idx) => (
                                                            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-medium">
                                                                    {new Date(item.purchase_date).toLocaleDateString()}
                                                                </td>
                                                                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                                                                    {item.item_name}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    {item.item_category ? (
                                                                        <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${item.item_category === 'material'
                                                                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                                                            : item.item_category === 'tool'
                                                                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                                                                                : 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200'
                                                                            }`}>
                                                                            {item.item_category}
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-xs text-gray-400 dark:text-gray-500">N/A</span>
                                                                    )}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                                    {item.os || '-'}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                                    {item.project_type || '-'}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                                    {item.issued_by || '-'}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                                    {item.issued_to || '-'}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-right font-medium">
                                                                    {item.quantity}
                                                                </td>
                                                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                                    {item.notes || '-'}
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
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
