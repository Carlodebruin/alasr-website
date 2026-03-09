import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin, Instagram, Facebook } from 'lucide-react';
import { siteConfig } from '@/config/site';

export const Footer = () => {
    return (
        <footer className="bg-primary text-white border-t border-white/10 font-sans">
            <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="col-span-1 md:col-span-1">
                        <Link href="/" className="inline-block group">
                            <img
                                src="/images/alasr-logo-light-new.png"
                                alt={siteConfig.siteName}
                                className="h-24 w-auto mb-2 object-contain object-left opacity-90 group-hover:opacity-100 transition-opacity"
                            />
                        </Link>
                        <p className="mb-6 text-secondary text-sm italic font-light">
                            "Teach them the book and the wisdom..."
                        </p>
                        <p className="mt-6 text-white/70 text-sm leading-relaxed">
                            Excellence in Education. Nurturing the leaders of tomorrow with Islamic values and academic distinction.
                        </p>
                        <div className="mt-8 flex space-x-6">
                            <a href={siteConfig.instagramUrl} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors">
                                <span className="sr-only">Instagram</span>
                                <Instagram className="h-6 w-6" />
                            </a>
                            {/* Assuming siteConfig.facebookUrl exists or will be added */}
                            <a href={siteConfig.facebookUrl} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors">
                                <span className="sr-only">Facebook</span>
                                <Facebook className="h-6 w-6" />
                            </a>
                        </div>

                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">Quick Links</h3>
                        <ul className="mt-6 space-y-4">
                            <li><Link href="/about" className="text-base text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                            <li><Link href="/academics" className="text-base text-gray-400 hover:text-white transition-colors">Academics</Link></li>
                            <li><Link href="/admissions" className="text-base text-gray-400 hover:text-white transition-colors">Admissions</Link></li>
                            <li><Link href="/contact" className="text-base text-gray-400 hover:text-white transition-colors">Contact</Link></li>
                            <li><Link href="/donations" className="text-base text-gray-400 hover:text-white transition-colors">Donate</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">Support</h3>
                        <ul className="mt-6 space-y-4">
                            <li><Link href="/privacy-policy" className="text-base text-gray-400 hover:text-white transition-colors">Privacy Policy (POPIA)</Link></li>
                            <li><Link href="/cookie-policy" className="text-base text-gray-400 hover:text-white transition-colors">Cookie Policy</Link></li>
                            <li><Link href="/terms-of-service" className="text-base text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">Contact</h3>
                        <ul className="mt-6 space-y-4">
                            <li className="flex items-start">
                                <MapPin className="h-6 w-6 text-primary mr-3 flex-shrink-0" />
                                <span className="text-base text-gray-400">{siteConfig.address}</span>
                            </li>
                            <li className="flex items-center">
                                <Phone className="h-6 w-6 text-primary mr-3 flex-shrink-0" />
                                <span className="text-base text-gray-400">{siteConfig.contactPhone}</span>
                            </li>
                            <li className="flex items-center">
                                <Mail className="h-6 w-6 text-primary mr-3 flex-shrink-0" />
                                <a href={`mailto:${siteConfig.contactEmail}`} className="text-base text-gray-400 hover:text-white transition-colors">{siteConfig.contactEmail}</a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="mt-12 border-t border-gray-800 pt-8 md:flex md:items-center md:justify-between">
                    <p className="text-base text-gray-500">&copy; {new Date().getFullYear()} {siteConfig.siteName}. All rights reserved.</p>
                    <div className="flex space-x-8 items-center mt-6 md:mt-0">
                        <img
                            src="/images/umalusi-new.png"
                            alt="Umalusi Accredited"
                            className="h-20 w-auto object-contain brightness-0 invert opacity-80 hover:opacity-100 transition-opacity"
                        />
                        <img
                            src="/images/gauteng-department-of-education-new.png"
                            alt="Gauteng Department of Education"
                            className="h-20 w-auto object-contain brightness-0 invert opacity-80 hover:opacity-100 transition-opacity"
                        />
                    </div>
                </div>
            </div>
        </footer>
    );
};
