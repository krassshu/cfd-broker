"use client";

import { useEffect, useState } from "react";

function pad(n: number): string {
    return n.toString().padStart(2, "0");
}

export default function NavbarClock() {
    const [now, setNow] = useState<Date | null>(null);

    useEffect(() => {
        // Set initial time after mount to avoid SSR mismatch
        setNow(new Date());

        const interval = setInterval(() => {
            setNow(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // Render placeholder during SSR / first client frame
    if (!now) {
        return (
            <div className="hidden md:flex items-center gap-2 select-none" aria-label="Clock">
                <span className="font-mono text-sm tracking-wider text-muted-foreground/60">
                    --:--:-- --.--. ----
                </span>
            </div>
        );
    }

    const hours = pad(now.getHours());
    const minutes = pad(now.getMinutes());
    const seconds = pad(now.getSeconds());
    const day = pad(now.getDate());
    const month = pad(now.getMonth() + 1);
    const year = now.getFullYear();

    return (
        <div
            className="hidden md:flex items-center gap-2 select-none"
            aria-label="Current time"
        >
            {/* Time section */}
            <div className="flex items-baseline gap-px font-mono text-sm tracking-wider">
                <span className="text-foreground font-semibold">{hours}</span>
                <span className="text-primary/70 animate-pulse">:</span>
                <span className="text-foreground font-semibold">{minutes}</span>
                <span className="text-primary/70 animate-pulse">:</span>
                <span className="text-muted-foreground font-medium">{seconds}</span>
            </div>

            {/* Subtle separator */}
            <span className="w-px h-3.5 bg-border/40" />

            {/* Date section */}
            <div className={"font-mono"}>
                <span className="font-semibold text-xs tracking-wide text-muted-foreground">
                    {day}.{month}.{year}
                </span>
            </div>
        </div>
    );
}
