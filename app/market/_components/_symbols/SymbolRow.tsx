"use client"
import { memo } from "react";
import Image from "next/image";
import { useMarketStore } from "@/lib/store";
import { SPREAD_RATE } from "@/lib/trading-math";
import { Star } from "lucide-react";
import { createBrowserClient } from '@supabase/ssr';

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

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const toggleFavorite = async (e: React.MouseEvent) => {
        e.stopPropagation();

        if (isFavorite) {
            removeFavorite(symbol);
        } else {
            addFavorite(symbol);
        }

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            if (isFavorite) {
                await supabase.from('favorites').delete().eq('user_id', user.id).eq('symbol', symbol);
            } else {
                await supabase.from('favorites').insert({ user_id: user.id, symbol: symbol });
            }
        } catch (err) {
            console.error("Error updating favorite:", err);
            if (isFavorite) addFavorite(symbol);
            else removeFavorite(symbol);
        }
    };

    return (
        <div onClick={() => setActiveSymbol(symbol)} className={`flex items-center justify-between p-3 border-b border-border/30 cursor-pointer transition-colors duration-200 group ${isActive ? 'bg-primary/10 border-l-2 border-l-primary' : 'hover:bg-muted/5 border-l-2 border-l-transparent'}`}>
            <div className="flex items-center space-x-3 w-[26%] overflow-hidden">
                <div className="relative w-6 h-6 rounded-full bg-slate-900 border border-border overflow-hidden flex-shrink-0">
                    <Image
                        src={`https://bin.bnbstatic.com/static/assets/logos/${cleanSymbol}.png`}
                        alt={cleanSymbol}
                        fill
                        sizes="24px"
                        className="object-cover p-0.5"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://bin.bnbstatic.com/static/assets/logos/BTC.png';
                        }}
                    />
                </div>
                <div className="flex flex-col min-w-0">
                    <span className="font-bold text-xs text-foreground tracking-tight truncate">{cleanSymbol}</span>
                    <span className="text-[9px] text-slate-500 font-medium">USDT</span>
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
                <div className={`text-[10px] font-bold ${isUp ? 'text-green-500' : 'text-red-500'} truncate`}>
                    {isUp ? '▲' : '▼'} {Math.abs(changePercent).toFixed(2)}%
                </div>
            </div>
            <div className="w-[10%] flex justify-center items-center">
                <button
                    onClick={toggleFavorite}
                    className="p-1.5 hover:bg-muted/20 rounded-full transition-colors active:scale-90"
                >
                    <Star className={`transition-colors duration-200 cursor-pointer ${isFavorite ? "fill-yellow-400 text-yellow-400" : "text-slate-600 hover:text-slate-400"}`}
                        size={14}
                    />
                </button>
            </div>
        </div>
    );
}, (prev, next) => {
    return prev.price === next.price &&
        prev.isActive === next.isActive &&
        prev.changePercent === next.changePercent &&
        prev.isFavorite === next.isFavorite;
});

SymbolRow.displayName = "SymbolRow";
export default SymbolRow;