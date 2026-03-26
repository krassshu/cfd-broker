import ParticleNetwork from "@/app/_components/landing/hero/ParticleNetwork";
import { WHY_CHOOSE } from "@/app/_components/landing/data/landing-data";

export default function WhyChooseSection() {
    return (
        <section id="features" className="relative py-24 px-6">
            <div className="absolute inset-0 -z-10" aria-hidden="true">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-50 rounded-full bg-blob-primary blur-[120px]" />
            </div>

            <div className="absolute -right-32 -top-40 w-150 h-175 overflow-hidden pointer-events-none opacity-90">
                <ParticleNetwork preset="scatter" color="#3b82f6" className="absolute inset-0" />
            </div>

            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-16">
                    <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">Why Choose Us</p>
                    <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                        Safe, guaranteed, and easy to use
                    </h2>
                    <p className="text-sm text-muted max-w-lg mx-auto leading-relaxed">
                        Professional-grade tools built for both beginners and experienced traders.
                        Everything you need in one platform.
                    </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {WHY_CHOOSE.map((feature) => {
                        const Icon = feature.icon;
                        return (
                            <article
                                key={feature.title}
                                id={feature.title === "Safe and secure" ? "security" : undefined}
                                className="group relative p-6 rounded-xl border landing-card hover:border-primary/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.08)]"
                            >
                                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5 group-hover:bg-primary/20 group-hover:border-primary/30 transition-all">
                                    <Icon className="w-5 h-5 text-primary" />
                                </div>
                                <h3 className="text-sm font-bold text-foreground mb-2">{feature.title}</h3>
                                <p className="text-xs text-muted leading-relaxed">{feature.description}</p>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
