"use client"
import { useState } from "react";
import { useMarketStore } from "@/lib/store";
import { calculateExecutionPrice, LEVERAGE } from "@/lib/trading-math";
import { executeTrade } from "@/app/actions/trade";
import { TradeButton } from "./TradeButton";
import { QuantitySelector } from "./QuantitySelector";
import { toast } from "sonner";

export default function OrderPanel() {
    const { activeSymbol, currentPrice, freeMargin } = useMarketStore();

    const [isPending, setIsPending] = useState(false);
    const [amountStr, setAmountStr] = useState("1");

    const amount = parseFloat(amountStr) || 0;

    const buyCalc = calculateExecutionPrice(currentPrice, 'BUY', amount);
    const sellCalc = calculateExecutionPrice(currentPrice, 'SELL', amount);

    const requiredMargin = buyCalc.requiredMargin;
    const hasInsufficientFunds = requiredMargin > freeMargin;

    const handleQuickTrade = async (side: 'BUY' | 'SELL') => {
        if (currentPrice === 0) return toast.error("Market Unavailable");
        if (amount <= 0) return toast.error("Invalid Amount");

        if (hasInsufficientFunds) {
            return toast.error("Insufficient Funds", {
                description: `Margin Required: $${requiredMargin.toFixed(2)} | Free: $${freeMargin.toFixed(2)}`
            });
        }

        setIsPending(true);

        const tradePromise = executeTrade(activeSymbol, amount, side);

        toast.promise(tradePromise, {
            loading: `Opening ${side} (50x)...`,
            success: (result) => {
                if (!result.success) throw new Error(result.message);
                return `${side} Opened @ ${result.data?.executionPrice}`;
            },
            error: (err) => `Failed: ${err.message}`,
        });

        try { await tradePromise; }
        finally { setIsPending(false); }
    };

    const isButtonDisabled = isPending || currentPrice === 0 || amount <= 0 || hasInsufficientFunds;

    return (
        <div className="flex flex-col gap-2 max-w-lg relative">
            <div className="flex items-center justify-center gap-2">
                <div className="flex-1">
                    <TradeButton
                        side="SELL"
                        price={sellCalc.executionPrice}
                        disabled={isButtonDisabled}
                        onClick={() => handleQuickTrade('SELL')}
                    />
                </div>
                <div className="shrink-0 flex flex-col items-center">
                    <QuantitySelector
                        currentPrice={currentPrice}
                        value={amountStr}
                        onChange={setAmountStr}
                        userBalance={freeMargin * LEVERAGE}
                    />
                </div>
                <div className="flex-1">
                    <TradeButton
                        side="BUY"
                        price={buyCalc.executionPrice}
                        disabled={isButtonDisabled}
                        onClick={() => handleQuickTrade('BUY')}
                    />
                </div>
            </div>
        </div>
    );
}