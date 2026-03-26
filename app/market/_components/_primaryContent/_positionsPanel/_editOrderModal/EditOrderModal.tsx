"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Order } from "@/app/market/_components/_primaryContent/_positionsPanel/types";
import { useMarketStore } from "@/lib/store";
import {
    calculatePositionPnL,
    calculateClosePriceFromPnL,
    calculateSlPriceLimits,
    calculateTpPriceLimits,
} from "@/lib/trading-math";
import { formatPrice } from "@/lib/utils";
import OrderLevelSection from "./OrderLevelSection";

interface EditOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (id: string, sl: number, tp: number) => Promise<void>;
    order: Order | null;
}

type ActiveField = 'price' | 'amount' | null;

/** Modal for editing SL/TP on an open position with live price validation and quick-set buttons */
export default function EditOrderModal({ isOpen, onClose, onSave, order }: EditOrderModalProps) {
    // SL fields
    const [slPrice, setSlPrice] = useState("");
    const [slAmount, setSlAmount] = useState("");
    const [slActiveField, setSlActiveField] = useState<ActiveField>(null);

    // TP fields
    const [tpPrice, setTpPrice] = useState("");
    const [tpAmount, setTpAmount] = useState("");
    const [tpActiveField, setTpActiveField] = useState<ActiveField>(null);

    const [isSaving, setIsSaving] = useState(false);

    const tickersMap = useMarketStore((state) => state.tickersMap);

    const currentPrice = useMemo(() => {
        if (!order) return 0;
        const ticker = tickersMap.get(order.symbol);
        return ticker ? parseFloat(ticker.lastPrice) : 0;
    }, [order, tickersMap]);

    // ── Initialize from existing order ─────────────────────────────
    useEffect(() => {
        if (!order) return;

        if (order.stop_loss) {
            setSlPrice(order.stop_loss.toString());
            const pnl = calculatePositionPnL(order.side, order.entry_price, order.stop_loss, order.amount);
            setSlAmount(pnl.toFixed(2));
        } else {
            setSlPrice("");
            setSlAmount("");
        }

        if (order.take_profit) {
            setTpPrice(order.take_profit.toString());
            const pnl = calculatePositionPnL(order.side, order.entry_price, order.take_profit, order.amount);
            setTpAmount(pnl.toFixed(2));
        } else {
            setTpPrice("");
            setTpAmount("");
        }

        setSlActiveField(null);
        setTpActiveField(null);
    }, [order]);

    // ── Escape key ─────────────────────────────────────────────────
    useEffect(() => {
        if (!isOpen) return;
        const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [isOpen, onClose]);

    // ── SL handlers ──────────────────────────────────────────────
    const handleSlPriceChange = useCallback((val: string) => {
        setSlPrice(val);
        setSlActiveField('price');
        if (!order) return;
        const price = parseFloat(val);
        if (!isNaN(price) && price > 0) {
            const pnl = calculatePositionPnL(order.side, order.entry_price, price, order.amount);
            setSlAmount(pnl.toFixed(2));
        } else {
            setSlAmount("");
        }
    }, [order]);

    const handleSlAmountChange = useCallback((val: string) => {
        setSlAmount(val);
        setSlActiveField('amount');
        if (!order) return;
        const targetPnl = parseFloat(val);
        if (!isNaN(targetPnl)) {
            const closePrice = calculateClosePriceFromPnL(order.side, order.entry_price, order.amount, targetPnl);
            if (closePrice > 0) {
                setSlPrice(formatPrice(closePrice));
            } else {
                setSlPrice("");
            }
        } else {
            setSlPrice("");
        }
    }, [order]);

    // ── TP handlers ──────────────────────────────────────────────
    const handleTpPriceChange = useCallback((val: string) => {
        setTpPrice(val);
        setTpActiveField('price');
        if (!order) return;
        const price = parseFloat(val);
        if (!isNaN(price) && price > 0) {
            const pnl = calculatePositionPnL(order.side, order.entry_price, price, order.amount);
            setTpAmount(pnl.toFixed(2));
        } else {
            setTpAmount("");
        }
    }, [order]);

    const handleTpAmountChange = useCallback((val: string) => {
        setTpAmount(val);
        setTpActiveField('amount');
        if (!order) return;
        const targetPnl = parseFloat(val);
        if (!isNaN(targetPnl)) {
            const closePrice = calculateClosePriceFromPnL(order.side, order.entry_price, order.amount, targetPnl);
            if (closePrice > 0) {
                setTpPrice(formatPrice(closePrice));
            } else {
                setTpPrice("");
            }
        } else {
            setTpPrice("");
        }
    }, [order]);

    // ── Price limits ───────────────────────────────────────────────
    const limits = useMemo(() => {
        if (!order || currentPrice <= 0) return null;
        const liqPrice = order.liquidation_price || 0;

        const sl = calculateSlPriceLimits(order.side, order.entry_price, currentPrice, liqPrice);
        const tp = calculateTpPriceLimits(order.side, order.entry_price, currentPrice);

        const slMinPnl = calculatePositionPnL(order.side, order.entry_price, sl.min, order.amount);
        const slMaxPnl = calculatePositionPnL(order.side, order.entry_price, sl.max, order.amount);
        const tpMinPnl = calculatePositionPnL(order.side, order.entry_price, tp.min, order.amount);
        const tpMaxPnl = calculatePositionPnL(order.side, order.entry_price, tp.max, order.amount);

        return {
            sl: { ...sl, minPnl: slMinPnl, maxPnl: slMaxPnl },
            tp: { ...tp, minPnl: tpMinPnl, maxPnl: tpMaxPnl },
        };
    }, [order, currentPrice]);

    // ── Validation ─────────────────────────────────────────────────
    const validation = useMemo(() => {
        if (!order) return { slError: '', tpError: '' };

        const slVal = parseFloat(slPrice);
        const tpVal = parseFloat(tpPrice);
        let slError = '';
        let tpError = '';

        if (slPrice !== '' && !isNaN(slVal)) {
            if (slVal < 0) {
                slError = 'Stop Loss cannot be negative';
            } else if (slVal > 0) {
                if (order.side === 'BUY') {
                    if (slVal >= order.entry_price) slError = 'SL must be below entry price for BUY';
                    else if (order.liquidation_price && slVal <= order.liquidation_price)
                        slError = 'SL is below liquidation (would never trigger)';
                    else if (currentPrice > 0 && slVal >= currentPrice)
                        slError = 'SL is at or above current price (would trigger immediately)';
                } else {
                    if (slVal <= order.entry_price) slError = 'SL must be above entry price for SELL';
                    else if (order.liquidation_price && slVal >= order.liquidation_price)
                        slError = 'SL is above liquidation (would never trigger)';
                    else if (currentPrice > 0 && slVal <= currentPrice)
                        slError = 'SL is at or below current price (would trigger immediately)';
                }
            }
        }

        if (tpPrice !== '' && !isNaN(tpVal)) {
            if (tpVal < 0) {
                tpError = 'Take Profit cannot be negative';
            } else if (tpVal > 0) {
                if (order.side === 'BUY') {
                    if (tpVal <= order.entry_price) tpError = 'TP must be above entry price for BUY';
                    else if (currentPrice > 0 && tpVal <= currentPrice)
                        tpError = 'TP is at or below current price (would trigger immediately)';
                } else {
                    if (tpVal >= order.entry_price) tpError = 'TP must be below entry price for SELL';
                    else if (currentPrice > 0 && tpVal >= currentPrice)
                        tpError = 'TP is at or above current price (would trigger immediately)';
                }
            }
        }

        return { slError, tpError };
    }, [slPrice, tpPrice, order, currentPrice]);

    if (!isOpen || !order) return null;

    const hasErrors = validation.slError !== '' || validation.tpError !== '';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (hasErrors) return;

        setIsSaving(true);
        await onSave(order.id, parseFloat(slPrice) || 0, parseFloat(tpPrice) || 0);
        setIsSaving(false);
        onClose();
    };

    const slQuickButtons = limits ? [
        { label: 'Min', price: limits.sl.min * (order.side === 'BUY' ? 1.001 : 0.999) },
        { label: '-1%', price: order.entry_price * (order.side === 'BUY' ? 0.99 : 1.01) },
        { label: '-2%', price: order.entry_price * (order.side === 'BUY' ? 0.98 : 1.02) },
        { label: '-5%', price: order.entry_price * (order.side === 'BUY' ? 0.95 : 1.05) },
    ] : [];

    const tpQuickButtons = limits ? [
        { label: '+1%', price: order.entry_price * (order.side === 'BUY' ? 1.01 : 0.99) },
        { label: '+2%', price: order.entry_price * (order.side === 'BUY' ? 1.02 : 0.98) },
        { label: '+5%', price: order.entry_price * (order.side === 'BUY' ? 1.05 : 0.95) },
        { label: '+10%', price: order.entry_price * (order.side === 'BUY' ? 1.10 : 0.90) },
    ] : [];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md bg-card border border-border rounded-lg shadow-2xl p-6 transform transition-all scale-100"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center mb-5">
                    <div>
                        <h2 className="text-lg font-bold text-foreground">Edit Position</h2>
                        <p className="text-xs text-muted font-mono">
                            {order.symbol} &bull; {order.side} &bull; {order.amount} units
                        </p>
                    </div>
                    <button onClick={onClose} className="text-muted hover:text-foreground transition-colors cursor-pointer text-lg" aria-label="Close modal">
                        ✕
                    </button>
                </div>

                {/* Info bar */}
                <div className="flex justify-between items-center text-[11px] text-muted bg-background/50 rounded px-3 py-2 mb-5 border border-border/50">
                    <div>Entry: <span className="font-mono text-foreground">${formatPrice(order.entry_price)}</span></div>
                    {currentPrice > 0 && (
                        <div>Current: <span className="font-mono text-foreground">${formatPrice(currentPrice)}</span></div>
                    )}
                    {order.liquidation_price && (
                        <div>Liq: <span className="font-mono text-red-500">${formatPrice(order.liquidation_price)}</span></div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <OrderLevelSection
                        type="sl"
                        order={order}
                        price={slPrice}
                        amount={slAmount}
                        activeField={slActiveField}
                        error={validation.slError}
                        limits={limits?.sl ?? null}
                        quickButtons={slQuickButtons}
                        onPriceChange={handleSlPriceChange}
                        onAmountChange={handleSlAmountChange}
                        onClear={() => { setSlPrice(""); setSlAmount(""); setSlActiveField(null); }}
                    />

                    <OrderLevelSection
                        type="tp"
                        order={order}
                        price={tpPrice}
                        amount={tpAmount}
                        activeField={tpActiveField}
                        error={validation.tpError}
                        limits={limits?.tp ?? null}
                        quickButtons={tpQuickButtons}
                        onPriceChange={handleTpPriceChange}
                        onAmountChange={handleTpAmountChange}
                        onClear={() => { setTpPrice(""); setTpAmount(""); setTpActiveField(null); }}
                    />

                    {/* Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 text-xs font-bold rounded border border-border hover:bg-muted/10 transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving || hasErrors}
                            className="flex-1 px-4 py-2.5 text-xs font-bold rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                        >
                            {isSaving ? "Saving..." : "Update Order"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
