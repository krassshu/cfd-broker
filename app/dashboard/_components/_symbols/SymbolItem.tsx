"use client"
import React from "react";
import Image from "next/image";

const TickerRow = React.memo(({ ticker }: { ticker: any }) => {
    const cleanSymbol = ticker.symbol.replace('USDT', '');
    const isUp = parseFloat(ticker.priceChangePercent) >= 0;
    const price = parseFloat(ticker.lastPrice);
    const isLowValue = price < 1 || cleanSymbol === 'SHIB';

    return (
        <div className="flex items-center justify-between p-3 border-b border-border/30 hover:bg-muted/5 cursor-pointer transition-all active:bg-muted/10 group">
            <div className="flex items-center space-x-3 w-1/3">
                <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0 relative bg-slate-800">
                    <Image
                        src={`https://bin.bnbstatic.com/static/assets/logos/${cleanSymbol}.png`}
                        alt={cleanSymbol}
                        fill
                        className="object-cover"
                    />
                </div>
                <div className="flex flex-col">
                    <span className="font-bold text-xs text-foreground tracking-tight">{cleanSymbol}</span>
                    <span className="text-[9px] text-muted">USDT</span>
                </div>
            </div>
            <div className="w-1/3 text-right text-xs font-mono font-semibold">
                {price.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                    minimumFractionDigits: isLowValue ? 6 : 2,
                    maximumFractionDigits: isLowValue ? 8 : 2,
                })}
            </div>
            <div className={`w-1/3 text-right text-[10px] font-bold ${isUp ? 'text-green-500' : 'text-red-500'}`}>
                {isUp ? '+' : ''}{parseFloat(ticker.priceChangePercent).toFixed(2)}%
            </div>
        </div>
    );
});

TickerRow.displayName = "TickerRow";

export default function SymbolItem({ data, isLoading, error }: any) {
    if (isLoading) return <div className="p-4 text-xs animate-pulse">Fetching markets...</div>;
    if (error) return <div className="p-4 text-xs text-red-500 font-medium">Error loading data</div>;
    if (data?.length === 0) return <div className="p-8 text-center text-xs text-muted">No results found</div>;

    return (
        <>
            {data.map((ticker: any) => (
                <TickerRow key={ticker.symbol} ticker={ticker} />
            ))}
        </>
    );
}