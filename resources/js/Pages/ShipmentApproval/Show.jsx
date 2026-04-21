import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function Show({ auth, shipmentApproval }) {
    return (
        <>
            <AuthenticatedLayout
                header={
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                            <Link
                                href={route('shipment-approvals.index')}
                                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                            >
                                <ArrowLeftIcon className="h-6 w-6" />
                            </Link>
                            <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                                Shipment Approval Details
                            </h2>
                        </div>
                    </div>
                }
            >
                <Head title={`Shipment Approval - ${shipmentApproval.sa_number || 'N/A'}`} />

                <div className="py-12">
                    <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Project Site Name */}
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Project Site Name</h3>
                                        <p className="mt-1 text-lg text-gray-900 dark:text-gray-100">{shipmentApproval.project_site_name}</p>
                                    </div>

                                    {/* SA Number */}
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">SA#</h3>
                                        <p className="mt-1 text-lg text-gray-900 dark:text-gray-100">{shipmentApproval.sa_number || 'N/A'}</p>
                                    </div>

                                    {/* Tools ID & Items */}
                                    <div className="md:col-span-2">
                                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Tools ID & Items</h3>
                                        <div className="mt-1 space-y-2">
                                            {shipmentApproval.tools_id && shipmentApproval.description ? (
                                                (() => {
                                                    const toolIds = shipmentApproval.tools_id.split(',').map(id => id.trim());
                                                    const items = shipmentApproval.description.split(',').map(item => item.trim());
                                                    const maxLength = Math.max(toolIds.length, items.length);
                                                    
                                                    return Array.from({ length: maxLength }, (_, index) => (
                                                        <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                            <span className="font-medium text-blue-600 dark:text-blue-400 min-w-[3rem] text-sm">
                                                                ID: {toolIds[index] || '-'}
                                                            </span>
                                                            <span className="text-gray-900 dark:text-gray-100 break-words leading-relaxed flex-1">
                                                                {items[index] || '-'}
                                                            </span>
                                                        </div>
                                                    ));
                                                })()
                                            ) : (
                                                <div className="text-gray-500 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                    No Tools ID or Description available
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Created By */}
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Created By</h3>
                                        <p className="mt-1 text-lg text-gray-900 dark:text-gray-100">
                                            {shipmentApproval.creator ? shipmentApproval.creator.name : 'Unknown'}
                                        </p>
                                    </div>

                                    {/* Created At */}
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Created At</h3>
                                        <p className="mt-1 text-lg text-gray-900 dark:text-gray-100">
                                            {new Date(shipmentApproval.created_at).toLocaleDateString()} at {new Date(shipmentApproval.created_at).toLocaleTimeString()}
                                        </p>
                                    </div>

                                    {/* Updated At */}
                                    <div>
                                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</h3>
                                        <p className="mt-1 text-lg text-gray-900 dark:text-gray-100">
                                            {new Date(shipmentApproval.updated_at).toLocaleDateString()} at {new Date(shipmentApproval.updated_at).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>

                                
                                {/* Pictures */}
                                {shipmentApproval.picture && Array.isArray(shipmentApproval.picture) && shipmentApproval.picture.length > 0 && (
                                    <div className="mt-6">
                                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">Pictures</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {shipmentApproval.picture.map((pic, idx) => (
                                                <div key={idx} className="relative group">
                                                    <a
                                                        href={`/storage/${pic}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="block"
                                                    >
                                                        <img
                                                            src={`/storage/${pic}`}
                                                            alt={`Shipment ${idx + 1}`}
                                                            className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700 group-hover:border-blue-500 transition-colors duration-200"
                                                        />
                                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                                                            <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-sm font-medium">
                                                                View Full Size
                                                            </span>
                                                        </div>
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="mt-8 flex justify-end space-x-3">
                                    <Link
                                        href={route('shipment-approvals.index')}
                                        className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
                                    >
                                        Back to List
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        </>
    );
}
