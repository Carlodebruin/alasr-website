import { HeroSection } from "@/components/sections/HeroSection";
import { FeatureGrid } from "@/components/sections/FeatureGrid";
import { DonationSection } from "@/components/sections/DonationSection";
import { SocialSection } from "@/components/sections/SocialSection";
import { CTASection } from "@/components/sections/CTASection";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen font-sans">
      <HeroSection />
      <FeatureGrid />
      <DonationSection />
      <SocialSection />
      <CTASection />
    </div>
  );
}
