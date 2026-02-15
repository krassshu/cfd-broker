'use server'

import { createClient } from "./utils";
import { getTicker } from "@/lib/binance";
import { revalidatePath } from "next/cache";

export async function closePosition(positionId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    try {
        const { data: position } = await supabase
            .from('positions')
            .select('*')
            .eq('id', positionId)
            .eq('user_id', user?.id) // Security check
            .single();

        if (!position) return { success: false, message: "Position not found" };
        if (position.status !== 'OPEN') return { success: false, message: "Position already closed" };

        const tickers = await getTicker();
        const ticker = tickers.find((t: any) => t.symbol === position.symbol);

        if (!ticker) return { success: false, message: "Market unavailable" };

        const currentPrice = parseFloat(ticker.lastPrice);

        let pnl = 0;
        if (position.side === 'BUY') {
            pnl = (currentPrice - position.entry_price) * position.amount;
        } else {
            pnl = (position.entry_price - currentPrice) * position.amount;
        }

        const { error: updateError } = await supabase.from('positions').update({
            status: 'CLOSED',
            exit_price: currentPrice,
            closed_at: new Date().toISOString(),
            pnl: pnl
        }).eq('id', positionId);

        if (updateError) throw updateError;

        const returnAmount = position.margin + pnl;

        await supabase.from('transactions').insert({
            user_id: position.user_id,
            amount: returnAmount,
            type: 'REALIZED_PNL',
            reference_id: positionId
        });

        revalidatePath('/market');
        return {
            success: true,
            message: `Closed at $${currentPrice.toFixed(2)}. P/L: $${pnl.toFixed(2)}`,
            data: { closePrice: currentPrice, pnl }
        };

    } catch (e: any) {
        return { success: false, message: "Close failed: " + e.message };
    }
}