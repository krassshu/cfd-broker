"use client"
import { useState, useMemo } from "react";
import Tabs from "@/app/_components/_tabs/Tabs";
import { useQuery } from "@tanstack/react-query";
import { getTicker, BinanceTicker } from "@/lib/binance";
import SymbolItem from "./SymbolItem";
import SymbolsSearch from "./SymbolsSearch";

export default function SymbolsList() {
    const [searchQuery, setSearchQuery] = useState("");

    const { data, isLoading, error } = useQuery({
        queryKey: ['binance-tickers'],
        queryFn: getTicker,
        refetchInterval: 30000,
    });

    const filteredData = useMemo(() => {
        if (!data) return [];
        const query = searchQuery.toUpperCase();

        return data
            .filter((ticker) => {
                const price = parseFloat(ticker.lastPrice);
                const matchesSearch = ticker.symbol.includes(query);
                const hasValue = price > 0;
                return matchesSearch && hasValue;
            })
    }, [data, searchQuery]);

    return (
        <div className="h-full flex-shrink-0 flex flex-col font-sans">
            <Tabs />
            <div className="w-80 h-[calc(100vh-140px)] bg-card border border-border rounded-sm rounded-tl-none shadow-xl overflow-hidden flex flex-col">
                <SymbolsSearch value={searchQuery} onChange={setSearchQuery} />

                <div className="p-3 border-b border-border/50 bg-background/50">
                    <div className="flex justify-between items-center text-[10px] text-muted font-bold uppercase tracking-wider">
                        <span className="w-1/3 text-slate-500">Symbol</span>
                        <span className="w-1/3 text-right text-slate-500">Price</span>
                        <span className="w-1/3 text-right text-slate-500">24h %</span>
                    </div>
                </div>
                <div className="overflow-y-auto flex-1 custom-scrollbar">
                    <SymbolItem
                        data={filteredData}
                        isLoading={isLoading}
                        error={error}
                    />
                </div>
            </div>
        </div>
    );
}