"use client";

import { BellRing, RefreshCw } from "lucide-react";

interface CalendarFooterProps {
    subscriptionCount: number;
    loading: boolean;
    hasEvents: boolean;
}

export default function CalendarFooter({ subscriptionCount, loading, hasEvents }: CalendarFooterProps) {
    return (
        <div className="px-4 py-2 border-t border-border/30 bg-muted/5 flex items-center justify-between">
            <span className="text-[9px] text-muted">
                Data by Investing.com · Auto-refresh every 5 min
            </span>
            <div className="flex items-center gap-2">
                {subscriptionCount > 0 && (
                    <span className="text-[9px] text-primary flex items-center gap-1">
                        <BellRing className="w-3 h-3" />
                        {subscriptionCount} alert{subscriptionCount > 1 ? "s" : ""}
                    </span>
                )}
                {loading && hasEvents && (
                    <RefreshCw className="w-3 h-3 text-muted animate-spin" />
                )}
            </div>
        </div>
    );
}
