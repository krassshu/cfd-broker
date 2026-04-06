"use client";

import { Calendar, RefreshCw, X } from "lucide-react";

interface CalendarHeaderProps {
    filteredEventsCount: number;
    loading: boolean;
    onRefresh: () => void;
    onClose: () => void;
}

export default function CalendarHeader({ filteredEventsCount, loading, onRefresh, onClose }: CalendarHeaderProps) {
    return (
        <div className="px-4 py-3 border-b border-border/50 bg-muted/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm text-foreground">Economic Calendar</h3>
                <span className="text-[10px] text-muted bg-muted/15 px-1.5 py-0.5 rounded-full font-mono">
                    {filteredEventsCount} events
                </span>
            </div>
            <div className="flex items-center gap-1">
                <button
                    onClick={onRefresh}
                    disabled={loading}
                    className="p-1.5 rounded-lg hover:bg-muted/10 transition-colors text-muted-foreground hover:text-foreground cursor-pointer disabled:opacity-50"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                </button>
                <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg hover:bg-muted/10 transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}
