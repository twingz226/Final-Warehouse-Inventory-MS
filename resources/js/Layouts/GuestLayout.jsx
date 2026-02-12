import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center pt-6 sm:justify-center sm:pt-0 relative overflow-hidden"
             style={{
                 backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url("/images/warehouse.jpg")',
                 backgroundSize: 'cover',
                 backgroundPosition: 'center',
                 backgroundRepeat: 'no-repeat',
                 backgroundAttachment: 'fixed'
             }}>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100/30 via-white/30 to-orange-100/30"></div>
            {/* Industrial decorative elements */}
            {/* Gear shapes */}
            <div className="absolute top-10 left-10 w-32 h-32 opacity-20">
                <svg viewBox="0 0 100 100" className="w-full h-full text-blue-600 animate-spin-slow">
                    <path d="M50 10 L55 20 L65 15 L70 25 L80 20 L85 30 L90 40 L85 50 L90 60 L85 70 L80 80 L70 75 L65 85 L55 80 L50 90 L45 80 L35 85 L30 75 L20 80 L15 70 L10 60 L15 50 L10 40 L15 30 L20 20 L30 25 L35 15 L45 20 Z" fill="currentColor"/>
                    <circle cx="50" cy="50" r="20" fill="white"/>
                </svg>
            </div>
            
            {/* Pipe/industrial elements */}
            <div className="absolute bottom-20 right-20 w-40 h-40 opacity-25">
                <svg viewBox="0 0 120 120" className="w-full h-full text-orange-600">
                    <rect x="10" y="40" width="100" height="20" fill="currentColor" rx="10"/>
                    <rect x="10" y="60" width="100" height="20" fill="currentColor" rx="10"/>
                    <circle cx="30" cy="50" r="15" fill="white"/>
                    <circle cx="90" cy="50" r="15" fill="white"/>
                    <circle cx="30" cy="70" r="15" fill="white"/>
                    <circle cx="90" cy="70" r="15" fill="white"/>
                </svg>
            </div>
            
            {/* Technical grid pattern */}
            <div className="absolute top-1/3 left-1/4 w-48 h-48 opacity-15">
                <svg viewBox="0 0 100 100" className="w-full h-full text-gray-600">
                    <defs>
                        <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                        </pattern>
                    </defs>
                    <rect width="100" height="100" fill="url(#grid)"/>
                    <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1"/>
                    <line x1="20" y1="50" x2="80" y2="50" stroke="currentColor" strokeWidth="1"/>
                    <line x1="50" y1="20" x2="50" y2="80" stroke="currentColor" strokeWidth="1"/>
                </svg>
            </div>
            
            {/* 3D cube/box element */}
            <div className="absolute top-2/3 right-1/3 w-36 h-36 opacity-20 transform rotate-12 animate-float">
                <svg viewBox="0 0 100 100" className="w-full h-full text-red-600">
                    <defs>
                        <linearGradient id="cubeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="currentColor" stopOpacity="0.8"/>
                            <stop offset="100%" stopColor="currentColor" stopOpacity="0.4"/>
                        </linearGradient>
                    </defs>
                    {/* Top face */}
                    <path d="M30 20 L70 20 L80 30 L40 30 Z" fill="url(#cubeGradient)"/>
                    {/* Right face */}
                    <path d="M70 20 L70 60 L80 70 L80 30 Z" fill="currentColor" opacity="0.6"/>
                    {/* Front face */}
                    <path d="M30 20 L30 60 L70 60 L70 20 Z" fill="currentColor" opacity="0.8"/>
                </svg>
            </div>
            
            {/* Industrial bolt/nut elements */}
            <div className="absolute bottom-1/4 left-1/3 w-24 h-24 opacity-25 animate-float" style={{animationDelay: '2s'}}>
                <svg viewBox="0 0 100 100" className="w-full h-full text-blue-700">
                    <polygon points="50,20 65,35 65,65 50,80 35,65 35,35" fill="currentColor"/>
                    <polygon points="50,30 58,38 58,62 50,70 42,62 42,38" fill="white"/>
                </svg>
            </div>
            
            <div className="relative z-10">
                <Link href="/">
                    <ApplicationLogo className="h-32 w-32 fill-current text-gray-500" />
                </Link>
            </div>

            <div className="relative z-10 mt-6 w-full overflow-hidden bg-white/80 backdrop-blur-sm px-6 py-4 shadow-lg sm:max-w-md sm:rounded-xl border border-white/20">
                {children}
            </div>
        </div>
    );
}
