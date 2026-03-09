import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@/components/ui/Button";

export const HeroSection = () => {
    return (
        <section className="relative bg-gradient-to-br from-primary via-[#2d2b6b] to-primary text-white overflow-hidden">
            <div className="absolute inset-0 bg-[url('/images/pattern.png')] opacity-10 mix-blend-overlay"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20 relative z-10">
                <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
                    <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
                        <h1 className="text-3xl tracking-tight font-extrabold sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl">
                            <span className="block">Nurturing the</span>
                            <span className="block text-secondary">Leaders of Tomorrow</span>
                        </h1>
                        <p className="mt-3 text-base text-blue-100 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                            Excellence in Education with Islamic Values. We provide a holistic environment aimed at developing individuals who are academically proficient and Qur'anically grounded, following the CAPS curriculum alongside comprehensive Islamic Studies.
                        </p>
                        <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <Button variant="secondary" size="lg" href="/admissions" className="shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all font-bold">
                                    Start Application
                                </Button>
                                <Button variant="outline" size="lg" href="/academics" className="border-white/40 text-white hover:bg-white/10 backdrop-blur-sm">
                                    Explore Academics
                                </Button>
                            </div>
                            <p className="mt-4 text-sm font-medium text-blue-200 tracking-wide uppercase">
                                Accredited by UMALUSI | Grades RR-12
                            </p>
                        </div>
                    </div>
                    <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center lg:justify-center">
                        <div className="relative mx-auto w-full lg:max-w-lg transform hover:scale-105 transition-transform duration-500">
                            <img
                                src="/beta/images/alasr-logo-light-new.png"
                                alt="Al-Asr Educational Institute Logo"
                                className="w-full h-auto object-contain drop-shadow-2xl"
                            />
                        </div>
                    </div>
                </div>

                {/* Surah Al-Asr Compact Footer */}
                <div className="mt-16 lg:mt-20 p-4 md:p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 text-center max-w-4xl mx-auto">
                    <p className="italic text-lg md:text-xl text-blue-100 leading-relaxed line-clamp-2">
                        "By time, indeed, mankind is in loss, Except for those who have believed and done righteous deeds and advised each other to truth and advised each other to patience."
                    </p>
                    <p className="mt-2 text-[10px] md:text-xs uppercase tracking-[0.4em] text-blue-300/60 font-mono">— Surah Al-Asr (103:1-3)</p>
                </div>
            </div>
        </section>
    );
};
