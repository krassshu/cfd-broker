// ─── Types & Constants ─────────────────────────────────────

export type Impact = "low" | "medium" | "high";
export type SortKey = "time" | "impact" | "currency";
export type SortDir = "asc" | "desc";
export type DatePreset = "yesterday" | "today" | "tomorrow" | "this_week" | "next_week" | "custom";

// ─── Currency Groups ──────────────────────────────────────

export interface CurrencyGroup {
    label: string;
    currencies: readonly string[];
}

export const CURRENCY_GROUPS: CurrencyGroup[] = [
    { label: "Major",    currencies: ["USD", "EUR", "GBP", "JPY", "CHF"] },
    { label: "Commodity", currencies: ["AUD", "CAD", "NZD"] },
    { label: "Emerging", currencies: ["CNY", "INR", "BRL", "KRW", "MXN"] },
];

/** Flat array of all currencies (for backward compat) */
export const CURRENCIES = CURRENCY_GROUPS.flatMap(g => [...g.currencies]);

// ─── Impact Config ────────────────────────────────────────

export const IMPACT_CONFIG: Record<Impact, { label: string; color: string; bg: string; dot: string }> = {
    high:   { label: "High",   color: "text-red-400",    bg: "bg-red-500/15",    dot: "bg-red-500"    },
    medium: { label: "Medium", color: "text-yellow-400", bg: "bg-yellow-500/15", dot: "bg-yellow-500" },
    low:    { label: "Low",    color: "text-emerald-400",bg: "bg-emerald-500/15",dot: "bg-emerald-500"},
};

export const IMPACT_SORT_ORDER: Record<Impact, number> = { high: 3, medium: 2, low: 1 };

export const AUTO_REFRESH_MS = 10 * 60 * 1000; // 10 minutes (server caches for 30 min)
