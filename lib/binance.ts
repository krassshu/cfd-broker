import { SPREAD_RATE, BINANCE_TICKER_URL, BINANCE_KLINES_URL } from "@/lib/config";

export interface BinanceTicker {
    symbol: string;
    lastPrice: string;
    priceChangePercent: string;
    quoteVolume: string;
}

export interface CandlestickData {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
}

/** Fetches all 24h ticker data from Binance (cached 30s via Next.js) */
export async function getBinanceData(): Promise<BinanceTicker[]> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
        const response = await fetch(BINANCE_TICKER_URL, {
            next: { revalidate: 30 },
            signal: controller.signal,
        });

        if (!response.ok) {
            throw new Error(`Binance API Error: ${response.statusText}`);
        }

        return await response.json();
    } finally {
        clearTimeout(timeout);
    }
}

/** Returns only USDT-paired tickers with essential fields */
export async function getTicker(): Promise<BinanceTicker[]> {
    const data = await getBinanceData();

    return data
        .filter((ticker) => ticker.symbol.endsWith("USDT"))
        .map((ticker) => ({
            symbol: ticker.symbol,
            lastPrice: ticker.lastPrice,
            priceChangePercent: ticker.priceChangePercent,
            quoteVolume: ticker.quoteVolume,
        }));
}

const VALID_INTERVALS = new Set([
    '1m', '3m', '5m', '15m', '30m',
    '1h', '2h', '4h', '6h', '8h', '12h',
    '1d', '3d', '1w', '1M',
]);

/** Fetches OHLC candlestick data and applies spread adjustment */
export async function getKlines(symbol: string, interval: string): Promise<CandlestickData[]> {
    const cleanSymbol = symbol.replace('/', '').toUpperCase();

    if (!VALID_INTERVALS.has(interval)) {
        throw new Error(`Invalid kline interval: ${interval}`);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    let data;
    try {
        const response = await fetch(
            `${BINANCE_KLINES_URL}?symbol=${encodeURIComponent(cleanSymbol)}&interval=${encodeURIComponent(interval)}&limit=1000`,
            { signal: controller.signal }
        );

        if (!response.ok) throw new Error('Failed to fetch klines');

        data = await response.json();
    } finally {
        clearTimeout(timeout);
    }
    const multiplier = 1 - SPREAD_RATE;

    return data.map((k: [number, string, string, string, string, ...unknown[]]) => ({
        time: k[0] / 1000,
        open: parseFloat(k[1]) * multiplier,
        high: parseFloat(k[2]) * multiplier,
        low: parseFloat(k[3]) * multiplier,
        close: parseFloat(k[4]) * multiplier,
    }));
}
