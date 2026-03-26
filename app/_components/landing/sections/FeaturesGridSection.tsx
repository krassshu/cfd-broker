import { FEATURES_GRID } from "@/app/_components/landing/data/landing-data";

export default function FeaturesGridSection() {
    return (
        <section className="relative py-24 px-6 overflow-hidden section-gradient">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-16">
                    <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">Our Features</p>
                    <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                        All you need is here
                    </h2>
                    <p className="text-sm text-muted max-w-lg mx-auto leading-relaxed">
                        Everything a modern trader needs — from risk management to 24/7 market access.
                    </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {FEATURES_GRID.map((feature) => {
                        const Icon = feature.icon;
                        return (
                            <article
                                key={feature.title}
                                className="group p-6 rounded-xl border landing-card hover:border-primary/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.08)]"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-all">
                                        <Icon className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-foreground mb-1.5">{feature.title}</h3>
                                        <p className="text-xs text-muted leading-relaxed">{feature.description}</p>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
