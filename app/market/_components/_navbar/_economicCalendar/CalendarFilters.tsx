"use client";

import { Filter, ChevronDown, ArrowUpDown } from "lucide-react";
import { CURRENCY_GROUPS, IMPACT_CONFIG, type Impact, type SortKey } from "./types";

interface CalendarFiltersProps {
    showFilters: boolean;
    onToggleFilters: () => void;
    selectedCurrencies: Set<string>;
    selectedImpacts: Set<Impact>;
    onToggleCurrency: (c: string) => void;
    onToggleImpact: (i: Impact) => void;
    onClearCurrencies: () => void;
    sortKey: SortKey;
    onCycleSort: (key: SortKey) => void;
}

export default function CalendarFilters({
    showFilters,
    onToggleFilters,
    selectedCurrencies,
    selectedImpacts,
    onToggleCurrency,
    onToggleImpact,
    onClearCurrencies,
    sortKey,
    onCycleSort,
}: CalendarFiltersProps) {
    return (
        <>
            {/* ─── Filter Toggle + Sort ─── */}
            <div className="px-4 py-2 border-b border-border/30 flex items-center justify-between">
                <button
                    onClick={onToggleFilters}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-all cursor-pointer
                        ${showFilters ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-muted/10"}
                    `}
                >
                    <Filter className="w-3 h-3" />
                    Filters
                    {(selectedCurrencies.size > 0 || selectedImpacts.size < 3) && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                    <ChevronDown className={`w-3 h-3 transition-transform ${showFilters ? "rotate-180" : ""}`} />
                </button>

                <div className="flex items-center gap-1">
                    {(["time", "impact", "currency"] as SortKey[]).map(key => (
                        <button
                            key={key}
                            onClick={() => onCycleSort(key)}
                            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all cursor-pointer
                                ${sortKey === key ? "bg-muted/15 text-foreground" : "text-muted-foreground hover:bg-muted/10"}
                            `}
                        >
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                            {sortKey === key && <ArrowUpDown className="w-2.5 h-2.5" />}
                        </button>
                    ))}
                </div>
            </div>

            {/* ─── Collapsible Filter Panel ─── */}
            {showFilters && (
                <div className="px-4 py-3 border-b border-border/30 bg-muted/5 space-y-3">
                    {/* Impact */}
                    <div>
                        <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">Impact</span>
                        <div className="flex gap-1.5 mt-1.5">
                            {(["high", "medium", "low"] as Impact[]).map(imp => (
                                <button
                                    key={imp}
                                    onClick={() => onToggleImpact(imp)}
                                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer
                                        ${selectedImpacts.has(imp)
                                            ? `${IMPACT_CONFIG[imp].bg} ${IMPACT_CONFIG[imp].color}`
                                            : "text-muted-foreground hover:bg-muted/10"
                                        }
                                    `}
                                >
                                    <span className={`w-2 h-2 rounded-full ${IMPACT_CONFIG[imp].dot}`} />
                                    {IMPACT_CONFIG[imp].label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Currencies — grouped */}
                    <div>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">Currency</span>
                            {selectedCurrencies.size > 0 && (
                                <button
                                    onClick={onClearCurrencies}
                                    className="text-[10px] text-primary hover:underline cursor-pointer"
                                >
                                    Clear all
                                </button>
                            )}
                        </div>
                        <div className="space-y-2 mt-1.5">
                            {CURRENCY_GROUPS.map(group => (
                                <div key={group.label}>
                                    <span className="text-[9px] text-muted/60 uppercase tracking-widest">{group.label}</span>
                                    <div className="flex flex-wrap gap-1 mt-0.5">
                                        {group.currencies.map(cur => (
                                            <button
                                                key={cur}
                                                onClick={() => onToggleCurrency(cur)}
                                                className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-medium transition-all cursor-pointer
                                                    ${selectedCurrencies.has(cur)
                                                        ? "bg-primary/15 text-primary"
                                                        : "text-muted-foreground hover:bg-muted/10 border border-border/40"
                                                    }
                                                `}
                                            >
                                                {cur}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
