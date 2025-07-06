"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BenefitsSection } from "@/components/landing/sections/benefits";
import { FAQSection } from "@/components/landing/sections/faq";
import { FeaturesSection } from "@/components/landing/sections/features";
import { FooterSection } from "@/components/landing/sections/footer";
import { HeroSection } from "@/components/landing/sections/hero";
import { PricingSection } from "@/components/landing/sections/pricing";
import { ServicesSection } from "@/components/landing/sections/services";
import { SponsorsSection } from "@/components/landing/sections/sponsors";
import { TestimonialSection } from "@/components/landing/sections/testimonial";
import { useAuthContext } from "@/components/auth/AuthProvider";

export default function LandingPage() {
  const { isAuthenticated, loading } = useAuthContext();
  const router = useRouter();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [loading, isAuthenticated, router]);

  // Don't render anything if authenticated (redirect will happen)
  if (!loading && isAuthenticated) {
    return null;
  }

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