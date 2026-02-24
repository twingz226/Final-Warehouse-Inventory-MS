// resources/js/Pages/Purchases/Show.jsx
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PencilIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function Show({ auth, purchase, groupItems }) {
    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'ordered': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'received': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
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
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-100 leading-tight">
                        Distribution Order Details
                    </h2>
                    <div className="flex space-x-3">
                        <Link
                            href={route('purchases.edit', purchase.id)}
                            className="inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                        >
                            <PencilIcon className="h-4 w-4 mr-2" />
                            Edit Distribution
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Distribution Order Details" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    {/* Back Button */}
                    <div className="mb-6">
                        <Link
                            href={route('purchases.index')}
                            className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                        >
                            <ArrowLeftIcon className="h-4 w-4 mr-2" />
                            Back to Distribution Orders
                        </Link>
                    </div>

                    {/* Purchase Details Card */}
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{purchase.supplier_name}</h3>
                                    <p className="text-gray-600 dark:text-gray-300 mt-1">Distribution Date: {new Date(purchase.purchase_date).toLocaleDateString()}</p>
                                </div>
                                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(purchase.status)}`}>
                                    {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Destination Information */}
                                <div>
                                    <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Destination Information</h4>
                                    <dl className="space-y-2">
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</dt>
                                            <dd className="text-sm text-gray-900 dark:text-gray-100">{purchase.supplier_name}</dd>
                                        </div>

                                        {purchase.supplier_phone && (
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</dt>
                                                <dd className="text-sm text-gray-900 dark:text-gray-100">{purchase.supplier_phone}</dd>
                                            </div>
                                        )}
                                    </dl>
                                </div>



                                {/* Project Information */}
                                {(purchase.project_name || purchase.project_type || purchase.os) && (
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Project Information</h4>
                                        <dl className="space-y-2">
                                            {purchase.project_name && (
                                                <div>
                                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Name of the Project</dt>
                                                    <dd className="text-sm text-gray-900 dark:text-gray-100">{purchase.project_name}</dd>
                                                </div>
                                            )}
                                            {purchase.project_type && (
                                                <div>
                                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Type of the Project</dt>
                                                    <dd className="text-sm text-gray-900 dark:text-gray-100">{purchase.project_type}</dd>
                                                </div>
                                            )}
                                            {purchase.os && (
                                                <div>
                                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">O.S</dt>
                                                    <dd className="text-sm text-gray-900 dark:text-gray-100">{purchase.os}</dd>
                                                </div>
                                            )}
                                        </dl>
                                    </div>
                                )}

                                {/* Distribution Details */}
                                <div>
                                    <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Distribution Details</h4>
                                    <dl className="space-y-2">
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Distribution Date</dt>
                                            <dd className="text-sm text-gray-900 dark:text-gray-100">{new Date(purchase.purchase_date).toLocaleDateString()}</dd>
                                        </div>
                                        {purchase.issued_by && (
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Issued By</dt>
                                                <dd className="text-sm text-gray-900 dark:text-gray-100">{purchase.issued_by}</dd>
                                            </div>
                                        )}
                                        {purchase.issued_to && (
                                            <div>
                                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Issued To</dt>
                                                <dd className="text-sm text-gray-900 dark:text-gray-100">{purchase.issued_to}</dd>
                                            </div>
                                        )}
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
                                            <dd className="text-sm text-gray-900 dark:text-gray-100">{purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created By</dt>
                                            <dd className="text-sm text-gray-900 dark:text-gray-100">{purchase.creator?.name || 'Unknown'}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Created At</dt>
                                            <dd className="text-sm text-gray-900 dark:text-gray-100">{new Date(purchase.created_at).toLocaleString()}</dd>
                                        </div>
                                    </dl>
                                </div>

                                {/* Notes */}
                                <div>
                                    <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Additional Notes</h4>
                                    {purchase.notes ? (
                                        <p className="text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 p-3 rounded-md">{purchase.notes}</p>
                                    ) : (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 italic">No notes provided</p>
                                    )}
                                </div>
                            </div>

                            {/* Items Included */}
                            <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Items Included</h4>
                                <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Item Name</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quantity</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {(groupItems || [purchase]).map((item, index) => (
                                                <tr key={item.id || index}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{item.item_name}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{item.description || '-'}</td>
                                                    <td className="px-6 py-4 align-top">
                                                        <div className="space-y-1">
                                                            <div>
                                                                {item.item_category ? (
                                                                    <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${item.item_category === 'material' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                                                                        item.item_category === 'tool' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                                                                            'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200'
                                                                        }`}>
                                                                        {item.item_category}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-xs text-gray-400 dark:text-gray-500">N/A</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.quantity}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* History Section */}
                    {purchase.histories && purchase.histories.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Activity History</h3>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    {purchase.histories.map((history) => (
                                        <div key={history.id} className="flex items-start space-x-3">
                                            <div className="flex-shrink-0">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionColor(history.action)}`}>
                                                    {history.action.replace('_', ' ').charAt(0).toUpperCase() + history.action.replace('_', ' ').slice(1)}
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm text-gray-900 dark:text-gray-100">
                                                    <span className="font-medium">{history.user?.name || 'Unknown user'}</span>
                                                    {history.description && (
                                                        <span className="ml-2">{history.description}</span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    {new Date(history.created_at).toLocaleString()}
                                                </div>
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
