import React from 'react';
import { Section } from "@/components/ui/Section";
import { BookOpen, GraduationCap, Heart, Users } from "lucide-react";
import { FeatureCard } from "./FeatureCard";

export const FeatureGrid = () => {
    const features = [
        {
            icon: <BookOpen className="h-6 w-6 text-primary" />,
            title: "Islamic Ethos",
            description: "Integrated Islamic studies covering Quran, Arabic, Fiqh, and History within the daily curriculum."
        },
        {
            icon: <GraduationCap className="h-6 w-6 text-primary" />,
            title: "Academic Excellence",
            description: "Rigorous academic program following the CAPS curriculum, accredited by UMALUSI."
        },
        {
            icon: <Heart className="h-6 w-6 text-primary" />,
            title: "Holistic Development",
            description: "Focus on character building (Tarbiyyah), good character (Akhlaaq), sports, and extra-curricular activities."
        },
        {
            icon: <Users className="h-6 w-6 text-primary" />,
            title: "Community",
            description: "A supportive environment fostering brotherhood and sisterhood, preparing students for success in both worlds."
        }
    ];

    return (
        <Section>
            <div className="text-center mb-16">
                <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Our Ethos</h2>
                <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-foreground sm:text-4xl">
                    Why Choose Al-Asr?
                </p>
                <p className="mt-4 max-w-2xl text-xl text-foreground/70 mx-auto">
                    A holistic approach to education that balances spiritual growth with academic success.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map((feature, index) => (
                    <FeatureCard
                        key={index}
                        icon={feature.icon}
                        title={feature.title}
                        description={feature.description}
                    />
                ))}
            </div>
        </Section>
    );
};
