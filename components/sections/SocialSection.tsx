import React from 'react';
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { InstagramFeed } from "@/components/integrations/InstagramFeed";
import { YouTubeGrid } from "@/components/integrations/YouTubeGrid";
import { siteConfig } from "@/config/site";

export const SocialSection = () => {
    return (
        <Section className="bg-surface/20 border-y border-surface/50">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                <div className="text-center md:text-left">
                    <h2 className="text-3xl font-bold text-foreground">Latest Updates</h2>
                    <p className="mt-2 text-lg text-foreground/70">Stay connected with our school community.</p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" size="sm" href={siteConfig.instagramUrl} target="_blank" className="hidden md:inline-flex">
                        View Instagram
                    </Button>
                    <Button variant="outline" size="sm" href={siteConfig.youtubeChannelUrl} target="_blank" className="hidden md:inline-flex">
                        Visit YouTube
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                    <div className="flex items-center justify-between md:hidden">
                        <h3 className="font-semibold text-gray-900">Instagram</h3>
                        <a href={siteConfig.instagramUrl} className="text-sm text-primary">View Profile</a>
                    </div>
                    <InstagramFeed />
                </div>
                <div className="space-y-6">
                    <div className="flex items-center justify-between md:hidden">
                        <h3 className="font-semibold text-gray-900">YouTube</h3>
                        <a href={siteConfig.youtubeChannelUrl} className="text-sm text-primary">Visit Channel</a>
                    </div>
                    <YouTubeGrid />
                </div>
            </div>
        </Section>
    );
};
