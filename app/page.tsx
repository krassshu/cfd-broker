import type { Metadata } from "next";

import CryptoTicker from "@/app/_components/landing/CryptoTicker";
import FAQSection from "@/app/_components/landing/sections/FAQSection";
import LandingNavbar from "@/app/_components/landing/LandingNavbar";
import ScrollToTop from "@/app/_components/landing/ScrollToTop";
import Footer from "@/app/_components/landing/Footer";
import HeroSection from "@/app/_components/landing/hero/HeroSection";
import AboutSection from "@/app/_components/landing/sections/AboutSection";
import WhyChooseSection from "@/app/_components/landing/sections/WhyChooseSection";
import StepsSection from "@/app/_components/landing/sections/StepsSection";
import WorldStatsSection from "@/app/_components/landing/sections/WorldStatsSection";
import FeaturesGridSection from "@/app/_components/landing/sections/FeaturesGridSection";
import CTASection from "@/app/_components/landing/sections/CTASection";
import NewsletterSection from "@/app/_components/landing/sections/NewsletterSection";

export const metadata: Metadata = {
    title: "CryptoBroker — Trade Crypto with Up to 50x Leverage",
    description:
        "Trade 100+ cryptocurrency CFDs with up to 50x leverage. Real-time prices, advanced risk management, and lightning-fast execution. Start with a free $10,000 demo account.",
    keywords: [
        "crypto trading", "CFD broker", "cryptocurrency leverage", "bitcoin trading",
        "ethereum trading", "crypto CFD", "leverage trading", "50x leverage",
    ],
    openGraph: {
        title: "CryptoBroker — Trade Crypto with Up to 50x Leverage",
        description: "Trade 100+ cryptocurrency CFDs with real-time prices and advanced risk management.",
        type: "website",
        locale: "en_US",
    },
    twitter: {
        card: "summary_large_image",
        title: "CryptoBroker — Trade Crypto with Up to 50x Leverage",
        description: "Trade 100+ cryptocurrency CFDs with real-time prices and advanced risk management.",
    },
    robots: { index: true, follow: true },
};

export default function LandingPage() {
    return (
        <>
            <LandingNavbar />
            <CryptoTicker />
            <main>
                <HeroSection />
                <AboutSection />
                <WhyChooseSection />
                <StepsSection />
                <WorldStatsSection />
                <FeaturesGridSection />
                <CTASection />
                <FAQSection />
                <NewsletterSection />
            </main>

            <Footer />
            <ScrollToTop />

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebApplication",
                        name: "CryptoBroker",
                        applicationCategory: "FinanceApplication",
                        description: "Trade 100+ cryptocurrency CFDs with up to 50x leverage.",
                        offers: {
                            "@type": "Offer",
                            price: "0",
                            priceCurrency: "USD",
                            description: "Free demo account with $10,000 virtual balance",
                        },
                        featureList: [
                            "50x leverage", "100+ crypto pairs", "Real-time market data",
                            "Stop Loss & Take Profit", "24/7 trading", "Professional charts",
                        ],
                    }),
                }}
            />
        </>
    );
}
