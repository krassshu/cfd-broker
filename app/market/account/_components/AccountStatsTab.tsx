"use client";

import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, TrendingDown, Target, Activity } from "lucide-react";
import { getAccountStats, type AccountStats } from "@/app/actions/account/get-account-stats";
import { formatCurrency } from "@/lib/utils";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const SYMBOL_COLORS = [
    "rgba(59, 130, 246, 0.8)", "rgba(139, 92, 246, 0.8)", "rgba(236, 72, 153, 0.8)", "rgba(245, 158, 11, 0.8)",
    "rgba(34, 197, 94, 0.8)", "rgba(6, 182, 212, 0.8)", "rgba(239, 68, 68, 0.8)", "rgba(99, 102, 241, 0.8)",
    "rgba(20, 184, 166, 0.8)", "rgba(249, 115, 22, 0.8)",
];

const CAPITAL_COLORS = { profit: "rgba(34, 197, 94, 0.8)", loss: "rgba(239, 68, 68, 0.8)" };

function StatCard({ label, value, icon: Icon, color }: {
    label: string;
    value: string;
    icon: typeof BarChart3;
    color?: string;
}) {
    return (
        <div className="p-4 rounded-xl border landing-card">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0">
                    <p className="text-xs text-muted uppercase tracking-wider font-semibold truncate">{label}</p>
                    <p className={`text-sm font-bold font-mono ${color ?? "text-foreground"}`}>{value}</p>
                </div>
            </div>
        </div>
    );
}

function CustomTooltip({ active, payload, isCurrency }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { fill: string } }>; isCurrency?: boolean }) {
    if (!active || !payload?.length) return null;
    const item = payload[0];
    return (
        <div className="bg-card border border-border rounded-lg shadow-xl px-3 py-2 text-xs">
            <p className="font-semibold text-foreground">{item.name}</p>
            <p className="text-muted">{isCurrency ? formatCurrency(item.value) : item.value}</p>
        </div>
    );
}

export default function AccountStatsTab() {
    const [stats, setStats] = useState<AccountStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getAccountStats().then((res) => {
            if (res.success && res.data) setStats(res.data);
            else setError(res.message ?? "Failed to load statistics.");
            setLoading(false);
        });
    }, []);

    if (loading) {
        return (
            <div className="grid lg:grid-cols-2 gap-6 animate-pulse">
                {/* Left column skeleton */}
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="p-4 rounded-xl border border-landing-card-border bg-card-surface">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-primary/10" />
                                    <div className="space-y-2 flex-1">
                                        <div className="h-3 w-16 rounded bg-muted/20" />
                                        <div className="h-4 w-24 rounded bg-muted/20" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-5 rounded-xl border border-landing-card-border bg-card-surface">
                        <div className="h-4 w-32 rounded bg-muted/20 mb-4" />
                        <div className="grid grid-cols-3 gap-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex flex-col items-center gap-2">
                                    <div className="h-6 w-10 rounded bg-muted/20" />
                                    <div className="h-3 w-12 rounded bg-muted/20" />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="p-5 rounded-xl border border-landing-card-border bg-card-surface">
                        <div className="h-4 w-28 rounded bg-muted/20 mb-4" />
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex justify-between py-3 border-b border-section-border last:border-0">
                                <div className="h-4 w-20 rounded bg-muted/20" />
                                <div className="h-4 w-16 rounded bg-muted/20" />
                            </div>
                        ))}
                    </div>
                </div>
                {/* Right column skeleton */}
                <div className="space-y-6">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="p-5 rounded-xl border border-landing-card-border bg-card-surface">
                            <div className="h-4 w-36 mx-auto rounded bg-muted/20 mb-4" />
                            <div className="w-[200px] h-[200px] rounded-full bg-muted/10 mx-auto" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="p-4 rounded-lg bg-down/10 text-down text-sm border border-down/20">
                {error ?? "Failed to load statistics."}
            </div>
        );
    }

    const winRate = stats.closedTrades > 0
        ? ((stats.winCount / stats.closedTrades) * 100).toFixed(1)
        : "0.0";
    const pnlColor = stats.totalRealizedPnL >= 0 ? "text-up" : "text-down";

    const capitalData = [
        { name: "Profit", value: stats.totalProfit },
        { name: "Loss", value: stats.totalLoss },
    ].filter(d => d.value > 0);

    const symbolData = stats.symbolBreakdown.map((s, i) => ({
        name: s.symbol.replace("USDT", ""),
        value: s.count,
        fill: SYMBOL_COLORS[i % SYMBOL_COLORS.length],
    }));

    const hasCharts = capitalData.length > 0 || symbolData.length > 0;

    return (
        <div className="grid lg:grid-cols-2 gap-6">
            {/* LEFT COLUMN — Stats + Trade Summary */}
            <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-3">
                    <StatCard label="Balance" value={formatCurrency(stats.balance)} icon={BarChart3} />
                    <StatCard label="Total P&L" value={formatCurrency(stats.totalRealizedPnL)} icon={TrendingUp} color={pnlColor} />
                    <StatCard label="Win Rate" value={`${winRate}%`} icon={Target} />
                    <StatCard label="Total Trades" value={stats.totalTrades.toString()} icon={Activity} />
                    <StatCard label="Best Trade" value={formatCurrency(stats.bestTrade)} icon={TrendingUp} color="text-up" />
                    <StatCard label="Worst Trade" value={formatCurrency(stats.worstTrade)} icon={TrendingDown} color="text-down" />
                </div>

                {/* Trade Summary */}
                <div className="p-5 rounded-xl border landing-card">
                    <h3 className="text-sm font-semibold text-foreground mb-4">Trade Summary</h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-xl font-bold font-mono text-foreground">{stats.openTrades}</p>
                            <p className="text-xs text-muted mt-1">Open</p>
                        </div>
                        <div>
                            <p className="text-xl font-bold font-mono text-up">{stats.winCount}</p>
                            <p className="text-xs text-muted mt-1">Wins</p>
                        </div>
                        <div>
                            <p className="text-xl font-bold font-mono text-down">{stats.lossCount}</p>
                            <p className="text-xs text-muted mt-1">Losses</p>
                        </div>
                    </div>
                    {stats.totalVolume > 0 && (
                        <div className="mt-4 pt-4 border-t border-section-border">
                            <p className="text-xs text-muted">Total Volume Traded</p>
                            <p className="text-sm font-bold font-mono text-foreground">{formatCurrency(stats.totalVolume)}</p>
                        </div>
                    )}
                </div>

                {/* Symbol P&L Table */}
                {stats.symbolBreakdown.length > 0 && (
                    <div className="p-5 rounded-xl border landing-card">
                        <h3 className="text-sm font-semibold text-foreground mb-4">P&L by Symbol</h3>
                        <div className="space-y-1">
                            {stats.symbolBreakdown.map((s) => (
                                <div key={s.symbol} className="flex items-center justify-between py-2 border-b border-section-border last:border-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-foreground">{s.symbol.replace("USDT", "")}</span>
                                        <span className="text-xs text-muted">{s.count} trades</span>
                                    </div>
                                    <span className={`text-sm font-bold font-mono ${s.pnl >= 0 ? "text-up" : "text-down"}`}>
                                        {formatCurrency(s.pnl)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* RIGHT COLUMN — Charts */}
            {hasCharts && (
                <div className="space-y-6">
                    {/* Capital Summary */}
                    {capitalData.length > 0 && (
                        <div className="p-5 rounded-xl border landing-card">
                            <h3 className="text-sm font-semibold text-foreground mb-2 text-center">Capital Summary</h3>
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie
                                        data={capitalData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={3}
                                        dataKey="value"
                                        strokeWidth={0}
                                    >
                                        {capitalData.map((entry, i) => (
                                            <Cell key={i} fill={entry.name === "Profit" ? CAPITAL_COLORS.profit : CAPITAL_COLORS.loss} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip isCurrency />} />
                                    <Legend
                                        verticalAlign="bottom"
                                        iconType="circle"
                                        iconSize={8}
                                        formatter={(value: string) => (
                                            <span className="text-xs text-muted">{value}</span>
                                        )}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Most Traded Symbols */}
                    {symbolData.length > 0 && (
                        <div className="p-5 rounded-xl border landing-card">
                            <h3 className="text-sm font-semibold text-foreground mb-2 text-center">Most Traded Symbols</h3>
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie
                                        data={symbolData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={2}
                                        dataKey="value"
                                        strokeWidth={0}
                                    >
                                        {symbolData.map((entry, i) => (
                                            <Cell key={i} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend
                                        verticalAlign="bottom"
                                        iconType="circle"
                                        iconSize={8}
                                        formatter={(value: string) => (
                                            <span className="text-xs text-muted">{value}</span>
                                        )}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
