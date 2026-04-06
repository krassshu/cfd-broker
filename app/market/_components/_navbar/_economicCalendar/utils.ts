// ─── Date helpers ──────────────────────────────────────────

export function startOfDay(d: Date): Date {
    const r = new Date(d);
    r.setHours(0, 0, 0, 0);
    return r;
}

export function endOfDay(d: Date): Date {
    const r = new Date(d);
    r.setHours(23, 59, 59, 999);
    return r;
}

export function addDays(d: Date, n: number): Date {
    const r = new Date(d);
    r.setDate(r.getDate() + n);
    return r;
}

export function startOfWeek(d: Date): Date {
    const r = new Date(d);
    const day = r.getDay() || 7;
    r.setDate(r.getDate() - day + 1);
    return startOfDay(r);
}

export function endOfWeek(d: Date): Date {
    return endOfDay(addDays(startOfWeek(d), 6));
}

// ─── Date formatters ───────────────────────────────────────

export function fmtDate(d: Date): string {
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function fmtTime(iso: string): string {
    try {
        return new Date(iso).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
    } catch {
        return "—";
    }
}

export function fmtDay(iso: string): string {
    try {
        return new Date(iso).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
        });
    } catch {
        return "—";
    }
}

// ─── Calendar grid helpers ─────────────────────────────────

export function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
}

/** 0 = Mon, 6 = Sun (ISO weekday) */
export function getFirstWeekday(year: number, month: number): number {
    const d = new Date(year, month, 1).getDay();
    return d === 0 ? 6 : d - 1; // Convert Sun=0 → 6, Mon=1 → 0
}

export function isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear()
        && a.getMonth() === b.getMonth()
        && a.getDate() === b.getDate();
}

export function isInRange(date: Date, from: Date, to: Date): boolean {
    const d = startOfDay(date).getTime();
    return d >= startOfDay(from).getTime() && d <= startOfDay(to).getTime();
}

export function fmtMonthYear(d: Date): string {
    return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function toISODateStr(d: Date): string {
    return d.toISOString().slice(0, 10);
}

// ─── Number formatter ──────────────────────────────────────

export function fmtNum(val: number | null): string {
    if (val === null) return "—";
    const abs = Math.abs(val);
    const sign = val < 0 ? "-" : "";
    if (abs >= 1e9) return sign + (abs / 1e9).toFixed(1) + "B";
    if (abs >= 1e6) return sign + (abs / 1e6).toFixed(1) + "M";
    if (abs >= 1e4) return sign + (abs / 1e3).toFixed(1) + "K";
    if (Number.isInteger(val)) return val.toLocaleString("en-US");
    return val.toFixed(2);
}
