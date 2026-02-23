import { useState, useEffect } from 'react';

export default function ThemeToggle() {
    const [isDark, setIsDark] = useState(() => {
        // Check localStorage and system preference
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('theme');
            if (stored) {
                return stored === 'dark';
            }
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    });

    const [animating, setAnimating] = useState(false);

    useEffect(() => {
        const root = window.document.documentElement;
        if (isDark) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    useEffect(() => {
        if (animating) {
            const timer = setTimeout(() => setAnimating(false), 300);
            return () => clearTimeout(timer);
        }
    }, [animating]);

    const toggleTheme = () => {
        setAnimating(true);
        setIsDark(!isDark);
    };

    return (
        <>
            <style>{`
            @keyframes electric-flicker-sun {
                0%   { box-shadow: 0 0 4px 1px #fbbf24, 0 0 10px 2px #f59e0b; opacity: 1; }
                10%  { box-shadow: 0 0 2px 1px #fbbf24, 0 0 5px 1px #f59e0b;  opacity: 0.82; }
                25%  { box-shadow: 0 0 8px 3px #fde68a, 0 0 18px 5px #f59e0b; opacity: 1; }
                40%  { box-shadow: 0 0 2px 1px #fbbf24, 0 0 4px 1px #f59e0b;  opacity: 0.78; }
                55%  { box-shadow: 0 0 10px 4px #fde68a, 0 0 22px 6px #f59e0b;opacity: 1; }
                70%  { box-shadow: 0 0 2px 1px #fbbf24, 0 0 5px 1px #f59e0b;  opacity: 0.85; }
                85%  { box-shadow: 0 0 7px 3px #fde68a, 0 0 16px 4px #f59e0b; opacity: 1; }
                100% { box-shadow: 0 0 4px 1px #fbbf24, 0 0 10px 2px #f59e0b; opacity: 1; }
            }
            @keyframes electric-flicker-moon {
                0%   { box-shadow: 0 0 4px 1px #818cf8, 0 0 10px 2px #6366f1; opacity: 1; }
                10%  { box-shadow: 0 0 2px 1px #818cf8, 0 0 5px 1px #6366f1;  opacity: 0.82; }
                25%  { box-shadow: 0 0 8px 3px #a5b4fc, 0 0 18px 5px #6366f1; opacity: 1; }
                40%  { box-shadow: 0 0 2px 1px #818cf8, 0 0 4px 1px #6366f1;  opacity: 0.78; }
                55%  { box-shadow: 0 0 10px 4px #c7d2fe, 0 0 22px 6px #6366f1;opacity: 1; }
                70%  { box-shadow: 0 0 2px 1px #818cf8, 0 0 5px 1px #6366f1;  opacity: 0.85; }
                85%  { box-shadow: 0 0 7px 3px #a5b4fc, 0 0 16px 4px #6366f1; opacity: 1; }
                100% { box-shadow: 0 0 4px 1px #818cf8, 0 0 10px 2px #6366f1; opacity: 1; }
            }
            .electric-theme-sun:hover  { animation: electric-flicker-sun  0.2s step-end infinite; }
            .electric-theme-moon:hover { animation: electric-flicker-moon 0.2s step-end infinite; }
        `}</style>
            <button
                onClick={toggleTheme}
                className={`${isDark ? 'electric-theme-sun' : 'electric-theme-moon'} flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${animating ? 'animate-spin' : ''}`}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
                {isDark ? (
                    // Sun icon for light mode
                    <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                    </svg>
                ) : (
                    // Moon icon for dark mode
                    <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                )}
            </button>
        </>
    );
}
