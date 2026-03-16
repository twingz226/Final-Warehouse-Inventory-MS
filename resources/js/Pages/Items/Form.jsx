// resources/js/Pages/Items/Form.jsx
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import { useEffect, useState, useRef } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';

// Format datetime for display
function formatDateTimeForDisplay(dateTime) {
    if (!dateTime) return '';

    const date = typeof dateTime === 'string' ? new Date(dateTime) : dateTime;

    const options = {
        timeZone: 'Asia/Manila',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    };

    return new Intl.DateTimeFormat('en-US', options).format(date);
}

export default function Form({ auth, item = null }) {
    const { data, setData, post, put, processing, errors, reset, transform } = useForm({
        items: item ? [{
            name: item.name || '',
            description: item.description || '',
            category: item.category || 'tool',
            quantity: item.quantity || 0,
            unit: item.unit || 'Quantity',
        }] : [{
            name: '',
            description: '',
            category: 'tool',
            quantity: 0,
            unit: 'Quantity',
        }],
        date_time: item ? formatDateTimeForDisplay(item.date_time) : '',
    });

    const [nameChecks, setNameChecks] = useState([{ exists: false, checking: false }]);
    const debounceRefs = useRef([]);

    useEffect(() => {
        if (!item && !data.date_time) {
            const now = new Date();
            const options = {
                timeZone: 'Asia/Manila',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            };

            const formatter = new Intl.DateTimeFormat('en-US', options);
            const formattedDateTime = formatter.format(now);
            setData('date_time', formattedDateTime);
        }
    }, [item, data.date_time, setData]);

    const checkName = (name, index, itemId = null) => {
        const trimmed = name.trim();
        
        if (!trimmed) {
            setNameChecks(prev => prev.map((c, i) => i === index ? { ...c, exists: false, checking: false } : c));
            clearTimeout(debounceRefs.current[index]);
            return;
        }

        setNameChecks(prev => prev.map((c, i) => i === index ? { ...c, checking: true } : c));
        clearTimeout(debounceRefs.current[index]);

        debounceRefs.current[index] = setTimeout(async () => {
            try {
                const params = new URLSearchParams({ name: trimmed });
                if (itemId) params.append('ignore_id', itemId);

                const res = await fetch(`/items/check-name?${params}`);
                const json = await res.json();
                
                const duplicateInRows = data.items.some((it, i) => i !== index && it.name.trim().toLowerCase() === trimmed.toLowerCase());
                
                setNameChecks(prev => prev.map((c, i) => i === index ? { ...c, exists: json.exists || duplicateInRows, checking: false } : c));
            } catch {
                setNameChecks(prev => prev.map((c, i) => i === index ? { ...c, exists: false, checking: false } : c));
            }
        }, 400);
    };

    const updateItem = (index, field, value) => {
        const newItems = [...data.items];
        newItems[index][field] = value;
        setData('items', newItems);
        
        if (field === 'name') {
            checkName(value, index, item?.id);
        }
    };

    const addItem = () => {
        setData('items', [...data.items, { name: '', description: '', category: 'tool', quantity: 0, unit: 'Quantity' }]);
        setNameChecks(prev => [...prev, { exists: false, checking: false }]);
    };

    const removeItem = (index) => {
        setData('items', data.items.filter((_, i) => i !== index));
        setNameChecks(prev => prev.filter((_, i) => i !== index));
    };

    const submit = (e) => {
        e.preventDefault();
        
        if (nameChecks.some(c => c.exists)) return;

        if (item) {
            transform((d) => ({
                name: d.items[0].name,
                description: d.items[0].description,
                category: d.items[0].category,
                quantity: d.items[0].quantity,
                unit: d.items[0].unit,
            }));
            put(route('items.update', item.id));
        } else {
            post(route('items.store'));
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    {item ? 'Edit Tool/Material' : 'Create New Tool/Material'}
                </h2>
            }
        >
            <Head title={item ? 'Edit Tool/Material' : 'Create Tool/Material'} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                            <form onSubmit={submit} className="space-y-8">
                                
                                {data.items.map((it, index) => {
                                    const nameEx = nameChecks[index]?.exists || false;
                                    const nameChk = nameChecks[index]?.checking || false;

                                    return (
                                        <div key={index} className="relative bg-gray-50 dark:bg-gray-700/50 p-6 rounded-lg border border-gray-200 dark:border-gray-600">
                                            
                                            {(!item && data.items.length > 1) && (
                                                <div className="flex justify-between items-center mb-4">
                                                    <h3 className="text-md font-medium text-gray-700 dark:text-gray-300">Item #{index + 1}</h3>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(index)}
                                                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            )}

                                            <div className="space-y-6">
                                                <div>
                                                    <InputLabel htmlFor={`name_${index}`} value="Item Name" />
                                                    <TextInput
                                                        id={`name_${index}`}
                                                        type="text"
                                                        className={`mt-1 block w-full ${nameEx ? 'border-amber-400 focus:border-amber-500 focus:ring-amber-500' : ''}`}
                                                        value={it.name}
                                                        onChange={(e) => updateItem(index, 'name', e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1))}
                                                        required
                                                        autoFocus={index === 0}
                                                    />
                                                    <InputError message={errors[`items.${index}.name`] || (index === 0 ? errors.name : null)} className="mt-2" />
                                                    {nameChk && !nameEx && (
                                                        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500 italic">Checking availability…</p>
                                                    )}
                                                    {!nameChk && nameEx && (
                                                        <div className="mt-2 flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-600 px-3 py-2">
                                                            <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                                            </svg>
                                                            <p className="text-sm text-amber-700 dark:text-amber-400">
                                                                An item named <strong>&ldquo;{it.name.trim()}&rdquo;</strong> already exists or is duplicated.
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>

                                                <div>
                                                    <InputLabel htmlFor={`description_${index}`} value="Description" />
                                                    <textarea
                                                        id={`description_${index}`}
                                                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                                        value={it.description}
                                                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                                                        rows={3}
                                                    />
                                                    <InputError message={errors[`items.${index}.description`] || (index === 0 ? errors.description : null)} className="mt-2" />
                                                </div>

                                                <div>
                                                    <InputLabel htmlFor={`category_${index}`} value="Category" />
                                                    <select
                                                        id={`category_${index}`}
                                                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                                        value={it.category}
                                                        onChange={(e) => updateItem(index, 'category', e.target.value)}
                                                        required
                                                    >
                                                        <option value="tool">Tool</option>
                                                        <option value="material">Material</option>
                                                    </select>
                                                    <InputError message={errors[`items.${index}.category`] || (index === 0 ? errors.category : null)} className="mt-2" />
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <InputLabel htmlFor={`quantity_${index}`} value="Quantity" />
                                                        <div className="flex space-x-2">
                                                            <TextInput
                                                                id={`quantity_${index}`}
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                className="mt-1 block flex-1"
                                                                value={it.quantity}
                                                                onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                                                required
                                                                disabled
                                                            />
                                                            <select
                                                                id={`unit_${index}`}
                                                                className="mt-1 block w-32 border-gray-300 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                                                value={it.unit}
                                                                onChange={(e) => updateItem(index, 'unit', e.target.value)}
                                                                required
                                                            >
                                                                <option value="Quantity">pcs.</option>
                                                                <option value="Kg">Kg</option>
                                                            </select>
                                                        </div>
                                                        <InputError message={errors[`items.${index}.quantity`] || (index === 0 ? errors.quantity : null)} className="mt-2" />
                                                        <InputError message={errors[`items.${index}.unit`] || (index === 0 ? errors.unit : null)} className="mt-2" />
                                                    </div>

                                                    {index === 0 && (
                                                        <div>
                                                            <InputLabel htmlFor="date_time" value="Date & Time" />
                                                            <TextInput
                                                                id="date_time"
                                                                type="text"
                                                                className="mt-1 block w-full"
                                                                value={data.date_time}
                                                                onChange={(e) => setData('date_time', e.target.value)}
                                                                readOnly
                                                            />
                                                            <InputError message={errors.date_time} className="mt-2" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

                                {!item && (
                                    <button
                                        type="button"
                                        onClick={addItem}
                                        className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 border border-indigo-600 dark:from-indigo-500 dark:to-indigo-600 dark:hover:from-indigo-600 dark:hover:to-indigo-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                                    >
                                        <PlusIcon className="h-5 w-5" />
                                        Add Another Item
                                    </button>
                                )}

                                <div className="flex items-center justify-end space-x-4 pt-4">
                                    <Link
                                        href={route('items.index')}
                                        className="inline-flex items-center px-4 py-2 bg-gray-500 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150"
                                    >
                                        Cancel
                                    </Link>
                                    <PrimaryButton
                                        type="submit"
                                        disabled={processing || nameChecks.some(c => c.exists)}
                                        className="ml-4"
                                    >
                                        {item ? 'Update' : 'Create'} Tool/Material{(!item && data.items.length > 1) ? 's' : ''}
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

