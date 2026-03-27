import ApplicationLogo from '@/Components/ApplicationLogo';
import NavLink from '@/Components/NavLink';
import SidebarNavLink from '@/Components/SidebarNavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import ThemeToggle from '@/Components/ThemeToggle';
import { Link, usePage, router } from '@inertiajs/react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);

    return (
        <div className="min-h-screen bg-gray-300/70 dark:bg-gray-900 backdrop-blur-md flex print:bg-white print:dark:bg-white">
            {/* Sidebar - Hidden on mobile, visible on desktop */}
            <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 print:hidden">
                <div className="flex flex-col flex-grow pt-5 bg-blue-600/70 dark:bg-blue-900/80 backdrop-blur-sm border-r border-white/10 dark:border-white/5 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/20 hover:[&::-webkit-scrollbar-thumb]:bg-white/40 [&::-webkit-scrollbar-thumb]:rounded-full shadow-2xl">
                    <div className="flex items-center justify-center flex-shrink-0 px-4 border-b border-white/20 pb-4">
                        <Link href="/logo">
                            <ApplicationLogo className="block h-12 w-auto filter drop-shadow-lg" />
                        </Link>
                    </div>
                    <div className="px-4 pb-4 border-b border-white/20">
                        <h2 className="text-center text-white font-bold text-lg tracking-wide drop-shadow-md">
                            Warlen Warehouse
                        </h2>
                    </div>

                    <nav className="mt-5 flex-1 px-3 flex flex-col gap-1">
                        {/* ── MAIN section ── */}
                        <p className="px-3 pt-2 pb-1 text-xs font-bold uppercase tracking-widest text-white/65 select-none">
                            Main
                        </p>

                        <SidebarNavLink
                            href={route('dashboard')}
                            active={route().current('dashboard')}
                        >
                            <svg className="mr-3 h-5 w-5 flex-shrink-0 text-blue-300 group-hover:text-blue-200 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Dashboard
                        </SidebarNavLink>

                        <SidebarNavLink
                            href={route('inventory.index')}
                            active={route().current('inventory.index')}
                        >
                            <svg className="mr-3 h-5 w-5 flex-shrink-0 text-emerald-300 group-hover:text-emerald-200 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            Inventory
                        </SidebarNavLink>

                        <SidebarNavLink
                            href={route('activity-history.index')}
                            active={route().current('activity-history.index')}
                        >
                            <svg className="mr-3 h-5 w-5 flex-shrink-0 text-amber-300 group-hover:text-amber-200 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Activity Log
                        </SidebarNavLink>

                        <SidebarNavLink
                            href={route('projects.index')}
                            active={route().current('projects.index')}
                        >
                            <svg className="mr-3 h-5 w-5 flex-shrink-0 text-violet-300 group-hover:text-violet-200 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Projects
                        </SidebarNavLink>

                        {/* ── TRANSACTIONS section ── */}
                        <div className="mt-4">
                            <p className="px-3 pb-1 text-xs font-bold uppercase tracking-widest text-white/65 select-none">
                                Transactions
                            </p>

                            {/* Incoming Items */}
                            <SidebarNavLink
                                href={route('arrival.index')}
                                active={route().current('arrival.index')}
                            >
                                <span className="mr-3 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors duration-200">
                                    <svg className="h-4 w-4 text-cyan-300 group-hover:text-cyan-200 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                    </svg>
                                </span>
                                <span className="flex-1">
                                    <span className="block text-base font-medium leading-tight">Incoming Items</span>
                                    <span className="block text-sm text-white/75 group-hover:text-white/90 transition-colors">Manage incoming items</span>
                                </span>
                            </SidebarNavLink>

                            {/* Outgoing Items */}
                            <SidebarNavLink
                                href={route('purchase.index')}
                                active={route().current('purchase.index')}
                            >
                                <span className="mr-3 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors duration-200">
                                    <svg className="h-4 w-4 text-orange-300 group-hover:text-orange-200 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </span>
                                <span className="flex-1">
                                    <span className="block text-base font-medium leading-tight">Outgoing Items</span>
                                    <span className="block text-sm text-white/75 group-hover:text-white/90 transition-colors">Manage distribution orders</span>
                                </span>
                            </SidebarNavLink>

                            {/* Borrowed Items */}
                            <SidebarNavLink
                                href={route('borrowings.index')}
                                active={route().current('borrowings.index')}
                            >
                                <span className="mr-3 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors duration-200">
                                    <svg className="h-4 w-4 text-rose-300 group-hover:text-rose-200 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                    </svg>
                                </span>
                                <span className="flex-1">
                                    <span className="block text-base font-medium leading-tight">Borrowed Items</span>
                                    <span className="block text-sm text-white/75 group-hover:text-white/90 transition-colors">Track borrowed items</span>
                                </span>
                            </SidebarNavLink>

                            {/* Shipment Approval */}
                            <SidebarNavLink
                                href={route('shipment-approvals.index')}
                                active={route().current('shipment-approvals.index')}
                            >
                                <span className="mr-3 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors duration-200">
                                    <svg className="h-4 w-4 text-purple-300 group-hover:text-purple-200 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </span>
                                <span className="flex-1">
                                    <span className="block text-base font-medium leading-tight">Shipment Approval</span>
                                    <span className="block text-sm text-white/75 group-hover:text-white/90 transition-colors">Manage shipment approvals</span>
                                </span>
                            </SidebarNavLink>

                            {/* Item Transaction History */}
                            <SidebarNavLink
                                href={route('item-transaction-history.index')}
                                active={route().current('item-transaction-history.index')}
                            >
                                <span className="mr-3 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors duration-200">
                                    <svg className="h-4 w-4 text-pink-300 group-hover:text-pink-200 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </span>
                                <span className="flex-1">
                                    <span className="block text-base font-medium leading-tight">Item Transaction History</span>
                                    <span className="block text-sm text-white/75 group-hover:text-white/90 transition-colors">View item transactions</span>
                                </span>
                            </SidebarNavLink>
                        </div>
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
                                <div className="text-base font-bold text-white truncate">
                                    {user.name}
                                </div>
                                <div className="text-sm text-white/80 truncate">
                                    {user.email}
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 space-y-2">
                            <ResponsiveNavLink
                                href={route('profile.edit')}
                                className="group flex items-center px-3 py-2.5 text-base font-medium rounded-lg text-white/90 hover:bg-white/20 hover:text-white transition-all duration-200 ease-in-out"
                            >
                                <svg className="mr-3 h-4 w-4 text-slate-300 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Account Settings
                            </ResponsiveNavLink>
                            <button
                                onClick={() => setShowLogoutDialog(true)}
                                className="group flex items-center w-full px-3 py-2.5 text-base font-medium rounded-lg text-white/90 hover:bg-red-500/30 hover:text-white transition-all duration-200 ease-in-out"
                            >
                                <svg className="mr-3 h-4 w-4 text-slate-300 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="md:pl-64 print:pl-0 flex flex-col flex-1 min-w-0 h-screen print:h-auto overflow-y-auto print:overflow-visible [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 dark:[&::-webkit-scrollbar-track]:bg-gray-800 [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 hover:[&::-webkit-scrollbar-thumb]:bg-gray-400 dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-500 [&::-webkit-scrollbar-thumb]:rounded-full">
                {/* Sticky Top Bar */}
                <div className="sticky top-0 z-30 flex flex-col w-full print:hidden">
                    {/* Mobile menu button */}
                    <div className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
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

                {header && (
                    <header className="bg-orange-500 dark:bg-orange-600 shadow">
                        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    {header}
                                </div>
                                <div className="ml-4">
                                    <ThemeToggle />
                                </div>
                            </div>
                        </div>
                    </header>
                )}
            </div>

            {/* Mobile navigation overlay */}
                {showingNavigationDropdown && (
                    <div className="md:hidden fixed inset-0 z-40 flex">
                        <div className="fixed inset-0 bg-black opacity-25 dark:opacity-50" onClick={() => setShowingNavigationDropdown(false)}></div>
                        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-transparent">
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
                            <div className="flex flex-col flex-grow pt-5 bg-blue-600/95 dark:bg-blue-900/95 backdrop-blur-xl border-r border-white/10 dark:border-white/5 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/20 hover:[&::-webkit-scrollbar-thumb]:bg-white/40 [&::-webkit-scrollbar-thumb]:rounded-full shadow-2xl">
                    <div className="flex items-center justify-center flex-shrink-0 px-4 border-b border-white/20 pb-4">
                        <Link href="/logo">
                            <ApplicationLogo className="block h-12 w-auto filter drop-shadow-lg" />
                        </Link>
                    </div>
                    <div className="px-4 pb-4 border-b border-white/20">
                        <h2 className="text-center text-white font-bold text-lg tracking-wide drop-shadow-md">
                            Warlen Warehouse
                        </h2>
                    </div>

                    <nav className="mt-5 flex-1 px-3 flex flex-col gap-1">
                        {/* ── MAIN section ── */}
                        <p className="px-3 pt-2 pb-1 text-xs font-bold uppercase tracking-widest text-white/65 select-none">
                            Main
                        </p>

                        <SidebarNavLink
                            href={route('dashboard')}
                            active={route().current('dashboard')}
                        >
                            <svg className="mr-3 h-5 w-5 flex-shrink-0 text-blue-300 group-hover:text-blue-200 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Dashboard
                        </SidebarNavLink>

                        <SidebarNavLink
                            href={route('inventory.index')}
                            active={route().current('inventory.index')}
                        >
                            <svg className="mr-3 h-5 w-5 flex-shrink-0 text-emerald-300 group-hover:text-emerald-200 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            Inventory
                        </SidebarNavLink>

                        <SidebarNavLink
                            href={route('activity-history.index')}
                            active={route().current('activity-history.index')}
                        >
                            <svg className="mr-3 h-5 w-5 flex-shrink-0 text-amber-300 group-hover:text-amber-200 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Activity Log
                        </SidebarNavLink>

                        <SidebarNavLink
                            href={route('projects.index')}
                            active={route().current('projects.index')}
                        >
                            <svg className="mr-3 h-5 w-5 flex-shrink-0 text-violet-300 group-hover:text-violet-200 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Projects
                        </SidebarNavLink>

                        {/* ── TRANSACTIONS section ── */}
                        <div className="mt-4">
                            <p className="px-3 pb-1 text-xs font-bold uppercase tracking-widest text-white/65 select-none">
                                Transactions
                            </p>

                            {/* Incoming Items */}
                            <SidebarNavLink
                                href={route('arrival.index')}
                                active={route().current('arrival.index')}
                            >
                                <span className="mr-3 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors duration-200">
                                    <svg className="h-4 w-4 text-cyan-300 group-hover:text-cyan-200 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                    </svg>
                                </span>
                                <span className="flex-1">
                                    <span className="block text-base font-medium leading-tight">Incoming Items</span>
                                    <span className="block text-sm text-white/75 group-hover:text-white/90 transition-colors">Manage incoming items</span>
                                </span>
                            </SidebarNavLink>

                            {/* Outgoing Items */}
                            <SidebarNavLink
                                href={route('purchase.index')}
                                active={route().current('purchase.index')}
                            >
                                <span className="mr-3 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors duration-200">
                                    <svg className="h-4 w-4 text-orange-300 group-hover:text-orange-200 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </span>
                                <span className="flex-1">
                                    <span className="block text-base font-medium leading-tight">Outgoing Items</span>
                                    <span className="block text-sm text-white/75 group-hover:text-white/90 transition-colors">Manage distribution orders</span>
                                </span>
                            </SidebarNavLink>

                            {/* Borrowed Items */}
                            <SidebarNavLink
                                href={route('borrowings.index')}
                                active={route().current('borrowings.index')}
                            >
                                <span className="mr-3 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors duration-200">
                                    <svg className="h-4 w-4 text-rose-300 group-hover:text-rose-200 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                    </svg>
                                </span>
                                <span className="flex-1">
                                    <span className="block text-base font-medium leading-tight">Borrowed Items</span>
                                    <span className="block text-sm text-white/75 group-hover:text-white/90 transition-colors">Track borrowed items</span>
                                </span>
                            </SidebarNavLink>

                            {/* Shipment Approval */}
                            <SidebarNavLink
                                href={route('shipment-approvals.index')}
                                active={route().current('shipment-approvals.index')}
                            >
                                <span className="mr-3 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors duration-200">
                                    <svg className="h-4 w-4 text-purple-300 group-hover:text-purple-200 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                </span>
                                <span className="flex-1">
                                    <span className="block text-base font-medium leading-tight">Shipment Approval</span>
                                    <span className="block text-sm text-white/75 group-hover:text-white/90 transition-colors">Manage shipment approvals</span>
                                </span>
                            </SidebarNavLink>

                            {/* Item Transaction History */}
                            <SidebarNavLink
                                href={route('item-transaction-history.index')}
                                active={route().current('item-transaction-history.index')}
                            >
                                <span className="mr-3 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors duration-200">
                                    <svg className="h-4 w-4 text-pink-300 group-hover:text-pink-200 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </span>
                                <span className="flex-1">
                                    <span className="block text-base font-medium leading-tight">Item Transaction History</span>
                                    <span className="block text-sm text-white/75 group-hover:text-white/90 transition-colors">View item transactions</span>
                                </span>
                            </SidebarNavLink>
                        </div>
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
                                <div className="text-base font-bold text-white truncate">
                                    {user.name}
                                </div>
                                <div className="text-sm text-white/80 truncate">
                                    {user.email}
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 space-y-2">
                            <ResponsiveNavLink
                                href={route('profile.edit')}
                                className="group flex items-center px-3 py-2.5 text-base font-medium rounded-lg text-white/90 hover:bg-white/20 hover:text-white transition-all duration-200 ease-in-out"
                            >
                                <svg className="mr-3 h-4 w-4 text-slate-300 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Account Settings
                            </ResponsiveNavLink>
                            <button
                                onClick={() => setShowLogoutDialog(true)}
                                className="group flex items-center w-full px-3 py-2.5 text-base font-medium rounded-lg text-white/90 hover:bg-red-500/30 hover:text-white transition-all duration-200 ease-in-out"
                            >
                                <svg className="mr-3 h-4 w-4 text-slate-300 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
                        </div>
                    </div>
                )}



                <main className="flex-1">{children}</main>
            </div>

            {/* Logout Confirmation Dialog */}
            {showLogoutDialog && (
                <div className="fixed inset-0 z-50 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-black/20 dark:[&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div
                            className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 transition-opacity"
                            onClick={() => setShowLogoutDialog(false)}
                        ></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 sm:mx-0 sm:h-10 sm:w-10">
                                        <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                    </div>
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-gray-100">
                                            Confirm Sign Out
                                        </h3>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Are you sure you want to sign out? You will need to sign in again to access your account.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    onClick={() => {
                                        router.post(route('logout'));
                                        setShowLogoutDialog(false);
                                    }}
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 dark:bg-red-700 text-base font-medium text-white hover:bg-red-700 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-red-600 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    Sign Out
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowLogoutDialog(false)}
                                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-600 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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
