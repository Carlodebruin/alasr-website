'use client';

import { usePathname } from 'next/navigation';
import { Footer } from '@/components/layout/Footer';

export function ConditionalFooter() {
    const pathname = usePathname();

    // Hide footer only on the book/pathway route
    // Next.js basePath /beta is automatically handled by usePathname in most cases, 
    // but we'll check for both just to be safe.
    if (pathname === '/pathway' || pathname === '/pathway/') {
        return null;
    }

    return <Footer />;
}
