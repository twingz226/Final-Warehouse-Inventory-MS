import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import axios from 'axios';
import { useState, useEffect } from 'react';

export default function Form({ auth, projectSiteNames = [] }) {
    const [projectItems, setProjectItems] = useState([]);
    const [dateFilter, setDateFilter] = useState('');
    const { data, setData, post, processing, errors, reset } = useForm({
        project_site_name: '',
        sa_number: '',
        tools_id: '',
        description: '',
        picture: [],
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('shipment-approvals.store'));
    };

    const filteredProjectItems = dateFilter
        ? projectItems.filter(item => {
            const d = new Date(item.purchase_date || item.created_at);
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            const localDateStr = `${yyyy}-${mm}-${dd}`;
            return localDateStr === dateFilter;
        })
        : projectItems;

    useEffect(() => {
        if (data.project_site_name || projectItems.length > 0) {
            const itemNames = filteredProjectItems.map(item => item.item_name).filter(Boolean).join(', ');
            setData('description', itemNames);
        }
    }, [dateFilter, projectItems]);

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
                                {projectItems.length > 0 && (
                                    <div className="mb-8">
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Items Distributed to Selected Project</h3>
                                        <div className="overflow-x-auto bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 shadow-sm rounded-lg p-0">
                                            <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                                                <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-800 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                                                    <tr>
                                                        <th className="px-4 py-3">Item/Tool Name</th>
                                                        <th className="px-4 py-3">Quantity</th>
                                                        <th className="px-4 py-3">
                                                            <div className="flex items-center space-x-2">
                                                                <span>Date Distributed</span>
                                                                <input
                                                                    type="date"
                                                                    className="text-xs border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 font-normal py-1 px-2 cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                                                                    value={dateFilter}
                                                                    onChange={(e) => setDateFilter(e.target.value)}
                                                                />
                                                            </div>
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredProjectItems.length > 0 ? (
                                                        filteredProjectItems.map((item, index) => (
                                                            <tr key={item.id || index} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                                                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{item.item_name}</td>
                                                                <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                                                                    {item.quantity} {item.unit === 'Quantity' ? 'pcs' : (item.unit ? item.unit.toLowerCase() : '')}
                                                                </td>
                                                                <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                                                                    {new Date(item.purchase_date || item.created_at).toLocaleDateString()}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="3" className="px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                                                No items found for the selected date.
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
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
                                                            if (Array.isArray(res.data)) {
                                                                setProjectItems(res.data);
                                                                setDateFilter('');
                                                                setData(prevData => ({
                                                                    ...prevData,
                                                                    project_site_name: value
                                                                }));
                                                            }
                                                        })
                                                        .catch(err => console.error('Error fetching project data:', err));
                                                } else {
                                                    setProjectItems([]);
                                                    setDateFilter('');
                                                    setData('description', '');
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
                                        multiple
                                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        onChange={(e) => setData('picture', Array.from(e.target.files))}
                                    />
                                    <InputError message={errors.picture} className="mt-2" />
                                    {Object.keys(errors)
                                        .filter(key => key.startsWith('picture.'))
                                        .map(key => (
                                            <InputError key={key} message={errors[key]} className="mt-2" />
                                        ))}
                                    {data.picture && data.picture.length > 0 && (
                                        <div className="mt-2 text-sm text-gray-500">
                                            {data.picture.length} file(s) selected
                                        </div>
                                    )}
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
