"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { Calendar } from "lucide-react";
import { useMarketStore } from "@/lib/store";
import type { Impact, SortKey, SortDir, DatePreset } from "./types";
import { useCalendarData } from "./useCalendarData";
import CalendarHeader from "./CalendarHeader";
import CalendarDatePresets from "./CalendarDatePresets";
import CalendarDatePicker from "./CalendarDatePicker";
import CalendarFilters from "./CalendarFilters";
import CalendarEventList from "./CalendarEventList";
import CalendarFooter from "./CalendarFooter";

export default function EconomicCalendar() {
    const [isOpen, setIsOpen] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    // ─── Persisted filters from Zustand store ───
    const storedCurrencies = useMarketStore((s) => s.calendarSelectedCurrencies);
    const storedImpacts = useMarketStore((s) => s.calendarSelectedImpacts);
    const storedCustomFrom = useMarketStore((s) => s.calendarCustomDateFrom);
    const storedCustomTo = useMarketStore((s) => s.calendarCustomDateTo);
    const setStoredCurrencies = useMarketStore((s) => s.setCalendarSelectedCurrencies);
    const setStoredImpacts = useMarketStore((s) => s.setCalendarSelectedImpacts);
    const setStoredCustomDateRange = useMarketStore((s) => s.setCalendarCustomDateRange);

    // ─── Local state (not persisted) ───
    const [datePreset, setDatePreset] = useState<DatePreset>("today");
    const [sortKey, setSortKey] = useState<SortKey>("time");
    const [sortDir, setSortDir] = useState<SortDir>("asc");
    const [showFilters, setShowFilters] = useState(false);

    // Convert stored arrays to Sets for the hook
    const selectedCurrencies = useMemo(() => new Set(storedCurrencies), [storedCurrencies]);
    const selectedImpacts = useMemo(() => new Set(storedImpacts as Impact[]), [storedImpacts]);

    // Custom date range from store
    const customDateFrom = useMemo(() => storedCustomFrom ? new Date(storedCustomFrom) : null, [storedCustomFrom]);
    const customDateTo = useMemo(() => storedCustomTo ? new Date(storedCustomTo) : null, [storedCustomTo]);

    // ─── Store (subscriptions & highlights) ───
    const calendarSubscriptions = useMarketStore((s) => s.calendarSubscriptions);
    const addCalendarSubscription = useMarketStore((s) => s.addCalendarSubscription);
    const removeCalendarSubscription = useMarketStore((s) => s.removeCalendarSubscription);
    const highlightEventId = useMarketStore((s) => s.highlightEventId);
    const calendarShouldOpen = useMarketStore((s) => s.calendarShouldOpen);
    const clearCalendarHighlight = useMarketStore((s) => s.clearCalendarHighlight);

    // ─── Data hook ───
    const {
        events,
        filteredEvents,
        groupedByDay,
        loading,
        error,
        fetchEvents,
        upcomingCount,
        dateRange,
    } = useCalendarData({
        isOpen,
        datePreset,
        customDateFrom,
        customDateTo,
        selectedCurrencies,
        selectedImpacts,
        sortKey,
        sortDir,
    });

    // ─── Refs ───
    const panelRef = useRef<HTMLDivElement>(null);
    const highlightRef = useRef<HTMLDivElement>(null);
    const nowSeparatorRef = useRef<HTMLDivElement>(null);
    const didAutoScroll = useRef(false);

    // ─── Open calendar from notification click ───
    useEffect(() => {
        if (calendarShouldOpen) {
            setIsOpen(true);
            const timer = setTimeout(() => clearCalendarHighlight(), 3000);
            return () => clearTimeout(timer);
        }
    }, [calendarShouldOpen, clearCalendarHighlight]);

    // ─── Auto-scroll to Now separator — only once per open ───
    useEffect(() => {
        if (isOpen && !loading && events.length > 0 && !didAutoScroll.current) {
            const timer = setTimeout(() => {
                if (nowSeparatorRef.current) {
                    nowSeparatorRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
                }
                didAutoScroll.current = true;
            }, 200);
            return () => clearTimeout(timer);
        }
    }, [isOpen, loading, events.length]);

    // Reset auto-scroll flag when calendar closes or date preset changes
    useEffect(() => {
        if (!isOpen) didAutoScroll.current = false;
    }, [isOpen]);
    useEffect(() => {
        didAutoScroll.current = false;
    }, [datePreset]);

    // ─── Scroll to highlighted event ───
    useEffect(() => {
        if (highlightEventId && highlightRef.current) {
            highlightRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, [highlightEventId]);

    // ─── Click outside to close ───
    useEffect(() => {
        if (!isOpen) return;
        function handleClick(e: MouseEvent) {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [isOpen]);

    // ─── Toggle helpers (persist to store) ───
    const toggleCurrency = useCallback((c: string) => {
        const next = new Set(storedCurrencies);
        next.has(c) ? next.delete(c) : next.add(c);
        setStoredCurrencies([...next]);
    }, [storedCurrencies, setStoredCurrencies]);

    const toggleImpact = useCallback((i: Impact) => {
        const next = new Set(storedImpacts);
        next.has(i) ? next.delete(i) : next.add(i);
        setStoredImpacts([...next]);
    }, [storedImpacts, setStoredImpacts]);

    const cycleSort = useCallback((key: SortKey) => {
        if (key === sortKey) {
            setSortDir(d => d === "asc" ? "desc" : "asc");
        } else {
            setSortKey(key);
            setSortDir("asc");
        }
    }, [sortKey]);

    const toggleSubscription = useCallback((eventId: string) => {
        if (calendarSubscriptions.includes(eventId)) {
            removeCalendarSubscription(eventId);
        } else {
            addCalendarSubscription(eventId);
        }
    }, [calendarSubscriptions, addCalendarSubscription, removeCalendarSubscription]);

    // ─── Date picker handlers ───
    const handlePresetChange = useCallback((preset: DatePreset) => {
        setDatePreset(preset);
        setShowDatePicker(false);
    }, []);

    const handleDatePickerConfirm = useCallback((from: Date, to: Date) => {
        setStoredCustomDateRange(from.toISOString(), to.toISOString());
        setDatePreset("custom");
        setShowDatePicker(false);
    }, [setStoredCustomDateRange]);

    return (
        <div className="relative" ref={panelRef}>
            {/* ─── Trigger Button ─── */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer
                    ${isOpen
                        ? "bg-primary/15 text-primary"
                        : "text-muted-foreground hover:bg-muted/10 hover:text-foreground"
                    }
                `}
            >
                <Calendar className="w-4 h-4" />
                <span className="hidden md:inline">Calendar</span>

                {upcomingCount > 0 && (
                    <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white px-1">
                        {upcomingCount}
                    </span>
                )}
            </button>

            {/* ─── Panel ─── */}
            {isOpen && (
                <div className="absolute left-0 mt-2 w-[min(95vw,640px)] rounded-xl border border-border/50 bg-card/98 backdrop-blur-md shadow-2xl z-50 overflow-hidden flex flex-col max-h-[80vh]">
                    <CalendarHeader
                        filteredEventsCount={filteredEvents.length}
                        loading={loading}
                        onRefresh={fetchEvents}
                        onClose={() => setIsOpen(false)}
                    />

                    <CalendarDatePresets
                        datePreset={datePreset}
                        dateRange={dateRange}
                        onPresetChange={handlePresetChange}
                        onOpenDatePicker={() => setShowDatePicker(!showDatePicker)}
                    />

                    {showDatePicker && (
                        <CalendarDatePicker
                            initialFrom={dateRange.from}
                            initialTo={dateRange.to}
                            onConfirm={handleDatePickerConfirm}
                            onClose={() => setShowDatePicker(false)}
                        />
                    )}

                    <CalendarFilters
                        showFilters={showFilters}
                        onToggleFilters={() => setShowFilters(!showFilters)}
                        selectedCurrencies={selectedCurrencies}
                        selectedImpacts={selectedImpacts}
                        onToggleCurrency={toggleCurrency}
                        onToggleImpact={toggleImpact}
                        onClearCurrencies={() => setStoredCurrencies([])}
                        sortKey={sortKey}
                        onCycleSort={cycleSort}
                    />

                    <CalendarEventList
                        groupedByDay={groupedByDay}
                        loading={loading}
                        error={error}
                        filteredEventsCount={filteredEvents.length}
                        onRetry={fetchEvents}
                        calendarSubscriptions={calendarSubscriptions}
                        highlightEventId={highlightEventId}
                        onToggleSubscription={toggleSubscription}
                        nowSeparatorRef={nowSeparatorRef}
                        highlightRef={highlightRef}
                        hasEvents={events.length > 0}
                    />

                    <CalendarFooter
                        subscriptionCount={calendarSubscriptions.length}
                        loading={loading}
                        hasEvents={events.length > 0}
                    />
                </div>
            )}
        </div>
    );
}
