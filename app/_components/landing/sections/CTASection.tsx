import Link from "next/link";
import { ArrowRight, Globe } from "lucide-react";

export default function CTASection() {
    return (
        <section className="py-16 px-6">
            <div className="max-w-5xl mx-auto">
                <div className="relative rounded-2xl border border-primary/20 p-10 sm:p-14 overflow-hidden" style={{ background: `linear-gradient(to right, var(--cta-from), var(--cta-via), var(--cta-from))` }}>
                    <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-blob-primary blur-[60px]" aria-hidden="true" />
                    <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full bg-blob-accent blur-[60px]" aria-hidden="true" />

                    <div className="relative flex flex-col sm:flex-row items-center gap-8">
                        <div className="flex-1">
                            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-primary mb-3">
                                <Globe className="w-3.5 h-3.5" />
                                CryptoBroker Exchange
                            </p>
                            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                                Low fees and deep liquidity
                            </h2>
                            <p className="text-sm text-muted leading-relaxed max-w-md">
                                Trade with confidence knowing you&apos;re getting the best prices from Binance
                                market feeds. Zero commission, minimal spreads.
                            </p>
                        </div>
                        <Link
                            href="/register"
                            className="group shrink-0 flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.5)]"
                        >
                            Try It Now
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
