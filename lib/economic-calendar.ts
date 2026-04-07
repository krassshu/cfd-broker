"use server"

// ─── Public types ─────────────────────────────────────

export interface EconomicEvent {
    id: string;
    country: string;
    currency: string;
    event: string;
    impact: 'low' | 'medium' | 'high';
    time: string;
    actual: number | null;
    estimate: number | null;
    prev: number | null;
    unit: string;
    /** true for holidays / speeches that never produce actual data */
    noData?: boolean;
}

// ─── Config ───────────────────────────────────────────

const isDev = process.env.NODE_ENV === 'development';

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY ?? '';
const RAPIDAPI_HOST = 'economic-calendar-api.p.rapidapi.com';
const RAPIDAPI_URL = `https://${RAPIDAPI_HOST}/calendar`;

// Cache for 30 min — free tier has ~500 req/month, this keeps us well under
const CACHE_TTL_MS = 30 * 60 * 1000;

let cache: { data: EconomicEvent[]; ts: number; from: string; to: string } | null = null;

// ─── RapidAPI response types ─────────────────────────

interface RapidAPIEvent {
    id: string;
    eventId: string;
    dateUtc: string;
    actual: number | null;
    revised: number | null;
    consensus: number | null;
    previous: number | null;
    name: string;
    countryCode: string;
    currencyCode: string;
    unit: string;
    volatility: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH';
    isAllDay: boolean;
    isSpeech: boolean;
    isTentative: boolean;
    isPreliminary: boolean;
    isReport: boolean;
}

interface RapidAPIResponse {
    success: boolean;
    message?: string;
    data: RapidAPIEvent[];
}

// ─── Mappers ─────────────────────────────────────────

function mapVolatility(v: string | undefined): EconomicEvent['impact'] {
    switch (v?.toUpperCase()) {
        case 'HIGH': return 'high';
        case 'MEDIUM': return 'medium';
        default: return 'low';
    }
}

function isNoDataEvent(event: RapidAPIEvent): boolean {
    if (event.isAllDay || event.isSpeech) return true;
    const lower = event.name.toLowerCase();
    return /\b(holiday|day off|easter|christmas|new year|ramadan|good friday|maundy|thanksgiving|ascension|whit|corpus christi|remembrance|independence|memorial|bank holiday|eve|closed)\b/.test(lower);
}

function mapEvent(raw: RapidAPIEvent): EconomicEvent {
    return {
        id: raw.id,
        country: raw.countryCode,
        currency: raw.currencyCode || 'USD',
        event: raw.name,
        impact: mapVolatility(raw.volatility),
        time: raw.dateUtc,
        actual: raw.actual,
        estimate: raw.consensus,
        prev: raw.previous,
        unit: raw.unit || '',
        noData: isNoDataEvent(raw),
    };
}

// ─── Fetch from RapidAPI ─────────────────────────────

async function fetchFromRapidAPI(from: string, to: string): Promise<EconomicEvent[]> {
    if (!RAPIDAPI_KEY) {
        console.error('[calendar] RAPIDAPI_KEY is not configured');
        return [];
    }

    if (isDev) console.log(`[calendar] Fetching RapidAPI: ${from} → ${to}`);

    try {
        const url = `${RAPIDAPI_URL}?from=${from}&to=${to}&limit=1000`;
        const res = await fetch(url, {
            method: 'GET',
            headers: {
                'x-rapidapi-key': RAPIDAPI_KEY,
                'x-rapidapi-host': RAPIDAPI_HOST,
            },
            next: { revalidate: 0 },
        });

        if (!res.ok) {
            if (isDev) console.error(`[calendar] RapidAPI HTTP ${res.status}`);
            return [];
        }

        const json: RapidAPIResponse = await res.json();

        if (!json.success || !Array.isArray(json.data)) {
            if (isDev) console.error(`[calendar] RapidAPI error: ${json.message}`);
            return [];
        }

        const events = json.data.map(mapEvent);
        if (isDev) console.log(`[calendar] ✓ RapidAPI: ${events.length} events (${from} → ${to})`);
        return events;
    } catch (err: any) {
        if (isDev) console.error(`[calendar] RapidAPI fetch error: ${err?.message}`);
        return [];
    }
}

// ─── Public API ──────────────────────────────────────

export async function fetchEconomicCalendar(
    from: Date,
    to: Date,
): Promise<EconomicEvent[]> {
    const fromStr = from.toISOString().slice(0, 10);
    const toStr = to.toISOString().slice(0, 10);

    // Check if cache covers the requested range and is fresh
    const cacheValid = cache
        && Date.now() - cache.ts < CACHE_TTL_MS
        && cache.from <= fromStr
        && cache.to >= toStr;

    if (!cacheValid) {
        // Fetch a wider range (full week) to maximize cache hits
        const now = new Date();
        const day = now.getDay() || 7;
        const monday = new Date(now);
        monday.setDate(now.getDate() - day + 1);
        const nextSunday = new Date(monday);
        nextSunday.setDate(monday.getDate() + 13); // 2 weeks for coverage

        const wideFrom = monday.toISOString().slice(0, 10);
        const wideTo = nextSunday.toISOString().slice(0, 10);

        const events = await fetchFromRapidAPI(wideFrom, wideTo);

        // Only cache non-empty results
        if (events.length > 0) {
            cache = { data: events, ts: Date.now(), from: wideFrom, to: wideTo };
        } else if (cache) {
            if (isDev) console.log('[calendar] Fresh fetch returned 0 events, keeping stale cache');
        }
    }

    return filterByDate(cache?.data ?? [], from, to);
}

function filterByDate(events: EconomicEvent[], from: Date, to: Date): EconomicEvent[] {
    const fromMs = from.getTime();
    const toMs = to.getTime();
    return events.filter(e => {
        const t = new Date(e.time).getTime();
        return t >= fromMs && t <= toMs;
    });
}
