import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ParticleNetwork from "@/app/_components/landing/hero/ParticleNetwork";
import { STEPS } from "@/app/_components/landing/data/landing-data";

export default function StepsSection() {
    return (
        <section className="relative py-24 px-6 section-gradient">
            <div className="absolute inset-0 -z-10" aria-hidden="true">
                <div className="absolute bottom-0 left-1/4 w-100 h-75 rounded-full bg-blob-accent blur-[100px]" />
            </div>

            <div className="absolute -left-32 -top-20 w-150 h-175 overflow-hidden pointer-events-none opacity-90 z-0">
                <ParticleNetwork preset="wave" color="#EC4899" className="absolute inset-0" />
            </div>

            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-16">
                    <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">Step by step guide</p>
                    <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                        Easy Steps to Success
                    </h2>
                    <p className="text-sm text-muted max-w-lg mx-auto leading-relaxed">
                        From zero to your first trade in under 5 minutes. Simple, fast, and straightforward.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 z-10">
                    {STEPS.map((step) => {
                        const Icon = step.icon;
                        return (
                            <div
                                key={step.step}
                                className="group relative p-8 rounded-xl border landing-card hover:border-primary/30 transition-all duration-300 text-center hover:shadow-[0_0_30px_rgba(59,130,246,0.08)]"
                            >
                                <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-primary/5 blur-[20px] group-hover:bg-primary/10 transition-all" />

                                <div className="relative">
                                    <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 group-hover:scale-110 transition-all">
                                        <Icon className="w-7 h-7 text-primary" />
                                    </div>
                                    <h3 className="text-base font-bold text-foreground mb-3">{step.title}</h3>
                                    <p className="text-xs text-muted leading-relaxed mb-6">{step.description}</p>
                                    <Link
                                        href="/register"
                                        className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary hover:text-primary-foreground transition-all"
                                    >
                                        Learn More
                                        <ArrowRight className="w-3 h-3" />
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
