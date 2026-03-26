"use client"
import { memo } from "react";
import { useMarketStore } from "@/lib/store";
import CryptoIcon from "@/app/market/_components/_shared/CryptoIcon";
import { SPREAD_RATE } from "@/lib/config";
import { Star } from "lucide-react";
import { addFavoriteAction, removeFavoriteAction } from "@/app/actions/favorites";

interface SymbolRowProps {
    symbol: string;
    price: number;
    changePercent: number;
    isActive: boolean;
    isFavorite: boolean;
}

const SymbolRow = memo(({ symbol, price, changePercent, isActive, isFavorite }: SymbolRowProps) => {
    const setActiveSymbol = useMarketStore((state) => state.setActiveSymbol);
    const addFavorite = useMarketStore((state) => state.addFavorite);
    const removeFavorite = useMarketStore((state) => state.removeFavorite);

    const displayPrice = price * (1 - SPREAD_RATE);
    const cleanSymbol = symbol.replace('USDT', '');
    const isUp = changePercent >= 0;
    const isLowValue = displayPrice < 1 || cleanSymbol === 'SHIB' || cleanSymbol === 'PEPE';

    const toggleFavorite = async (e: React.MouseEvent) => {
        e.stopPropagation();

        // Optimistic update
        if (isFavorite) {
            removeFavorite(symbol);
        } else {
            addFavorite(symbol);
        }

        // Server action (authenticated, with proper user lookup)
        try {
            const result = isFavorite
                ? await removeFavoriteAction(symbol)
                : await addFavoriteAction(symbol);

            // Rollback on failure
            if (!result.success) {
                if (isFavorite) addFavorite(symbol);
                else removeFavorite(symbol);
            }
        } catch {
            // Rollback on error
            if (isFavorite) addFavorite(symbol);
            else removeFavorite(symbol);
        }
    };

    return (
        <div onClick={() => setActiveSymbol(symbol)} className={`flex items-center justify-between p-3 border-b border-border/30 cursor-pointer transition-colors duration-200 group ${isActive ? 'bg-primary/10 border-l-2 border-l-primary' : 'hover:bg-muted/5 border-l-2 border-l-transparent'}`}>
            <div className="flex items-center space-x-3 w-[26%] overflow-hidden">
                <CryptoIcon symbol={symbol} size={24} />
                <div className="flex flex-col min-w-0">
                    <span className="font-bold text-xs text-foreground tracking-tight truncate">{cleanSymbol}</span>
                    <span className="text-[9px] text-muted font-medium">USDT</span>
                </div>
            </div>
            <div className="w-[40%] text-right overflow-hidden">
                <div className="text-[11px] font-mono font-bold text-foreground transition-colors truncate">
                    {displayPrice.toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                        minimumFractionDigits: isLowValue ? 6 : 2,
                        maximumFractionDigits: isLowValue ? 8 : 2,
                    })}
                </div>
            </div>
            <div className="w-[24%] text-right overflow-hidden">
                <div className={`text-[10px] font-bold ${isUp ? 'text-up' : 'text-down'} truncate`}>
                    {isUp ? '▲' : '▼'} {Math.abs(changePercent).toFixed(2)}%
                </div>
            </div>
            <div className="w-[10%] flex justify-center items-center">
                <button
                    onClick={toggleFavorite}
                    className="p-1.5 hover:bg-muted/20 rounded-full transition-colors active:scale-90"
                >
                    <Star className={`transition-colors duration-200 cursor-pointer ${isFavorite ? "fill-yellow-400 text-yellow-400" : "text-muted hover:text-muted-foreground"}`}
                        size={14}
                    />
                </button>
            </div>
        </div>
    );
}, (prev, next) => {
    return prev.symbol === next.symbol &&
        prev.price === next.price &&
        prev.isActive === next.isActive &&
        prev.changePercent === next.changePercent &&
        prev.isFavorite === next.isFavorite;
});

SymbolRow.displayName = "SymbolRow";
export default SymbolRow;
