import { useEffect } from 'react';
import { router } from '@inertiajs/react';

export default function Borrowed() {
    useEffect(() => {
        router.replace('/borrowings');
    }, []);

    return null;
}
