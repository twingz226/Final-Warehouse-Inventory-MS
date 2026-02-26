import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

export default function Form({ auth, projectSiteNames = [] }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        project_site_name: '',
        sa_number: '',
        quantity: '',
        unit: 'pcs',
        tools_id: '',
        description: '',
        picture: null,
        date: new Date().toISOString().split('T')[0],
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('shipment-approvals.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center space-x-4">
                    <a
                        href={route('shipment-approvals.index')}
                        className="inline-flex items-center px-3 py-2 bg-gray-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition ease-in-out duration-150"
                    >
                        <ArrowLeftIcon className="w-4 h-4 mr-2" />
                        Back
                    </a>
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                        Create Shipment Approval
                    </h2>
                </div>
            }
        >
            <Head title="Create Shipment Approval" />

            <div className="py-12">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <form onSubmit={submit} encType="multipart/form-data">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <InputLabel htmlFor="project_site_name" value="Project Site Name" />
                                        <select
                                            id="project_site_name"
                                            name="project_site_name"
                                            value={data.project_site_name}
                                            className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setData('project_site_name', value);

                                                if (value) {
                                                    axios.get(route('shipment-approvals.project-data', value))
                                                        .then(res => {
                                                            if (res.data) {
                                                                setData(data => ({
                                                                    ...data,
                                                                    project_site_name: value,
                                                                    quantity: res.data.quantity || '',
                                                                    description: res.data.description || '',
                                                                }));
                                                            }
                                                        })
                                                        .catch(err => console.error('Error fetching project data:', err));
                                                }
                                            }}
                                            required
                                        >
                                            <option value="" disabled>Select a Project Site</option>
                                            {projectSiteNames.map((name, index) => (
                                                <option key={index} value={name}>{name}</option>
                                            ))}
                                        </select>
                                        <InputError message={errors.project_site_name} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="sa_number" value="SA#" />
                                        <TextInput
                                            id="sa_number"
                                            type="text"
                                            name="sa_number"
                                            value={data.sa_number}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('sa_number', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.sa_number} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="quantity" value="Quantity" />
                                        <TextInput
                                            id="quantity"
                                            type="number"
                                            name="quantity"
                                            value={data.quantity}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('quantity', e.target.value)}
                                            min="1"
                                            required
                                        />
                                        <InputError message={errors.quantity} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="unit" value="Unit" />
                                        <select
                                            id="unit"
                                            name="unit"
                                            value={data.unit}
                                            className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                            onChange={(e) => setData('unit', e.target.value)}
                                            required
                                        >
                                            <option value="pcs">pcs</option>
                                            <option value="kg">kg</option>
                                        </select>
                                        <InputError message={errors.unit} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="tools_id" value="Tools ID" />
                                        <TextInput
                                            id="tools_id"
                                            type="text"
                                            name="tools_id"
                                            value={data.tools_id}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('tools_id', e.target.value)}
                                        />
                                        <InputError message={errors.tools_id} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="date" value="Date" />
                                        <TextInput
                                            id="date"
                                            type="date"
                                            name="date"
                                            value={data.date}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('date', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.date} className="mt-2" />
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <InputLabel htmlFor="description" value="Description" />
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={data.description}
                                        className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                        rows="4"
                                        onChange={(e) => setData('description', e.target.value)}
                                    />
                                    <InputError message={errors.description} className="mt-2" />
                                </div>

                                <div className="mt-6">
                                    <InputLabel htmlFor="picture" value="Picture" />
                                    <input
                                        id="picture"
                                        type="file"
                                        name="picture"
                                        accept="image/*"
                                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        onChange={(e) => setData('picture', e.target.files[0])}
                                    />
                                    <InputError message={errors.picture} className="mt-2" />
                                </div>

                                <div className="flex items-center justify-end mt-6">
                                    <PrimaryButton className="ml-4" disabled={processing}>
                                        Create Shipment Approval
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
