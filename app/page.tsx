'use client';

import DarkModeToggle from '@/components/DarkModeToggle';
import LandingSection from '@/components/LandingSection';
import ExplanationSection from '@/components/ExplanationSection';
import StepsSection from '@/components/StepsSection';
import AdBanner from '@/components/AdBanner';
import { Analytics } from "@vercel/analytics/next"

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
            <Analytics />
            <AdBanner />
            <DarkModeToggle />
            <LandingSection />
            <ExplanationSection />
            <StepsSection />
        </div>
    );
}
