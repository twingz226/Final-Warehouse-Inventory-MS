import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState } from 'react';
import { PlusIcon, EyeIcon, TrashIcon, PrinterIcon } from '@heroicons/react/24/outline';

export default function Index({ auth, purchases, status }) {
    const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 });
    const deletePurchase = (id) => {
        router.delete(route('purchases.destroy', id));
    };

    const handlePrint = (purchase) => {
        // Create a new window for printing
        const printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
        
        if (!printWindow) {
            alert('Please allow popups to print the withdrawal slip');
            return;
        }
        
        // Generate detailed print content
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Withdrawal Slip #${purchase.id}</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        padding: 20px;
                        max-width: 800px;
                        margin: 0 auto;
                    }
                    .withdrawal-slip { 
                        font-family: Arial, sans-serif; 
                        padding: 20px; 
                        max-width: 800px; 
                        margin: 0 auto; 
                    }
                    .company-header { 
                        text-align: center; 
                        margin-bottom: 30px; 
                        border-bottom: 2px solid #333; 
                        padding-bottom: 15px; 
                    }
                    .company-name { 
                        font-size: 20px; 
                        font-weight: bold; 
                        margin: 0; 
                    }
                    .company-address { 
                        font-size: 12px; 
                        margin: 5px 0 0 0; 
                        color: #666; 
                    }
                    .slip-title { 
                        font-size: 24px; 
                        font-weight: bold; 
                        margin: 15px 0 0 0; 
                        text-transform: uppercase; 
                    }
                    .info-section { 
                        margin-bottom: 25px; 
                        display: flex; 
                        flex-wrap: wrap; 
                        gap: 20px; 
                    }
                    .info-field { 
                        flex: 1; 
                        min-width: 200px; 
                    }
                    .field-label { 
                        font-weight: bold; 
                        font-size: 12px; 
                        margin-bottom: 3px; 
                    }
                    .field-value { 
                        border-bottom: 1px solid #333; 
                        padding: 2px 0; 
                        font-size: 12px; 
                        min-height: 18px; 
                    }
                    .category-section { 
                        margin: 20px 0; 
                    }
                    .category-title { 
                        font-weight: bold; 
                        font-size: 12px; 
                        margin-bottom: 10px; 
                    }
                    .category-options { 
                        display: flex; 
                        gap: 30px; 
                    }
                    .category-option { 
                        display: flex; 
                        align-items: center; 
                        gap: 5px; 
                        font-size: 12px; 
                    }
                    .checkbox { 
                        width: 12px; 
                        height: 12px; 
                        border: 1px solid #333; 
                    }
                    .items-table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        margin: 20px 0; 
                    }
                    .items-table th { 
                        border: 1px solid #333; 
                        padding: 8px; 
                        text-align: center; 
                        font-weight: bold; 
                        font-size: 12px; 
                        background: #f5f5f5; 
                    }
                    .items-table td { 
                        border: 1px solid #333; 
                        padding: 8px; 
                        font-size: 12px; 
                    }
                    .qty-col { 
                        width: 80px; 
                        text-align: center; 
                    }
                    .description-col { 
                        text-align: left; 
                    }
                    .purpose-section { 
                        margin: 25px 0; 
                    }
                    .purpose-label { 
                        font-weight: bold; 
                        font-size: 12px; 
                        margin-bottom: 5px; 
                    }
                    .purpose-field { 
                        border: 1px solid #333; 
                        padding: 8px; 
                        min-height: 40px; 
                        font-size: 12px; 
                    }
                    .signature-section { 
                        margin-top: 40px; 
                        display: flex; 
                        justify-content: space-between; 
                    }
                    .signature-field { 
                        text-align: center; 
                        width: 200px; 
                    }
                    .signature-label { 
                        font-size: 11px; 
                        margin-bottom: 30px; 
                    }
                    .signature-line { 
                        border-bottom: 1px solid #333; 
                        height: 20px; 
                    }
                    @media print {
                        body { margin: 0; padding: 10px; }
                    }
                </style>
            </head>
            <body>
                <div class="withdrawal-slip">
                    <!-- Company Header -->
                    <div class="company-header">
                        <div class="company-name">Warlen Industrial Sales Corporation</div>
                        <div class="company-address">Deka Sales Bldg., Lacson Ext., Alijis Rd., Bacolod City</div>
                        <div class="slip-title">Withdrawal Slip</div>
                    </div>
                    
                    <!-- Information Fields -->
                    <div class="info-section">
                        <div class="info-field">
                            <div class="field-label">No.</div>
                            <div class="field-value">${purchase.id}</div>
                        </div>
                        <div class="info-field">
                            <div class="field-label">Name of Project</div>
                            <div class="field-value">${purchase.project_name || ''}</div>
                        </div>
                        <div class="info-field">
                            <div class="field-label">Date</div>
                            <div class="field-value">${new Date(purchase.purchase_date).toLocaleDateString()}</div>
                        </div>
                        <div class="info-field">
                            <div class="field-label">Type of Project</div>
                            <div class="field-value">${purchase.project_type || ''}</div>
                        </div>
                    </div>
                    
                    <!-- Category Selection -->
                    <div class="category-section">
                        <div class="category-title">Type of Items:</div>
                        <div class="category-options">
                            <div class="category-option">
                                <div class="checkbox">${purchase.item_category === 'material' ? '✓' : ''}</div>
                                <span>Construction Materials</span>
                            </div>
                            <div class="category-option">
                                <div class="checkbox">${purchase.item_category === 'tool' ? '✓' : ''}</div>
                                <span>Spare Parts</span>
                            </div>
                            <div class="category-option">
                                <div class="checkbox">${!purchase.item_category || (purchase.item_category !== 'material' && purchase.item_category !== 'tool') ? '✓' : ''}</div>
                                <span>Others</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Items Table -->
                    <table class="items-table">
                        <thead>
                            <tr>
                                <th class="qty-col">Qty</th>
                                <th class="description-col">Item Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="qty-col">${purchase.quantity}</td>
                                <td class="description-col">${purchase.item_name}${purchase.description ? ' - ' + purchase.description : ''}</td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <!-- Purpose Section -->
                    <div class="purpose-section">
                        <div class="purpose-label">Purpose:</div>
                        <div class="purpose-field">${purchase.notes || 'For distribution to ' + purchase.supplier_name}</div>
                    </div>
                    
                    <!-- Signature Section -->
                    <div class="signature-section">
                        <div class="signature-field">
                            <div class="signature-label">Issued By:</div>
                            <div class="signature-line"></div>
                        </div>
                        <div class="signature-field">
                            <div class="signature-label">Issued To:</div>
                            <div class="signature-line"></div>
                        </div>
                        <div class="signature-field">
                            <div class="signature-label">Noted By:</div>
                            <div class="signature-line"></div>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;
        
        // Write content to the new window
        printWindow.document.write(printContent);
        printWindow.document.close();
        
        // Wait for content to load, then print
        printWindow.onload = function() {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        };
        
        // Fallback for browsers that don't support onload properly
        setTimeout(() => {
            if (printWindow && !printWindow.closed) {
                printWindow.focus();
                printWindow.print();
                printWindow.close();
            }
        }, 500);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Distribution Management
                    </h2>
                    <Link
                        href={route('purchases.create')}
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700"
                    >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add New Distribution
                    </Link>
                </div>
            }
        >
            <Head title="Distribution Management" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {status && (
                        <div className="mb-4 p-4 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded">
                            {status}
                        </div>
                    )}
                    
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Destination
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Item
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Quantity
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {purchases.data.length > 0 ? (
                                        purchases.data.map((purchase) => (
                                        <tr key={purchase.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {purchase.supplier_name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {purchase.item_name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {purchase.item_category ? (
                                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 capitalize">
                                                        {purchase.item_category}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-gray-400 dark:text-gray-500">N/A</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {purchase.quantity}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handlePrint(purchase)}
                                                        className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                                                        onMouseEnter={(e) => { const rect = e.currentTarget.getBoundingClientRect(); setTooltip({ show: true, text: 'Print Purchase Details', x: rect.left + rect.width / 2, y: rect.top - 30 }); }}
                                                        onMouseLeave={() => setTooltip({ show: false, text: '', x: 0, y: 0 })}
                                                    >
                                                        <PrinterIcon className="h-5 w-5" />
                                                    </button>
                                                    <Link
                                                        href={route('purchases.show', purchase.id)}
                                                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                                                        onMouseEnter={(e) => { const rect = e.currentTarget.getBoundingClientRect(); setTooltip({ show: true, text: 'View Purchase', x: rect.left + rect.width / 2, y: rect.top - 30 }); }}
                                                        onMouseLeave={() => setTooltip({ show: false, text: '', x: 0, y: 0 })}
                                                    >
                                                        <EyeIcon className="h-5 w-5" />
                                                    </Link>
                                                    <button
                                                        onClick={() => deletePurchase(purchase.id)}
                                                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                                                        onMouseEnter={(e) => { const rect = e.currentTarget.getBoundingClientRect(); setTooltip({ show: true, text: 'Delete Purchase', x: rect.left + rect.width / 2, y: rect.top - 30 }); }}
                                                        onMouseLeave={() => setTooltip({ show: false, text: '', x: 0, y: 0 })}
                                                    >
                                                        <TrashIcon className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center">
                                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                                    No distributions found
                                                </p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
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
    );
}
