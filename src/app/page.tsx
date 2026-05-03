import Header from "@/components/Header";
import AnimatedHero from "@/components/AnimatedHero";
import VideoShowcase from "@/components/VideoShowcase";
import FeatureStrip from "@/components/FeatureStrip";
import PricingSection from "@/components/PricingSection";
import FAQSection from "@/components/FAQSection";
import CTASection from "@/components/CTASection";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <AnimatedHero />
        <FeatureStrip />
        <VideoShowcase
          title="Prompt Builder in Motion"
          subtitle="Select structured visual attributes and watch your prompt come together in real time."
          videoSrc="/vid/1.mp4"
        />
        <VideoShowcase
          title="Campaign Output Preview"
          subtitle="Generate consistent, campaign-ready AI image directions from clean JSON prompts."
          reverse
        />
        <PricingSection />
        <FAQSection />
        <CTASection />
      </main>
    </>
  );
}

