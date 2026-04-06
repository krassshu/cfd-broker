"use client";

import { Calendar, RefreshCw } from "lucide-react";
import type { EconomicEvent } from "@/lib/economic-calendar";
import CalendarEventRow from "./CalendarEventRow";
import React from "react";

interface CalendarEventListProps {
    groupedByDay: [string, EconomicEvent[]][];
    loading: boolean;
    error: string | null;
    filteredEventsCount: number;
    onRetry: () => void;
    calendarSubscriptions: string[];
    highlightEventId: string | null;
    onToggleSubscription: (id: string) => void;
    nowSeparatorRef: React.RefObject<HTMLDivElement | null>;
    highlightRef: React.RefObject<HTMLDivElement | null>;
    hasEvents: boolean;
}

export default function CalendarEventList({
    groupedByDay,
    loading,
    error,
    filteredEventsCount,
    onRetry,
    calendarSubscriptions,
    highlightEventId,
    onToggleSubscription,
    nowSeparatorRef,
    highlightRef,
    hasEvents,
}: CalendarEventListProps) {
    const nowMs = Date.now();

    if (loading && !hasEvents) {
        return (
            <div className="overflow-y-auto flex-1 custom-scrollbar">
                <div className="p-12 text-center">
                    <RefreshCw className="w-6 h-6 mx-auto text-muted animate-spin mb-3" />
                    <p className="text-sm text-muted-foreground">Loading events...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="overflow-y-auto flex-1 custom-scrollbar">
                <div className="p-12 text-center">
                    <p className="text-sm text-red-400 mb-2">{error}</p>
                    <button onClick={onRetry} className="text-xs text-primary hover:underline cursor-pointer">
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (filteredEventsCount === 0) {
        return (
            <div className="overflow-y-auto flex-1 custom-scrollbar">
                <div className="p-12 text-center">
                    <Calendar className="w-8 h-8 mx-auto text-muted/30 mb-3" />
                    <p className="text-sm text-muted-foreground">No events match your filters</p>
                    <p className="text-[10px] text-muted mt-1">Try adjusting date range or filters</p>
                </div>
            </div>
        );
    }

    return (
        <div className="overflow-y-auto flex-1 custom-scrollbar">
            {groupedByDay.map(([day, dayEvents]) => {
                // Find split point for Now separator: last event that is in the past
                let separatorIndex = -1;
                for (let i = 0; i < dayEvents.length; i++) {
                    if (new Date(dayEvents[i].time).getTime() <= nowMs) {
                        separatorIndex = i;
                    }
                }
                const hasPast = separatorIndex >= 0;
                const hasUpcoming = separatorIndex < dayEvents.length - 1;
                const showSeparator = hasPast && hasUpcoming;

                return (
                    <div key={day}>
                        {/* Day header */}
                        <div className="px-4 py-1.5 bg-muted/8 border-b border-border/20 sticky top-0 z-10">
                            <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">{day}</span>
                            <span className="text-[10px] text-muted ml-2">({dayEvents.length})</span>
                        </div>

                        {/* Events with separator */}
                        {dayEvents.map((event, idx) => (
                            <React.Fragment key={event.id}>
                                {/* Past/Upcoming "Now" separator */}
                                {showSeparator && idx === separatorIndex + 1 && (
                                    <div ref={nowSeparatorRef} className="flex items-center gap-2 px-4 py-1.5">
                                        <div className="flex-1 h-px bg-primary/30" />
                                        <span className="text-[9px] font-semibold text-primary uppercase tracking-wider">Now</span>
                                        <div className="flex-1 h-px bg-primary/30" />
                                    </div>
                                )}

                                <CalendarEventRow
                                    event={event}
                                    isPast={new Date(event.time).getTime() <= nowMs}
                                    isHighlighted={highlightEventId === event.id}
                                    isSubscribed={calendarSubscriptions.includes(event.id)}
                                    highlightRef={highlightEventId === event.id ? highlightRef : undefined}
                                    onToggleSubscription={onToggleSubscription}
                                />
                            </React.Fragment>
                        ))}
                    </div>
                );
            })}
        </div>
    );
}
