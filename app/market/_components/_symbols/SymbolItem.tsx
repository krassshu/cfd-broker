"use client"
import Image from "next/image";
import { BinanceTicker } from "@/lib/binance";
import {useMarketStore} from "@/lib/store";

interface SymbolItemProps {
    data: BinanceTicker[] | undefined;
    isLoading: boolean;
    error: any;
}

export default function SymbolItem({ data, isLoading, error }: SymbolItemProps) {
    const setActiveMarket = useMarketStore((state) => state.setActiveMarket);
    const activeSymbol = useMarketStore((state) => state.activeSymbol);

    if (isLoading) return <div className="p-4 text-muted text-xs animate-pulse font-bold">LOADING MARKETS...</div>;
    if (error) return <div className="p-4 text-red-500 text-xs font-medium uppercase">{error.message}</div>;
    if (data?.length === 0) return <div className="p-8 text-center text-xs text-slate-500 italic">No assets found</div>;

    return (
        <>
            {data?.map((ticker) => {
                const cleanSymbol = ticker.symbol.replace('USDT', '');
                const isUp = parseFloat(ticker.priceChangePercent) >= 0;
                const price = parseFloat(ticker.lastPrice);
                const isLowValue = price < 1 || cleanSymbol === 'SHIB';
                const isActive = activeSymbol === ticker.symbol;

                return (
                    <div
                        key={ticker.symbol}
                        onClick={() => setActiveMarket(ticker.symbol, price, parseFloat(ticker.priceChangePercent))}
                        className={`flex items-center justify-between p-3 border-b border-border/30 cursor-pointer transition-all duration-200 group
                            ${isActive ? 'bg-primary/10 border-l-2 border-l-primary' : 'hover:bg-muted/5 border-l-2 border-l-transparent'}
                        `}
                    >
                        <div className="flex items-center space-x-3 w-1/3">
                            <div
                                className="relative w-6 h-6 rounded-full bg-slate-900 border border-border overflow-hidden flex-shrink-0 relative">
                                <Image
                                    src={`https://bin.bnbstatic.com/static/assets/logos/${cleanSymbol}.png`}
                                    alt={cleanSymbol}
                                    fill
                                    sizes={"height: calc(var(--spacing) * 6); width: calc(var(--spacing) * 6);"}
                                    className="object-cover p-0.5"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = 'https://bin.bnbstatic.com/static/assets/logos/BTC.png';
                                    }}
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-xs text-foreground tracking-tight">
                                    {cleanSymbol}
                                </span>
                                <span className="text-[9px] text-slate-500 font-medium">USDT</span>
                            </div>
                        </div>

                        <div className="w-1/3 text-right">
                            <div className="text-[11px] font-mono font-bold text-foreground">
                                {price.toLocaleString("en-US", {
                                    style: "currency",
                                    currency: "USD",
                                    minimumFractionDigits: isLowValue ? 6 : 2,
                                    maximumFractionDigits: isLowValue ? 8 : 2,
                                })}
                            </div>
                        </div>

                        <div className="w-1/3 text-right">
                            <div className={`text-[10px] font-bold ${isUp ? 'text-green-500' : 'text-red-500'}`}>
                                {isUp ? '▲' : '▼'} {Math.abs(parseFloat(ticker.priceChangePercent)).toFixed(2)}%
                            </div>
                        </div>
                    </div>
                );
            })}
        </>
    );
}