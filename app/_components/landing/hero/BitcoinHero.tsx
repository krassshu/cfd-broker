"use client";

import { useEffect, useState } from "react";

export default function BitcoinHero() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    return (
        <div
            className={`relative w-full max-w-[420px] aspect-square transition-all duration-1000 ${
                mounted ? "opacity-100 scale-100" : "opacity-0 scale-90"
            }`}
            aria-hidden="true"
        >
            <div className="absolute inset-0 rounded-full bg-primary/10 blur-[80px] animate-pulse" />

            <div className="absolute inset-[10%] rounded-full border border-primary/20 animate-[spin_20s_linear_infinite]">
                <div className="absolute -top-1.5 left-1/2 w-3 h-3 rounded-full bg-primary/60 blur-[2px]" />
            </div>

            <div className="absolute inset-[20%] rounded-full border border-primary/10 animate-[spin_15s_linear_infinite_reverse]">
                <div className="absolute -bottom-1 right-4 w-2 h-2 rounded-full bg-cyan-400/40 blur-[1px]" />
            </div>

            <div className="absolute inset-[25%] rounded-full bg-gradient-to-br from-primary/30 via-primary/10 to-transparent border border-primary/40 flex items-center justify-center shadow-[0_0_60px_rgba(59,130,246,0.3),inset_0_0_60px_rgba(59,130,246,0.1)]">
                <div className="absolute inset-2 rounded-full border border-primary/20" />
                <div className="absolute inset-4 rounded-full border border-primary/10" />

                <svg viewBox="0 0 64 64" className="w-1/3 h-1/3 text-primary drop-shadow-[0_0_20px_rgba(59,130,246,0.6)]">
                    <text
                        x="32"
                        y="44"
                        textAnchor="middle"
                        fontSize="40"
                        fontWeight="bold"
                        fill="currentColor"
                        fontFamily="monospace"
                    >
                        ₿
                    </text>
                </svg>
            </div>

            {[
                { top: "8%", left: "20%", size: "6px", delay: "0s", dur: "3s" },
                { top: "15%", right: "15%", size: "4px", delay: "0.5s", dur: "4s" },
                { bottom: "20%", left: "10%", size: "5px", delay: "1s", dur: "3.5s" },
                { bottom: "10%", right: "25%", size: "3px", delay: "1.5s", dur: "2.5s" },
                { top: "50%", left: "5%", size: "4px", delay: "2s", dur: "4s" },
                { top: "35%", right: "8%", size: "5px", delay: "0.8s", dur: "3s" },
            ].map((p, i) => (
                <div
                    key={i}
                    className="absolute rounded-full bg-primary/40 animate-float"
                    style={{
                        top: p.top,
                        left: p.left,
                        right: p.right,
                        bottom: p.bottom,
                        width: p.size,
                        height: p.size,
                        animationDelay: p.delay,
                        animationDuration: p.dur,
                    }}
                />
            ))}
        </div>
    );
}
