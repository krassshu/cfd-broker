import Link from "next/link";
import { ArrowRight } from "lucide-react";
import HeroVisual from "@/app/_components/landing/hero/HeroVisual";
import ParticleNetwork from "@/app/_components/landing/hero/ParticleNetwork";

export default function AboutSection() {
    return (
        <section className="relative py-24 px-6 overflow-hidden section-gradient">
            <div className="absolute inset-0 -z-10" aria-hidden="true">
                <div className="absolute top-1/2 left-0 w-75 h-75 rounded-full bg-blob-accent blur-[100px]" />
                <div className="absolute bottom-0 right-0 w-75 h-75 rounded-full bg-blob-primary blur-[100px]" />
            </div>

            <div className="absolute -right-32 -top-20 w-150 h-175 overflow-hidden pointer-events-none opacity-50">
                <ParticleNetwork preset="triangle" color="#3b82f6" className="absolute inset-0" />
            </div>

            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                <div className="flex-1 w-full">
                    <HeroVisual />
                </div>

                <div className="flex-1 text-center lg:text-left">
                    <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">About us</p>
                    <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-5 leading-tight">
                        Accelerate your trading journey
                    </h2>
                    <p className="text-sm text-muted leading-relaxed mb-8 max-w-md mx-auto lg:mx-0">
                        Our platform gives you real-time access to cryptocurrency markets
                        with professional-grade tools. Whether you&apos;re a beginner exploring
                        markets or an experienced trader seeking leverage, we provide the
                        speed, security, and simplicity you need.
                    </p>
                    <Link
                        href="/register"
                        className="group inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                    >
                        Read More
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
