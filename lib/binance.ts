export interface BinanceTicker{
    symbol: string;
    lastPrice: string;
    priceChangePercent:string;
    quoteVolume:string;
}

export async function getBinanceData():Promise<BinanceTicker[]>{
    const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');

    if(!response.ok) throw new Error(response.statusText);

    return  await response.json();
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