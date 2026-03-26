import ParticleNetwork from "@/app/_components/landing/hero/ParticleNetwork";
import WorldMap from "@/app/_components/landing/data/WorldMap";
import { WORLD_STATS } from "@/app/_components/landing/data/landing-data";

export default function WorldStatsSection() {
    return (
        <section className="relative py-24 px-6 overflow-hidden">
            <div className="absolute -left-48 -top-12 w-150 h-175 overflow-hidden pointer-events-none opacity-90">
                <ParticleNetwork preset="nebula" color="#3b82f6" className="absolute inset-0" />
            </div>

            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
                    <div className="shrink-0 lg:w-[320px] text-center lg:text-left">
                        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">Our vision</p>
                        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                            Users from all over the world
                        </h2>
                        <p className="text-sm text-muted leading-relaxed mb-10">
                            Thousands of traders trust our platform. Join a growing global community
                            of crypto enthusiasts trading with confidence.
                        </p>
                        <div className="flex justify-center lg:justify-start gap-8">
                            {WORLD_STATS.map((stat) => (
                                <div key={stat.label} className="text-center lg:text-left">
                                    <div className="text-2xl sm:text-3xl font-bold text-primary font-mono">{stat.value}</div>
                                    <div className="text-xs text-muted mt-1 uppercase tracking-wide">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 w-full">
                        <WorldMap />
                    </div>
                </div>
            </div>
        </section>
    );
}
