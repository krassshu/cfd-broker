"use client";

import { TrendingUp, TrendingDown, Minus, BellRing, BellOff, Clock } from "lucide-react";
import type { EconomicEvent } from "@/lib/economic-calendar";
import { IMPACT_CONFIG } from "./types";
import { fmtTime, fmtNum } from "./utils";

interface CalendarEventRowProps {
    event: EconomicEvent;
    isPast: boolean;
    isHighlighted: boolean;
    isSubscribed: boolean;
    highlightRef?: React.Ref<HTMLDivElement>;
    onToggleSubscription: (id: string) => void;
}

function renderActual(actual: number | null, estimate: number | null, isPast: boolean, noData?: boolean) {
    // No actual data yet
    if (actual === null) {
        // Holidays, speeches, etc. — will never have actual data
        if (noData) {
            return <span className="text-muted text-xs">—</span>;
        }
        if (isPast) {
            // Event happened but API hasn't updated actual yet — show "Pending"
            return (
                <span className="flex items-center gap-1 text-[10px] text-yellow-400">
                    <Clock className="w-3 h-3" />
                    Pending
                </span>
            );
        }
        // Future event — no actual expected yet
        return <span className="text-muted text-xs">—</span>;
    }

    // Actual data available — show with comparison to forecast
    if (estimate === null) {
        return <span className="font-mono text-xs text-foreground">{fmtNum(actual)}</span>;
    }

    const diff = actual - estimate;
    const Icon = diff > 0 ? TrendingUp : diff < 0 ? TrendingDown : Minus;
    const color = diff > 0 ? "text-up" : diff < 0 ? "text-down" : "text-muted";

    return (
        <span className={`flex items-center gap-1 font-mono text-xs ${color}`}>
            <Icon className="w-3 h-3" />
            {fmtNum(actual)}
        </span>
    );
}

export default function CalendarEventRow({
    event,
    isPast,
    isHighlighted,
    isSubscribed,
    highlightRef,
    onToggleSubscription,
}: CalendarEventRowProps) {
    return (
        <div
            ref={highlightRef}
            className={`px-4 py-2.5 border-b border-border/15 hover:bg-muted/5 transition-all grid grid-cols-[44px_1fr_auto] gap-3 items-center
                ${isPast ? "opacity-50" : ""}
                ${isHighlighted ? "ring-2 ring-primary/40 bg-primary/5 rounded-md" : ""}
            `}
        >
            {/* Time */}
            <span className="font-mono text-[11px] text-muted-foreground">
                {fmtTime(event.time)}
            </span>

            {/* Event info */}
            <div className="min-w-0">
                <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${IMPACT_CONFIG[event.impact].dot}`} />
                    <span className="text-xs font-medium text-foreground truncate">
                        {event.event}
                    </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 ml-3.5">
                    <span className="text-[10px] font-mono text-primary/80 font-medium">
                        {event.currency}
                    </span>
                    <span className={`text-[9px] font-medium px-1 py-0 rounded ${IMPACT_CONFIG[event.impact].bg} ${IMPACT_CONFIG[event.impact].color}`}>
                        {IMPACT_CONFIG[event.impact].label}
                    </span>
                </div>
            </div>

            {/* Data columns + subscribe */}
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-3 text-right">
                    <div className="w-14">
                        <span className="text-[9px] text-muted block">Actual</span>
                        {renderActual(event.actual, event.estimate, isPast, event.noData)}
                    </div>
                    <div className="w-14">
                        <span className="text-[9px] text-muted block">Forecast</span>
                        <span className="font-mono text-xs text-muted-foreground">
                            {fmtNum(event.estimate)}
                        </span>
                    </div>
                    <div className="w-14 hidden sm:block">
                        <span className="text-[9px] text-muted block">Previous</span>
                        <span className="font-mono text-xs text-muted-foreground">
                            {fmtNum(event.prev)}
                        </span>
                    </div>
                </div>

                {/* Subscribe button */}
                <button
                    onClick={() => onToggleSubscription(event.id)}
                    title={isSubscribed ? "Unsubscribe from alerts" : "Subscribe to alerts"}
                    className={`p-1 rounded-md transition-all cursor-pointer shrink-0
                        ${isSubscribed
                            ? "text-primary bg-primary/10 hover:bg-primary/20"
                            : "text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted/10"
                        }
                    `}
                >
                    {isSubscribed
                        ? <BellRing className="w-3.5 h-3.5" />
                        : <BellOff className="w-3.5 h-3.5" />
                    }
                </button>
            </div>
        </div>
    );
}
