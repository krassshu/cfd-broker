'use server'

import { createClient } from "@/lib/supabase/server";
import { calculateExecutionPrice } from "@/lib/trading-math";
import { getTicker } from "@/lib/binance";
import { revalidatePath } from "next/cache";
import { TradeSchema, parseSchema } from "@/lib/schemas";
import { LEVERAGE, RATE_LIMIT_TRADE, type TradeSide } from "@/lib/config";
import { rateLimit } from "@/lib/rate-limit";

/** Opens a new leveraged position via atomic RPC (applies spread, checks margin, creates position) */
export async function executeTrade(symbol: string, amount: number, side: TradeSide) {
    const validation = parseSchema(TradeSchema, { symbol, amount, side });
    if (!validation.success) return { success: false, message: validation.message };

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Unauthorized" };

    if (!rateLimit(`trade:${user.id}`, RATE_LIMIT_TRADE.max, RATE_LIMIT_TRADE.windowMs)) {
        return { success: false, message: "Too many requests. Please wait." };
    }

    try {
        const tickers = await getTicker();
        const targetTicker = tickers.find(t => t.symbol === symbol);
        if (!targetTicker) return { success: false, message: "Asset unavailable" };

        const currentRealPrice = parseFloat(targetTicker.lastPrice);
        if (isNaN(currentRealPrice) || currentRealPrice <= 0) {
            return { success: false, message: "Invalid market price. Please try again." };
        }

        const { executionPrice, requiredMargin, liquidationPrice } = calculateExecutionPrice(currentRealPrice, side, amount);

        // New capital model: send half-margin as used capital.
        // DB should NOT deduct from balance on open — balance only changes on close.
        const usedMarginPerPosition = requiredMargin / 2;

        const { data, error } = await supabase.rpc('execute_trade_atomic', {
            p_user_id: user.id,
            p_symbol: symbol,
            p_side: side,
            p_amount: amount,
            p_entry_price: executionPrice,
            p_leverage: LEVERAGE,
            p_margin: usedMarginPerPosition,
            p_liquidation_price: liquidationPrice,
        });

        if (error) {
            console.error('execute_trade_atomic RPC error:', error.message);
            return { success: false, message: "Trade execution failed. Please try again." };
        }

        const result = data as { success: boolean; message: string; position_id?: string; entry_price?: number };

        if (!result.success) {
            return { success: false, message: result.message };
        }

        revalidatePath('/market');
        return { success: true, message: "Position Opened", data: { executionPrice } };

    } catch (e: unknown) {
        console.error('executeTrade error:', e);
        return { success: false, message: "Trade execution failed. Please try again." };
    }
}
