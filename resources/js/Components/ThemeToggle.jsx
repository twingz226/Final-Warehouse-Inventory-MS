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
    const [showTooltip, setShowTooltip] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState('center');

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

    const handleMouseEnter = (e) => {
        setShowTooltip(true);
        
        // Calculate tooltip position to prevent overflow
        const buttonRect = e.currentTarget.getBoundingClientRect();
        const tooltipWidth = 120; // Approximate tooltip width
        const spaceOnRight = window.innerWidth - buttonRect.right;
        const spaceOnLeft = buttonRect.left;
        
        if (spaceOnRight < tooltipWidth && spaceOnLeft > tooltipWidth) {
            setTooltipPosition('right');
        } else if (spaceOnLeft < tooltipWidth && spaceOnRight > tooltipWidth) {
            setTooltipPosition('left');
        } else {
            setTooltipPosition('center');
        }
    };

    return (
        <>
            <div className="relative inline-block">
                <button
                    onClick={toggleTheme}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={() => setShowTooltip(false)}
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
                {showTooltip && (
                    <div className={`absolute top-full mt-2 px-2 py-1 text-xs text-white bg-gray-900 dark:bg-gray-100 dark:text-gray-900 rounded whitespace-nowrap z-50 ${
                        tooltipPosition === 'right' ? 'right-0' : 
                        tooltipPosition === 'left' ? 'left-0' : 
                        'left-1/2 transform -translate-x-1/2'
                    }`}>
                        {isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                        <div className={`absolute top-0 -mt-1 ${
                            tooltipPosition === 'right' ? 'right-2' : 
                            tooltipPosition === 'left' ? 'left-2' : 
                            'left-1/2 transform -translate-x-1/2'
                        }`}>
                            <div className="border-4 border-transparent border-b-gray-900 dark:border-b-gray-100"></div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
