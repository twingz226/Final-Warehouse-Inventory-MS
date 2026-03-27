import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';

export default function LogoIndex() {
    const [currentLogo, setCurrentLogo] = useState('/images/warlen.png');
    const [preview, setPreview] = useState(null);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        logo: null,
    });

    useEffect(() => {
        fetchCurrentLogo();
    }, []);

    const fetchCurrentLogo = async () => {
        try {
            const response = await fetch('/logo/current');
            const result = await response.json();
            setCurrentLogo(result.logo_url);
        } catch (error) {
            console.error('Failed to fetch current logo:', error);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('logo', file);
            
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('logo', data.logo);
        
        post('/logo/update', {
            onSuccess: () => {
                alert('Logo updated successfully!');
                fetchCurrentLogo(); // Refresh the logo
                setPreview(null);
                reset();
            },
            onError: (errors) => {
                Object.values(errors).forEach(error => {
                    alert(error);
                });
            }
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Logo Management" />
            
            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-6">
                                Logo Management
                            </h2>
                            
                            <div className="space-y-8">
                                {/* Current Logo Display */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">
                                        Current Logo
                                    </h3>
                                    <div className="flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <img 
                                            src={currentLogo} 
                                            alt="Current Logo" 
                                            className="h-32 w-auto object-contain"
                                            onError={(e) => {
                                                e.target.src = '/images/warlen.png';
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Upload Form */}
                                <div>
                                    <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">
                                        Upload New Logo
                                    </h3>
                                    
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {/* File Input */}
                                        <div>
                                            <label htmlFor="logo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Choose Logo Image
                                            </label>
                                            <input
                                                type="file"
                                                id="logo"
                                                name="logo"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="block w-full text-sm text-gray-500
                                                    file:mr-4 file:py-2 file:px-4
                                                    file:rounded-full file:border-0
                                                    file:text-sm file:font-semibold
                                                    file:bg-indigo-50 file:text-indigo-700
                                                    hover:file:bg-indigo-100
                                                    dark:file:bg-indigo-900 dark:file:text-indigo-200
                                                    dark:hover:file:bg-indigo-800"
                                            />
                                            {errors.logo && (
                                                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                                                    {errors.logo}
                                                </p>
                                            )}
                                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                                Supported formats: JPEG, PNG, GIF, SVG. Maximum size: 2MB.
                                            </p>
                                        </div>

                                        {/* Preview */}
                                        {preview && (
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Preview
                                                </h4>
                                                <div className="flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                                    <img 
                                                        src={preview} 
                                                        alt="Logo Preview" 
                                                        className="h-32 w-auto object-contain"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Submit Button */}
                                        <div className="flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={processing || !data.logo}
                                                className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition ease-in-out duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {processing ? 'Updating...' : 'Update Logo'}
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                {/* Instructions */}
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                                        Instructions
                                    </h4>
                                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
                                        <li>Upload a new logo to replace the current one</li>
                                        <li>The logo will be displayed in the sidebar and other areas</li>
                                        <li>Recommended size: 200x80 pixels or similar aspect ratio</li>
                                        <li>Transparent backgrounds work best for PNG/SVG files</li>
                                        <li>The old logo will be automatically replaced</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
