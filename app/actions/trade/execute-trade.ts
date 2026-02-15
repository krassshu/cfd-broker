'use server'

import { createClient } from "./utils";
import { calculateExecutionPrice, LEVERAGE } from "@/lib/trading-math";
import { getTicker } from "@/lib/binance";
import { revalidatePath } from "next/cache";

export async function executeTrade(symbol: string, amount: number, side: 'BUY' | 'SELL') {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Unauthorized" };

    try {
        const tickers = await getTicker();
        const targetTicker = tickers.find(t => t.symbol === symbol);

        if (!targetTicker) return { success: false, message: "Asset unavailable" };

        const currentRealPrice = parseFloat(targetTicker.lastPrice);

        const { executionPrice, requiredMargin, liquidationPrice } = calculateExecutionPrice(currentRealPrice, side, amount);

        const { data: profile } = await supabase.from('profiles').select('balance').eq('id', user.id).single();
        const { data: openPositions } = await supabase.from('positions').select('*').eq('user_id', user.id).eq('status', 'OPEN');

        if (!profile) return { success: false, message: "Profile error" };

        let totalUnrealizedPnL = 0;

        const priceMap = new Map(tickers.map(t => [t.symbol, parseFloat(t.lastPrice)]));

        if (openPositions) {
            openPositions.forEach(pos => {
                const marketPrice = priceMap.get(pos.symbol);
                if (marketPrice) {
                    let pnl = 0;
                    if (pos.side === 'BUY') {
                        pnl = (marketPrice - pos.entry_price) * pos.amount;
                    } else {
                        pnl = (pos.entry_price - marketPrice) * pos.amount;
                    }
                    totalUnrealizedPnL += pnl;
                }
            });
        }

        const calculatedFreeMargin = profile.balance + totalUnrealizedPnL;

        if (calculatedFreeMargin < requiredMargin) {
            return {
                success: false,
                message: `Insufficient Margin. Free: $${calculatedFreeMargin.toFixed(2)}, Req: $${requiredMargin.toFixed(2)}`
            };
        }

        const { data: newPosition, error: posError } = await supabase.from('positions').insert({
            user_id: user.id,
            symbol: symbol,
            side: side,
            amount: amount,
            entry_price: executionPrice,
            leverage: LEVERAGE,
            margin: requiredMargin,
            liquidation_price: liquidationPrice,
            status: 'OPEN'
        }).select().single();

        if (posError) throw posError;

        await supabase.from('transactions').insert({
            user_id: user.id,
            amount: -requiredMargin,
            type: 'MARGIN_LOCK',
            reference_id: newPosition.id
        });

        revalidatePath('/market');
        return { success: true, message: "Position Opened", data: { executionPrice } };

    } catch (e: any) {
        return { success: false, message: e.message || "Trade failed" };
    }
}