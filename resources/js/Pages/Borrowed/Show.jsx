// resources/js/Pages/Borrowed/Show.jsx
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PencilIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function Show({ auth, borrowing }) {
    const getStatusColor = (status) => {
        switch (status) {
            case 'borrowed': return 'bg-blue-100 text-blue-800';
            case 'returned': return 'bg-green-100 text-green-800';
            case 'overdue': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getActionColor = (action) => {
        switch (action) {
            case 'created': return 'bg-green-100 text-green-800';
            case 'updated': return 'bg-blue-100 text-blue-800';
            case 'deleted': return 'bg-red-100 text-red-800';
            case 'status_changed': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Borrowing Record Details
                    </h2>
                    <div className="flex space-x-3">
                        <Link
                            href={route('borrowings.edit', borrowing.id)}
                            className="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                        >
                            <PencilIcon className="h-4 w-4 mr-2" />
                            Edit Record
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
                            className="inline-flex items-center text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeftIcon className="h-4 w-4 mr-2" />
                            Back to Borrowing Records
                        </Link>
                    </div>

                    {/* Borrowing Details Card */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">{borrowing.item_name}</h3>
                                    <p className="text-gray-600 mt-1">Borrowing Record #{borrowing.id}</p>
                                </div>
                                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(borrowing.status)}`}>
                                    {borrowing.status.charAt(0).toUpperCase() + borrowing.status.slice(1)}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Borrower Information */}
                                <div>
                                    <h4 className="text-lg font-medium text-gray-900 mb-4">Borrower Information</h4>
                                    <dl className="space-y-2">
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Name</dt>
                                            <dd className="text-sm text-gray-900">{borrowing.borrower_name}</dd>
                                        </div>
                                        {borrowing.borrower_email && (
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Email</dt>
                                                <dd className="text-sm text-gray-900">{borrowing.borrower_email}</dd>
                                            </div>
                                        )}
                                        {borrowing.borrower_phone && (
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                                                <dd className="text-sm text-gray-900">{borrowing.borrower_phone}</dd>
                                            </div>
                                        )}
                                    </dl>
                                </div>

                                {/* Item Information */}
                                <div>
                                    <h4 className="text-lg font-medium text-gray-900 mb-4">Item Information</h4>
                                    <dl className="space-y-2">
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Item Name</dt>
                                            <dd className="text-sm text-gray-900">{borrowing.item_name}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Quantity</dt>
                                            <dd className="text-sm text-gray-900">{borrowing.quantity}</dd>
                                        </div>
                                        {borrowing.description && (
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Description</dt>
                                                <dd className="text-sm text-gray-900">{borrowing.description}</dd>
                                            </div>
                                        )}
                                    </dl>
                                </div>

                                {/* Dates Information */}
                                <div>
                                    <h4 className="text-lg font-medium text-gray-900 mb-4">Dates</h4>
                                    <dl className="space-y-2">
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Borrow Date</dt>
                                            <dd className="text-sm text-gray-900">{borrowing.borrow_date}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Expected Return Date</dt>
                                            <dd className="text-sm text-gray-900">{borrowing.expected_return_date}</dd>
                                        </div>
                                        {borrowing.actual_return_date && (
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500">Actual Return Date</dt>
                                                <dd className="text-sm text-gray-900">{borrowing.actual_return_date}</dd>
                                            </div>
                                        )}
                                    </dl>
                                </div>

                                {/* Project Information */}
                                {(borrowing.project_type || borrowing.project_name) && (
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 mb-4">Project Information</h4>
                                        <dl className="space-y-2">
                                            {borrowing.project_type && (
                                                <div>
                                                    <dt className="text-sm font-medium text-gray-500">Project Type</dt>
                                                    <dd className="text-sm text-gray-900">{borrowing.project_type}</dd>
                                                </div>
                                            )}
                                            {borrowing.project_name && (
                                                <div>
                                                    <dt className="text-sm font-medium text-gray-500">Project Name</dt>
                                                    <dd className="text-sm text-gray-900">{borrowing.project_name}</dd>
                                                </div>
                                            )}
                                        </dl>
                                    </div>
                                )}
                            </div>

                            {/* Notes */}
                            {borrowing.notes && (
                                <div className="mt-6">
                                    <h4 className="text-lg font-medium text-gray-900 mb-2">Notes</h4>
                                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">{borrowing.notes}</p>
                                </div>
                            )}

                            {/* Created By */}
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Created by: {borrowing.creator?.name || 'Unknown'}</span>
                                    <span>Created: {new Date(borrowing.created_at).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* History Section */}
                    {borrowing.histories && borrowing.histories.length > 0 && (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <h4 className="text-lg font-medium text-gray-900 mb-4">Activity History</h4>
                                <div className="space-y-4">
                                    {borrowing.histories.map((history) => (
                                        <div key={history.id} className="flex items-start space-x-3">
                                            <div className="flex-shrink-0">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(history.action)}`}>
                                                    {history.action.replace('_', ' ').toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm text-gray-900">{history.description}</p>
                                                <p className="text-xs text-gray-500">
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
        </AuthenticatedLayout>
    );
}
