import { Head, Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function Welcome({ canLogin }) {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="absolute inset-0" style={{backgroundImage: 'linear-gradient(to bottom right, #fed7aa, #dbeafe)'}}></div>
            <Head>
                <title>Welcome - Deka Sales Inventory</title>
                <meta name="description" content="Welcome to Deka Sales Inventory System" />
            </Head>
            
            <div className="w-full max-w-md">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                    {/* Logo Section */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-center">
                        <div className="flex justify-center mb-2">
                            <ApplicationLogo className="h-16 w-auto mx-auto text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white">Deka Sales Inventory</h1>
                        <p className="text-blue-100 mt-1">Manage your inventory with ease</p>
                    </div>
                    
                    {/* Content */}
                    <div className="p-8 text-center">
                        <p className="text-gray-600 mb-6">
                            Welcome to the Deka Sales Inventory System. Sign in to access your dashboard and manage your inventory.
                        </p>
                        
                        {canLogin && (
                            <Link
                                href={route('login')}
                                className="inline-flex items-center rounded-md border border-transparent bg-gray-800 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-150 ease-in-out"
                            >
                                Sign In to Your Account
                            </Link>
                        )}
                    </div>
                    
                    {/* Footer */}
                    <div className="bg-gray-50 px-6 py-4 text-center border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                            © {new Date().getFullYear()} Deka Sales Inventory. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
