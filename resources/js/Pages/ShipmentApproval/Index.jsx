import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState } from 'react';
import { PlusIcon, EyeIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function Index({ auth, shipmentApprovals, status }) {
    const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 });

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
                    <div className="flex justify-between items-center">
                        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                            Shipment Approval
                        </h2>
                        <Link
                            href={route('shipment-approvals.create')}
                            className="electric-btn-blue inline-flex items-center justify-center p-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition ease-in-out duration-150"
                            onMouseEnter={(e) => { const rect = e.currentTarget.getBoundingClientRect(); setTooltip({ show: true, text: 'Add Shipment Approval', x: rect.left + rect.width / 2, y: rect.bottom + 10 }); }}
                            onMouseLeave={() => setTooltip({ show: false, text: '', x: 0, y: 0 })}
                        >
                            <PlusIcon className="h-5 w-5" />
                        </Link>
                    </div>
                }
            >
                <Head title="Shipment Approval" />

                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6 text-gray-900 dark:text-gray-100">
                                {status && (
                                    <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                                        {status}
                                    </div>
                                )}

                                <div className="overflow-auto max-h-[65vh] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-gray-100 dark:[&::-webkit-scrollbar-track]:bg-gray-800 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-500 [&::-webkit-scrollbar-thumb]:rounded-full">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Project Site Name
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    SA#
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Tools ID
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Description
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Picture
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {shipmentApprovals.data.map((approval) => (
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
                                                        {/* Actions - Add back when routes are implemented */}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                <div className="mt-4">
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
            </AuthenticatedLayout>
        </>
    );
}
