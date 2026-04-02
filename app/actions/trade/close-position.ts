'use server'

import { createClient } from "@/lib/supabase/server";
import { getTickerPrice } from "@/lib/binance";
import { calculatePositionPnL } from "@/lib/trading-math";
import { revalidatePath } from "next/cache";
import { ClosePositionSchema, parseSchema } from "@/lib/schemas";
import { RATE_LIMIT_CLOSE, type TradeSide } from "@/lib/config";
import { rateLimit } from "@/lib/rate-limit";

/** Closes a position at current market price via atomic RPC (validates, calculates P&L, settles) */
export async function closePosition(positionId: string, clientPrice?: number) {
    const validation = parseSchema(ClosePositionSchema, { positionId });
    if (!validation.success) return { success: false, message: validation.message };

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Unauthorized" };

    if (!rateLimit(`close:${user.id}`, RATE_LIMIT_CLOSE.max, RATE_LIMIT_CLOSE.windowMs)) {
        return { success: false, message: "Too many requests. Please wait." };
    }

    try {
        const { data: position } = await supabase
            .from('positions')
            .select('id, symbol, side, entry_price, amount')
            .eq('id', positionId)
            .eq('user_id', user.id)
            .single();

        if (!position) return { success: false, message: "Position not found" };

        // Try server-side price first, fall back to client price
        const serverPrice = await getTickerPrice(position.symbol);

        let currentPrice: number;

        if (serverPrice && serverPrice > 0) {
            currentPrice = serverPrice;
        } else if (clientPrice && clientPrice > 0) {
            console.warn(`Binance API unavailable for ${position.symbol}, using client price: ${clientPrice}`);
            currentPrice = clientPrice;
        } else {
            return { success: false, message: "Market data unavailable. Please try again." };
        }

        const pnl = calculatePositionPnL(
            position.side as TradeSide,
            position.entry_price,
            currentPrice,
            position.amount
        );

        const { data, error } = await supabase.rpc('close_position_atomic', {
            p_user_id: user.id,
            p_position_id: positionId,
            p_exit_price: currentPrice,
            p_pnl: pnl,
        });

        if (error) {
            console.error('close_position_atomic RPC error:', error.message);
            return { success: false, message: "Failed to close position. Please try again." };
        }

        const result = data as { success: boolean; message: string; close_price?: number; pnl?: number };

        if (!result.success) {
            return { success: false, message: result.message };
        }

        revalidatePath('/market');
        return {
            success: true,
            message: result.message,
            data: { closePrice: currentPrice, pnl }
        };

    } catch (e: unknown) {
        console.error('closePosition error:', e);
        return { success: false, message: "Failed to close position. Please try again." };
    }
}
