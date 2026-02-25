import React from 'react';
import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";

export const CTASection = () => {
    return (
        <section className="bg-primary py-16 lg:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                    Ready to Join the Al-Asr Family?
                </h2>
                <p className="mt-4 text-xl text-secondary max-w-2xl mx-auto font-medium">
                    Admissions are open for the upcoming academic year. Secure your child&apos;s future today with an education that matters.
                </p>
                <div className="mt-10 flex justify-center gap-4">
                    <Button variant="secondary" size="lg" href="/admissions" className="px-8 py-4 text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all">
                        Start Application
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                    <Button variant="outline" size="lg" href="/contact" className="bg-transparent border-white text-white hover:bg-white hover:text-primary">
                        Contact Us
                    </Button>
                </div>
            </div>
        </section>
    );
};
