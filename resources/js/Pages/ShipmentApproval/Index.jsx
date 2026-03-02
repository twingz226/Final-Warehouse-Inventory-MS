import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState } from 'react';
import axios from 'axios';
import { PlusIcon, EyeIcon, TrashIcon, PencilSquareIcon, PrinterIcon } from '@heroicons/react/24/outline';

export default function Index({ auth, shipmentApprovals, status }) {
    const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 });
    const [confirmingDeletion, setConfirmingDeletion] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    const deleteItem = (id) => {
        router.delete(route('shipment-approvals.destroy', id), {
            preserveScroll: true,
            onSuccess: () => setConfirmingDeletion(false),
        });
    };

    return (
        <>
            <style>{`
            @keyframes electric-flicker-blue {
                0%   { box-shadow: 0 0 4px 1px #60a5fa, 0 0 10px 2px #2563eb; opacity: 1; }
                10%  { box-shadow: 0 0 2px 1px #60a5fa, 0 0 6px 1px #2563eb;  opacity: 0.85; }
                20%  { box-shadow: 0 0 8px 3px #93c5fd, 0 0 18px 5px #2563eb; opacity: 1; }
                30%  { box-shadow: 0 0 3px 1px #60a5fa, 0 0 8px 2px #2563eb;  opacity: 0.9; }
                40%  { box-shadow: 0 0 10px 4px #bfdbfe, 0 0 22px 6px #2563eb;opacity: 1; }
                50%  { box-shadow: 0 0 2px 1px #60a5fa, 0 0 5px 1px #2563eb;  opacity: 0.8; }
                60%  { box-shadow: 0 0 9px 3px #93c5fd, 0 0 20px 5px #2563eb; opacity: 1; }
                70%  { box-shadow: 0 0 3px 1px #60a5fa, 0 0 7px 2px #2563eb;  opacity: 0.88; }
                80%  { box-shadow: 0 0 11px 4px #bfdbfe, 0 0 24px 7px #2563eb;opacity: 1; }
                90%  { box-shadow: 0 0 2px 1px #60a5fa, 0 0 6px 1px #2563eb;  opacity: 0.82; }
                100% { box-shadow: 0 0 4px 1px #60a5fa, 0 0 10px 2px #2563eb; opacity: 1; }
            }
            .electric-btn-blue:hover {
                animation: electric-flicker-blue 0.18s step-end infinite;
                outline: none;
            }
            `}</style>
            <AuthenticatedLayout
                header={
                    <div className="flex justify-between items-center print:hidden">
                        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                            Shipment Approval
                        </h2>
                    </div>
                }
            >
                <Head title="Shipment Approval" />

                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg print:hidden">
                            <div className="p-6 text-gray-900 dark:text-gray-100">
                                {status && (
                                    <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                                        {status}
                                    </div>
                                )}

                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-blue-600/70 dark:bg-blue-900/80">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                                    Project Site Name
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                                    SA#
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                                    Tools ID
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                                    Description
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                                    Picture
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {shipmentApprovals.data.map((approval) => {
                                                return (
                                                    <tr key={approval.id} className="odd:bg-white even:bg-gray-200 dark:odd:bg-gray-800 dark:even:bg-gray-700 hover:bg-blue-200 dark:hover:bg-gray-600 border-b border-gray-300 dark:border-gray-600 transition-colors duration-200">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                            {approval.project_site_name}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                            {approval.sa_number}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                            {approval.tools_id || '-'}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                                                            {approval.description || '-'}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                                                            {approval.picture && Array.isArray(approval.picture) && approval.picture.length > 0 ? (
                                                                <div className="flex flex-wrap gap-2">
                                                                    {approval.picture.map((pic, idx) => (
                                                                        <a key={idx} href={`/storage/${pic}`} target="_blank" rel="noopener noreferrer">
                                                                            <img
                                                                                src={`/storage/${pic}`}
                                                                                alt={`Shipment ${idx + 1}`}
                                                                                className="inline-block h-12 w-12 rounded-full border-2 border-white dark:border-gray-800 object-cover shadow-sm bg-gray-100 dark:bg-gray-700 hover:z-10 hover:ring-2 hover:ring-blue-500 transition-all cursor-pointer relative"
                                                                                title={`Image ${idx + 1}`}
                                                                            />
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                '-'
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                            <div className="flex space-x-2">
                                                                <Link
                                                                    href={route('shipment-approvals.edit', approval.id)}
                                                                    className="hidden text-yellow-600 dark:text-yellow-400 hover:text-yellow-900 dark:hover:text-yellow-300"
                                                                    onMouseEnter={(e) => { const rect = e.currentTarget.getBoundingClientRect(); setTooltip({ show: true, text: 'Edit', x: rect.left + rect.width / 2, y: rect.bottom + 10 }); }}
                                                                    onMouseLeave={() => setTooltip({ show: false, text: '', x: 0, y: 0 })}
                                                                >
                                                                    <PencilSquareIcon className="h-5 w-5" />
                                                                </Link>
                                                                <button
                                                                    onClick={() => {
                                                                        setItemToDelete(approval);
                                                                        setConfirmingDeletion(true);
                                                                    }}
                                                                    className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                                                                    onMouseEnter={(e) => { const rect = e.currentTarget.getBoundingClientRect(); setTooltip({ show: true, text: 'Delete', x: rect.left + rect.width / 2, y: rect.bottom + 10 }); }}
                                                                    onMouseLeave={() => setTooltip({ show: false, text: '', x: 0, y: 0 })}
                                                                >
                                                                    <TrashIcon className="h-5 w-5" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                <div className="mt-4 print:hidden">
                                    {shipmentApprovals.links && (
                                        <div className="flex justify-center">
                                            {shipmentApprovals.links.map((link, index) => {
                                                if (link.url === null) {
                                                    return (
                                                        <span
                                                            key={index}
                                                            className="px-3 py-2 mx-1 text-sm rounded bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                                        />
                                                    );
                                                }

                                                return (
                                                    <Link
                                                        key={index}
                                                        href={link.url}
                                                        className={`px-3 py-2 mx-1 text-sm rounded ${link.active
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                                            }`}
                                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                                    />
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tooltip */}
                {tooltip.show && (
                    <div
                        className="fixed z-50 bg-gray-800 dark:bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none transform -translate-x-1/2"
                        style={{ left: tooltip.x, top: tooltip.y }}
                    >
                        {tooltip.text}
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {confirmingDeletion && (
                    <div className="fixed inset-0 bg-gray-500 dark:bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                                Delete Shipment Approval
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Are you sure you want to delete this shipment approval? This action cannot be undone.
                            </p>
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => {
                                        setConfirmingDeletion(false);
                                        setItemToDelete(null);
                                    }}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => deleteItem(itemToDelete.id)}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </AuthenticatedLayout>
        </>
    );
}
