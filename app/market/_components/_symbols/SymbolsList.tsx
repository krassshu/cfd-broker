"use client"
import { useState, useMemo } from "react";
import SymbolRow from "./SymbolRow";
import SymbolsSearch from "./SymbolsSearch";
import { useMarketStore } from "@/lib/store";
import Tabs, { TabType } from "@/app/market/_components/_symbols/_tabs/Tabs";

export default function SymbolsList() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<TabType>('FAV');

    const tickersMap = useMarketStore((state) => state.tickersMap);
    const favorites = useMarketStore((state) => state.favorites);
    const isLoading = useMarketStore((state) => state.isMarketLoading);
    const activeSymbol = useMarketStore((state) => state.activeSymbol);

    const filteredData = useMemo(() => {
        const query = searchQuery.toUpperCase();

        let data = Array.from(tickersMap.values()).filter((ticker) => {
            const price = parseFloat(ticker.lastPrice);
            return ticker.symbol.includes(query) && price > 0;
        });

        if (activeTab === 'FAV') {
            data = data.filter(t => favorites.has(t.symbol));
        }
        else if (activeTab === 'GAINERS') {
            data = data.filter(t => parseFloat(t.priceChangePercent) >= 10);
            data.sort((a, b) => parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent));
        }
        else if (activeTab === 'LOSERS') {
            data = data.filter(t => parseFloat(t.priceChangePercent) <= -10);
            data.sort((a, b) => parseFloat(a.priceChangePercent) - parseFloat(b.priceChangePercent));
        }

        return data;
    }, [tickersMap, searchQuery, activeTab, favorites]);

    return (
        <div className="h-full flex-shrink-0 flex flex-col font-sans">
            <Tabs activeTab={activeTab} onTabChange={setActiveTab} />

            <div className="w-80 h-[calc(100vh-140px)] bg-card border border-border rounded-sm rounded-tl-none shadow-xl overflow-hidden flex flex-col">
                <SymbolsSearch value={searchQuery} onChange={setSearchQuery} />
                <div className="p-3 border-b border-border/50 bg-background/50">
                    <div className="flex justify-between items-center text-[10px] text-muted font-bold uppercase tracking-wider">
                        <span className="w-[26%] text-slate-500 pl-1">Symbol</span>
                        <span className="w-[40%] text-right text-slate-500">Price</span>
                        <span className="w-[24%] text-right text-slate-500">24h %</span>
                        <span className="w-[10%] text-center text-slate-500">Fav</span>
                    </div>
                </div>
                <div className="overflow-y-auto flex-1 custom-scrollbar">
                    {isLoading && <div className="p-4 text-muted text-xs animate-pulse font-bold text-center">LOADING MARKETS...</div>}
                    {!isLoading && filteredData.length === 0 && (
                        <div className="p-8 text-center text-xs text-slate-500 italic">
                            {activeTab === 'FAV' ? "No favorites yet" : "No assets found"}
                        </div>
                    )}
                    {!isLoading && filteredData.map((ticker) => (
                        <SymbolRow
                            key={ticker.symbol}
                            symbol={ticker.symbol}
                            price={parseFloat(ticker.lastPrice)}
                            changePercent={parseFloat(ticker.priceChangePercent)}
                            isActive={activeSymbol === ticker.symbol}
                            isFavorite={favorites.has(ticker.symbol)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}