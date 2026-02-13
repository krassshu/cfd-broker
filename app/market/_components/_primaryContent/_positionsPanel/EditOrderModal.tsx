"use client";

import { useState, useEffect } from "react";
import { Order } from "@/app/market/_components/_primaryContent/_positionsPanel/types";

interface EditOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (id: string, sl: number, tp: number) => Promise<void>;
    order: Order | null;
}

export default function EditOrderModal({ isOpen, onClose, onSave, order }: EditOrderModalProps) {
    const [sl, setSl] = useState<string>("");
    const [tp, setTp] = useState<string>("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (order) {
            setSl(order.stop_loss ? order.stop_loss.toString() : "");
            setTp(order.take_profit ? order.take_profit.toString() : "");
        }
    }, [order]);

    if (!isOpen || !order) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        await onSave(order.id, parseFloat(sl) || 0, parseFloat(tp) || 0);
        setIsSaving(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="w-full max-w-sm bg-card border border-border rounded-lg shadow-2xl p-6 transform transition-all scale-100"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-foreground">Edit Position</h2>
                        <p className="text-xs text-muted font-mono">{order.symbol} • {order.side}</p>
                    </div>
                    <button onClick={onClose} className="text-muted hover:text-foreground">
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-muted uppercase flex justify-between">
                            Stop Loss
                            <span className="text-red-500 text-[10px]">Risk Management</span>
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                step="any"
                                value={sl}
                                onChange={(e) => setSl(e.target.value)}
                                className="w-full bg-background/50 border border-border rounded px-3 py-2 text-sm font-mono focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
                                placeholder="No Stop Loss"
                            />
                            <span className="absolute right-3 top-2 text-xs text-muted">USDT</span>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-muted uppercase flex justify-between">
                            Take Profit
                            <span className="text-green-500 text-[10px]">Target</span>
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                step="any"
                                value={tp}
                                onChange={(e) => setTp(e.target.value)}
                                className="w-full bg-background/50 border border-border rounded px-3 py-2 text-sm font-mono focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none transition-all"
                                placeholder="No Take Profit"
                            />
                            <span className="absolute right-3 top-2 text-xs text-muted">USDT</span>
                        </div>
                    </div>
                    <div className="pt-2 pb-2 text-xs text-center text-muted">
                        Entry Price: <span className="font-mono text-foreground">{order.open_price}</span>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-xs font-bold rounded border border-border hover:bg-muted/10 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 px-4 py-2 text-xs font-bold rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {isSaving ? "Saving..." : "Update Order"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}