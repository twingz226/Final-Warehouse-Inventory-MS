import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState, useEffect } from 'react';
import { PlusIcon, EyeIcon, TrashIcon, PrinterIcon } from '@heroicons/react/24/outline';

export default function Index({ auth, purchases, status }) {
    const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 });
    const [dateFilter, setDateFilter] = useState('');
    const [printProjectName, setPrintProjectName] = useState(null);
    const [printProjectItems, setPrintProjectItems] = useState([]);
    const [openDropdown, setOpenDropdown] = useState(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (openDropdown && !event.target.closest('.print-dropdown-container')) {
                setOpenDropdown(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [openDropdown]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('date')) {
            setDateFilter(params.get('date'));
        }
    }, []);

    const handleDateChange = (e) => {
        const newDate = e.target.value;
        setDateFilter(newDate);

        const params = new URLSearchParams(window.location.search);
        if (newDate) {
            params.set('date', newDate);
        } else {
            params.delete('date');
        }
        params.delete('page');

        const queryStr = params.toString();
        router.visit(route('purchases.index') + (queryStr ? `?${queryStr}` : ''), {
            preserveState: true,
            preserveScroll: true,
        });
    };

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
                        padding: 10px; 
                        max-width: 800px; 
                        margin: 0 auto; 
                    }
                    .company-header { 
                        text-align: center; 
                        margin-bottom: 15px; 
                        border-bottom: 2px solid #333; 
                        padding-bottom: 10px; 
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
                        font-size: 16px; 
                        font-weight: bold; 
                        margin: 10px 0 0 0; 
                        text-transform: uppercase; 
                    }
                    .info-section { 
                        margin-bottom: 15px; 
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
                        margin: 10px 0; 
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
                        margin: 10px 0; 
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
                        margin: 15px 0; 
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
                        margin-top: 20px; 
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
                        <img src="/images/warlen.png" alt="Warlen Logo" style="max-width: 80px; height: auto; display: block; margin: 0 auto 5px;" />
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
                            ${(purchase._groupItems || [{ item_name: purchase.item_name, quantity: purchase.quantity, description: purchase.description }])
                .map(item => `
                                <tr>
                                    <td class="qty-col">${item.quantity}</td>
                                    <td class="description-col">${item.item_name}${item.description ? ' - ' + item.description : ''}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    
                    <!-- Purpose Section -->
                    <div class="purpose-section">
                        <div class="purpose-label">Purpose/O.S:</div>
                        <div class="purpose-field">${purchase.os || purchase.notes || ''}</div>
                    </div>
                    
                    <!-- Signature Section -->
                    <div class="signature-section">
                        <div class="signature-field">
                            <div class="signature-label">Issued By:</div>
                            <div class="signature-line" style="text-align: center; line-height: 20px;">${purchase.issued_by || ''}</div>
                        </div>
                        <div class="signature-field">
                            <div class="signature-label">Issued To:</div>
                            <div class="signature-line" style="text-align: center; line-height: 20px;">${purchase.issued_to || ''}</div>
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
        printWindow.onload = function () {
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

    const handleShipmentPrint = (group) => {
        setOpenDropdown(null);
        setPrintProjectName(group.supplier_name);
        setPrintProjectItems(group._groupItems || [group]);

        setTimeout(() => {
            window.print();
            setPrintProjectName(null);
            setPrintProjectItems([]);
        }, 300);
    };

    return (
        <>
            <style>{`
            @keyframes electric-flicker {
                0%   { box-shadow: 0 0 4px 1px #818cf8, 0 0 10px 2px #6366f1; opacity: 1; }
                10%  { box-shadow: 0 0 2px 1px #818cf8, 0 0 6px 1px #6366f1;  opacity: 0.85; }
                20%  { box-shadow: 0 0 8px 3px #a5b4fc, 0 0 18px 5px #6366f1; opacity: 1; }
                30%  { box-shadow: 0 0 3px 1px #818cf8, 0 0 8px 2px #6366f1;  opacity: 0.9; }
                40%  { box-shadow: 0 0 10px 4px #c7d2fe, 0 0 22px 6px #6366f1;opacity: 1; }
                50%  { box-shadow: 0 0 2px 1px #818cf8, 0 0 5px 1px #6366f1;  opacity: 0.8; }
                60%  { box-shadow: 0 0 9px 3px #a5b4fc, 0 0 20px 5px #6366f1; opacity: 1; }
                70%  { box-shadow: 0 0 3px 1px #818cf8, 0 0 7px 2px #6366f1;  opacity: 0.88; }
                80%  { box-shadow: 0 0 11px 4px #c7d2fe, 0 0 24px 7px #6366f1;opacity: 1; }
                90%  { box-shadow: 0 0 2px 1px #818cf8, 0 0 6px 1px #6366f1;  opacity: 0.82; }
                100% { box-shadow: 0 0 4px 1px #818cf8, 0 0 10px 2px #6366f1; opacity: 1; }
            }
            .electric-btn-indigo:hover {
                animation: electric-flicker 0.18s step-end infinite;
                outline: none;
            }
        `}</style>
            <AuthenticatedLayout
                user={auth.user}
                header={
                    <div className="flex justify-between items-center">
                        <h2 className="font-semibold text-xl text-gray-800 dark:text-white leading-tight">
                            Outgoing Items
                        </h2>
                        <Link
                            href={route('purchases.create')}
                            className="electric-btn-indigo inline-flex items-center justify-center p-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
                            onMouseEnter={(e) => { const rect = e.currentTarget.getBoundingClientRect(); setTooltip({ show: true, text: 'Add New Distribution', x: rect.left + rect.width / 2, y: rect.bottom + 10 }); }}
                            onMouseLeave={() => setTooltip({ show: false, text: '', x: 0, y: 0 })}
                        >
                            <PlusIcon className="h-5 w-5" />
                        </Link>
                    </div>
                }
            >
                <Head title="Outgoing Items" />

                <div className="py-12">
                    <style>
                        {`
                        @media print {
                            @page { 
                                margin: 0 20mm 20mm 20mm;
                            }
                            body {
                                -webkit-print-color-adjust: exact !important;
                                print-color-adjust: exact !important;
                            }
                        }
                        `}
                    </style>
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        {/* Printable Layout (Only visible when printing via handleShipmentPrint) */}
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
                                                SA#:<br />
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
                                        {printProjectName && printProjectItems.map((item, index) => (
                                            <tr key={index}>
                                                <td className="border border-black px-2 py-4 text-center">{item.quantity || 1}</td>
                                                <td className="border border-black px-2 py-4 text-center uppercase">{item.item_unit === 'Quantity' ? 'PC' : (item.item_unit || 'PC')}</td>
                                                <td className="border border-black px-2 py-4 text-center"></td>
                                                <td className="border border-black px-4 py-4 uppercase font-semibold text-center" colSpan={2}>
                                                    {item.item_name || 'UNKNOWN ITEM'}
                                                </td>
                                                <td className={`border-black px-2 py-2 text-center border-l border-r ${index === 0 ? 'border-t' : ''} ${index === printProjectItems.length - 1 ? 'border-b' : ''}`}></td>
                                            </tr>
                                        ))}
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

                        <div className="print:hidden">
                            {status && (
                                <div className="mb-4 p-4 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded">
                                    {status}
                                </div>
                            )}

                            {/* Date Filter */}
                            <div className="mb-6 flex justify-end">
                                <div className="flex items-center gap-2">
                                    <label htmlFor="date-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Filter by Date:
                                    </label>
                                    <input
                                        id="date-filter"
                                        type="date"
                                        value={dateFilter}
                                        onChange={handleDateChange}
                                        className="border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm sm:text-sm"
                                    />
                                    {dateFilter && (
                                        <button
                                            onClick={() => handleDateChange({ target: { value: '' } })}
                                            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 ml-2 py-1 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                        >
                                            Clear Filter
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                        <thead className="bg-blue-600/70 dark:bg-blue-900/80">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                                    Name of Project
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                                    Type of Project
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                                    Item
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                                    Category
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                                    Quantity
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {purchases.data.length > 0 ? (() => {
                                                // ── Group by supplier_name + purchase_date ──────────
                                                const groups = [];
                                                const seen = {};
                                                purchases.data.forEach((p) => {
                                                    const key = `${p.supplier_name}||${p.purchase_date}`;
                                                    if (seen[key] === undefined) {
                                                        seen[key] = groups.length;
                                                        groups.push({ key, rows: [p] });
                                                    } else {
                                                        groups[seen[key]].rows.push(p);
                                                    }
                                                });

                                                return groups.map((group, groupIndex) => {
                                                    const first = group.rows[0];
                                                    const isMulti = group.rows.length > 1;

                                                    // For print: pass representative purchase + all items
                                                    const printGroup = {
                                                        ...first,
                                                        // Override items list for print
                                                        _groupItems: group.rows.map(r => ({
                                                            item_name: r.item_name,
                                                            quantity: r.quantity,
                                                            description: r.description,
                                                            item_category: r.item_category,
                                                            item_unit: r.item_unit,
                                                        })),
                                                    };

                                                    const handleGroupDelete = () => {
                                                        if (window.confirm(
                                                            isMulti
                                                                ? `Delete all ${group.rows.length} items distributed to "${first.supplier_name}"?`
                                                                : `Delete this distribution record?`
                                                        )) {
                                                            group.rows.forEach(r => router.delete(route('purchases.destroy', r.id)));
                                                        }
                                                    };

                                                    return (
                                                        <tr key={group.key} className="odd:bg-white even:bg-gray-200 dark:odd:bg-gray-800 dark:even:bg-gray-700 hover:bg-blue-200 dark:hover:bg-gray-600 border-b border-gray-300 dark:border-gray-600 transition-colors duration-200">
                                                            {/* Destination */}
                                                            <td className="px-6 py-4 align-top">
                                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                    {groupIndex + 1}. {first.supplier_name}
                                                                </div>
                                                                {first.purchase_date && (
                                                                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                                                        {new Date(first.purchase_date).toLocaleDateString()}
                                                                    </div>
                                                                )}
                                                            </td>

                                                            {/* Type of Project */}
                                                            <td className="px-6 py-4 align-top">
                                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                    {first.project_type ? (
                                                                        <span className="inline-flex px-2 py-0.5 text-xs font-semibold rounded-full capitalize bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                                                                            {first.project_type}
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-xs text-gray-400 dark:text-gray-500">N/A</span>
                                                                    )}
                                                                </div>
                                                            </td>

                                                            {/* Items list */}
                                                            <td className="px-6 py-4 align-top">
                                                                <div className="space-y-1">
                                                                    {group.rows.map((r, idx) => (
                                                                        <div key={idx} className="flex items-center gap-2 min-h-[32px]">
                                                                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                                {group.rows.length > 1 ? `${idx + 1}. ` : ''}{r.item_name}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </td>

                                                            {/* Category badges */}
                                                            <td className="px-6 py-4 align-top">
                                                                <div className="space-y-1">
                                                                    {group.rows.map((r, idx) => (
                                                                        <div key={idx} className="flex items-center min-h-[32px]">
                                                                            {r.item_category ? (
                                                                                <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${r.item_category === 'material'
                                                                                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                                                                    : r.item_category === 'tool'
                                                                                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                                                                                        : 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200'
                                                                                    }`}>
                                                                                    {r.item_category}
                                                                                </span>
                                                                            ) : (
                                                                                <span className="text-xs text-gray-400 dark:text-gray-500">N/A</span>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </td>

                                                            {/* Quantities */}
                                                            <td className="px-6 py-4 align-top">
                                                                <div className="space-y-1">
                                                                    {group.rows.map((r, idx) => (
                                                                        <div key={idx} className="flex items-center text-sm text-gray-500 dark:text-gray-400 min-h-[32px]">
                                                                            {r.quantity} {r.item_unit === 'Quantity' ? 'pcs' : (r.item_unit ? r.item_unit.toLowerCase() : '')}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </td>

                                                            {/* Actions */}
                                                            <td className="px-6 py-4 align-top text-sm font-medium">
                                                                <div className="flex items-start gap-2 pt-1.5">
                                                                    {/* Dropdown Print Menu */}
                                                                    <div className="relative print-dropdown-container">
                                                                        <button
                                                                            onClick={() => setOpenDropdown(openDropdown === group.key ? null : group.key)}
                                                                            className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                                                                            onMouseEnter={(e) => {
                                                                                if (openDropdown !== group.key) {
                                                                                    const rect = e.currentTarget.getBoundingClientRect();
                                                                                    setTooltip({ show: true, text: 'Print Options', x: rect.left + rect.width / 2, y: rect.top - 30 });
                                                                                }
                                                                            }}
                                                                            onMouseLeave={() => setTooltip({ show: false, text: '', x: 0, y: 0 })}
                                                                        >
                                                                            <PrinterIcon className="h-5 w-5" />
                                                                        </button>

                                                                        {openDropdown === group.key && (
                                                                            <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
                                                                                <div className="py-1" role="menu" aria-orientation="vertical">
                                                                                    <button
                                                                                        onClick={() => {
                                                                                            setOpenDropdown(null);
                                                                                            handlePrint(printGroup);
                                                                                        }}
                                                                                        className="text-left w-full block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                                                        role="menuitem"
                                                                                    >
                                                                                        Print Withdrawal Slip
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => handleShipmentPrint(printGroup)}
                                                                                        className="text-left w-full block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                                                        role="menuitem"
                                                                                    >
                                                                                        Print Shipment Approval
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {/* View — one link per group */}
                                                                    <div className="flex flex-col gap-1">
                                                                        <Link
                                                                            href={route('purchases.show', first.id)}
                                                                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 mt-0.5"
                                                                            onMouseEnter={(e) => { const rect = e.currentTarget.getBoundingClientRect(); setTooltip({ show: true, text: 'View Details', x: rect.left + rect.width / 2, y: rect.top - 30 }); }}
                                                                            onMouseLeave={() => setTooltip({ show: false, text: '', x: 0, y: 0 })}
                                                                        >
                                                                            <EyeIcon className="h-5 w-5" />
                                                                        </Link>
                                                                    </div>

                                                                    {/* Delete all in group */}
                                                                    <button
                                                                        onClick={handleGroupDelete}
                                                                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 mt-0.5"
                                                                        onMouseEnter={(e) => { const rect = e.currentTarget.getBoundingClientRect(); setTooltip({ show: true, text: isMulti ? 'Delete All Items' : 'Delete Record', x: rect.left + rect.width / 2, y: rect.top - 30 }); }}
                                                                        onMouseLeave={() => setTooltip({ show: false, text: '', x: 0, y: 0 })}
                                                                    >
                                                                        <TrashIcon className="h-5 w-5" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                });
                                            })() : (
                                                <tr>
                                                    <td colSpan="6" className="px-6 py-12 text-center">
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
