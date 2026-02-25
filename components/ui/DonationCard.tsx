import React from 'react';
import { Button } from './Button';
import { Card } from './Card';
import { LucideIcon } from 'lucide-react';

interface DonationCardProps {
    title: string;
    description: string;
    icon?: LucideIcon;
    href: string;
    variant?: 'primary' | 'secondary' | 'outline';
    amountPrefix?: boolean;
    badge?: string;
}

export const DonationCard = ({ title, description, icon: Icon, href, variant = 'primary', amountPrefix, badge }: DonationCardProps) => {
    return (
        <Card className="flex flex-col h-full hover:shadow-xl transition-all duration-300 border-t-4 border-primary relative overflow-hidden">
            {badge && (
                <div className="absolute top-4 right-[-35px] bg-secondary text-white text-[10px] font-bold py-1 px-10 transform rotate-45 shadow-sm uppercase tracking-wider">
                    {badge}
                </div>
            )}
            <div className="p-8 flex flex-col h-full">
                {Icon && (
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                        <Icon className="h-6 w-6 text-primary" />
                    </div>
                )}
                <h3 className="text-xl font-bold text-foreground mb-3">{title}</h3>
                <p className="text-foreground/70 mb-8 flex-grow leading-relaxed">
                    {description}
                </p>
                <div className="mt-auto">
                    <Button
                        href={href}
                        target="_blank"
                        variant={variant}
                        size="lg"
                        fullWidth
                        className="shadow-sm hover:shadow-md py-6 text-lg"
                    >
                        {amountPrefix ? 'Donate' : 'Donate Now'}
                    </Button>
                </div>
            </div>
        </Card>
    );
};
