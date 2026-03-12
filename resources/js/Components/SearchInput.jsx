import { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function SearchInput() {
    const [value, setValue] = useState('');
    const timeoutRef = useRef(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setValue(params.get('search') || '');
    }, []);

    const performSearch = (searchValue) => {
        console.log('Performing search for:', searchValue);
        const params = new URLSearchParams(window.location.search);
        if (searchValue) {
            params.set('search', searchValue);
        } else {
            params.delete('search');
        }
        params.delete('date');
        params.set('page', '1');
        const url = `${window.location.pathname}?${params.toString()}`;
        console.log('Search URL:', url);
        router.get(url, {}, { 
            preserveScroll: true,
            preserveState: true
        });
    };

    const handleChange = (e) => {
        const newValue = e.target.value;
        setValue(newValue);

        // Clear existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Debounce - search after 500ms of no typing
        timeoutRef.current = setTimeout(() => {
            performSearch(newValue);
        }, 500);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Clear any pending debounce
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        performSearch(value);
    };

    const handleClear = () => {
        setValue('');
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        performSearch('');
    };

    return (
        <form action="" method="GET" onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                    type="text"
                    name="search"
                    value={value}
                    onChange={handleChange}
                    placeholder="Search tools and materials..."
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-500 dark:focus:border-indigo-400 sm:text-sm"
                />
                {value && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                        <svg className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>
            <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-800"
            >
                Search
            </button>
        </form>
    );
}
