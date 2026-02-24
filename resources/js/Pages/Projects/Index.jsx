import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

export default function Index({ auth, purchases }) {
    const [expandedGroups, setExpandedGroups] = useState({});

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
                    {groups.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6 text-center text-gray-500 dark:text-gray-400">
                            No active projects or distributions found.
                        </div>
                    ) : (
                        groups.map((group, index) => {
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
                                            <div className="overflow-x-auto">
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
                                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                                Quantity
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                                Purpose/Notes
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
