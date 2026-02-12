import { useEffect } from 'react';
import { router } from '@inertiajs/react';

export default function Purchase() {
    useEffect(() => {
        router.replace('/purchases');
    }, []);

    return null;
}
