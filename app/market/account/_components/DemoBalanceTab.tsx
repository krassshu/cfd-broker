"use client";

import { useState } from "react";
import { Wallet, Plus, Loader2, DollarSign } from "lucide-react";
import { addDemoFunds } from "@/app/actions/account/add-demo-funds";
import { useMarketStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { DEMO_FUND_OPTIONS, MAX_DEMO_BALANCE } from "@/lib/config";

export default function DemoBalanceTab() {
    const balance = useMarketStore((s) => s.balance);
    const [loading, setLoading] = useState(false);
    const [customAmount, setCustomAmount] = useState("");
    const [message, setMessage] = useState<{ text: string; success: boolean } | null>(null);

    const remaining = MAX_DEMO_BALANCE - balance;

    const handleAddFunds = async (amount: number) => {
        if (amount <= 0) {
            setMessage({ text: "Amount must be positive.", success: false });
            return;
        }
        if (balance + amount > MAX_DEMO_BALANCE) {
            setMessage({
                text: `Cannot add $${amount.toLocaleString()}. Maximum balance is $${MAX_DEMO_BALANCE.toLocaleString()}, you can add up to $${Math.max(0, remaining).toLocaleString()}.`,
                success: false,
            });
            return;
        }

        setLoading(true);
        setMessage(null);
        try {
            const result = await addDemoFunds(amount);
            setMessage({ text: result.message, success: result.success });
            if (result.success) setCustomAmount("");
        } catch {
            setMessage({ text: "Network error. Please try again.", success: false });
        } finally {
            setLoading(false);
        }
    };

    const handleCustomSubmit = () => {
        const parsed = parseFloat(customAmount);
        if (isNaN(parsed) || parsed <= 0) {
            setMessage({ text: "Enter a valid positive amount.", success: false });
            return;
        }
        handleAddFunds(Math.round(parsed));
    };

    return (
        <div className="space-y-8">
            {/* Current Balance Display */}
            <div className="p-6 rounded-xl border landing-card">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <Wallet className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <p className="text-xs text-muted uppercase tracking-wider font-semibold">Current Balance</p>
                        <p className="text-2xl font-bold font-mono text-foreground">{formatCurrency(balance)}</p>
                    </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted">
                    <span>Maximum: ${MAX_DEMO_BALANCE.toLocaleString()}</span>
                    <span>Available to add: <span className={remaining <= 0 ? "text-down font-semibold" : "text-primary font-semibold"}>${Math.max(0, remaining).toLocaleString()}</span></span>
                </div>
            </div>

            {/* Custom Amount Input */}
            <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Custom Amount</h3>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                        <input
                            type="number"
                            value={customAmount}
                            onChange={(e) => setCustomAmount(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleCustomSubmit()}
                            placeholder="Enter amount..."
                            min={1}
                            max={remaining}
                            disabled={loading || remaining <= 0}
                            className="w-full pl-9 pr-4 py-3 rounded-xl border border-landing-card-border bg-card-surface text-sm font-mono text-foreground placeholder:text-muted outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all disabled:opacity-50"
                        />
                    </div>
                    <button
                        onClick={handleCustomSubmit}
                        disabled={loading || !customAmount || remaining <= 0}
                        className="px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Add
                    </button>
                </div>
            </div>

            {/* Quick Add Buttons */}
            <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Quick Add</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {DEMO_FUND_OPTIONS.map((amount) => {
                        const wouldExceed = balance + amount > MAX_DEMO_BALANCE;
                        return (
                            <button
                                key={amount}
                                onClick={() => handleAddFunds(amount)}
                                disabled={loading || wouldExceed}
                                className="flex items-center justify-center gap-1.5 px-3 py-3 rounded-xl border border-landing-card-border bg-card-surface hover:bg-card-surface-hover hover:border-primary/30 transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <Plus className="w-3.5 h-3.5 text-primary" />
                                <span className="text-sm font-bold text-foreground">
                                    ${amount.toLocaleString()}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Status Message */}
            {message && (
                <div className={`p-3 rounded-lg text-sm font-medium ${
                    message.success
                        ? "bg-up/10 text-up border border-up/20"
                        : "bg-down/10 text-down border border-down/20"
                }`}>
                    {message.text}
                </div>
            )}
        </div>
    );
}
