import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState, useEffect, useRef } from 'react';
import { PlusIcon, EyeIcon, TrashIcon, PrinterIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function Index({ auth, purchases, status }) {
    const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 });
    const [dateFilter, setDateFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [printProjectName, setPrintProjectName] = useState(null);
    const [printProjectItems, setPrintProjectItems] = useState([]);
    const [printImages, setPrintImages] = useState({});
    const [printSaNumber, setPrintSaNumber] = useState('');
    const [printToolsId, setPrintToolsId] = useState({});
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

    const firstRender = useRef(true);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('date')) {
            setDateFilter(params.get('date'));
        }
        if (params.get('search')) {
            setSearchTerm(params.get('search'));
        }
        firstRender.current = false;
    }, []);

    useEffect(() => {
        if (firstRender.current) return;

        // Fetch suggestions when search term changes
        const fetchSuggestions = async () => {
            if (searchTerm.length >= 1) {
                try {
                    const response = await fetch(`/commercial/public/index.php/purchases/suggestions?q=${encodeURIComponent(searchTerm)}`);
                    const data = await response.json();
                    setSuggestions(data);
                    setShowSuggestions(true);
                } catch (error) {
                    console.error("Failed to fetch suggestions:", error);
                }
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        };

        const timer = setTimeout(() => {
            fetchSuggestions();

            const params = new URLSearchParams(window.location.search);
            const currentSearch = params.get('search') || '';

            if (searchTerm !== currentSearch) {
                if (searchTerm) {
                    params.set('search', searchTerm);
                } else {
                    params.delete('search');
                }

                params.delete('page');

                const queryStr = params.toString();
                router.visit(route('purchases.index') + (queryStr ? `?${queryStr}` : ''), {
                    preserveState: true,
                    preserveScroll: true,
                });
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm]);

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

    const handlePrint = async (purchase) => {
        // Create a new window for printing immediately so the popup blocker doesn't block it due to async wait
        const printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');

        if (!printWindow) {
            alert('Please allow popups to print the withdrawal slip');
            return;
        }

        let logoDataUrl = `${window.location.origin}/images/warlen.png`;
        try {
            const response = await fetch('/images/warlen.png');
            const blob = await response.blob();
            logoDataUrl = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error('Error fetching logo:', error);
        }

        // Generate detailed print content
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Withdrawal Slip #${purchase.id}</title>
                <style>
                    * {
                        box-sizing: border-box;
                    }
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                        background: #fff;
                    }
                    .slip-container {
                        width: 100%;
                        height: 50vh;
                        max-width: none;
                        margin: 0;
                        padding: 20px;
                        font-size: 14px;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 15px;
                    }
                    .header-top {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }
                    .company-name {
                        font-family: "Arial Black", sans-serif;
                        font-weight: 900;
                        font-size: 16px;
                        margin: 0;
                        letter-spacing: -0.5px;
                    }
                    .company-address {
                        font-size: 11px;
                        font-weight: bold;
                        margin-top: 2px;
                    }
                    .logo-placeholder {
                        width: 40px;
                        height: 40px;
                        margin-right: 8px;
                        border-radius: 50%;
                        background-color: #333; /* Dark circle like in the image */
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .slip-title-row {
                        position: relative;
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-end;
                        margin-bottom: 2px;
                        min-height: 24px;
                    }
                    .year-prefix {
                        font-weight: bold;
                        font-size: 18px;
                    }
                    .slip-main-title {
                        position: absolute;
                        left: 50%;
                        transform: translateX(-50%);
                        bottom: 0;
                        font-family: "Arial Black", sans-serif;
                        font-weight: 900;
                        font-size: 18px;
                        letter-spacing: -0.5px;
                        white-space: nowrap;
                    }
                    .slip-no {
                        font-weight: bold;
                        font-size: 14px;
                        border-bottom: 1px solid #000;
                        padding-bottom: 2px;
                        min-width: 100px;
                    }
                    .info-row {
                        margin-bottom: 4px;
                    }
                    .info-row-flex {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 4px;
                    }
                    .label {
                        font-weight: bold;
                    }
                    .underline-field {
                        display: inline-block;
                        border-bottom: 1px solid #000;
                        min-height: 16px;
                    }
                    .categories-row {
                        display: flex;
                        justify-content: space-between;
                        font-weight: bold;
                        font-size: 13px;
                        margin-top: 6px;
                        margin-bottom: 2px;
                    }
                    
                    /* Table Styles */
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        border: 1px solid #000;
                        margin-bottom: 5px;
                    }
                    th {
                        border: 1px solid #000;
                        padding: 3px 5px;
                        text-align: center;
                        font-weight: bold;
                    }
                    td {
                        border: 1px solid #000;
                        padding: 3px 5px;
                        height: 22px; /* Fixed height for blank rows */
                    }
                    .qty-col {
                        width: 25%;
                        text-align: center;
                        font-weight: bold;
                    }
                    .desc-col {
                        text-align: left;
                        font-weight: bold;
                    }

                    .purpose-row {
                        display: flex;
                        margin-bottom: 15px;
                        font-weight: bold;
                    }
                    .signatures-row {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 5px;
                        font-weight: bold;
                    }
                    .signature-block {
                        width: 30%;
                    }
                    .signature-line {
                        border-bottom: 1px solid #000;
                        min-height: 20px;
                        margin-left: 5px;
                        display: inline-block;
                        width: calc(100% - 70px);
                    }
                    .footer-codes {
                        font-weight: bold;
                        font-size: 14px;
                        line-height: 1.2;
                        margin-top: 10px;
                    }

                    @media print {
                        body {
                            margin: 0;
                            padding: 0;
                        }
                        @page {
                            margin: 0;
                            size: portrait;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="slip-container">
                    <div class="header">
                        <div class="header-top">
                            <img src="${logoDataUrl}" alt="Logo" class="logo-placeholder" style="object-fit: contain; background: none; border-radius: 0;" />
                            <div class="company-name">Warlen Industrial Sales Corporation</div>
                        </div>
                        <div class="company-address">Deka Sales Bldg., Lacson Ext., Alijis Rd., Bacolod City</div>
                    </div>
                    
                    <div class="slip-title-row">
                        <div class="year-prefix">#${new Date().getFullYear()}</div>
                        <div class="slip-main-title">WITHDRAWAL SLIP</div>
                        <div class="slip-no">No. ${((purchase.os || purchase.notes || '').match(/\d+/) || [''])[0]}</div>
                    </div>

                    <div class="info-row-flex">
                        <div style="flex-grow: 1;">
                            <span class="label">Name of Project:</span>
                            <span class="underline-field" style="width: calc(100% - 130px);">${purchase.project_name || ''}</span>
                        </div>
                        <div style="width: 150px; text-align: right;">
                            <span class="label">Date:</span>
                            <span class="underline-field" style="width: 100px; text-align: center;">${new Date(purchase.purchase_date).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div class="info-row">
                        <span class="label">Type of Project:</span>
                        <span class="underline-field" style="width: calc(100% - 120px);">${purchase.project_type || ''}</span>
                    </div>

                    <div class="categories-row">
                        <div>Construction materials (${purchase.item_category === 'material' ? '✓' : ' '})</div>
                        <div>Spares parts (${purchase.item_category === 'tool' ? '✓' : ' '})</div>
                        <div>others: <span class="underline-field" style="width: 60px;">${(!purchase.item_category || (purchase.item_category !== 'material' && purchase.item_category !== 'tool')) ? '✓' : ''}</span></div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th class="qty-col">Qty</th>
                                <th class="desc-col">Item Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${(() => {
                const items = purchase._groupItems || [{ item_name: purchase.item_name, quantity: purchase.quantity, description: purchase.description }];
                const rows = [];
                for (let i = 0; i < 10; i++) { // Render 6 rows by default
                    if (i < items.length) {
                        const item = items[i];
                        rows.push(`
                                            <tr>
                                                <td class="qty-col" style="font-weight: normal;">${item.quantity}</td>
                                                <td class="desc-col" style="font-weight: normal;">${item.item_name}${item.description ? ' - ' + item.description : ''}</td>
                                            </tr>
                                        `);
                    } else {
                        rows.push(`
                                            <tr>
                                                <td></td>
                                                <td></td>
                                            </tr>
                                        `);
                    }
                }
                return rows.join('');
            })()}
                        </tbody>
                    </table>

                    <div class="purpose-row">
                        <span>Purpose:</span>
                        <span class="underline-field" style="flex-grow: 1; border-bottom: none; margin-left: 5px; font-weight: normal;">${purchase.os || purchase.notes || ''}</span>
                    </div>

                    <div class="signatures-row">
                        <div class="signature-block">
                            <span class="underline-field" style="width: 100%; display: block;"></span>
                            <span style="margin-top: 15px;">Noted By:</span>
                        </div>
                        <div class="signature-block">
                            <span class="underline-field" style="width: 100%; display: block; text-align: center; font-weight: normal;">${purchase.issued_by || ''}</span>
                            <span style="margin-top: 15px;">Issued By:</span>
                        </div>
                        <div class="signature-block">
                            <span class="underline-field" style="width: 100%; display: block; text-align: center; font-weight: normal;">${purchase.issued_to || ''}</span>
                            <span style="margin-top: 15px;">Issued To:</span>
                        </div>
                    </div>

                    <div class="footer-codes">
                        <div>QF-WHS-003</div>
                        <div>Rev 00 EFF: 02/10/2025</div>
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
        setPrintImages({});
        setPrintSaNumber('');
        setPrintToolsId({});
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
                            html, body, #app {
                                background-color: white !important;
                                background: white !important;
                            }
                            body {
                                -webkit-print-color-adjust: exact !important;
                                print-color-adjust: exact !important;
                            }
                        }
                        `}
                    </style>
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 print:bg-white print:p-0">
                        {/* Printable Layout Preview Modal */}
                        {printProjectName && (
                            <div className="fixed inset-0 z-[100] bg-gray-500/80 md:p-8 flex items-start justify-center overflow-y-auto print:bg-white print:p-0 print:block print:relative print:inset-auto print:z-auto print:border-none print:shadow-none bg-white">
                                <div className="bg-white w-full max-w-5xl shadow-2xl print:shadow-none print:border-none print:ring-0 print:outline-none print:max-w-none print:m-0 print:rounded-none relative min-h-screen print:min-h-0 md:min-h-0 md:rounded-lg">

                                    {/* Action Bar (Hidden on Print) */}
                                    <div className="print:hidden sticky top-0 bg-gray-100 border-b px-6 py-4 flex flex-col sm:flex-row justify-between items-center z-10 shadow-sm md:rounded-t-lg">
                                        <h3 className="text-lg font-bold text-gray-800 mb-4 sm:mb-0">Print Preview - Shipment Approval</h3>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => {
                                                    setPrintProjectName(null);
                                                    setPrintProjectItems([]);
                                                    setPrintImages({});
                                                    setPrintSaNumber('');
                                                    setPrintToolsId({});
                                                }}
                                                className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const formData = new FormData();
                                                    formData.append('project_site_name', printProjectName || 'Unknown Site');
                                                    formData.append('sa_number', printSaNumber || 'N/A');

                                                    // Collect Tools IDs and merge them (if multiple rows have tools id)
                                                    const toolsList = Object.values(printToolsId).filter(val => val.trim() !== '');
                                                    formData.append('tools_id', toolsList.length > 0 ? toolsList.join(', ') : '');

                                                    const descItems = printProjectItems.map(item => `${item.quantity || 1} ${item.item_unit === 'Quantity' ? 'PC' : (item.item_unit || 'PC')} - ${item.item_name}`).join(', ');
                                                    formData.append('description', descItems);

                                                    Object.keys(printImages).forEach(idx => {
                                                        const imgData = printImages[idx];
                                                        if (imgData && imgData.file) {
                                                            formData.append('picture[]', imgData.file);
                                                        }
                                                    });

                                                    router.post(route('shipment-approvals.store'), formData, {
                                                        preserveState: true,
                                                        preserveScroll: true,
                                                    });

                                                    setTimeout(() => window.print(), 100);
                                                }}
                                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none flex items-center"
                                            >
                                                <PrinterIcon className="h-5 w-5 mr-2" />
                                                Print Document
                                            </button>
                                        </div>
                                    </div>

                                    {/* Printable Content */}
                                    <div className="p-8 print:p-0 w-full bg-white text-black font-sans leading-relaxed max-w-[210mm] mx-auto min-h-[297mm] print:min-h-0">
                                        {/* Header Section */}
                                        <div className="text-center mb-6 print:mb-1">
                                            <div className="flex justify-center items-center print:mb-0">
                                                <img src="/images/warlen.png" alt="Logo" className="h-12 w-12 object-contain mr-3" />
                                                <h1 className="text-2xl print:text-[20px] font-bold uppercase tracking-wide text-blue-900 print:leading-none" style={{ color: '#1e3a8a' }}>
                                                    WARLEN INDUSTRIAL SALES CORPORATION
                                                </h1>
                                            </div>
                                            <h2 className="text-[12px] font-semibold uppercase tracking-widest text-red-600 mb-1 print:mb-0 print:leading-none -mt-2" style={{ color: '#dc2626' }}>
                                                General Engineering and Specialty Contractor
                                            </h2>
                                            <p className="text-xs print:leading-tight">
                                                Tel. 432-3497 / 435-1573<br />
                                                Blk. 2 Lot 20, Greenplains Subd., Alijis Road, Bacolod City
                                            </p>
                                        </div>

                                        <h3 className="text-xl text-center font-bold mb-6 print:mb-2">
                                            Shipment Approval and Confirmation of Materials
                                        </h3>

                                        <p className="text-sm indent-8 mb-6 print:mb-2 text-justify">
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
                                                        <div className="flex items-center gap-1">
                                                            <span className="whitespace-nowrap">SA#:</span>
                                                            <input
                                                                type="text"
                                                                value={printSaNumber}
                                                                onChange={(e) => setPrintSaNumber(e.target.value)}
                                                                placeholder="Enter SA Number"
                                                                className="print:text-black print:border-none print:p-0 print:bg-transparent print:placeholder-transparent border-b border-gray-300 bg-transparent text-sm w-full py-0 px-1 focus:outline-none focus:border-blue-500 transition-colors"
                                                            />
                                                        </div>
                                                        <div className="mt-1">
                                                            Date: {new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }).replace(/\//g, '-')}
                                                        </div>
                                                    </th>
                                                </tr>
                                                <tr className="bg-gray-100">
                                                    <th className="border border-black px-2 py-2 print:py-1 text-center w-16">QTY</th>
                                                    <th className="border border-black px-2 py-2 print:py-1 text-center w-16">UNIT</th>
                                                    <th className="border border-black px-2 py-2 print:py-1 text-center w-24">TOOLS ID</th>
                                                    <th className="border border-black px-2 py-2 print:py-1 text-center uppercase" colSpan={2}>Description</th>
                                                    <th className="border border-black px-2 py-2 print:py-1 text-center w-32 uppercase">Picture</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {printProjectName && printProjectItems.map((item, index) => (
                                                    <tr key={index}>
                                                        <td className="border border-black px-2 py-4 print:py-1 text-center">{item.quantity || 1}</td>
                                                        <td className="border border-black px-2 py-4 print:py-1 text-center uppercase">{item.item_unit === 'Quantity' ? 'PC' : (item.item_unit || 'PC')}</td>
                                                        <td className="border border-black px-2 py-4 text-center print:p-0">
                                                            <input
                                                                type="text"
                                                                value={printToolsId[index] || ''}
                                                                onChange={(e) => setPrintToolsId(prev => ({ ...prev, [index]: e.target.value }))}
                                                                placeholder="Enter ID"
                                                                className="print:text-black print:border-none print:p-0 print:bg-transparent print:placeholder-transparent border-b border-gray-300 bg-transparent text-sm w-[80px] text-center py-1 px-1 focus:outline-none focus:border-blue-500 transition-colors mx-auto block"
                                                            />
                                                        </td>
                                                        <td className="border border-black px-4 py-4 print:py-1 uppercase font-semibold text-center" colSpan={2}>
                                                            {item.item_name || 'UNKNOWN ITEM'}
                                                        </td>
                                                        <td className={`border-black px-2 py-2 print:py-1 text-center border-l border-r ${index === 0 ? 'border-t' : ''} ${index === printProjectItems.length - 1 ? 'border-b' : ''}`}>
                                                            <label className="cursor-pointer block min-h-[60px] print:min-h-0 flex items-center justify-center relative group">
                                                                <input
                                                                    type="file"
                                                                    className="hidden"
                                                                    accept="image/*"
                                                                    onChange={(e) => {
                                                                        if (e.target.files && e.target.files[0]) {
                                                                            const file = e.target.files[0];
                                                                            const reader = new FileReader();
                                                                            reader.onload = (event) => {
                                                                                setPrintImages(prev => ({
                                                                                    ...prev,
                                                                                    [index]: { file, preview: event.target.result }
                                                                                }));
                                                                            };
                                                                            reader.readAsDataURL(file);
                                                                        }
                                                                    }}
                                                                />
                                                                {printImages[index] ? (
                                                                    <div className="relative w-full h-full flex items-center justify-center">
                                                                        <img src={printImages[index].preview || printImages[index]} alt="Uploaded" className="max-h-24 max-w-[120px] object-contain" />
                                                                        <div
                                                                            className="print:hidden absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded cursor-pointer"
                                                                            onClick={(e) => {
                                                                                e.preventDefault();
                                                                                const newImages = { ...printImages };
                                                                                delete newImages[index];
                                                                                setPrintImages(newImages);
                                                                            }}
                                                                        >
                                                                            <TrashIcon className="h-6 w-6 text-white mb-1" />
                                                                            <span className="text-white text-xs font-semibold">Remove</span>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="print:hidden text-gray-400 text-xs flex flex-col items-center p-2 border-2 border-dashed border-transparent hover:border-gray-300 rounded hover:text-blue-500 transition-colors">
                                                                        <PlusIcon className="h-5 w-5 mb-1 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                                                        <span>Add Picture</span>
                                                                    </div>
                                                                )}
                                                            </label>
                                                        </td>
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
                                </div>
                            </div>
                        )}

                        <div className="print:hidden">
                            {status && (
                                <div className="mb-4 p-4 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded">
                                    {status}
                                </div>
                            )}

                            {/* Filters */}
                            <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                {/* Search Bar */}
                                <div className="relative w-full sm:w-96 rounded-md shadow-sm z-20">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                    </div>
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onFocus={() => { if (searchTerm.length > 0) setShowSuggestions(true); }}
                                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                        placeholder="Search outgoing items..."
                                        className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-700 rounded-md leading-5 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm shadow-sm transition-colors duration-200 ease-in-out"
                                        autoComplete="off"
                                    />
                                    {searchTerm && (
                                        <button
                                            onClick={() => { setSearchTerm(''); setSuggestions([]); setShowSuggestions(false); }}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500 transition-colors"
                                            title="Clear search"
                                        >
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}

                                    {/* Auto-suggestions Dropdown */}
                                    {showSuggestions && suggestions.length > 0 && (
                                        <div className="absolute z-30 mt-1 w-full bg-white dark:bg-gray-900 shadow-xl max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm border border-gray-200 dark:border-gray-700 transform transition-all duration-200 ease-out origin-top">
                                            {suggestions.map((suggestion, index) => (
                                                <div
                                                    key={index}
                                                    onClick={() => {
                                                        setSearchTerm(suggestion.text);
                                                        setShowSuggestions(false);
                                                    }}
                                                    className="cursor-pointer select-none relative py-2.5 pl-3 pr-9 hover:bg-indigo-50 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 flex items-center group transition-colors duration-150"
                                                >
                                                    <span className="block truncate font-medium">
                                                        {suggestion.text}
                                                    </span>
                                                    <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${suggestion.type === 'project' ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300' : 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'}`}>
                                                        {suggestion.type === 'project' ? 'Project' : 'Item'}
                                                    </span>
                                                    {/* Arrow indicator that fades in on hover */}
                                                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                        <svg className="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Date Filter */}
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <label htmlFor="date-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300 shrink-0">
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
                                            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 py-1 px-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 shrink-0"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg">
                                <div>
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
                                                // ── Group by supplier_name + purchase_date + created_at ──────────
                                                const groups = [];
                                                const seen = {};
                                                purchases.data.forEach((p) => {
                                                    const key = `${p.supplier_name}||${p.purchase_date}||${p.created_at}`;
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
