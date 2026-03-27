import { useState, useEffect } from 'react';

export default function ApplicationLogo({ className = '' }) {
    const [logoSrc, setLogoSrc] = useState('/images/warlen.png');

    useEffect(() => {
        fetchCurrentLogo();
    }, []);

    const fetchCurrentLogo = async () => {
        try {
            const response = await fetch('/logo/current');
            const result = await response.json();
            setLogoSrc(result.logo_url);
        } catch (error) {
            console.error('Failed to fetch current logo:', error);
        }
    };

    return (
        <img 
            src={logoSrc}
            alt="Warlen Logo"
            className={`h-20 w-auto ${className}`}
            onError={(e) => {
                e.target.src = '/images/warlen.png';
            }}
        />
    );
}
