"use client"
import { useState } from "react";
import { useMarketStore } from "@/lib/store";
import { calculateExecutionPrice } from "@/lib/trading-math";
import { executeTrade } from "@/app/actions/trade";

export default function OrderPanel() {
    const { activeSymbol, currentPrice } = useMarketStore();
    const [isPending, setIsPending] = useState(false);

    const amount = 1;

    const sellPrice = calculateExecutionPrice(currentPrice, 'SELL', amount).executionPrice;
    const buyPrice = calculateExecutionPrice(currentPrice, 'BUY', amount).executionPrice;

    const handleQuickTrade = async (side: 'BUY' | 'SELL') => {
        if (currentPrice === 0) return;
        setIsPending(true);

        const result = await executeTrade(activeSymbol, amount, side);

        if (result.success) {
            console.log(`Order Filled: ${side} @ ${result.data.executionPrice}`);
        } else {
            alert("Order Failed");
        }
        setIsPending(false);
    };

    return (
        <div className="flex items-center gap-2">
            <button
                disabled={isPending || currentPrice === 0}
                onClick={() => handleQuickTrade('SELL')}
                className="flex items-center gap-2 px-3 py-1 rounded bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white text-red-500 transition-all active:scale-95 disabled:opacity-50 group cursor-pointer"
            >
                <span className="text-sm font-bold uppercase group-hover:text-white/80">Sell</span>
                <span className="text-sm font-mono font-bold">
                    {sellPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
            </button>
            <button
                disabled={isPending || currentPrice === 0}
                onClick={() => handleQuickTrade('BUY')}
                className="flex items-center gap-2 px-3 py-1 rounded bg-green-500/10 border border-green-500/20 hover:bg-green-500 hover:text-white text-green-500 transition-all active:scale-95 disabled:opacity-50 group cursor-pointer"
            >
                <span className="text-sm font-bold uppercase group-hover:text-white/80">Buy</span>
                <span className="text-sm font-mono font-bold">
                    {buyPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
            </button>
        </div>
    );
}