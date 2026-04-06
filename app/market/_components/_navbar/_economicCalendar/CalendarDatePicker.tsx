"use client";

import { useState, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { getDaysInMonth, getFirstWeekday, isSameDay, isInRange, startOfDay, fmtMonthYear, addDays } from "./utils";

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

interface CalendarDatePickerProps {
    initialFrom: Date;
    initialTo: Date;
    onConfirm: (from: Date, to: Date) => void;
    onClose: () => void;
}

export default function CalendarDatePicker({ initialFrom, initialTo, onConfirm, onClose }: CalendarDatePickerProps) {
    const [rangeStart, setRangeStart] = useState<Date | null>(initialFrom);
    const [rangeEnd, setRangeEnd] = useState<Date | null>(initialTo);
    const [selecting, setSelecting] = useState<"start" | "end" | null>(null);

    // Current viewed month
    const [viewDate, setViewDate] = useState(() => new Date(initialFrom.getFullYear(), initialFrom.getMonth(), 1));

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const prevMonth = useCallback(() => setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1)), []);
    const nextMonth = useCallback(() => setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1)), []);

    // Build calendar grid
    const calendarDays = useMemo(() => {
        const daysInMonth = getDaysInMonth(year, month);
        const firstWeekday = getFirstWeekday(year, month);
        const days: (Date | null)[] = [];

        // Empty cells before first day
        for (let i = 0; i < firstWeekday; i++) days.push(null);
        // Actual days
        for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));

        return days;
    }, [year, month]);

    function handleDayClick(date: Date) {
        if (!rangeStart || selecting === "start" || (rangeStart && rangeEnd && !selecting)) {
            // Starting a new selection
            setRangeStart(date);
            setRangeEnd(null);
            setSelecting("end");
        } else if (selecting === "end") {
            // Completing selection
            if (date < rangeStart) {
                setRangeEnd(rangeStart);
                setRangeStart(date);
            } else {
                setRangeEnd(date);
            }
            setSelecting(null);
        }
    }

    function handleConfirm() {
        if (rangeStart) {
            const from = startOfDay(rangeStart);
            const to = rangeEnd ? startOfDay(rangeEnd) : startOfDay(rangeStart);
            // Set to end of day for 'to' date
            to.setHours(23, 59, 59, 999);
            onConfirm(from, to);
        }
    }

    // Quick presets
    function applyQuickPreset(from: Date, to: Date) {
        setRangeStart(from);
        setRangeEnd(to);
        setSelecting(null);
        setViewDate(new Date(from.getFullYear(), from.getMonth(), 1));
    }

    const today = startOfDay(new Date());

    const quickPresets = useMemo(() => {
        const now = new Date();
        return [
            { label: "Today",       from: startOfDay(now),              to: startOfDay(now) },
            { label: "Last 3 days", from: startOfDay(addDays(now, -2)), to: startOfDay(now) },
            { label: "This week",   from: startOfDay(addDays(now, -(now.getDay() || 7) + 1)), to: startOfDay(addDays(now, 7 - (now.getDay() || 7))) },
            { label: "Last 7 days", from: startOfDay(addDays(now, -6)), to: startOfDay(now) },
            { label: "Last 14 days",from: startOfDay(addDays(now, -13)),to: startOfDay(now) },
            { label: "This month",  from: new Date(now.getFullYear(), now.getMonth(), 1), to: new Date(now.getFullYear(), now.getMonth() + 1, 0) },
        ];
    }, []);

    return (
        <div className="border-b border-border/30 bg-card/98">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-border/20">
                <span className="text-xs font-semibold text-foreground">Select Date Range</span>
                <button onClick={onClose} className="p-1 rounded hover:bg-muted/10 text-muted-foreground cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>

            <div className="flex">
                {/* Quick Presets — sidebar */}
                <div className="w-[130px] border-r border-border/20 p-2 space-y-0.5 shrink-0">
                    {quickPresets.map(p => (
                        <button
                            key={p.label}
                            onClick={() => applyQuickPreset(p.from, p.to)}
                            className="w-full text-left px-2 py-1 rounded text-[11px] text-muted-foreground hover:bg-muted/10 hover:text-foreground transition-all cursor-pointer"
                        >
                            {p.label}
                        </button>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="flex-1 p-3">
                    {/* Month Navigation */}
                    <div className="flex items-center justify-between mb-2">
                        <button onClick={prevMonth} className="p-1 rounded hover:bg-muted/10 text-muted-foreground cursor-pointer">
                            <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-medium text-foreground">{fmtMonthYear(viewDate)}</span>
                        <button onClick={nextMonth} className="p-1 rounded hover:bg-muted/10 text-muted-foreground cursor-pointer">
                            <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/* Weekday headers */}
                    <div className="grid grid-cols-7 gap-0.5 mb-1">
                        {WEEKDAYS.map(d => (
                            <div key={d} className="text-center text-[9px] font-medium text-muted/60 py-0.5">{d}</div>
                        ))}
                    </div>

                    {/* Day cells */}
                    <div className="grid grid-cols-7 gap-0.5">
                        {calendarDays.map((date, i) => {
                            if (!date) return <div key={`empty-${i}`} />;

                            const isToday = isSameDay(date, today);
                            const isStart = rangeStart && isSameDay(date, rangeStart);
                            const isEnd = rangeEnd && isSameDay(date, rangeEnd);
                            const inRange = rangeStart && rangeEnd && isInRange(date, rangeStart, rangeEnd);
                            const isSelected = isStart || isEnd;

                            return (
                                <button
                                    key={date.getDate()}
                                    onClick={() => handleDayClick(date)}
                                    className={`
                                        relative h-7 rounded text-[11px] font-medium transition-all cursor-pointer
                                        ${isSelected
                                            ? "bg-primary text-primary-foreground"
                                            : inRange
                                                ? "bg-primary/10 text-primary"
                                                : isToday
                                                    ? "text-primary font-bold"
                                                    : "text-foreground hover:bg-muted/15"
                                        }
                                    `}
                                >
                                    {date.getDate()}
                                    {isToday && !isSelected && (
                                        <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Selected Range + Actions */}
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/20">
                        <div className="text-[11px] text-muted-foreground font-mono">
                            {rangeStart
                                ? `${rangeStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })}${
                                    rangeEnd && !isSameDay(rangeStart, rangeEnd)
                                        ? ` — ${rangeEnd.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                                        : ""
                                }`
                                : "Select start date"
                            }
                            {selecting === "end" && <span className="text-primary ml-1">→ select end</span>}
                        </div>
                        <div className="flex gap-1.5">
                            <button
                                onClick={onClose}
                                className="px-2.5 py-1 rounded-md text-[11px] text-muted-foreground hover:bg-muted/10 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={!rangeStart}
                                className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-primary/15 text-primary hover:bg-primary/25 disabled:opacity-30 cursor-pointer"
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
