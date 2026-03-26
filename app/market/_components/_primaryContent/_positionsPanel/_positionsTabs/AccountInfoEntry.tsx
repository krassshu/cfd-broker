"use client";

import { useMarketStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";

/** Displays balance, equity, used margin, available capital, and unrealized P&L */
export default function AccountInfoEntry() {
    const balance = useMarketStore((state) => state.balance);
    const equity = useMarketStore((state) => state.equity);
    const usedMargin = useMarketStore((state) => state.usedMargin);
    const available = useMarketStore((state) => state.available);

    const unrealizedPnL = equity - balance;

    return (
        <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
                <span className="text-muted">Balance:</span>
                <span className="text-foreground font-mono tracking-tight">
                    {formatCurrency(balance)}
                </span>
            </div>
            <div className="w-px h-3 bg-border/50"></div>
            <div className="flex items-center gap-1.5">
                <span className="text-muted">Equity:</span>
                <span className="text-foreground font-mono tracking-tight">
                    {formatCurrency(equity)}
                </span>
            </div>
            <div className="w-px h-3 bg-border/50"></div>
            <div className="flex items-center gap-1.5">
                <span className="text-muted">Used:</span>
                <span className="text-foreground font-mono tracking-tight">
                    {formatCurrency(usedMargin)}
                </span>
            </div>
            <div className="w-px h-3 bg-border/50"></div>
            <div className="flex items-center gap-1.5">
                <span className="text-muted">Available:</span>
                <span className={`font-mono tracking-tight ${available <= 0 ? "text-down font-bold" : "text-foreground"}`}>
                    {formatCurrency(available)}
                </span>
            </div>
            <div className="w-px h-3 bg-border/50"></div>
            <div className="flex items-center gap-1.5">
                <span className="text-muted">P&L:</span>
                <span className={`font-mono tracking-tight font-bold ${unrealizedPnL > 0 ? "text-up" : unrealizedPnL < 0 ? "text-down" : "text-muted"}`}>
                    {unrealizedPnL > 0 ? "+" : ""}{formatCurrency(unrealizedPnL)}
                </span>
            </div>
        </div>
    );
}
