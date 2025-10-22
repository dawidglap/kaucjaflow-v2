// src/app/page.tsx
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import WhyNow from '@/components/WhyNow';
import MythBuster from '@/components/MythBuster';
import BigPromise from '@/components/BigPromise';
import Proof from '@/components/Proof';
import OfferFeatures from '@/components/OfferFeatures';
import ContrastTable from '@/components/ContrastTable';
import HowItWorks from '@/components/HowItWorks';
import SocialProof from '@/components/SocialProof';
import Pricing from '@/components/Pricing';
import FAQ from '@/components/FAQ';
import CTASection from '@/components/CTASection';
import GrowthPlan from '@/components/GrowthPlan';
import ColdScript from '@/components/ColdScript';
import Guarantee from '@/components/Guarantee';
import LegalFooter from '@/components/LegalFooter';

export default function Home() {
  return (
    <div className="min-h-dvh bg-white text-black dark:bg-black dark:text-white">
      <Navbar /* logoSrc="/logo/kaucjaflow.svg" */ />

      <main>
        <Hero />
        <WhyNow
  posterSrc="/images/kaucjaflow-poster-16x9.jpg"
  posterVerticalSrc="/images/kaucjaflow-poster-9x16.jpg"
/>

        <MythBuster />
        <BigPromise />
        <Proof />
        <OfferFeatures />
        <ContrastTable />
        <HowItWorks />
        <SocialProof />
        <Pricing />
        <FAQ />
        <CTASection />
        {/* <GrowthPlan /> */}
        {/* <ColdScript /> */}
        <Guarantee />
        <LegalFooter />
      </main>

      <footer className="border-t border-black/5 py-8 text-center text-sm text-gray-600 dark:border-white/10 dark:text-gray-300">
        © {new Date().getFullYear()} KaucjaFlow — Wszystkie prawa zastrzeżone
      </footer>
    </div>
  );
}
