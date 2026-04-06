"use client";

import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import type { DatePreset } from "./types";
import { fmtDate } from "./utils";

const PRESET_ORDER: DatePreset[] = ["yesterday", "today", "tomorrow", "this_week", "next_week"];

const PRESET_LABELS: [DatePreset, string][] = [
    ["yesterday", "Yesterday"],
    ["today", "Today"],
    ["tomorrow", "Tomorrow"],
    ["this_week", "This Week"],
    ["next_week", "Next Week"],
];

interface CalendarDatePresetsProps {
    datePreset: DatePreset;
    dateRange: { from: Date; to: Date };
    onPresetChange: (preset: DatePreset) => void;
    onOpenDatePicker: () => void;
}

export default function CalendarDatePresets({ datePreset, dateRange, onPresetChange, onOpenDatePicker }: CalendarDatePresetsProps) {
    function navigate(direction: -1 | 1) {
        const order = [...PRESET_ORDER, "custom" as DatePreset];
        const idx = order.indexOf(datePreset);
        const next = idx + direction;
        if (next >= 0 && next < order.length) {
            if (order[next] === "custom") {
                onOpenDatePicker();
            } else {
                onPresetChange(order[next]);
            }
        }
    }

    return (
        <div className="px-4 py-2 border-b border-border/30 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 overflow-x-auto">
                {PRESET_LABELS.map(([key, label]) => (
                    <button
                        key={key}
                        onClick={() => onPresetChange(key)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-all cursor-pointer
                            ${datePreset === key
                                ? "bg-primary/15 text-primary"
                                : "text-muted-foreground hover:bg-muted/10 hover:text-foreground"
                            }
                        `}
                    >
                        {label}
                    </button>
                ))}
                <button
                    onClick={onOpenDatePicker}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-all cursor-pointer
                        ${datePreset === "custom"
                            ? "bg-primary/15 text-primary"
                            : "text-muted-foreground hover:bg-muted/10 hover:text-foreground"
                        }
                    `}
                >
                    <CalendarDays className="w-3 h-3" />
                    Custom
                </button>
            </div>
            <div className="flex items-center gap-2">
                <span className="text-[10px] text-muted font-mono whitespace-nowrap">
                    {fmtDate(dateRange.from)} – {fmtDate(dateRange.to)}
                </span>
                <div className="flex gap-0.5">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-1 rounded hover:bg-muted/10 text-muted-foreground cursor-pointer"
                    >
                        <ChevronLeft className="w-3 h-3" />
                    </button>
                    <button
                        onClick={() => navigate(1)}
                        className="p-1 rounded hover:bg-muted/10 text-muted-foreground cursor-pointer"
                    >
                        <ChevronRight className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </div>
    );
}
