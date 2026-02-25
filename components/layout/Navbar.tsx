'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AnnouncementBar } from './AnnouncementBar';

const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Academics', href: '/academics' },
    { name: 'Admissions', href: '/admissions' },
    { name: 'Contact', href: '/contact' },
    { name: 'Donate', href: '/donations' },
];

export const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <AnnouncementBar />
            <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 transition-all duration-300 font-sans">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-24">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <Link href="/" className="flex items-center space-x-2">
                                    <img
                                        src="/beta/images/alasr-logo-new.png"
                                        alt="Al-Asr Educational Institute"
                                        className="h-20 w-auto object-contain"
                                    />
                                </Link>
                            </div>
                            <div className="hidden md:ml-10 md:flex md:space-x-8">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-foreground/80 hover:text-primary border-b-2 border-transparent hover:border-primary transition-all duration-200"
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                        <div className="hidden md:flex items-center space-x-4">
                            <Button
                                variant="primary"
                                size="lg"
                                href="/admissions"
                                className="shadow-md hover:shadow-xl transition-all duration-300 py-3 px-8 text-lg font-bold transform hover:-translate-y-0.5"
                            >
                                Apply Now
                            </Button>
                            <Button
                                variant="secondary"
                                size="lg"
                                href="/donations"
                                className="shadow-md hover:shadow-xl transition-all duration-300 py-3 px-8 text-lg font-bold transform hover:-translate-y-0.5"
                            >
                                Donate
                            </Button>
                        </div>
                        <div className="-mr-2 flex items-center md:hidden">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary transition-colors"
                            >
                                <span className="sr-only">Open main menu</span>
                                {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                {isOpen && (
                    <div className="md:hidden bg-white border-t border-gray-100 shadow-lg absolute w-full">
                        <div className="pt-2 pb-3 space-y-1 px-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="block pl-3 pr-4 py-3 border-l-4 border-transparent text-base font-medium text-gray-600 hover:text-primary hover:bg-gray-50 hover:border-primary transition-all rounded-r-md"
                                    onClick={() => setIsOpen(false)}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="mt-4 space-y-3 pb-6">
                                <Button
                                    variant="primary"
                                    size="lg"
                                    fullWidth
                                    href="/admissions"
                                    className="justify-center shadow-lg py-4 text-xl font-bold"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Apply Now
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="lg"
                                    fullWidth
                                    href="/donations"
                                    className="justify-center shadow-lg py-4 text-xl font-bold"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Donate
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </nav>
        </>
    );
};
