"use client";

import { useMarketStore } from "@/lib/store";

/** Displays LIVE/OFFLINE WebSocket connection indicator */
export default function ConnectionStatus() {
    const wsConnected = useMarketStore((state) => state.wsConnected);

    return (
        <div className="flex items-center gap-1.5" title={wsConnected ? "Live market data" : "Reconnecting..."}>
            <div className={`w-2 h-2 rounded-full ${wsConnected ? "bg-up animate-pulse" : "bg-down"}`} />
            <span className={`text-[10px] font-bold uppercase tracking-wider ${wsConnected ? "text-up" : "text-down"}`}>
                {wsConnected ? "LIVE" : "OFFLINE"}
            </span>
        </div>
    );
}
