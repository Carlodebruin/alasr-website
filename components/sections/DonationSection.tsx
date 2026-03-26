import React from 'react';
import { Section } from '@/components/ui/Section';
import { DonationCard } from '@/components/ui/DonationCard';
import { Heart, Trophy, Users, ArrowRight } from 'lucide-react';
import { siteConfig } from '@/config/site';
import Link from 'next/link';

export const DonationSection = () => {
    const mainYoco = siteConfig.yocoLinks.main;

    return (
        <Section className="bg-white">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
                    <div className="max-w-2xl">
                        <h2 className="text-3xl font-bold text-foreground mb-4">Support Our Learners</h2>
                        <p className="text-foreground/70 text-lg">
                            Your generosity fuels academic excellence and spiritual development. Choose a cause near to your heart.
                        </p>
                    </div>
                    <Link
                        href="/donations"
                        className="mt-4 md:mt-0 inline-flex items-center text-primary font-bold hover:gap-2 transition-all group"
                    >
                        View all causes <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <DonationCard
                        title="Zakaat & Sadaqat"
                        description="Fulfill your religious obligations. Support our students in need and school upkeep through your Zakaat and Sadaqat contributions."
                        icon={Heart}
                        href={`${mainYoco}?reference=General-Welfare`}
                    />
                    <DonationCard
                        title="Sponsor a Child"
                        description="Directly support a student's education. Help us ensure that no child's learning is hindered by financial constraints."
                        icon={Users}
                        href={`${mainYoco}?reference=Student-Sponsorship&amount=1000.00`}
                        variant="secondary"
                    />
                    <DonationCard
                        title="Sports Complex"
                        description="Be part of our dream to build a state-of-the-art soccer field and running track for our future athletes."
                        icon={Trophy}
                        href={`${mainYoco}?reference=Sports-Project`}
                        variant="outline"
                    />
                </div>

                {/* Secure Payment Note */}
                <div className="mt-12 flex justify-center">
                    <div className="inline-flex items-center px-4 py-2 rounded-full bg-surface/30 border border-surface text-sm text-foreground/60">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        Secure payments processed by Yoco
                    </div>
                </div>
            </div>
        </Section>
    );
};
