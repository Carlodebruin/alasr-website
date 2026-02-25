'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from './Button';
import { X } from 'lucide-react';

export const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie-consent', 'accepted');
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem('cookie-consent', 'declined');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 z-[100] animate-in fade-in slide-in-from-bottom-10 duration-500 pointer-events-none">
            <div className="max-w-7xl mx-auto bg-gray-900 text-white rounded-2xl shadow-2xl border border-gray-800 p-5 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-xl bg-opacity-95 pointer-events-auto relative">
                <div className="flex-1 text-center md:text-left pr-6">
                    <h3 className="text-lg font-bold mb-1">Privacy Settings</h3>
                    <p className="text-gray-400 text-xs md:text-sm leading-relaxed max-w-2xl">
                        We use cookies to improve your experience. By clicking "Accept All", you consent to our <Link href="/privacy-policy" className="text-primary hover:underline font-semibold">Privacy Policy (POPIA)</Link>.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDecline}
                        className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800 py-2 sm:py-1"
                    >
                        Necessary
                    </Button>
                    <Button
                        variant="primary"
                        size="md"
                        onClick={handleAccept}
                        className="shadow-lg shadow-primary/20 py-2 sm:py-1"
                    >
                        Accept All
                    </Button>
                </div>
                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute top-3 right-3 text-gray-500 hover:text-white transition-colors p-1"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};
