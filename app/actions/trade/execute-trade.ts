'use server'

import { createClient } from "@/lib/supabase/server";
import { calculateExecutionPrice } from "@/lib/trading-math";
import { getTickerPrice } from "@/lib/binance";
import { revalidatePath } from "next/cache";
import { TradeSchema, parseSchema } from "@/lib/schemas";
import { LEVERAGE, RATE_LIMIT_TRADE, type TradeSide } from "@/lib/config";
import { rateLimit } from "@/lib/rate-limit";

/** Maximum allowed deviation (0.5%) between client price and server price */
const MAX_PRICE_DEVIATION = 0.005;

/** Opens a new leveraged position via atomic RPC (applies spread, checks margin, creates position) */
export async function executeTrade(symbol: string, amount: number, side: TradeSide, clientPrice?: number) {
    const validation = parseSchema(TradeSchema, { symbol, amount, side });
    if (!validation.success) return { success: false, message: validation.message };

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Unauthorized" };

    if (!rateLimit(`trade:${user.id}`, RATE_LIMIT_TRADE.max, RATE_LIMIT_TRADE.windowMs)) {
        return { success: false, message: "Too many requests. Please wait." };
    }

    try {
        // Try to get the server-side price from Binance (with fallback endpoints)
        const serverPrice = await getTickerPrice(symbol);

        let currentRealPrice: number;

        if (serverPrice && serverPrice > 0) {
            // Server price available — use it as source of truth
            currentRealPrice = serverPrice;
        } else if (clientPrice && clientPrice > 0) {
            // All Binance endpoints failed — fall back to client-provided price
            console.warn(`Binance API unavailable for ${symbol}, using client price: ${clientPrice}`);
            currentRealPrice = clientPrice;
        } else {
            return { success: false, message: "Market data unavailable. Please try again." };
        }

        // If both prices available, validate client price isn't stale/manipulated
        if (serverPrice && clientPrice && clientPrice > 0) {
            const deviation = Math.abs(serverPrice - clientPrice) / serverPrice;
            if (deviation > MAX_PRICE_DEVIATION) {
                // Price moved significantly — use server price but don't reject
                console.warn(`Price deviation ${(deviation * 100).toFixed(2)}% for ${symbol}: server=${serverPrice}, client=${clientPrice}`);
            }
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
