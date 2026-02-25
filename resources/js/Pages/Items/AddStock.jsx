// resources/js/Pages/Items/AddStock.jsx
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import { useEffect, useState } from 'react';
import { Listbox } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/24/outline';

export default function AddStock({ auth, items }) {
    const [selectedItem, setSelectedItem] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        item_id: '',
        quantity: '',
    });

    const isLowStock = (availableStock) => availableStock <= 10;

    const formatItemDisplay = (item) => `${item.name} - Current: ${item.available_stock} ${item.unit === 'Quantity' ? 'pcs' : item.unit}`;

    const handleItemChange = (e) => {
        const itemId = e.target.value;
        setData('item_id', itemId);
        const item = items.find(item => item.id == itemId);
        setSelectedItem(item);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('items.store-stock'));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Add Incoming Stock
                </h2>
            }
        >
            <Head title="Add Incoming Stock" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                            <form onSubmit={submit} className="space-y-6">
                                <div>
                                    <InputLabel htmlFor="item_id" value="Select Item" />
                                    <Listbox
                                        value={data.item_id}
                                        onChange={(value) => {
                                            setData('item_id', value);
                                            const item = items.find(item => item.id == value);
                                            setSelectedItem(item);
                                        }}
                                    >
                                        <div className="relative mt-1">
                                            <Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 pl-3 pr-10 text-left shadow-sm focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 sm:text-sm text-gray-900 dark:text-gray-100">
                                                <span className="block truncate">{selectedItem ? formatItemDisplay(selectedItem) : 'Choose an item...'}</span>
                                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                                    <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                                </span>
                                            </Listbox.Button>
                                            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                                {items.map((item) => (
                                                    <Listbox.Option
                                                        key={item.id}
                                                        value={item.id}
                                                        className={({ active }) =>
                                                            `relative cursor-default select-none py-2 pl-3 pr-9 ${
                                                                active ? 'bg-indigo-600 text-white' : isLowStock(item.quantity) ? 'text-red-600' : 'text-gray-900 dark:text-gray-100'
                                                            }`
                                                        }
                                                    >
                                                        {({ selected }) => (
                                                            <>
                                                                <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                                                    {formatItemDisplay(item)}
                                                                </span>
                                                                {selected && (
                                                                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600">
                                                                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                                    </span>
                                                                )}
                                                            </>
                                                        )}
                                                    </Listbox.Option>
                                                ))}
                                            </Listbox.Options>
                                        </div>
                                    </Listbox>
                                    <InputError message={errors.item_id} className="mt-2" />
                                </div>

                                {selectedItem && (
                                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                                        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                                            Item Details
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="font-medium text-gray-500 dark:text-gray-400">Name:</span>
                                                <span className="ml-2 text-gray-900 dark:text-gray-100">{selectedItem.name}</span>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-500 dark:text-gray-400">Current Quantity:</span>
                                                <span className="ml-2 text-gray-900 dark:text-gray-100">
                                                    {selectedItem.available_stock} {selectedItem.unit === 'Quantity' ? 'pcs' : selectedItem.unit}
                                                </span>
                                            </div>
                                            {selectedItem.description && (
                                                <div className="col-span-2">
                                                    <span className="font-medium text-gray-500 dark:text-gray-400">Description:</span>
                                                    <span className="ml-2 text-gray-900 dark:text-gray-100">{selectedItem.description}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <InputLabel htmlFor="quantity" value="Additional Quantity" />
                                    <div className="flex space-x-2">
                                        <TextInput
                                            id="quantity"
                                            type="number"
                                            min="0.01"
                                            step="0.01"
                                            className="mt-1 block flex-1"
                                            value={data.quantity}
                                            onChange={(e) => setData('quantity', e.target.value)}
                                            required
                                            placeholder="Enter quantity to add"
                                        />
                                        {selectedItem && (
                                            <div className="mt-1 flex items-center px-3 py-2 bg-gray-100 dark:bg-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300">
                                                {selectedItem.unit}
                                            </div>
                                        )}
                                    </div>
                                    <InputError message={errors.quantity} className="mt-2" />
                                </div>

                                <div className="flex items-center justify-end space-x-4">
                                    <Link
                                        href={route('items.index')}
                                        className="inline-flex items-center px-4 py-2 bg-gray-500 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150"
                                    >
                                        Cancel
                                    </Link>
                                    <PrimaryButton
                                        type="submit"
                                        disabled={processing}
                                        className="ml-4"
                                    >
                                        Add Stock
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
