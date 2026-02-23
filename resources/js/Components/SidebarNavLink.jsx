import { Link } from '@inertiajs/react';

export default function SidebarNavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={
                'group flex w-full items-center rounded-lg px-3 py-3 text-sm font-semibold transition-all duration-200 ease-in-out ' +
                (active
                    ? 'bg-white/25 text-white shadow-lg border-l-4 border-white'
                    : 'text-white hover:bg-white/15 hover:text-white border-l-4 border-transparent hover:border-white/60') +
                ' ' + className
            }
        >
            {children}
        </Link>
    );
}
