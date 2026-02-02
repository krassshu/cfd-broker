export interface BinanceTicker{
    symbol: string;
    lastPrice: string;
    priceChangePercent:string;
    quoteVolume:string;
}
export interface CandlestickData {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
}

export async function getBinanceData():Promise<BinanceTicker[]> {
    const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');

    if (!response.ok) throw new Error(response.statusText);

    return await response.json();
}

export async function getTicker():Promise<BinanceTicker[]>{
    const data = await getBinanceData();
    return data.filter((ticker)=>ticker.symbol.endsWith("USDT")).map((ticker=>({
        symbol: ticker.symbol,
        lastPrice: ticker.lastPrice,
        priceChangePercent: ticker.priceChangePercent,
        quoteVolume: ticker.quoteVolume,
    })))
}

export async function getKlines(symbol: string, interval: string): Promise<CandlestickData[]> {
    const cleanSymbol = symbol.replace('/', '').toUpperCase();

    const response = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${cleanSymbol}&interval=${interval}&limit=1000`
    );

    if (!response.ok) throw new Error('Failed to fetch klines');

    const data = await response.json();

    return data.map((k: any[]) => ({
        time: k[0] / 1000,
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: parseFloat(k[4]),
    }));
}