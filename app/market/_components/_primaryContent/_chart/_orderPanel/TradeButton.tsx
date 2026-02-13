"use client";

import {formatCurrency} from "@/app/lib/utils";

interface TradeButtonProps {
    side: 'BUY' | 'SELL';
    price: number;
    disabled: boolean;
    onClick: () => void;
}

export function TradeButton({ side, price, disabled, onClick }: TradeButtonProps) {

    const colorStyles = side === 'BUY'
        ? "bg-green-500/10 border-green-500/20 hover:bg-green-500 text-green-500 hover:text-white/90 border-green-500/20"
        : "bg-red-500/10 border-red-500/20 hover:bg-red-500 text-red-500 hover:text-white/90 border-red-500/20";

    const cursorStyles = disabled ? "cursor-default opacity-50" : "cursor-pointer";

    return (
        <button
            disabled={disabled}
            onClick={onClick}
            className={`flex items-center justify-between gap-3 px-3 h-8 text-xs font-bold rounded border transition-all duration-200 active:scale-[0.98] group ${colorStyles} ${cursorStyles}`}>
            <span className="uppercase tracking-wider">
                {side}
            </span>
            <span className="font-mono opacity-90">
                {formatCurrency(price)}
            </span>
        </button>
    );
}