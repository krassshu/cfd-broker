import { NextResponse } from 'next/server';
import { BINANCE_TICKER_URL } from '@/lib/config';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(request: Request) {
    // Rate limit: 30 requests per minute per IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (!rateLimit(`api-ticker:${ip}`, 30, 60_000)) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const res = await fetch(BINANCE_TICKER_URL, { signal: controller.signal });
        clearTimeout(timeout);

        if (!res.ok) {
            throw new Error(`Binance API error: ${res.statusText}`);
        }

        const data = await res.json();
        return NextResponse.json(data, {
            headers: { 'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=20' },
        });

    } catch (error: unknown) {
        const message = error instanceof Error
            ? (error.name === 'AbortError' ? 'Binance API timeout' : error.message)
            : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}