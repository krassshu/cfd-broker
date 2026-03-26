"use client";

import { useEffect } from "react";
import { Minus, Plus } from "lucide-react";

/**Returns step size and precision based on current crypto price.*/
export function getStepForPrice(price: number) {
    if (price > 10_000) return { step: 0.001, precision: 3 };
    if (price > 1_000)  return { step: 0.01,  precision: 2 };
    if (price > 100)    return { step: 0.1,   precision: 1 };
    if (price > 10)     return { step: 1,     precision: 0 };
    if (price > 1)      return { step: 10,    precision: 0 };
    if (price > 0.1)    return { step: 100,   precision: 0 };
    return { step: 1000, precision: 0 };
}

interface QuantitySelectorProps {
    currentPrice: number;
    value: string;
    onChange: (val: string) => void;
    userBalance: number;
}

export function QuantitySelector({ currentPrice, value, onChange, userBalance }: QuantitySelectorProps) {
    const { step, precision } = getStepForPrice(currentPrice);

    useEffect(() => {
        if (currentPrice <= 0) return;

        const numVal = parseFloat(value);
        if (numVal === 0 || isNaN(numVal)) {
            onChange(step.toString());
        }
    }, [currentPrice, step]);

    const numericValue = parseFloat(value) || 0;
    const estimatedCost = numericValue * currentPrice;
    const hasInsufficientFunds = estimatedCost > userBalance;

    const handleIncrement = () => {
        const current = parseFloat(value) || 0;
        const next = (current + step).toFixed(precision);
        onChange(next);
    };

    const handleDecrement = () => {
        const current = parseFloat(value) || 0;
        if (current - step <= 0) return;
        const next = (current - step).toFixed(precision);
        onChange(next);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;

        // Allow empty for typing, but block negative and scientific notation
        if (raw === '') {
            onChange('');
            return;
        }

        // Block negative signs, 'e' scientific notation, and multiple dots
        if (/[eE\-+]/.test(raw)) return;

        // Validate it's a proper positive number format
        if (!/^\d*\.?\d*$/.test(raw)) return;

        onChange(raw);
    };

    // When input loses focus, clean up the value
    const handleBlur = () => {
        const num = parseFloat(value);
        if (isNaN(num) || num <= 0) {
            onChange(step.toString());
        }
    };

    return (
        <div className="relative flex flex-col justify-center h-full">
            <div className={`flex items-center justify-between h-8 w-[120px] bg-background/50 border rounded transition-colors ${hasInsufficientFunds ? 'border-red-500/50' : 'border-border hover:border-primary/30 focus-within:border-primary/50'}`}>
                <button
                    onClick={handleDecrement}
                    className="h-full px-2 text-muted hover:text-foreground hover:bg-muted/10 transition-colors active:bg-muted/20 flex items-center justify-center border-r border-border/10 cursor-pointer"
                    type="button">
                    <Minus size={12} strokeWidth={3} />
                </button>
                <div className="flex-1 relative h-full">
                    <input
                        type="text"
                        inputMode="decimal"
                        id="amount"
                        value={value}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        placeholder={step.toString()}
                        className="w-full h-full bg-transparent text-center text-xs font-mono font-bold focus:outline-none placeholder:text-muted/30"/>
                </div>
                <button
                    onClick={handleIncrement}
                    className="h-full px-2 text-muted hover:text-foreground hover:bg-muted/10 transition-colors active:bg-muted/20 flex items-center justify-center border-l border-border/10 cursor-pointer"
                    type="button">
                    <Plus size={12} strokeWidth={3} />
                </button>
            </div>
            {hasInsufficientFunds && (
                <span className="absolute -bottom-4 left-0 w-full text-center text-[9px] text-red-500 font-bold whitespace-nowrap animate-pulse">
                    No funds
                </span>
            )}
        </div>
    );
}
