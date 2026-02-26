import { useState } from 'react';
import { router } from '@inertiajs/react';
import Modal from './Modal';
import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';

export default function ImportModal({ show, onClose }) {
    const [file, setFile] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setErrors({});
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!file) {
            setErrors({ file: 'Please select a file to import.' });
            return;
        }

        setProcessing(true);
        setErrors({});

        const formData = new FormData();
        formData.append('file', file);

        router.post(route('items.import'), formData, {
            onSuccess: () => {
                setProcessing(false);
                setFile(null);
                onClose();
            },
            onError: (errors) => {
                setProcessing(false);
                setErrors(errors);
            },
            onFinish: () => {
                setProcessing(false);
            },
        });
    };

    return (
        <Modal show={show} onClose={onClose}>
            <form onSubmit={handleSubmit} className="p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Import Items from Excel
                </h2>

                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Upload an Excel file (.xlsx or .xls) with columns: Name, Description, Category, Quantity, Unit, Date & Time
                </p>

                <div className="mt-6">
                    <label htmlFor="file" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Excel File
                    </label>
                    <input
                        id="file"
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileChange}
                        className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-indigo-50 file:text-indigo-700
                            dark:file:bg-indigo-900 dark:file:text-indigo-300
                            hover:file:bg-indigo-100 dark:hover:file:bg-indigo-800"
                        disabled={processing}
                    />
                    {errors.file && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.file}</p>
                    )}
                    {errors.import && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.import}</p>
                    )}
                </div>

                <div className="mt-6 flex justify-end">
                    <SecondaryButton onClick={onClose} disabled={processing}>
                        Cancel
                    </SecondaryButton>
                    <PrimaryButton className="ml-3" disabled={processing || !file}>
                        {processing ? 'Importing...' : 'Import'}
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}
