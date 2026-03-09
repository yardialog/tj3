'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { HeroSection } from '@/components/home/hero-section';
import { CategoriesSection } from '@/components/home/categories-section';
import { VacanciesSection } from '@/components/home/vacancies-section';
import { HowItWorksNewSection } from '@/components/home/how-it-works-new-section';
import { SafetyNewSection } from '@/components/home/safety-new-section';
import { AboutNewSection } from '@/components/home/about-new-section';
import { CTASection } from '@/components/home/cta-section';

export default function HomePage() {
  const { fetchUser, isLoading } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <CategoriesSection />
        <VacanciesSection />
        <HowItWorksNewSection />
        <SafetyNewSection />
        <AboutNewSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
