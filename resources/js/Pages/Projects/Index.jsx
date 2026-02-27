import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, BuildingOfficeIcon, MagnifyingGlassIcon, PrinterIcon } from '@heroicons/react/24/outline';

export default function Index({ auth, purchases }) {
    const [expandedGroups, setExpandedGroups] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [printingGroup, setPrintingGroup] = useState(null);

    const toggleGroup = (key) => {
        setExpandedGroups(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    // Group purchases by Destination Name (supplier_name)
    // The query ordered them by supplier_name asc, purchase_date asc
    const dataToGroup = purchases.data || purchases;
    const groupedData = dataToGroup.reduce((acc, purchase) => {
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

    const handlePrint = (e, groupDestination) => {
        e.stopPropagation(); // Prevent toggling the accordion

        // Ensure the current group is expanded, and close others (for better printing context)
        setExpandedGroups({
            [groupDestination]: true
        });

        setPrintingGroup(groupDestination);

        // Add a small delay to allow React to render the expanded table before printing
        setTimeout(() => {
            window.print();
            // Optional: reset after print dialog closes
            setTimeout(() => setPrintingGroup(null), 100);
        }, 300);
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-white leading-tight">
                    Projects Overview
                </h2>
            }
        >
            <Head title="Projects" />

            <div className="py-12">
                <style>
                    {`
                    @media print {
                        @page { size: landscape; }
                    }
                    `}
                </style>
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Modern Search Bar */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 print:hidden">
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
                                <div key={index} className={`bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg ${printingGroup && printingGroup !== group.destinationName ? 'print:hidden' : ''}`}>
                                    {/* Header / Summary Row */}
                                    <div
                                        className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 flex items-center justify-between print:hidden"
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
                                        <div className="flex items-center text-gray-400 space-x-4">
                                            <button
                                                onClick={(e) => handlePrint(e, group.destinationName)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg transition-colors print:hidden"
                                                title={`Print ${group.destinationName} details`}
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

                                    {/* Expanded Details - Table of Items (Print output) */}
                                    {isExpanded && (
                                        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-6 print:p-0 print:border-none print:bg-white text-black">
                                            {/* Print header showing project name in the print output */}
                                            <div className="hidden print:block mb-6 text-center">
                                                <h2 className="text-2xl font-bold">Withdrawal Slip ({group.destinationName})</h2>
                                                {group.projectName && <p className="text-gray-600">Project: {group.projectName}</p>}
                                            </div>
                                            <div className="overflow-x-auto pb-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-gray-100 dark:[&::-webkit-scrollbar-track]:bg-gray-800 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-500 [&::-webkit-scrollbar-thumb]:rounded-full print:overflow-visible">
                                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 print:border-collapse print:border print:border-black print:divide-y-0">
                                                    <thead className="bg-blue-600/70 dark:bg-blue-900/80 print:bg-blue-600/70 print:dark:bg-blue-900/80 print:[print-color-adjust:exact]">
                                                        <tr>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider print:border print:border-black print:p-2 print:text-white print:font-bold">
                                                                Date
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider print:border print:border-black print:p-2 print:text-white print:font-bold">
                                                                O.S
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider print:border print:border-black print:p-2 print:text-white print:font-bold">
                                                                Name of Project
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider print:border print:border-black print:p-2 print:text-white print:font-bold">
                                                                Type of Project
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider print:border print:border-black print:p-2 print:text-white print:font-bold">
                                                                QTY
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider print:border print:border-black print:p-2 print:text-white print:font-bold">
                                                                Unit
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider print:border print:border-black print:p-2 print:text-white print:font-bold">
                                                                Material Description
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider print:border print:border-black print:p-2 print:text-white print:font-bold">
                                                                Issued By
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider print:border print:border-black print:p-2 print:text-white print:font-bold">
                                                                Issued To
                                                            </th>
                                                            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider print:border print:border-black print:p-2 print:text-white print:font-bold">
                                                                Remarks
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 print:divide-y-0 text-black">
                                                        {group.items.map((item, idx) => (
                                                            <tr key={idx} className="odd:bg-white even:bg-gray-200 dark:odd:bg-gray-800 dark:even:bg-gray-700 hover:bg-blue-200 dark:hover:bg-gray-600 border-b border-gray-300 dark:border-gray-600 transition-colors duration-200 print:bg-white print:odd:bg-white print:even:bg-white print:border-none print:[print-color-adjust:exact]">
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-medium print:border print:border-black print:p-2 print:text-black">
                                                                    {new Date(item.purchase_date).toLocaleDateString()}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 print:border print:border-black print:p-2 print:text-black">
                                                                    {item.os || '-'}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 print:border print:border-black print:p-2 print:text-black">
                                                                    {item.supplier_name || '-'}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 print:border print:border-black print:p-2 print:text-black">
                                                                    {item.project_type || '-'}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-medium print:border print:border-black print:p-2 print:text-black">
                                                                    {item.quantity}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 print:border print:border-black print:p-2 print:text-black">
                                                                    {item.item_unit === 'Quantity' ? 'pcs' : (item.item_unit || '-')}
                                                                </td>
                                                                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 print:border print:border-black print:p-2 print:text-black">
                                                                    {item.item_name}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 print:border print:border-black print:p-2 print:text-black">
                                                                    {item.issued_by || '-'}
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 print:border print:border-black print:p-2 print:text-black">
                                                                    {item.issued_to || '-'}
                                                                </td>
                                                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 print:border print:border-black print:p-2 print:text-black">
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

                    {/* Pagination */}
                    {purchases.last_page > 1 && (
                        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg overflow-hidden mt-6 mb-6 print:hidden">
                            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                                    <div className="text-sm text-gray-700 dark:text-gray-300">
                                        Showing {purchases.from} to {purchases.to} of {purchases.total} results
                                    </div>
                                    <div className="flex flex-wrap justify-center gap-1">
                                        {purchases.links.map((link, index) => (
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
