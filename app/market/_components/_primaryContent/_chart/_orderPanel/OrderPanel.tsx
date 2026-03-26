"use client"
import { useState, useEffect, useRef } from "react";
import { useMarketStore } from "@/lib/store";
import { calculateExecutionPrice } from "@/lib/trading-math";
import { LEVERAGE } from "@/lib/config";
import { executeTrade } from "@/app/actions/trade";
import { TradeButton } from "./TradeButton";
import { QuantitySelector, getStepForPrice } from "./QuantitySelector";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

export default function OrderPanel() {
    const { activeSymbol, currentPrice, available, bumpPositionsVersion, addNotification } = useMarketStore();

    const [isPending, setIsPending] = useState(false);
    const [amountStr, setAmountStr] = useState("");

    const prevSymbolRef = useRef(activeSymbol);
    const priceInitializedRef = useRef(false);

    useEffect(() => {
        if (prevSymbolRef.current !== activeSymbol) {
            prevSymbolRef.current = activeSymbol;
            priceInitializedRef.current = false;
        }

        if (currentPrice > 0 && !priceInitializedRef.current) {
            const { step } = getStepForPrice(currentPrice);
            setAmountStr(step.toString());
            priceInitializedRef.current = true;
        }
    }, [activeSymbol, currentPrice]);

    const amount = parseFloat(amountStr) || 0;

    const buyCalc = calculateExecutionPrice(currentPrice, 'BUY', amount);
    const sellCalc = calculateExecutionPrice(currentPrice, 'SELL', amount);

    const requiredMargin = buyCalc.requiredMargin;

    // New model: full requiredMargin must fit within available capital
    const hasInsufficientFunds = requiredMargin > available;

    const handleQuickTrade = async (side: 'BUY' | 'SELL') => {
        if (currentPrice === 0) return toast.error("Market Unavailable");
        if (amount <= 0) return toast.error("Invalid Amount");

        if (hasInsufficientFunds) {
            return toast.error("Insufficient Margin", {
                description: `Required: ${formatCurrency(requiredMargin)} · Available: ${formatCurrency(available)}`
            });
        }

        setIsPending(true);

        const tradePromise = executeTrade(activeSymbol, amount, side);

        toast.promise(tradePromise, {
            loading: `Opening ${side} (50x)...`,
            success: (result) => {
                if (!result.success) throw new Error(result.message);
                bumpPositionsVersion();
                const cleanSymbol = activeSymbol.replace('USDT', '');
                addNotification(`${cleanSymbol} ${side} opened @ $${result.data?.executionPrice}`);
                return `${side} Opened @ ${result.data?.executionPrice}`;
            },
            error: (err) => `Failed: ${err.message}`,
        });

        try { await tradePromise; }
        finally { setIsPending(false); }
    };

    const isButtonDisabled = isPending || currentPrice === 0 || amount <= 0 || hasInsufficientFunds;

    return (
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
                <TradeButton
                    side="SELL"
                    price={sellCalc.executionPrice}
                    disabled={isButtonDisabled}
                    isPending={isPending}
                    onClick={() => handleQuickTrade('SELL')}
                />
                <QuantitySelector
                    currentPrice={currentPrice}
                    value={amountStr}
                    onChange={setAmountStr}
                    userBalance={available * LEVERAGE}
                />
                <TradeButton
                    side="BUY"
                    price={buyCalc.executionPrice}
                    disabled={isButtonDisabled}
                    isPending={isPending}
                    onClick={() => handleQuickTrade('BUY')}
                />
            </div>

            <div className="flex flex-col items-end leading-tight shrink-0">
                <span className="text-[9px] text-muted uppercase tracking-wide">Required</span>
                <span className={`text-[11px] font-mono font-bold ${hasInsufficientFunds ? "text-red-500" : "text-foreground"}`}>
                    {formatCurrency(requiredMargin)}
                </span>
            </div>
        </div>
    );
}
