// resources/js/Pages/Borrowed/Show.jsx
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PencilIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function Show({ auth, borrowing }) {
    const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 });

    const getStatusColor = (status) => {
        switch (status) {
            case 'borrowed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'returned': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    const getActionColor = (action) => {
        switch (action) {
            case 'created': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'updated': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'deleted': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'status_changed': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    return (
        <>
            <AuthenticatedLayout
                header={
                    <div className="flex justify-between items-center">
                        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-100 leading-tight">
                            Borrowing Record Details
                        </h2>
                        <div className="flex space-x-3">
                            <Link
                                href={route('borrowings.edit', borrowing.id)}
                                className="electric-btn-gray inline-flex items-center justify-center p-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                onMouseEnter={(e) => { const rect = e.currentTarget.getBoundingClientRect(); setTooltip({ show: true, text: 'Edit Record', x: rect.left + rect.width / 2, y: rect.bottom + 10 }); }}
                                onMouseLeave={() => setTooltip({ show: false, text: '', x: 0, y: 0 })}
                            >
                                <PencilIcon className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>
                }
            >
                <Head title="Borrowing Record Details" />

                <div className="py-12">
                    <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                        {/* Back Button */}
                        <div className="mb-6">
                            <Link
                                href={route('borrowings.index')}
                                className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                            >
                                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                                Back to Borrowing Records
                            </Link>
                        </div>

                        {/* Borrowing Details Card */}
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg mb-6">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{borrowing.item_name}</h3>
                                        <p className="text-gray-600 dark:text-gray-300 mt-1">Borrowing Record #{borrowing.id}</p>
                                    </div>
                                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(borrowing.status)}`}>
                                        {borrowing.status.charAt(0).toUpperCase() + borrowing.status.slice(1)}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Borrower Information */}
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Borrower Information</h4>
                                        <dl className="space-y-2">
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</dt>
                                                <dd className="text-sm text-gray-900 dark:text-gray-100">{borrowing.borrower_name}</dd>
                                            </div>

                                        </dl>
                                    </div>

                                    {/* Item Information */}
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Item Information</h4>
                                        <dl className="space-y-2">
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Item Name</dt>
                                                <dd className="text-sm text-gray-900 dark:text-gray-100">{borrowing.item_name}</dd>
                                            </div>
                                            {borrowing.tool_id && (
                                                <div>
                                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Tool ID</dt>
                                                    <dd className="text-sm text-gray-900 dark:text-gray-100">{borrowing.tool_id}</dd>
                                                </div>
                                            )}
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Quantity</dt>
                                                <dd className="text-sm text-gray-900 dark:text-gray-100">{borrowing.quantity}</dd>
                                            </div>

                                        </dl>
                                    </div>

                                    {/* Dates Information */}
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Dates</h4>
                                        <dl className="space-y-2">
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Borrow Date</dt>
                                                <dd className="text-sm text-gray-900 dark:text-gray-100">{new Date(borrowing.borrow_date).toLocaleString()}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Expected Return Date</dt>
                                                <dd className="text-sm text-gray-900 dark:text-gray-100">{new Date(borrowing.expected_return_date).toLocaleString()}</dd>
                                            </div>
                                            {borrowing.actual_return_date && (
                                                <div>
                                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Actual Return Date</dt>
                                                    <dd className="text-sm text-gray-900 dark:text-gray-100">{new Date(borrowing.actual_return_date).toLocaleString()}</dd>
                                                </div>
                                            )}
                                        </dl>
                                    </div>

                                </div>

                                {/* Created By */}
                                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                                        <span>Created by: {borrowing.creator?.name || 'Unknown'}</span>
                                        <span>Created: {new Date(borrowing.created_at).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* History Section */}
                        {borrowing.histories && borrowing.histories.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-6">
                                    <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Activity History</h4>
                                    <div className="space-y-4">
                                        {borrowing.histories.map((history) => (
                                            <div key={history.id} className="flex items-start space-x-3">
                                                <div className="flex-shrink-0">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(history.action)}`}>
                                                        {history.action.replace('_', ' ').toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm text-gray-900 dark:text-gray-100">{history.description}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {history.user?.name || 'Unknown user'} • {new Date(history.created_at).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Custom Tooltip */}
                {tooltip.show && (
                    <div
                        className="fixed z-50 bg-gray-800 dark:bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none transform -translate-x-1/2"
                        style={{ left: tooltip.x, top: tooltip.y }}
                    >
                        {tooltip.text}
                    </div>
                )}
            </AuthenticatedLayout>
        </>
    );
}
