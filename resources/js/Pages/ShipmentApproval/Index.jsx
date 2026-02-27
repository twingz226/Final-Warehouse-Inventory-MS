import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState } from 'react';
import axios from 'axios';
import { PlusIcon, EyeIcon, TrashIcon, PencilSquareIcon, PrinterIcon } from '@heroicons/react/24/outline';

export default function Index({ auth, shipmentApprovals, status }) {
    const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 });
    const [confirmingDeletion, setConfirmingDeletion] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [printProjectName, setPrintProjectName] = useState(null);
    const [printProjectItems, setPrintProjectItems] = useState([]);

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
                        <div className="flex space-x-2">
                            <Link
                                href={route('shipment-approvals.create')}
                                className="electric-btn-blue inline-flex items-center justify-center p-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition ease-in-out duration-150"
                                onMouseEnter={(e) => { const rect = e.currentTarget.getBoundingClientRect(); setTooltip({ show: true, text: 'Add Shipment Approval', x: rect.left + rect.width / 2, y: rect.bottom + 10 }); }}
                                onMouseLeave={() => setTooltip({ show: false, text: '', x: 0, y: 0 })}
                            >
                                <PlusIcon className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>
                }
            >
                <Head title="Shipment Approval" />

                <div className="py-12">
                    <style>
                        {`
                        @media print {
                            @page { 
                                margin: 20mm;
                            }
                            body {
                                -webkit-print-color-adjust: exact !important;
                                print-color-adjust: exact !important;
                            }
                        }
                        `}
                    </style>
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        {/* Printable Layout (Only visible when printing) */}
                        {printProjectName && (
                            <div className="hidden print:block w-full bg-white text-black font-sans leading-relaxed">
                                {/* Header Section */}
                                <div className="text-center mb-6">
                                    <div className="flex justify-center items-center mb-2">
                                        <h1 className="text-2xl font-bold uppercase tracking-wide text-blue-900" style={{ color: '#1e3a8a' }}>
                                            WARLEN INDUSTRIAL SALES CORPORATION
                                        </h1>
                                    </div>
                                    <h2 className="text-sm font-semibold uppercase tracking-widest text-red-600 mb-1" style={{ color: '#dc2626' }}>
                                        General Engineering and Specialty Contractor
                                    </h2>
                                    <p className="text-xs">
                                        Tel. 432-3497 / 435-1573<br />
                                        Blk. 2 Lot 20, Greenplains Subd., Alijis Road, Bacolod City
                                    </p>
                                </div>

                                <h3 className="text-xl text-center font-bold mb-6">
                                    Shipment Approval and Confirmation of Materials
                                </h3>

                                <p className="text-sm indent-8 mb-6 text-justify">
                                    This letter serves as formal confirmation of the approved list of materials for the upcoming shipment.
                                    Please be advised that only the items listed below have been authorized for inclusion in this shipment and no
                                    other additional materials to be added in the cargo:
                                </p>

                                {/* Print Table */}
                                <table className="w-full border-collapse border border-black text-sm mb-2">
                                    <thead>
                                        <tr>
                                            <th className="border border-black px-2 py-1 text-left font-bold" colSpan={4}>
                                                Project Site Name: {printProjectName}
                                            </th>
                                            <th className="border border-black px-2 py-1 text-left font-bold" colSpan={2}>
                                                SA#: {shipmentApprovals.data.find(a => a.project_site_name === printProjectName)?.sa_number || ''}<br />
                                                Date: {new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }).replace(/\//g, '-')}
                                            </th>
                                        </tr>
                                        <tr className="bg-gray-100">
                                            <th className="border border-black px-2 py-2 text-center w-16">QTY</th>
                                            <th className="border border-black px-2 py-2 text-center w-16">UNIT</th>
                                            <th className="border border-black px-2 py-2 text-center w-24">TOOLS ID</th>
                                            <th className="border border-black px-2 py-2 text-center uppercase" colSpan={2}>Description</th>
                                            <th className="border border-black px-2 py-2 text-center w-32 uppercase">Picture</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {printProjectName && (() => {
                                            const activeApproval = shipmentApprovals.data.find(a => a.project_site_name === printProjectName);

                                            if (printProjectItems.length > 0) {
                                                return printProjectItems.map((item, index) => (
                                                    <tr key={index}>
                                                        <td className="border border-black px-2 py-4 text-center">{item.quantity || 1}</td>
                                                        <td className="border border-black px-2 py-4 text-center uppercase">{item.unit === 'Quantity' ? 'PC' : (item.unit || 'PC')}</td>
                                                        <td className="border border-black px-2 py-4 text-center"></td>
                                                        <td className="border border-black px-4 py-4 uppercase font-semibold text-center" colSpan={2}>
                                                            {item.item_name || 'UNKNOWN ITEM'}
                                                        </td>
                                                        <td className="border border-black px-2 py-2 text-center">
                                                            {/* Only display the picture to the very first row to match layout visually to avoid spamming the same picture */}
                                                            {index === 0 && activeApproval?.picture && Array.isArray(activeApproval.picture) && activeApproval.picture.length > 0 ? (
                                                                <div className="flex justify-center items-center">
                                                                    <img
                                                                        src={`/storage/${activeApproval.picture[0]}`}
                                                                        alt="Shipment"
                                                                        className="max-h-16 max-w-[100px] object-contain"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                ''
                                                            )}
                                                        </td>
                                                    </tr>
                                                ));
                                            } else if (activeApproval) {
                                                return (
                                                    <tr>
                                                        <td className="border border-black px-2 py-4 text-center">1</td>
                                                        <td className="border border-black px-2 py-4 text-center">PC</td>
                                                        <td className="border border-black px-2 py-4 text-center"></td>
                                                        <td className="border border-black px-4 py-4 uppercase font-semibold text-center" colSpan={2}>
                                                            {activeApproval.description || 'NOTHING TO FOLLOW'}
                                                        </td>
                                                        <td className="border border-black px-2 py-2 text-center">
                                                            {activeApproval.picture && Array.isArray(activeApproval.picture) && activeApproval.picture.length > 0 ? (
                                                                <div className="flex justify-center items-center">
                                                                    <img
                                                                        src={`/storage/${activeApproval.picture[0]}`}
                                                                        alt="Shipment"
                                                                        className="max-h-16 max-w-[100px] object-contain"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                ''
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            }
                                        })()}
                                        <tr>
                                            <td className="border border-black px-2 py-1 text-center font-bold text-xs" colSpan={6}>
                                                ********************************NOTHING TO FOLLOW********************************
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                                {/* Footer Section */}
                                <p className="text-sm indent-8 mb-12 text-justify">
                                    We kindly request and require that no additional materials or items be included in this shipment beyond
                                    those listed above. This measure ensures proper documentation, compliance with agreed terms, and smooth
                                    processing at the receiving end.
                                </p>

                                <div className="text-right font-bold text-sm mb-16 mr-8">
                                    Thank you for your cooperation.
                                </div>

                                <div className="flex justify-between items-end mt-12 px-8">
                                    <div className="text-center">
                                        <div className="border-b border-black w-48 mb-1"></div>
                                        <p className="font-bold text-sm">PURCHASING</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="border-b border-black w-48 mb-1"></div>
                                        <p className="text-xs">WISC Electrical Engineer</p>
                                        <p className="font-bold text-sm">CARRIED BY</p>
                                    </div>
                                </div>

                                <div className="flex justify-between items-end mt-20 px-8">
                                    <div className="text-center">
                                        <div className="border-b border-black w-48 mb-1"></div>
                                        <p className="font-bold text-sm">LOGISTIC</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="border-b border-black w-48 mb-1"></div>
                                        <p className="font-bold text-sm">RECEIVED BY</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg print:hidden">
                            <div className="p-6 text-gray-900 dark:text-gray-100">
                                {status && (
                                    <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                                        {status}
                                    </div>
                                )}

                                <div className="overflow-auto max-h-[65vh] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-gray-100 dark:[&::-webkit-scrollbar-track]:bg-gray-800 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-500 [&::-webkit-scrollbar-thumb]:rounded-full">
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
                                                                <button
                                                                    onClick={() => {
                                                                        setPrintProjectName(approval.project_site_name);

                                                                        // Fetch exact items configured for this shipment approval
                                                                        axios.get(route('shipment-approvals.project-data', approval.project_site_name))
                                                                            .then(res => {
                                                                                if (Array.isArray(res.data)) {
                                                                                    setPrintProjectItems(res.data);
                                                                                } else {
                                                                                    setPrintProjectItems([]);
                                                                                }
                                                                                setTimeout(() => {
                                                                                    window.print();
                                                                                    setPrintProjectName(null);
                                                                                    setPrintProjectItems([]);
                                                                                }, 300);
                                                                            })
                                                                            .catch(err => {
                                                                                console.error('Error fetching project print data:', err);
                                                                                setPrintProjectItems([]);
                                                                                setTimeout(() => {
                                                                                    window.print();
                                                                                    setPrintProjectName(null);
                                                                                }, 300);
                                                                            });
                                                                    }}
                                                                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                                                                    onMouseEnter={(e) => { const rect = e.currentTarget.getBoundingClientRect(); setTooltip({ show: true, text: 'Print', x: rect.left + rect.width / 2, y: rect.bottom + 10 }); }}
                                                                    onMouseLeave={() => setTooltip({ show: false, text: '', x: 0, y: 0 })}
                                                                >
                                                                    <PrinterIcon className="h-5 w-5" />
                                                                </button>
                                                                <Link
                                                                    href={route('shipment-approvals.edit', approval.id)}
                                                                    className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-900 dark:hover:text-yellow-300"
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
