// resources/js/Pages/Items/Form.jsx
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import { useEffect } from 'react';

// Format datetime for display
    function formatDateTimeForDisplay(dateTime) {
        if (!dateTime) return '';
        
        // If it's a string, parse it first
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
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: item?.name || '',
        description: item?.description || '',
        category: item?.category || 'tool',
        quantity: item?.quantity || 0,
        date_time: item ? formatDateTimeForDisplay(item.date_time) : '',
    });

    // Auto-populate current datetime for new items
    useEffect(() => {
        if (!item && !data.date_time) {
            // Get current Philippine time in readable format
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

    const submit = (e) => {
        e.preventDefault();
        if (item) {
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
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <form onSubmit={submit} className="space-y-6">
                                <div>
                                    <InputLabel htmlFor="name" value="Name" />
                                    <TextInput
                                        id="name"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                        autoFocus
                                    />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="description" value="Description" />
                                    <textarea
                                        id="description"
                                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        rows={3}
                                    />
                                    <InputError message={errors.description} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="category" value="Category" />
                                    <select
                                        id="category"
                                        className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                                        value={data.category}
                                        onChange={(e) => setData('category', e.target.value)}
                                        required
                                    >
                                        <option value="tool">Tool</option>
                                        <option value="material">Material</option>
                                    </select>
                                    <InputError message={errors.category} className="mt-2" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <InputLabel htmlFor="quantity" value="Quantity" />
                                        <TextInput
                                            id="quantity"
                                            type="number"
                                            min="0"
                                            className="mt-1 block w-full"
                                            value={data.quantity}
                                            onChange={(e) => setData('quantity', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.quantity} className="mt-2" />
                                    </div>

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
                                </div>

                                <div className="flex items-center justify-end space-x-4">
                                    <Link
                                        href={route('items.index')}
                                        className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150"
                                    >
                                        Cancel
                                    </Link>
                                    <PrimaryButton
                                        type="submit"
                                        disabled={processing}
                                        className="ml-4"
                                    >
                                        {item ? 'Update' : 'Create'} Tool/Material
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