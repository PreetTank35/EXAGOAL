"use client";

import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { MetricsSection } from "@/components/landing/MetricsSection";
import { DashboardPreview } from "@/components/landing/DashboardPreview";
import { CTASection } from "@/components/landing/CTASection";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen relative font-sans bg-background text-foreground">
      {/* Global grain texture */}
      <div
        className="fixed inset-0 pointer-events-none z-[1]"
        style={{
          opacity: 0.025,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "200px",
        }}
      />

      {/* Subtle global gradient mesh */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 10% 0%, rgba(139,92,246,0.07) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 90% 100%, rgba(6,182,212,0.06) 0%, transparent 60%),
            radial-gradient(ellipse 50% 30% at 50% 50%, rgba(236,72,153,0.03) 0%, transparent 70%)
          `,
        }}
      />

      <div className="relative z-10">
        <Navbar />
        <HeroSection />
        <FeaturesSection />
        <MetricsSection />
        <DashboardPreview />
        <CTASection />
        <Footer />
      </div>
    </div>
  );
}
