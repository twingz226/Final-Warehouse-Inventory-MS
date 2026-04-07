// resources/js/Pages/Purchases/Show.jsx
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PencilIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function Show({ auth, purchase, groupItems }) {
    const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 });

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
        <>
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
                                className="electric-btn-gray inline-flex items-center justify-center p-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                onMouseEnter={(e) => { const rect = e.currentTarget.getBoundingClientRect(); setTooltip({ show: true, text: 'Edit Distribution', x: rect.left + rect.width / 2, y: rect.bottom + 10 }); }}
                                onMouseLeave={() => setTooltip({ show: false, text: '', x: 0, y: 0 })}
                            >
                                <PencilIcon className="h-5 w-5" />
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

                                {/* Overall Wrap */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                                    {/* Left Column: Key Project & Destination Details */}
                                    <div className="lg:col-span-2 space-y-6">
                                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5 border border-gray-100 dark:border-gray-600">
                                            <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4 border-b border-gray-200 dark:border-gray-600 pb-2">Project & Destination Details</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name of Project</dt>
                                                    <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">{purchase.supplier_name}</dd>
                                                </div>
                                                {purchase.project_type && (
                                                    <div>
                                                        <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type of Project</dt>
                                                        <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">{purchase.project_type}</dd>
                                                    </div>
                                                )}
                                                {purchase.os && (
                                                    <div>
                                                        <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">O.S</dt>
                                                        <dd className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100">{purchase.os}</dd>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Additional Notes */}
                                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5 border border-gray-100 dark:border-gray-600 mt-6 lg:mt-0">
                                            <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3 border-b border-gray-200 dark:border-gray-600 pb-2">Additional Notes</h4>
                                            {purchase.notes ? (
                                                <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{purchase.notes}</p>
                                            ) : (
                                                <p className="text-sm text-gray-400 dark:text-gray-500 italic">No notes or special instructions provided.</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right Column: Distribution Meta */}
                                    <div className="space-y-6">
                                        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-5 border border-indigo-100 dark:border-indigo-800/30">
                                            <h4 className="text-base font-semibold text-indigo-900 dark:text-indigo-200 mb-4 border-b border-indigo-200 dark:border-indigo-800 pb-2">Distribution Status</h4>
                                            <div className="space-y-4">
                                                <div>
                                                    <dt className="text-xs font-medium text-indigo-500/80 dark:text-indigo-400 uppercase tracking-wider">Distribution Date</dt>
                                                    <dd className="mt-1 text-sm font-semibold text-indigo-900 dark:text-indigo-100">{new Date(purchase.purchase_date).toLocaleDateString()}</dd>
                                                </div>
                                                {purchase.issued_by && (
                                                    <div>
                                                        <dt className="text-xs font-medium text-indigo-500/80 dark:text-indigo-400 uppercase tracking-wider">Issued By:</dt>
                                                        <dd className="mt-1 text-sm font-semibold text-indigo-900 dark:text-indigo-100">{purchase.issued_by}</dd>
                                                    </div>
                                                )}
                                                {purchase.issued_to && (
                                                    <div>
                                                        <dt className="text-xs font-medium text-indigo-500/80 dark:text-indigo-400 uppercase tracking-wider">Issued To:</dt>
                                                        <dd className="mt-1 text-sm font-semibold text-indigo-900 dark:text-indigo-100">{purchase.issued_to}</dd>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5 border border-gray-100 dark:border-gray-600">
                                            <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4 border-b border-gray-200 dark:border-gray-600 pb-2">System Record</h4>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-500 dark:text-gray-400">Created By:</span>
                                                    <span className="font-medium text-gray-900 dark:text-gray-100">{purchase.creator?.name || 'Unknown'}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-500 dark:text-gray-400">Time:</span>
                                                    <span className="font-medium text-gray-900 dark:text-gray-100">{new Date(purchase.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </div>
                                        </div>
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
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.quantity} {item.item_unit === 'Quantity' ? 'pcs' : (item.item_unit ? item.item_unit.toLowerCase() : '')}</td>
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
