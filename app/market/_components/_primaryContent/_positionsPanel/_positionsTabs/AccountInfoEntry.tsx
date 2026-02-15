"use client";

import { useMarketStore } from "@/lib/store";

export default function AccountInfoEntry() {
    const equity = useMarketStore((state) => state.equity);
    const freeMargin = useMarketStore((state) => state.freeMargin);
    const balance = useMarketStore((state) => state.balance);

    const unrealizedPnL = equity - balance;

    const formatCurrency = (value: number) => {
        return value.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    return (
        <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Equity:</span>
                <span className="text-foreground font-mono tracking-tight">
                    {formatCurrency(equity)}
                </span>
            </div>
            <div className="w-px h-3 bg-border/50"></div>
            <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Free Margin:</span>
                <span className="text-foreground font-mono tracking-tight">
                    {formatCurrency(freeMargin)}
                </span>
            </div>
            <div className="w-px h-3 bg-border/50"></div>
            <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Unrealized P&L:</span>
                <span className={`font-mono tracking-tight font-bold ${unrealizedPnL > 0 ? "text-green-500" : unrealizedPnL < 0 ? "text-red-500" : "text-slate-400"}`}>
                    {unrealizedPnL > 0 ? "+" : ""}{formatCurrency(unrealizedPnL)}
                </span>
            </div>
        </div>
    );
}