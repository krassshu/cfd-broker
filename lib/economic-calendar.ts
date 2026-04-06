"use server"

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

// ─── Cache ─────────────────────────────────────────────
let cache: { data: EconomicEvent[]; ts: number } | null = null;
const CACHE_TTL_MS = 3 * 60 * 1000;

// ─── Parsers ──────────────────────────────────────────

function mapImpact(val: string | number | null | undefined): EconomicEvent['impact'] {
    if (val === null || val === undefined) return 'low';
    const lower = val.toString().toLowerCase();
    if (lower === '3' || lower.includes('high') || lower.includes('bull3') || lower.includes('icon--3')) return 'high';
    if (lower === '2' || lower.includes('medium') || lower.includes('moderate') || lower.includes('orange') || lower.includes('bull2')) return 'medium';
    return 'low';
}

function parseNum(val: string | number | null | undefined): number | null {
    if (val === null || val === undefined || val === '') return null;
    if (typeof val === 'number') return isNaN(val) ? null : val;

    let str = val.toString().trim();
    str = str.replace(/<[^>]*>/g, '').trim();
    str = str.replace(/&[a-z]+;/gi, '').trim();
    if (!str || str === '—' || str === '-' || str === 'N/A') return null;

    const upper = str.toUpperCase();
    let cleaned = upper.replace(/[^0-9.\-KMB%]/g, '');
    if (!cleaned || cleaned === '%') return null;

    let multiplier = 1;
    if (cleaned.endsWith('K')) { multiplier = 1_000; cleaned = cleaned.slice(0, -1); }
    else if (cleaned.endsWith('M')) { multiplier = 1_000_000; cleaned = cleaned.slice(0, -1); }
    else if (cleaned.endsWith('B')) { multiplier = 1_000_000_000; cleaned = cleaned.slice(0, -1); }
    cleaned = cleaned.replace('%', '');

    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num * multiplier;
}

function safeISODate(val: string): string {
    try {
        const normalized = val.replace(/\//g, '-');
        const d = new Date(normalized);
        return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
    } catch {
        return new Date().toISOString();
    }
}

function getWeekRange(): { from: string; to: string } {
    const now = new Date();
    const day = now.getDay() || 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - day + 1);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    return { from: fmt(monday), to: fmt(sunday) };
}

/** Detect events that will never have actual data (holidays, speeches, etc.) */
const NO_DATA_PATTERNS = [
    /\bday\b/i, /\bholiday\b/i, /\beid\b/i, /\bjayanti\b/i, /\bequinox\b/i,
    /\bspeaks?\b/i, /\btestifies\b/i, /\bmeeting\b/i, /\bsummit\b/i,
    /\bvote\b/i, /\bpress conference\b/i, /\bminutes\b/i,
    /\bpassover\b/i, /\bholy\b/i, /\bpoya\b/i, /\bnational\b/i,
    /\beve\b/i, /\bclose at\b/i, /\bclosed\b/i, /\bfreedom\b/i,
    /\bindependence\b/i, /\bmemorial\b/i, /\banniversary\b/i,
    /\bbank holiday\b/i, /\bnew year\b/i, /\bchristmas\b/i,
    /\beaster\b/i, /\bramadan\b/i, /\bgood friday\b/i,
    /\bmaundy\b/i, /\bthanksgiving\b/i, /\bascension\b/i,
    /\bwhit\b/i, /\bcorpus christi\b/i, /\bremembrance\b/i,
];

function isNoDataEvent(name: string): boolean {
    return NO_DATA_PATTERNS.some(p => p.test(name));
}

// ─── Investing.com headers ──────────────────────────────────

const IC_URL = 'https://www.investing.com/economic-calendar/Service/getCalendarFilteredData';

function getHeaders(): Record<string, string> {
    // Rotate User-Agent to reduce Cloudflare fingerprinting
    const agents = [
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0',
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15',
    ];
    return {
        'User-Agent': agents[Math.floor(Math.random() * agents.length)],
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Referer': 'https://www.investing.com/economic-calendar/',
        'Origin': 'https://www.investing.com',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Ch-Ua': '"Chromium";v="125", "Not.A/Brand";v="24"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
    };
}

// ─── Single-page fetch with retry ────────────────────────────

const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 3000, 6000];

async function fetchPage(from: string, to: string, offset: number): Promise<string> {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        if (attempt > 0) {
            const delay = RETRY_DELAYS[attempt - 1] ?? 6000;
            if (isDev) console.log(`[calendar] Retry ${attempt}/${MAX_RETRIES} after ${delay}ms (offset=${offset})`);
            await new Promise(r => setTimeout(r, delay));
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);

        try {
            const body = new URLSearchParams({
                dateFrom: from,
                dateTo: to,
                timeZone: '55',
                timeFilter: 'timeRemain',
                currentTab: 'custom',
                limit_from: String(offset),
            });

            const res = await fetch(IC_URL, {
                method: 'POST',
                signal: controller.signal,
                headers: getHeaders(),
                body: body.toString(),
            });

            if (res.status === 429 || res.status === 503) {
                if (isDev) console.error(`[calendar] investing.com HTTP ${res.status} (offset=${offset}, attempt ${attempt})`);
                clearTimeout(timeout);
                continue; // retry
            }

            if (!res.ok) {
                if (isDev) console.error(`[calendar] investing.com HTTP ${res.status} (offset=${offset})`);
                clearTimeout(timeout);
                return '';
            }

            const rawText = await res.text();

            // Detect Cloudflare challenge page
            if (rawText.includes('Just a moment') || rawText.includes('cf-browser-verification')) {
                if (isDev) console.error(`[calendar] Cloudflare challenge detected (offset=${offset}, attempt ${attempt})`);
                clearTimeout(timeout);
                continue; // retry
            }

            clearTimeout(timeout);

            // Response is JSON with { data: "<html>" }
            try {
                const json = JSON.parse(rawText);
                return json?.data ?? json?.html ?? '';
            } catch {
                return rawText;
            }
        } catch (err: any) {
            clearTimeout(timeout);
            if (isDev) console.error(`[calendar] investing.com fetch error (offset=${offset}, attempt ${attempt}): ${err?.message}`);
            if (attempt === MAX_RETRIES) return '';
            continue;
        }
    }

    return '';
}

// ─── Paginated fetch — all events for the week ─────────────

async function fetchFromInvestingCom(): Promise<EconomicEvent[]> {
    const { from, to } = getWeekRange();
    if (isDev) console.log(`[calendar] Fetching investing.com: ${from} → ${to}`);

    const allEvents: EconomicEvent[] = [];
    const seenIds = new Set<string>();
    const PAGE_SIZE = 200; // investing.com returns ~200 per page
    const MAX_PAGES = 5;   // safety cap (5 × 200 = 1000 events max)

    for (let page = 0; page < MAX_PAGES; page++) {
        const offset = page * PAGE_SIZE;
        const html = await fetchPage(from, to, offset);

        if (!html || html.length < 50) {
            if (isDev) console.log(`[calendar] Page ${page} empty — pagination done`);
            break;
        }

        const pageEvents = parseInvestingComHTML(html);

        // Deduplicate by rowId
        let newCount = 0;
        for (const ev of pageEvents) {
            if (!seenIds.has(ev.id)) {
                seenIds.add(ev.id);
                allEvents.push(ev);
                newCount++;
            }
        }

        if (isDev) console.log(`[calendar] Page ${page}: ${pageEvents.length} parsed, ${newCount} new (total: ${allEvents.length})`);

        // Stop only when page returns nothing new
        if (newCount === 0) {
            if (isDev) console.log(`[calendar] Page ${page} had 0 new events — pagination done`);
            break;
        }

        // Small delay between pages to be respectful
        await new Promise(r => setTimeout(r, 300));
    }

    const withActual = allEvents.filter(e => e.actual !== null).length;
    if (isDev) console.log(`[calendar] ✓ investing.com total: ${allEvents.length} events, ${withActual} with actual data`);

    return allEvents;
}

// ─── HTML Parser ──────────────────────────────────────────

function parseInvestingComHTML(html: string): EconomicEvent[] {
    const events: EconomicEvent[] = [];

    // 1. Extract date headers with their positions
    //    investing.com inserts rows like: <td class="theDay" ...>Wednesday, April 01, 2026</td>
    const dateHeaders: { date: string; position: number }[] = [];
    const dateHeaderRegex = /class="[^"]*theDay[^"]*"[^>]*>([\s\S]*?)<\/td>/gi;
    let dateMatch;
    while ((dateMatch = dateHeaderRegex.exec(html)) !== null) {
        const dateText = dateMatch[1].replace(/<[^>]*>/g, '').trim();
        try {
            const parsed = new Date(dateText);
            if (!isNaN(parsed.getTime())) {
                dateHeaders.push({ date: parsed.toISOString(), position: dateMatch.index });
            }
        } catch { /* skip unparseable headers */ }
    }

    // 2. Extract event rows
    const rowRegex = /<tr[^>]*id="eventRowId_(\d+)"[^>]*>/gi;
    const rows: { id: string; startIndex: number }[] = [];
    let match;

    while ((match = rowRegex.exec(html)) !== null) {
        rows.push({ id: match[1], startIndex: match.index });
    }

    // Helper: find the most recent date header before a given position
    function getDateForPosition(pos: number): string {
        let best = '';
        for (const dh of dateHeaders) {
            if (dh.position < pos) best = dh.date;
            else break;
        }
        return best || new Date().toISOString();
    }

    for (let i = 0; i < rows.length; i++) {
        const startIdx = rows[i].startIndex;
        const endIdx = i + 1 < rows.length ? rows[i + 1].startIndex : html.length;
        const rowHtml = html.slice(startIdx, endIdx);
        const rowId = rows[i].id;

        try {
            // datetime
            const dtMatch = rowHtml.match(/data-event-datetime="([^"]+)"/);
            const datetime = dtMatch ? dtMatch[1] : '';

            // currency — investing.com puts currency code as text AFTER the flag span:
            // <td class="flagCur ..."><span class="ceFlags Netherlands">&nbsp;</span> EUR</td>
            const currMatch = rowHtml.match(/class="[^"]*flagCur[^"]*"[^>]*>[\s\S]*?<\/span>\s*([A-Z]{2,4})/i);
            const currency = currMatch ? currMatch[1].toUpperCase().slice(0, 3) : '';

            // impact — investing.com uses data-img_key="bull1/bull2/bull3"
            // and title="Low/Moderate/High Volatility Expected"
            const impactMatch = rowHtml.match(/data-img_key="bull(\d)"/i)
                || rowHtml.match(/sentiment[^"]*"[^>]*title="([^"]+)"/i);
            const impactStr = impactMatch ? (impactMatch[1] || '') : '';

            // event name
            const eventMatch = rowHtml.match(/class="[^"]*event[^"]*"[^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/i);
            let eventName = eventMatch ? eventMatch[1].replace(/<[^>]*>/g, '').trim() : '';
            if (!eventName) {
                const evFallback = rowHtml.match(/class="[^"]*event[^"]*"[^>]*>([\s\S]*?)<\/td>/i);
                eventName = evFallback ? evFallback[1].replace(/<[^>]*>/g, '').trim() : '';
            }
            if (!eventName) continue;

            // actual
            const actMatch = rowHtml.match(/id="eventActual_\d+"[^>]*>([\s\S]*?)<\/td>/i)
                || rowHtml.match(/class="[^"]*\bact\b[^"]*"[^>]*>([\s\S]*?)<\/td>/i);
            const actualStr = actMatch ? actMatch[1].replace(/<[^>]*>/g, '').trim() : '';

            // forecast
            const foreMatch = rowHtml.match(/id="eventForecast_\d+"[^>]*>([\s\S]*?)<\/td>/i)
                || rowHtml.match(/class="[^"]*\bfore\b[^"]*"[^>]*>([\s\S]*?)<\/td>/i);
            const foreStr = foreMatch ? foreMatch[1].replace(/<[^>]*>/g, '').trim() : '';

            // previous
            const prevMatch = rowHtml.match(/id="eventPrevious_\d+"[^>]*>([\s\S]*?)<\/td>/i)
                || rowHtml.match(/class="[^"]*\bprev\b[^"]*"[^>]*>([\s\S]*?)<\/td>/i);
            const prevStr = prevMatch ? prevMatch[1].replace(/<[^>]*>/g, '').trim() : '';

            // Use event datetime if available, otherwise fall back to date header
            const eventTime = datetime
                ? safeISODate(datetime)
                : getDateForPosition(startIdx);

            events.push({
                id: `ic_${rowId}_${i}`,
                country: currency,
                currency: currency || 'USD',
                event: eventName,
                impact: mapImpact(impactStr),
                time: eventTime,
                actual: parseNum(actualStr),
                estimate: parseNum(foreStr),
                prev: parseNum(prevStr),
                unit: '',
                noData: isNoDataEvent(eventName),
            });
        } catch {
            continue;
        }
    }

    return events;
}

// ─── Public API ───────────────────────────────────────

export async function fetchEconomicCalendar(
    from: Date,
    to: Date,
): Promise<EconomicEvent[]> {
    if (!cache || Date.now() - cache.ts > CACHE_TTL_MS) {
        const events = await fetchFromInvestingCom();
        // Only cache non-empty results to avoid persisting fetch failures
        if (events.length > 0) {
            cache = { data: events, ts: Date.now() };
        } else if (cache) {
            // Keep stale cache if fresh fetch returned nothing
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
