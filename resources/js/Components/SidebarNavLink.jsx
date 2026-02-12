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
                'group flex w-full items-center rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 ease-in-out ' +
                (active
                    ? 'bg-white/20 text-white shadow-lg border-l-4 border-white'
                    : 'text-white/80 hover:bg-white/10 hover:text-white border-l-4 border-transparent hover:border-white/50') +
                ' ' + className
            }
        >
            {children}
        </Link>
    );
}
