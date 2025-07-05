import { BenefitsSection } from "@/components/landing/sections/benefits";
import { FAQSection } from "@/components/landing/sections/faq";
import { FeaturesSection } from "@/components/landing/sections/features";
import { FooterSection } from "@/components/landing/sections/footer";
import { HeroSection } from "@/components/landing/sections/hero";
import { PricingSection } from "@/components/landing/sections/pricing";
import { ServicesSection } from "@/components/landing/sections/services";
import { SponsorsSection } from "@/components/landing/sections/sponsors";
import { TestimonialSection } from "@/components/landing/sections/testimonial";

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <SponsorsSection />
      <BenefitsSection />
      <FeaturesSection />
      <ServicesSection />
      <TestimonialSection />
      <PricingSection />
      <FAQSection />
      <FooterSection />
    </>
  );
}