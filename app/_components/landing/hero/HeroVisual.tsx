"use client";

import { useEffect, useState } from "react";

export default function HeroVisual() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    return (
        <div
            className={`relative w-full max-w-2xl mx-auto mt-16 transition-opacity duration-700 ${
                mounted ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden="true"
        >
            <div className="absolute inset-0 -z-10 blur-[80px] bg-primary/10 rounded-full scale-110" />

            <div className="relative rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-6 overflow-hidden">
                {/* Terminal-style top bar */}
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-2.5 h-2.5 rounded-full bg-down/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-primary/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-up/60" />
                    <div className="ml-3 h-3 w-32 rounded bg-border/30" />
                    <div className="ml-auto h-3 w-16 rounded bg-border/30" />
                </div>

                <svg
                    viewBox="0 0 600 200"
                    className="w-full h-auto"
                    preserveAspectRatio="xMidYMid meet"
                >
                    {[40, 80, 120, 160].map((y) => (
                        <line
                            key={y}
                            x1="0" y1={y} x2="600" y2={y}
                            className="stroke-border/30"
                            strokeWidth="1"
                            strokeDasharray="4 4"
                        />
                    ))}

                    <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" className="[stop-color:var(--primary)]" stopOpacity="0.3" />
                            <stop offset="100%" className="[stop-color:var(--primary)]" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    <path
                        d="M0,160 C40,155 80,140 120,130 C160,120 200,100 240,85 C280,70 320,90 360,75 C400,60 440,45 480,55 C520,65 560,40 600,30 L600,200 L0,200 Z"
                        fill="url(#chartGrad)"
                    />

                    <path
                        d="M0,160 C40,155 80,140 120,130 C160,120 200,100 240,85 C280,70 320,90 360,75 C400,60 440,45 480,55 C520,65 560,40 600,30"
                        fill="none"
                        className="stroke-primary"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <animate
                            attributeName="stroke-dasharray"
                            from="0 1200"
                            to="1200 0"
                            dur="2s"
                            fill="freeze"
                        />
                    </path>

                    {/* Pulsing endpoint */}
                    <circle cx="600" cy="30" r="4" className="fill-primary">
                        <animate attributeName="r" values="4;7;4" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
                    </circle>
                </svg>

                <div className="flex items-center gap-6 mt-4 text-xs font-mono">
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-up" />
                        <span className="text-muted">BTC/USDT</span>
                        <span className="text-up font-bold">+3.24%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-up" />
                        <span className="text-muted">ETH/USDT</span>
                        <span className="text-up font-bold">+1.87%</span>
                    </div>
                    <div className="flex items-center gap-1.5 hidden sm:flex">
                        <div className="w-1.5 h-1.5 rounded-full bg-down" />
                        <span className="text-muted">SOL/USDT</span>
                        <span className="text-down font-bold">-0.92%</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
