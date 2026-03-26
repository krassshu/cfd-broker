import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function NewsletterSection() {
    return (
        <section className="py-24 px-6">
            <div className="max-w-2xl mx-auto text-center">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">Start Now</p>
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                    Sign up to learn more
                </h2>
                <p className="text-sm text-muted mb-10 max-w-md mx-auto leading-relaxed">
                    Join thousands of traders using CryptoBroker. Create your free account
                    and get a $10,000 demo balance to practice with.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
                    <input
                        type="email"
                        placeholder="Enter your email"
                        className="flex-1 w-full px-5 py-3 rounded-lg border border-landing-card-border bg-card-surface text-sm text-foreground placeholder:text-muted outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all"
                        readOnly
                    />
                    <Link
                        href="/register"
                        className="group shrink-0 flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                    >
                        Sign Up
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
