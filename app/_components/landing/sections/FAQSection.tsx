"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQ_ITEMS = [
    {
        q: "What is CFD trading?",
        a: "CFD (Contract for Difference) trading lets you speculate on the price movements of cryptocurrencies without owning the underlying asset. You profit from the difference between the opening and closing price of a trade."
    },
    {
        q: "What leverage do you offer?",
        a: "We offer up to 50x leverage on all crypto pairs. This means a $100 margin allows you to control a $5,000 position. Higher leverage amplifies both gains and losses — trade responsibly."
    },
    {
        q: "How do I get started?",
        a: "Create an account in under a minute, verify your email, and you'll receive a $10,000 demo balance to practice with. When you're ready, you can deposit funds and start trading live markets."
    },
    {
        q: "What cryptocurrencies can I trade?",
        a: "We support 100+ crypto pairs including Bitcoin, Ethereum, Solana, XRP, BNB, Cardano, Polkadot, and many more — all quoted against USDT with real-time Binance price feeds."
    },
    {
        q: "Are my funds secure?",
        a: "Your account is protected by Supabase authentication with Row Level Security policies. All trading data is encrypted and isolated per user. We never have access to your private keys since CFDs don't require holding crypto."
    },
    {
        q: "What are Stop Loss and Take Profit?",
        a: "Stop Loss (SL) and Take Profit (TP) are risk management tools. Set a SL to automatically close a position if it moves against you beyond a threshold, and a TP to lock in profits when the price reaches your target."
    }
];

function FAQItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="border-b border-section-border">
            <button
                onClick={() => setOpen(!open)}
                className="flex w-full items-center justify-between py-5 text-left transition-colors hover:text-primary cursor-pointer"
                aria-expanded={open}
            >
                <span className="text-sm font-semibold text-foreground pr-4">{q}</span>
                <ChevronDown
                    className={`w-4 h-4 text-muted shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                />
            </button>
            <div
                className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr] opacity-100 pb-5" : "grid-rows-[0fr] opacity-0"}`}
            >
                <div className="overflow-hidden">
                    <p className="text-sm text-muted leading-relaxed">{a}</p>
                </div>
            </div>
        </div>
    );
}

export default function FAQSection() {
    return (
        <section id="faq" className="py-24 px-6 section-gradient">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-2xl font-bold text-foreground mb-3">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-sm text-muted">
                        Everything you need to know about trading with CFD Broker.
                    </p>
                </div>
                <div className="border-t border-section-border">
                    {FAQ_ITEMS.map((item) => (
                        <FAQItem key={item.q} q={item.q} a={item.a} />
                    ))}
                </div>
            </div>
        </section>
    );
}
