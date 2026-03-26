"use client";

import { useEffect, useState, useRef } from "react";
import { BINANCE_TICKER_URL, BINANCE_WS_BASE } from "@/lib/config";

interface TickerCoin {
    symbol: string;
    name: string;
    price: number;
    change: number;
}

const TRACKED_COINS: Record<string, string> = {
    BTCUSDT: "Bitcoin",
    ETHUSDT: "Ethereum",
    BNBUSDT: "BNB",
    SOLUSDT: "Solana",
    XRPUSDT: "XRP",
    DOGEUSDT: "Doge",
    ADAUSDT: "Cardano",
    AVAXUSDT: "Avalanche",
    DOTUSDT: "Polkadot",
    LINKUSDT: "Chainlink",
    MATICUSDT: "Polygon",
    LTCUSDT: "Litecoin",
    UNIUSDT: "Uniswap",
    ATOMUSDT: "Cosmos",
    NEARUSDT: "NEAR",
};

function formatPrice(price: number): string {
    if (price >= 1) return price.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return price.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 4, maximumFractionDigits: 6 });
}

function TickerItem({ coin }: { coin: TickerCoin }) {
    const isUp = coin.change >= 0;

    return (
        <div className="flex items-center px-6 py-2.5 shrink-0 select-none tabular-nums border-r border-border/40 last:border-0 hover:bg-black/3 dark:hover:bg-white/3 transition-colors cursor-default">
            <span className="text-[13px] font-medium text-foreground mr-4">
                {coin.name}
            </span>
            <div className="flex items-center gap-3 shrink-0">
                <span className="text-[13px] font-mono text-muted w-[85px] text-right">
                    {formatPrice(coin.price)}
                </span>

                <span
                    className={`flex items-center gap-1 text-[12px] font-bold font-mono w-[65px] justify-end ${
                        isUp ? "text-emerald-500 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"
                    }`}
                >
                    <span className="text-[10px]">{isUp ? "↗" : "↘"}</span>
                    {Math.abs(coin.change).toFixed(2)}%
                </span>
            </div>
        </div>
    );
}

export default function CryptoTicker() {
    const [coins, setCoins] = useState<TickerCoin[]>([]);
    const [loaded, setLoaded] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        let isMounted = true;

        fetch(BINANCE_TICKER_URL)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then((data: Array<{ symbol: string; lastPrice: string; priceChangePercent: string }>) => {
                if (!isMounted) return;
                const tracked = data.filter(t => t.symbol in TRACKED_COINS).map(t => ({
                    symbol: t.symbol,
                    name: TRACKED_COINS[t.symbol],
                    price: parseFloat(t.lastPrice),
                    change: parseFloat(t.priceChangePercent),
                }));
                const order = Object.keys(TRACKED_COINS);
                tracked.sort((a, b) => order.indexOf(a.symbol) - order.indexOf(b.symbol));
                setCoins(tracked);
                setLoaded(true);
            })
            .catch(() => { if (isMounted) setLoaded(true); });

        const streams = Object.keys(TRACKED_COINS).map(s => `${s.toLowerCase()}@miniTicker`).join("/");
        const ws = new WebSocket(`${BINANCE_WS_BASE}:9443/stream?streams=${streams}`);
        wsRef.current = ws;

        ws.onmessage = (event) => {
            if (!isMounted) return;
            try {
                const msg = JSON.parse(event.data);
                if (msg.data) {
                    const d = msg.data;
                    const price = parseFloat(d.c);
                    if (!isNaN(price)) {
                        setCoins(prev => prev.map(c =>
                            c.symbol === d.s ? { ...c, price } : c
                        ));
                    }
                }
            } catch {
                // Ignore malformed WebSocket messages
            }
        };

        ws.onerror = () => { ws.close(); };

        return () => {
            isMounted = false;
            ws.close();
        };
    }, []);

    if (!loaded || coins.length === 0) {
        return (
            <div className="w-full border-b border-border/40 bg-black/[0.02] dark:bg-white/[0.02] h-[45px] flex items-center overflow-hidden">
                <div className="flex gap-10 px-6">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-4 w-[160px] rounded bg-border/30 animate-pulse shrink-0" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div
            className="w-full border-b border-border/40 bg-black/[0.02] dark:bg-white/[0.02] overflow-hidden flex"
            role="marquee"
            aria-label="Live cryptocurrency prices"
            style={{
                WebkitMaskImage: "linear-gradient(to right, transparent, black 4%, black 96%, transparent)",
                maskImage: "linear-gradient(to right, transparent, black 4%, black 96%, transparent)"
            }}
        >
            <div className="flex w-max animate-ticker hover:[animation-play-state:paused]">
                {coins.map((coin) => (
                    <TickerItem key={`orig-${coin.symbol}`} coin={coin} />
                ))}
                {coins.map((coin) => (
                    <TickerItem key={`dup-${coin.symbol}`} coin={coin} />
                ))}
            </div>
        </div>
    );
}