import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState } from 'react';
import { PlusIcon, EyeIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function Index({ auth, borrowings, status, statusOptions }) {
    const [search, setSearch] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [searchTimeout, setSearchTimeout] = useState(null);
    const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 });

    const handleSearch = (value) => {
        setSearch(value);

        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        const timeout = setTimeout(() => {
            const params = new URLSearchParams(window.location.search);
            if (value) {
                params.set('search', value);
            } else {
                params.delete('search');
            }
            params.set('page', '1');

            router.get(`${window.location.pathname}?${params.toString()}`, {}, {
                preserveScroll: true,
                preserveState: true,
            });
        }, 300);

        setSearchTimeout(timeout);
    };

    const handleStatusFilter = (status) => {
        setSelectedStatus(status);

        const params = new URLSearchParams(window.location.search);
        if (status) {
            params.set('status', status);
        } else {
            params.delete('status');
        }
        params.set('page', '1');

        router.get(`${window.location.pathname}?${params.toString()}`, {}, {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const deleteBorrowing = (id) => {
        if (confirm('Are you sure you want to delete this borrowing record?')) {
            router.delete(route('borrowings.destroy', id));
        }
    };

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'borrowed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'returned': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-100 leading-tight">
                    Borrowed Tools & Materials
                </h2>
            }
        >
            <Head title="Borrowed Tools & Materials" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-xl sm:rounded-lg">
                        <div className="p-6 lg:p-8 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div>
                                    <h1 className="text-2xl font-medium text-gray-900 dark:text-gray-100">Borrowing Records</h1>
                                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                        Track tools and materials that have been borrowed
                                    </p>
                                </div>
                                <Link
                                    href={route('borrowings.create')}
                                    className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                >
                                    <PlusIcon className="w-4 h-4 mr-2" />
                                    Add Borrowing Record
                                </Link>
                            </div>

                            {/* Search and Filters */}
                            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search borrower or item..."
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 dark:focus:placeholder-gray-500 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 dark:text-gray-100"
                                        value={search}
                                        onChange={(e) => handleSearch(e.target.value)}
                                    />
                                </div>
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => handleStatusFilter(e.target.value)}
                                    className="block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:text-gray-100"
                                >
                                    {Object.entries(statusOptions).map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="bg-gray-200 bg-opacity-25 dark:bg-gray-900 dark:bg-opacity-50 grid grid-cols-1 gap-6 lg:gap-8 p-6 lg:p-8">
                            {borrowings.data.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="text-gray-400 dark:text-gray-500 mb-4">
                                        <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No borrowing records found</h3>
                                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                                        {search || selectedStatus ? 'Try adjusting your search or filters.' : 'Get started by creating your first borrowing record.'}
                                    </p>
                                    {!(search || selectedStatus) && (
                                        <Link
                                            href={route('borrowings.create')}
                                            className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700"
                                        >
                                            <PlusIcon className="w-4 h-4 mr-2" />
                                            Create First Record
                                        </Link>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {borrowings.data.map((borrowing, index) => (
                                        <div key={`borrowing-${index}`} className="bg-white dark:bg-gray-700 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 p-6">
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                            {borrowing.item_name}
                                                        </h3>
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(borrowing.status)}`}>
                                                            {borrowing.status}
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-300">
                                                        <div>
                                                            <span className="font-medium">Borrower:</span> {borrowing.borrower_name}
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">Item Borrowed.:</span> {borrowing.item_name}
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">Borrow Date:</span> {new Date(borrowing.borrow_date).toLocaleString()}
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">Expected Return:</span> {new Date(borrowing.expected_return_date).toLocaleString()}
                                                        </div>
                                                    </div>
                                                    {borrowing.description && (
                                                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{borrowing.description}</p>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        href={route('borrowings.show', borrowing.id)}
                                                        className="inline-flex items-center p-2 border border-gray-300 dark:border-gray-600 shadow-sm rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                        onMouseEnter={(e) => { const rect = e.currentTarget.getBoundingClientRect(); setTooltip({ show: true, text: 'View', x: rect.left + rect.width / 2, y: rect.top - 30 }); }}
                                                        onMouseLeave={() => setTooltip({ show: false, text: '', x: 0, y: 0 })}
                                                    >
                                                        <EyeIcon className="w-4 h-4" />
                                                    </Link>
                                                    <Link
                                                        href={route('borrowings.edit', borrowing.id)}
                                                        className="inline-flex items-center p-2 border border-gray-300 dark:border-gray-600 shadow-sm rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                        onMouseEnter={(e) => { const rect = e.currentTarget.getBoundingClientRect(); setTooltip({ show: true, text: 'Edit', x: rect.left + rect.width / 2, y: rect.top - 30 }); }}
                                                        onMouseLeave={() => setTooltip({ show: false, text: '', x: 0, y: 0 })}
                                                    >
                                                        <PencilIcon className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => deleteBorrowing(borrowing.id)}
                                                        className="inline-flex items-center p-2 border border-red-300 dark:border-red-600 shadow-sm rounded-md text-red-700 dark:text-red-400 bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                        onMouseEnter={(e) => { const rect = e.currentTarget.getBoundingClientRect(); setTooltip({ show: true, text: 'Delete', x: rect.left + rect.width / 2, y: rect.top - 30 }); }}
                                                        onMouseLeave={() => setTooltip({ show: false, text: '', x: 0, y: 0 })}
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Pagination */}
                            {borrowings.data.length > 0 && (
                                <div className="mt-6">
                                    {borrowings.links.map((link, index) => (
                                        link.url ? (
                                            <Link
                                                key={`${link.label}-${index}`}
                                                href={link.url}
                                                className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md mx-1 ${
                                                    link.active
                                                        ? 'bg-blue-600 text-white dark:bg-blue-700'
                                                        : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                                } border border-gray-300 dark:border-gray-600`}
                                                preserveScroll
                                                preserveState
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ) : (
                                            <span
                                                key={`${link.label}-${index}`}
                                                className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md mx-1 ${
                                                    'bg-white text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                                                } border border-gray-300 dark:border-gray-600`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        )
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Message */}
            {status && (
                <div className="fixed bottom-4 right-4 bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-200 px-4 py-3 rounded shadow-lg z-50">
                    <div className="flex">
                        <div className="py-1">
                            <svg className="fill-current h-6 w-6 text-green-500 dark:text-green-400 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z"/>
                            </svg>
                        </div>
                        <div>
                            <p className="font-bold dark:text-green-200">Success!</p>
                            <p className="text-sm dark:text-green-200">{typeof status === 'string' ? status : ''}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Tooltip */}
            {tooltip.show && (
                <div
                    className="fixed z-50 bg-gray-800 dark:bg-gray-900 text-white dark:text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none transform -translate-x-1/2"
                    style={{ left: tooltip.x, top: tooltip.y }}
                >
                    {tooltip.text}
                </div>
            )}
        </AuthenticatedLayout>
    );
}
