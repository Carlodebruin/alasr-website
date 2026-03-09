'use client';

import Link from 'next/link';
import { ArrowRight, Moon } from 'lucide-react';

export const AnnouncementBar = () => {
    return (
        <div className="bg-primary text-white py-3 px-4 relative overflow-hidden group no-print">
            <div className="absolute inset-0 bg-secondary/10 group-hover:bg-secondary/20 transition-colors"></div>
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center relative z-10 text-center gap-2">
                <div className="flex items-center space-x-2 text-sm md:text-base font-medium">
                    <Moon className="h-4 w-4 md:h-5 md:w-5 text-secondary animate-pulse flex-shrink-0" />
                    <span>
                        <span className="font-bold text-secondary uppercase tracking-tight">Ramadan Appeal:</span>
                        <span className="ml-1 hidden sm:inline">Support our students and fulfill your Zakaat.</span>
                        <span className="ml-1 sm:hidden">Support our students.</span>
                    </span>
                </div>
                <Link
                    href="/donations"
                    className="inline-flex items-center text-secondary hover:text-white underline underline-offset-4 decoration-secondary/30 hover:decoration-white transition-all font-bold text-sm md:text-base whitespace-nowrap"
                >
                    Donate <ArrowRight className="ml-1 h-3 w-3 md:h-4 md:w-4" />
                </Link>
            </div>
        </div>
    );
};
