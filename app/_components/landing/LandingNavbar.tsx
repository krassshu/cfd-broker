"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Globe } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import ThemeToggle from "@/app/_components/ThemeToggle";

export default function LandingNavbar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [user, setUser] = useState<{ email: string } | null>(null);

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user } }: { data: { user: { email?: string } | null } }) => {
            if (user?.email) {
                setUser({ email: user.email });
            }
        });
    }, []);

    const username = user?.email?.split("@")[0] ?? null;

    const navLinks = [
        { href: "#home", label: "Home" },
        { href: "#market", label: "Market" },
        { href: "#features", label: "Features" },
        { href: "#faq", label: "FAQ" },
    ];

    return (
        <header className="sticky top-0 z-50 w-full border-b border-primary/10 bg-background/80 backdrop-blur-xl">
            <nav
                className="mx-auto flex items-center justify-between h-16 px-6"
                aria-label="Main navigation"
            >
                <Link
                    href="/"
                    className="flex items-center gap-2 text-lg font-bold tracking-tight"
                    aria-label="CryptoBroker home"
                >
                    <Globe className="w-5 h-5 text-primary" />
                    <div>
                        <span className="text-foreground">Crypto</span>
                        <span className="text-primary">Broker</span>
                    </div>
                </Link>

                <div className="hidden md:flex items-center gap-8 text-sm text-muted">
                    {navLinks.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className="hover:text-primary transition-colors duration-200"
                        >
                            {link.label}
                        </a>
                    ))}
                </div>

                <div className="hidden md:flex items-center gap-4">
                    <ThemeToggle variant="navbar" />
                    {username ? (
                        <>
                            <span className="text-sm text-muted">
                                {username}
                            </span>
                            <Link
                                href="/market"
                                className="text-sm font-medium px-5 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                            >
                                Go to Market
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="text-sm font-medium text-muted hover:text-primary transition-colors"
                            >
                                Log in
                            </Link>
                            <Link
                                href="/register"
                                className="text-sm font-medium px-5 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                            >
                                Get Started
                            </Link>
                        </>
                    )}
                </div>

                <div className="flex md:hidden items-center gap-2">
                    <ThemeToggle variant="navbar" />
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-primary/20 transition-colors cursor-pointer"
                        aria-label={mobileOpen ? "Close menu" : "Open menu"}
                        aria-expanded={mobileOpen}
                    >
                        {mobileOpen ? (
                            <X className="h-4 w-4 text-foreground" />
                        ) : (
                            <Menu className="h-4 w-4 text-foreground" />
                        )}
                    </button>
                </div>
            </nav>

            <div
                className={`md:hidden overflow-hidden transition-all duration-300 ${
                    mobileOpen
                        ? "max-h-80 opacity-100"
                        : "max-h-0 opacity-0"
                }`}
            >
                <div className="px-6 pb-5 pt-2 border-t border-primary/10 bg-background/95 backdrop-blur-xl flex flex-col gap-4">
                    {navLinks.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            onClick={() => setMobileOpen(false)}
                            className="text-sm text-muted hover:text-primary transition-colors py-1"
                        >
                            {link.label}
                        </a>
                    ))}

                    <div className="border-t border-primary/10 pt-4 flex flex-col gap-3">
                        {username ? (
                            <>
                                <span className="text-sm text-muted">
                                    Logged in as <span className="text-foreground font-medium">{username}</span>
                                </span>
                                <Link
                                    href="/market"
                                    onClick={() => setMobileOpen(false)}
                                    className="text-sm font-medium px-5 py-2.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-center"
                                >
                                    Go to Market
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    onClick={() => setMobileOpen(false)}
                                    className="text-sm font-medium text-muted hover:text-primary transition-colors py-1"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href="/register"
                                    onClick={() => setMobileOpen(false)}
                                    className="text-sm font-medium px-5 py-2.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-center"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
