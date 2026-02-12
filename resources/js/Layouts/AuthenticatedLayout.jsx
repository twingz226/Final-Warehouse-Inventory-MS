import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import SidebarNavLink from '@/Components/SidebarNavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage, router } from '@inertiajs/react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar - Hidden on mobile, visible on desktop */}
            <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
                <div className="flex flex-col flex-grow pt-5 bg-gradient-to-b from-indigo-600 via-purple-600 to-pink-600 overflow-y-auto shadow-2xl">
                    <div className="flex items-center justify-center flex-shrink-0 px-4 border-b border-white/20 pb-4">
                        <Link href="/">
                            <ApplicationLogo className="block h-12 w-auto filter drop-shadow-lg" />
                        </Link>
                    </div>
                    <div className="px-4 pb-4 border-b border-white/20">
                        <h2 className="text-center text-white font-bold text-lg tracking-wide drop-shadow-md">
                            Warlen Warehouse
                        </h2>
                    </div>
                    
                    <nav className="mt-8 flex-1 px-3 space-y-2">
                        <SidebarNavLink
                            href={route('dashboard')}
                            active={route().current('dashboard')}
                        >
                            <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Dashboard
                        </SidebarNavLink>
                        <SidebarNavLink
                            href={route('inventory.index')}
                            active={route().current('inventory.index')}
                        >
                            <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            Inventory Management
                        </SidebarNavLink>
                        <SidebarNavLink
                            href={route('activity-history.index')}
                            active={route().current('activity-history.index')}
                        >
                            <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Activity History
                        </SidebarNavLink>
                        <Dropdown>
                            <Dropdown.Trigger>
                                <div className="group flex w-full items-center rounded-lg px-3 py-3 text-sm font-medium transition-all duration-300 ease-in-out text-white/90 hover:bg-gradient-to-r hover:from-white/20 hover:to-white/10 hover:text-white hover:shadow-lg hover:border-l-4 border-l-4 border-transparent hover:border-white/70 cursor-pointer backdrop-blur-sm">
                                    <svg className="mr-3 h-5 w-5 text-white/80 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                    <span className="flex-1">Record Tools & Materials</span>
                                    <svg className="ml-2 h-4 w-4 text-white/60 group-hover:text-white transition-all duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </Dropdown.Trigger>
                            <Dropdown.Content align="left" width="56" contentClasses="py-2 bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-md border border-white/20 shadow-2xl">
                                
                                <Dropdown.Link href={route('arrival.index')} className="group flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-700 transition-all duration-200 border-l-2 border-transparent hover:border-indigo-400">
                                    <div className="flex items-center w-full">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 group-hover:from-indigo-200 group-hover:to-purple-200 transition-all duration-200 mr-3">
                                            <svg className="h-4 w-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium">Arrival</div>
                                            <div className="text-xs text-gray-500">Manage incoming items</div>
                                        </div>
                                        <svg className="h-4 w-4 text-gray-400 group-hover:text-indigo-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </Dropdown.Link>
                                <Dropdown.Link href={route('purchase.index')} className="group flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-700 transition-all duration-200 border-l-2 border-transparent hover:border-purple-400">
                                    <div className="flex items-center w-full">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 group-hover:from-purple-200 group-hover:to-pink-200 transition-all duration-200 mr-3">
                                            <svg className="h-4 w-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium">Distribution</div>
                                            <div className="text-xs text-gray-500">Manage distribution orders</div>
                                        </div>
                                        <svg className="h-4 w-4 text-gray-400 group-hover:text-purple-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </nav>

                    {/* User menu in sidebar */}
                    <div className="flex-shrink-0 border-t border-white/20 bg-white/10 backdrop-blur-sm p-4">
                        <div className="flex items-center space-x-3">
                            <div className="relative">
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg ring-2 ring-white/50">
                                    <span className="text-white text-sm font-bold">
                                        {user.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold text-white truncate">
                                    {user.name}
                                </div>
                                <div className="text-xs text-white/80 truncate">
                                    {user.email}
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 space-y-2">
                            <ResponsiveNavLink 
                                href={route('profile.edit')}
                                className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-white/90 hover:bg-white/20 hover:text-white transition-all duration-200 ease-in-out"
                            >
                                <svg className="mr-3 h-4 w-4 text-white/70 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Profile
                            </ResponsiveNavLink>
                            <button
                                onClick={() => setShowLogoutDialog(true)}
                                className="group flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg text-white/90 hover:bg-red-500/30 hover:text-white transition-all duration-200 ease-in-out"
                            >
                                <svg className="mr-3 h-4 w-4 text-white/70 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Log Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="md:pl-64 flex flex-col flex-1">
                {/* Mobile menu button */}
                <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3">
                    <button
                        onClick={() =>
                            setShowingNavigationDropdown(
                                (previousState) => !previousState,
                            )
                        }
                        className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none"
                    >
                        <svg
                            className="h-6 w-6"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <path
                                className={
                                    !showingNavigationDropdown
                                        ? 'inline-flex'
                                        : 'hidden'
                                }
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                            <path
                                className={
                                    showingNavigationDropdown
                                        ? 'inline-flex'
                                        : 'hidden'
                                }
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Mobile navigation overlay */}
                {showingNavigationDropdown && (
                    <div className="md:hidden fixed inset-0 z-40 flex">
                        <div className="fixed inset-0 bg-black opacity-25" onClick={() => setShowingNavigationDropdown(false)}></div>
                        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
                            <div className="absolute top-0 right-0 -mr-12 pt-2">
                                <button
                                    onClick={() => setShowingNavigationDropdown(false)}
                                    className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                                >
                                    <svg className="h-6 w-6 text-white" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                                <div className="flex-shrink-0 flex items-center justify-center px-4">
                                    <ApplicationLogo className="block h-8 w-auto fill-current text-gray-800" />
                                </div>
                                <nav className="mt-5 px-2 space-y-1">
                                    <ResponsiveNavLink
                                        href={route('dashboard')}
                                        active={route().current('dashboard')}
                                    >
                                        Dashboard
                                    </ResponsiveNavLink>
                                    <ResponsiveNavLink
                                        href={route('inventory.index')}
                                        active={route().current('inventory.index')}
                                    >
                                        Inventory Management
                                    </ResponsiveNavLink>
                                    <Dropdown>
                                    <Dropdown.Trigger>
                                        <div className="group flex items-center w-full rounded-lg px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:via-purple-50 hover:to-pink-50 hover:text-indigo-700 transition-all duration-300 ease-in-out cursor-pointer shadow-sm hover:shadow-md border border-gray-200 hover:border-indigo-300">
                                            <svg className="mr-3 h-5 w-5 text-gray-500 group-hover:text-indigo-600 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                            </svg>
                                            <span className="flex-1">Record Tools & Materials</span>
                                            <svg className="ml-2 h-4 w-4 text-gray-400 group-hover:text-indigo-600 transition-all duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </Dropdown.Trigger>
                                    <Dropdown.Content align="left" width="56" contentClasses="py-2 bg-gradient-to-br from-white via-white to-gray-50 backdrop-blur-md border border-gray-200 shadow-xl">
                                        <div className="px-3 py-2 border-b border-gray-100">
                                            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Menu Options</p>
                                        </div>
                                        <Dropdown.Link href={route('arrival.index')} className="group flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-700 transition-all duration-200 border-l-2 border-transparent hover:border-indigo-400">
                                            <div className="flex items-center w-full">
                                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 group-hover:from-indigo-200 group-hover:to-purple-200 transition-all duration-200 mr-3">
                                                    <svg className="h-4 w-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-medium">Arrival</div>
                                                    <div className="text-xs text-gray-500">Manage incoming items</div>
                                                </div>
                                                <svg className="h-4 w-4 text-gray-400 group-hover:text-indigo-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </Dropdown.Link>
                                        <Dropdown.Link href={route('purchase.index')} className="group flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:text-purple-700 transition-all duration-200 border-l-2 border-transparent hover:border-purple-400">
                                            <div className="flex items-center w-full">
                                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 group-hover:from-purple-200 group-hover:to-pink-200 transition-all duration-200 mr-3">
                                                    <svg className="h-4 w-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-medium">Distribution</div>
                                                    <div className="text-xs text-gray-500">Manage distribution orders</div>
                                                </div>
                                                <svg className="h-4 w-4 text-gray-400 group-hover:text-purple-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                                </nav>
                            </div>
                            <div className="flex-shrink-0 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white p-4">
                                <div className="flex items-center space-x-3">
                                    <div className="relative">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg ring-2 ring-white">
                                            <span className="text-white text-sm font-semibold">
                                                {user.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-400 rounded-full border-2 border-white"></div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-base font-semibold text-gray-900 truncate">
                                            {user.name}
                                        </div>
                                        <div className="text-sm text-gray-500 truncate">
                                            {user.email}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 space-y-1">
                                    <ResponsiveNavLink 
                                        href={route('profile.edit')}
                                        className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-700 transition-all duration-200 ease-in-out"
                                    >
                                        <svg className="mr-3 h-4 w-4 text-gray-400 group-hover:text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        Profile
                                    </ResponsiveNavLink>
                                    <button
                                        onClick={() => setShowLogoutDialog(true)}
                                        className="group flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-700 transition-all duration-200 ease-in-out"
                                    >
                                        <svg className="mr-3 h-4 w-4 text-gray-400 group-hover:text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Log Out
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {header && (
                    <header className="bg-orange-500 shadow">
                        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                            {header}
                        </div>
                    </header>
                )}

                <main className="flex-1">{children}</main>
            </div>
            
            {/* Logout Confirmation Dialog */}
            {showLogoutDialog && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div 
                            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                            onClick={() => setShowLogoutDialog(false)}
                        ></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                                            Confirm Logout
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                Are you sure you want to log out? You will need to sign in again to access your account.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    onClick={() => {
                                        router.post(route('logout'));
                                        setShowLogoutDialog(false);
                                    }}
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Log Out
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowLogoutDialog(false)}
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
