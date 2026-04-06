"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getEconomicCalendar } from "@/app/actions/economic-calendar";
import type { EconomicEvent } from "@/lib/economic-calendar";
import { IMPACT_SORT_ORDER, AUTO_REFRESH_MS, type Impact, type SortDir, type SortKey, type DatePreset } from "./types";
import { startOfDay, endOfDay, addDays, startOfWeek, endOfWeek, fmtDay } from "./utils";

// ─── Return type ──────────────────────────────────────

export interface CalendarDataReturn {
    events: EconomicEvent[];
    filteredEvents: EconomicEvent[];
    groupedByDay: [string, EconomicEvent[]][];
    loading: boolean;
    error: string | null;
    fetchEvents: () => Promise<void>;
    upcomingCount: number;
    dateRange: { from: Date; to: Date };
}

interface Params {
    isOpen: boolean;
    datePreset: DatePreset;
    customDateFrom: Date | null;
    customDateTo: Date | null;
    selectedCurrencies: Set<string>;
    selectedImpacts: Set<Impact>;
    sortKey: SortKey;
    sortDir: SortDir;
}

// ─── Hook ─────────────────────────────────────────────

export function useCalendarData({
    isOpen,
    datePreset,
    customDateFrom,
    customDateTo,
    selectedCurrencies,
    selectedImpacts,
    sortKey,
    sortDir,
}: Params): CalendarDataReturn {
    const [events, setEvents] = useState<EconomicEvent[]>([]);
    const [todayEvents, setTodayEvents] = useState<EconomicEvent[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Track whether this is the initial open (for auto-scroll)
    const hasLoadedOnce = useRef(false);

    // ─── Date range from preset or custom (memoized) ───
    const dateRange = useMemo(() => {
        const now = new Date();
        switch (datePreset) {
            case "yesterday":
                return { from: startOfDay(addDays(now, -1)), to: endOfDay(addDays(now, -1)) };
            case "today":
                return { from: startOfDay(now), to: endOfDay(now) };
            case "tomorrow":
                return { from: startOfDay(addDays(now, 1)), to: endOfDay(addDays(now, 1)) };
            case "this_week":
                return { from: startOfWeek(now), to: endOfWeek(now) };
            case "next_week":
                return { from: startOfWeek(addDays(now, 7)), to: endOfWeek(addDays(now, 7)) };
            case "custom":
                if (customDateFrom && customDateTo) {
                    return { from: startOfDay(customDateFrom), to: endOfDay(customDateTo) };
                }
                return { from: startOfDay(now), to: endOfDay(addDays(now, 6)) };
            default:
                return { from: startOfDay(now), to: endOfDay(addDays(now, 6)) };
        }
    }, [datePreset, customDateFrom, customDateTo]);

    // ─── Fetch events for the selected preset ───
    const fetchEvents = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await getEconomicCalendar(
                dateRange.from.toISOString(),
                dateRange.to.toISOString(),
            );
            if (result.success) {
                setEvents(result.data);
            } else {
                setError(result.message ?? "Failed to load");
            }

            // Also fetch today's events for upcomingCount badge
            // (server caches the full week so this is essentially free)
            if (datePreset !== "today") {
                const now = new Date();
                const todayResult = await getEconomicCalendar(
                    startOfDay(now).toISOString(),
                    endOfDay(now).toISOString(),
                );
                if (todayResult.success) {
                    setTodayEvents(todayResult.data);
                }
            }
        } catch {
            setError("Network error");
        } finally {
            setLoading(false);
        }
    }, [dateRange, datePreset]);

    // Fetch on open or date change
    useEffect(() => {
        if (isOpen) {
            fetchEvents();
            hasLoadedOnce.current = false; // reset on new date preset
        }
    }, [isOpen, fetchEvents]);

    // ─── Auto-refresh while open ───
    useEffect(() => {
        if (!isOpen) return;
        const interval = setInterval(fetchEvents, AUTO_REFRESH_MS);
        return () => clearInterval(interval);
    }, [isOpen, fetchEvents]);

    // Keep todayEvents in sync when viewing "today"
    useEffect(() => {
        if (datePreset === "today") {
            setTodayEvents(events);
        }
    }, [datePreset, events]);

    // ─── Filter & sort ───
    const filteredEvents = useMemo(() => {
        let result = [...events];

        if (selectedCurrencies.size > 0) {
            result = result.filter((e) => selectedCurrencies.has(e.currency));
        }

        if (selectedImpacts.size > 0 && selectedImpacts.size < 3) {
            result = result.filter((e) => selectedImpacts.has(e.impact));
        }

        result.sort((a, b) => {
            let cmp = 0;
            switch (sortKey) {
                case "time":
                    cmp = new Date(a.time).getTime() - new Date(b.time).getTime();
                    break;
                case "impact":
                    cmp = IMPACT_SORT_ORDER[a.impact] - IMPACT_SORT_ORDER[b.impact];
                    break;
                case "currency":
                    cmp = a.currency.localeCompare(b.currency);
                    break;
            }
            return sortDir === "asc" ? cmp : -cmp;
        });

        return result;
    }, [events, selectedCurrencies, selectedImpacts, sortKey, sortDir]);

    // ─── Group by day ───
    const groupedByDay = useMemo(() => {
        const groups: Record<string, EconomicEvent[]> = {};
        for (const e of filteredEvents) {
            const day = fmtDay(e.time);
            if (!groups[day]) groups[day] = [];
            groups[day].push(e);
        }
        return Object.entries(groups).sort((a, b) =>
            new Date(a[1][0].time).getTime() - new Date(b[1][0].time).getTime()
        );
    }, [filteredEvents]);

    // ─── Upcoming count: ALWAYS based on today's events ───
    const upcomingCount = useMemo(() => {
        const now = new Date();
        return todayEvents.filter((e) => {
            const t = new Date(e.time);
            return e.impact === "high" && t > now;
        }).length;
    }, [todayEvents]);

    return {
        events,
        filteredEvents,
        groupedByDay,
        loading,
        error,
        fetchEvents,
        upcomingCount,
        dateRange,
    };
}
