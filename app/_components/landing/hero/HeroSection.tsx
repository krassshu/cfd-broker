import Link from "next/link";
import { ArrowRight } from "lucide-react";
import BitcoinHero from "./BitcoinHero";
import ParticleNetwork from "./ParticleNetwork";

export default function HeroSection() {
    return (
        <section className="relative py-20 lg:py-28 px-6 overflow-hidden">
            <div className="absolute inset-0 -z-10" aria-hidden="true">
                <div className="absolute top-0 left-1/4 w-125 h-125 rounded-full bg-blob-primary blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-100 h-75 rounded-full bg-blob-accent blur-[100px]" />
            </div>

            <div className="absolute inset-x-0 bottom-0 h-96 pointer-events-none" style={{
                maskImage: "linear-gradient(to bottom, transparent 0%, black 30%, black 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 30%, black 100%)",
            }}>
                <ParticleNetwork preset="hero" color="#3b82f6" className="absolute inset-0 opacity-60" />
            </div>

            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                <div className="flex-1 text-center lg:text-left">
                    <p className="animate-fade-in-up text-xs font-semibold uppercase tracking-widest text-primary mb-5">
                        Next-generation crypto trading
                    </p>
                    <h1 className="animate-fade-in-up animate-delay-100 text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight tracking-tight mb-6">
                        Best place buy and sell{" "}
                        <span className="text-primary">crypto</span>{" "}
                        currency asset
                    </h1>
                    <p className="animate-fade-in-up animate-delay-200 text-base text-muted max-w-lg mb-10 leading-relaxed mx-auto lg:mx-0">
                        Access 100+ cryptocurrency markets with up to 50x leverage.
                        Real-time prices, professional charts, and built-in risk management
                        — all in one clean interface.
                    </p>
                    <div className="animate-fade-in-up animate-delay-300 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                        <Link
                            href="/register"
                            className="group flex items-center gap-2 px-7 py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]"
                        >
                            Get Started
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                        <Link
                            href="/login"
                            className="flex items-center gap-2 px-7 py-3.5 rounded-lg border border-landing-card-border text-foreground font-medium text-sm hover:bg-card-surface hover:border-primary/30 transition-all"
                        >
                            I have an account
                        </Link>
                    </div>
                </div>

                <div className="flex-1 flex justify-center">
                    <BitcoinHero />
                </div>
            </div>
        </section>
    );
}
