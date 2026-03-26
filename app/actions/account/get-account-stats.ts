'use server'

import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";

export interface AccountStats {
    balance: number;
    totalTrades: number;
    openTrades: number;
    closedTrades: number;
    totalRealizedPnL: number;
    totalProfit: number;
    totalLoss: number;
    winCount: number;
    lossCount: number;
    bestTrade: number;
    worstTrade: number;
    totalVolume: number;
    symbolBreakdown: { symbol: string; count: number; pnl: number }[];
}

/** Fetches aggregate account statistics from closed positions and transactions */
export async function getAccountStats(): Promise<{ success: boolean; data?: AccountStats; message?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Unauthorized" };

    if (!rateLimit(`stats:${user.id}`, 10, 60_000)) {
        return { success: false, message: "Too many requests. Please wait a moment." };
    }

    try {
        // Fetch all user positions (both open and closed)
        const { data: positions, error: posErr } = await supabase
            .from('positions')
            .select('symbol, side, amount, entry_price, exit_price, pnl, status')
            .eq('user_id', user.id);

        if (posErr) throw posErr;

        // Fetch current balance
        const { data: profile, error: profErr } = await supabase
            .from('profiles')
            .select('balance')
            .eq('id', user.id)
            .single();

        if (profErr) throw profErr;

        const allPositions = positions || [];
        const openPositions = allPositions.filter(p => p.status === 'OPEN');
        const closedPositions = allPositions.filter(p => p.status === 'CLOSED');

        let totalRealizedPnL = 0;
        let totalProfit = 0;
        let totalLoss = 0;
        let winCount = 0;
        let lossCount = 0;
        let bestTrade = 0;
        let worstTrade = 0;
        let totalVolume = 0;

        const symbolMap = new Map<string, { count: number; pnl: number }>();

        for (const pos of closedPositions) {
            const pnl = pos.pnl ?? 0;
            totalRealizedPnL += pnl;

            if (pnl > 0) { winCount++; totalProfit += pnl; }
            else if (pnl < 0) { lossCount++; totalLoss += Math.abs(pnl); }

            if (pnl > bestTrade) bestTrade = pnl;
            if (pnl < worstTrade) worstTrade = pnl;

            const volume = (pos.entry_price ?? 0) * (pos.amount ?? 0);
            totalVolume += volume;

            const existing = symbolMap.get(pos.symbol) || { count: 0, pnl: 0 };
            existing.count++;
            existing.pnl += pnl;
            symbolMap.set(pos.symbol, existing);
        }

        const symbolBreakdown = Array.from(symbolMap.entries())
            .map(([symbol, data]) => ({ symbol, ...data }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        return {
            success: true,
            data: {
                balance: profile.balance ?? 0,
                totalTrades: allPositions.length,
                openTrades: openPositions.length,
                closedTrades: closedPositions.length,
                totalRealizedPnL,
                totalProfit,
                totalLoss,
                winCount,
                lossCount,
                bestTrade,
                worstTrade,
                totalVolume,
                symbolBreakdown,
            }
        };
    } catch (e) {
        console.error('getAccountStats error:', e);
        return { success: false, message: "Failed to load account statistics." };
    }
}
