// resources/js/Pages/Items/AddStock.jsx
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import { useEffect, useState } from 'react';

export default function AddStock({ auth, items }) {
    const [selectedItem, setSelectedItem] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        item_id: '',
        quantity: '',
    });

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
                                    <select
                                        id="item_id"
                                        className="mt-1 block w-full border-gray-300 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-indigo-500 dark:focus:ring-indigo-400 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        value={data.item_id}
                                        onChange={handleItemChange}
                                        required
                                        autoFocus
                                    >
                                        <option value="">Choose an item...</option>
                                        {items.map((item) => (
                                            <option key={item.id} value={item.id}>
                                                {item.name} - Current: {item.quantity} {item.unit}
                                            </option>
                                        ))}
                                    </select>
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
                                                    {selectedItem.quantity} {selectedItem.unit}
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
