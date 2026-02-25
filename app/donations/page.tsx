import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/config/site";
import { DonationCard } from "@/components/ui/DonationCard";
import { TrustSignals } from "@/components/ui/TrustSignals";
import { Heart, School, Trophy, Users, Star, Sparkles } from "lucide-react";

export default function Donations() {
    const mainYoco = siteConfig.yocoLinks.main;

    const generalWelfare = [
        {
            title: "Zakaat",
            description: "Fulfill your religious obligation. Zakaat funds support eligible recipients in financial need, as well as Masjid and school upkeep projects.",
            icon: Heart,
            href: `${mainYoco}?reference=Zakaat`,
            badge: "RAMADAN"
        },
        {
            title: "Lillah",
            description: "Support the school's general operations, infrastructure maintenance, and daily Islamic education activities.",
            icon: School,
            href: `${mainYoco}?reference=Lillah`
        },
        {
            title: "Sadaqat",
            description: "Voluntary charity for the ongoing welfare of the school community and special assistance programs.",
            icon: Sparkles,
            href: `${mainYoco}?reference=Sadaqat`
        }
    ];

    const sponsorshipTiers = [
        { amount: "R500", label: "Partial Support", reference: "Sponsorship-R500" },
        { amount: "R1500", label: "Half Tuition", reference: "Sponsorship-R1500" },
        { amount: "R3500", label: "Full Tuition", reference: "Sponsorship-R3500" },
    ];

    return (
        <div className="bg-background min-h-screen pb-20">
            {/* Header Section */}
            <div className="bg-primary py-24 text-white text-center">
                <div className="max-w-4xl mx-auto px-4">
                    <h1 className="text-4xl md:text-5xl font-bold mb-8">Invest in the Future</h1>

                    {/* Quranic Verse */}
                    <div className="mb-10 p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 italic">
                        <p className="text-xl md:text-2xl font-light mb-4 leading-relaxed font-sans">
                            "The example of those who spend their wealth in the way of Allah is like a seed [of grain] which grows seven ears; in each ear is a hundred grains. And Allah multiplies [His reward] for whom He wills."
                        </p>
                        <p className="text-sm opacity-70 tracking-widest uppercase font-sans">— Surah Al-Baqarah 2:261</p>
                    </div>

                    <p className="text-xl opacity-90 leading-relaxed max-w-2xl mx-auto">
                        Your contributions help us provide a holistic, excellence-driven education grounded in Islamic values to every child, regardless of their background.
                    </p>
                </div>
            </div>

            {/* General Welfare Section */}
            <Section className="py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-foreground mb-4">General Welfare</h2>
                        <p className="text-foreground/70 max-w-2xl mx-auto">Essential religious and community contributions to support the operations of Al-Asr.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {generalWelfare.map((item, index) => (
                            <DonationCard key={index} {...item} />
                        ))}
                    </div>
                </div>
            </Section>

            {/* Sponsor a Child Section */}
            <Section className="bg-white py-20">
                <div className="max-w-7xl mx-auto px-4 lg:grid lg:grid-cols-2 lg:gap-16 items-center">
                    <div>
                        <div className="inline-flex items-center px-4 py-1 rounded-full bg-surface text-primary font-medium text-sm mb-6">
                            <Users className="w-4 h-4 mr-2" />
                            Community Impact
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Sponsor a Child</h2>
                        <div className="prose prose-lg text-foreground/70 mb-8">
                            <p className="font-semibold text-primary text-xl mb-4">
                                Approximately 15% of our learners come from low-income households.
                            </p>
                            <p>
                                At Al-Asr, we believe that education is a right, not a privilege. Our Bursary Fund ensures that talented students facing financial hardship can continue their studies without interruption.
                            </p>
                            <p>
                                By sponsoring a child, you are directly investing in their academic success and spiritual growth, providing them with the tools to become the leaders of tomorrow.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                            {sponsorshipTiers.map((tier) => (
                                <a
                                    key={tier.amount}
                                    href={`${mainYoco}?amount=${tier.amount.replace('R', '')}.00&reference=Sponsor-A-Child`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-6 border-2 border-surface/50 rounded-xl text-center hover:border-primary hover:bg-surface/20 transition-all group shadow-sm hover:shadow-md"
                                >
                                    <span className="block text-3xl font-black text-foreground group-hover:text-primary mb-1">{tier.amount}</span>
                                    <span className="text-xs text-foreground/50 uppercase tracking-widest font-bold font-mono">{tier.label}</span>
                                </a>
                            ))}
                        </div>
                        <Button
                            href={`${mainYoco}?reference=Student+Sponsorship`}
                            variant="secondary"
                            size="lg"
                            target="_blank"
                            className="py-6 px-10 text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                        >
                            Custom Donation Amount
                        </Button>
                    </div>
                    <div className="mt-12 lg:mt-0 relative">
                        <div className="aspect-square bg-surface/30 rounded-2xl flex items-center justify-center p-12">
                            <div className="text-center">
                                <div className="text-6xl font-black text-primary mb-2">15%</div>
                                <p className="text-xl text-primary/80 font-medium uppercase tracking-widest">Low Income Support</p>
                                <div className="mt-8 flex justify-center space-x-2">
                                    {[...Array(5)].map((_, i) => <Star key={i} className="w-6 h-6 text-secondary fill-secondary" />)}
                                </div>
                            </div>
                        </div>
                        {/* Decorative background element */}
                        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-secondary rounded-2xl -z-10 opacity-20 transform rotate-12"></div>
                    </div>
                </div>
            </Section>

            {/* Sponsor a Project Section */}
            <Section className="py-20 bg-background">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="bg-gradient-to-br from-primary via-[#2d2b6b] to-primary rounded-3xl overflow-hidden shadow-2xl">
                        <div className="px-8 py-16 md:p-16 text-center text-white">
                            <div className="inline-flex items-center px-4 py-1 rounded-full bg-white/10 text-white/90 font-medium text-sm mb-8 backdrop-blur-sm">
                                <Trophy className="w-4 h-4 mr-2" />
                                Current Project
                            </div>
                            <h2 className="text-3xl md:text-5xl font-bold mb-6">New Sports Complex</h2>
                            <p className="text-xl text-secondary max-w-3xl mx-auto mb-10 leading-relaxed font-medium">
                                We are currently raising funds for a <strong>new soccer field and running track</strong>. Physical health is vital for spiritual and academic well-being. Help us provide a space where our students can excel on and off the field.
                            </p>

                            <div className="max-w-md mx-auto bg-white/5 rounded-2xl p-8 backdrop-blur-sm border border-white/10">
                                <p className="text-sm uppercase tracking-widest text-[#D8D7F6]/60 mb-6">Support our student athletes</p>
                                <Button
                                    href={`${mainYoco}?reference=Sports+Project`}
                                    size="lg"
                                    variant="secondary"
                                    fullWidth
                                    target="_blank"
                                >
                                    Contribute to Project
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>

            {/* Trust Signals and Footer Info */}
            <Section className="bg-white">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <TrustSignals />
                    <div className="mt-8 text-gray-500 text-sm">
                        <p>Al-Asr Educational Institute is a registered Non-Profit Organisation.</p>
                        <p className="mt-2 text-primary font-medium">
                            Section 18A Tax Certificates are available on request for eligible donations.
                            Please email <a href="mailto:admin@alasr.co.za" className="underline hover:text-blue-700">admin@alasr.co.za</a> with your proof of payment to request yours.
                        </p>
                    </div>
                </div>
            </Section>
        </div>
    );
}
