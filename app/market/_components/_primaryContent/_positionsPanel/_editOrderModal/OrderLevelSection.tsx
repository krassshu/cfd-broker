"use client";

import { Order } from "@/app/market/_components/_primaryContent/_positionsPanel/types";
import { formatPrice } from "@/lib/utils";

type ActiveField = 'price' | 'amount' | null;

interface QuickButton {
    label: string;
    price: number;
}

interface Limits {
    min: number;
    max: number;
    minPnl: number;
    maxPnl: number;
}

interface OrderLevelSectionProps {
    type: 'sl' | 'tp';
    order: Order;
    price: string;
    amount: string;
    activeField: ActiveField;
    error: string;
    limits: Limits | null;
    quickButtons: QuickButton[];
    onPriceChange: (val: string) => void;
    onAmountChange: (val: string) => void;
    onClear: () => void;
}

function formatPnl(value: number): string {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}`;
}

const THEME = {
    sl: {
        label: "Stop Loss",
        badge: "Risk Management",
        badgeColor: "text-red-500",
        focusColor: "focus:border-red-400 focus:ring-1 focus:ring-red-400",
        activeRing: "ring-1 ring-red-400/50",
        btnBg: "bg-red-500/10 text-red-400 hover:bg-red-500/20",
    },
    tp: {
        label: "Take Profit",
        badge: "Target",
        badgeColor: "text-green-500",
        focusColor: "focus:border-green-400 focus:ring-1 focus:ring-green-400",
        activeRing: "ring-1 ring-green-400/50",
        btnBg: "bg-green-500/10 text-green-400 hover:bg-green-500/20",
    },
} as const;

export default function OrderLevelSection({
    type, order, price, amount, activeField, error, limits,
    quickButtons, onPriceChange, onAmountChange, onClear,
}: OrderLevelSectionProps) {
    const theme = THEME[type];

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-muted uppercase tracking-wide">
                    {theme.label}
                </label>
                <span className={`${theme.badgeColor} text-[10px] font-semibold`}>{theme.badge}</span>
            </div>

            {/* Price + Amount row */}
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <div className="text-[10px] text-muted mb-1 flex justify-between">
                        <span>Closing Price</span>
                        {limits && (
                            <span className="text-muted/60">
                                {formatPrice(limits.min)} – {formatPrice(limits.max)}
                            </span>
                        )}
                    </div>
                    <div className="relative">
                        <input
                            type="number"
                            step="any"
                            value={price}
                            onChange={(e) => onPriceChange(e.target.value)}
                            className={`w-full bg-background/50 border rounded px-3 py-2 text-sm font-mono outline-none transition-all pr-14 ${
                                error
                                    ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                                    : `border-border ${theme.focusColor}`
                            } ${activeField === 'price' ? theme.activeRing : ''}`}
                            placeholder="Price"
                        />
                        <span className="absolute right-3 top-2 text-[10px] text-muted">USDT</span>
                    </div>
                </div>
                <div>
                    <div className="text-[10px] text-muted mb-1 flex justify-between">
                        <span>Closing Amount</span>
                        {limits && (
                            <span className="text-muted/60">
                                {type === 'sl'
                                    ? `${formatPnl(limits.maxPnl)} – ${formatPnl(limits.minPnl)}`
                                    : `${formatPnl(limits.minPnl)} – ${formatPnl(limits.maxPnl)}`
                                }
                            </span>
                        )}
                    </div>
                    <div className="relative">
                        <input
                            type="number"
                            step="any"
                            value={amount}
                            onChange={(e) => onAmountChange(e.target.value)}
                            className={`w-full bg-background/50 border rounded px-3 py-2 text-sm font-mono outline-none transition-all pr-8 ${
                                error
                                    ? 'border-red-500 focus:ring-1 focus:ring-red-500'
                                    : `border-border ${theme.focusColor}`
                            } ${activeField === 'amount' ? theme.activeRing : ''}`}
                            placeholder="P&L"
                        />
                        <span className="absolute right-3 top-2 text-[10px] text-muted">$</span>
                    </div>
                </div>
            </div>

            {/* Quick-set buttons */}
            {limits && (
                <div className="flex gap-1">
                    {quickButtons.map(({ label, price: btnPrice }) => (
                        <button
                            key={label}
                            type="button"
                            onClick={() => onPriceChange(formatPrice(btnPrice))}
                            className={`flex-1 text-[10px] py-1 rounded ${theme.btnBg} transition-colors cursor-pointer font-mono`}
                        >
                            {label}
                        </button>
                    ))}
                    <button
                        type="button"
                        onClick={onClear}
                        className="flex-1 text-[10px] py-1 rounded bg-muted/10 text-muted hover:bg-muted/20 transition-colors cursor-pointer"
                    >
                        Clear
                    </button>
                </div>
            )}

            {error && (
                <p className="text-[10px] text-red-500">{error}</p>
            )}
        </div>
    );
}
