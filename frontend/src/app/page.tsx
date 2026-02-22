import { GlassHeader } from "@/components/GlassHeader";
import { HeroSection } from "@/components/HeroSection";
import { SharingSection } from "@/components/SharingSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { SocialProofSection } from "@/components/SocialProofSection";
import { FAQSection } from "@/components/FAQSection";
import { CTASection } from "@/components/CTASection";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100">
      <GlassHeader />
      <HeroSection />
      <SharingSection />
      <FeaturesSection />
      <SocialProofSection />
      <FAQSection />
      <CTASection />
      <main className="flex flex-col items-center px-4 pb-24 gap-12">
        {/* Additional content can go here */}
      </main>
      <Footer />
    </div>
  );
}
