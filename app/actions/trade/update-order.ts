'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { UpdateOrderSchema, parseSchema } from "@/lib/schemas";
import type { TradeSide } from "@/lib/config";

/** Updates SL/TP on an open position with server-side validation against entry/liquidation prices */
export async function updateOrder(positionId: string, updates: { stopLoss?: number, takeProfit?: number }) {
    const validation = parseSchema(UpdateOrderSchema, { positionId, updates });
    if (!validation.success) return { success: false, message: validation.message };

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Unauthorized" };

    try {
        const { data: position } = await supabase
            .from('positions')
            .select('entry_price, side, liquidation_price')
            .eq('id', positionId)
            .eq('user_id', user.id)
            .eq('status', 'OPEN')
            .single();

        if (!position) return { success: false, message: "Position not found or already closed" };

        const side = position.side as TradeSide;
        const entryPrice = position.entry_price;

        const slValue = (updates.stopLoss && updates.stopLoss > 0) ? updates.stopLoss : null;
        const tpValue = (updates.takeProfit && updates.takeProfit > 0) ? updates.takeProfit : null;

        if (slValue !== null) {
            if (side === 'BUY' && slValue >= entryPrice) {
                return { success: false, message: "Stop Loss must be below entry price for BUY positions" };
            }
            if (side === 'SELL' && slValue <= entryPrice) {
                return { success: false, message: "Stop Loss must be above entry price for SELL positions" };
            }
            if (position.liquidation_price) {
                if (side === 'BUY' && slValue <= position.liquidation_price) {
                    return { success: false, message: "Stop Loss is below liquidation price" };
                }
                if (side === 'SELL' && slValue >= position.liquidation_price) {
                    return { success: false, message: "Stop Loss is above liquidation price" };
                }
            }
        }

        if (tpValue !== null) {
            if (side === 'BUY' && tpValue <= entryPrice) {
                return { success: false, message: "Take Profit must be above entry price for BUY positions" };
            }
            if (side === 'SELL' && tpValue >= entryPrice) {
                return { success: false, message: "Take Profit must be below entry price for SELL positions" };
            }
        }

        const { data: updated, error } = await supabase
            .from('positions')
            .update({
                stop_loss: slValue,
                take_profit: tpValue
            })
            .eq('id', positionId)
            .eq('user_id', user.id)
            .eq('status', 'OPEN')
            .select('id')
            .single();

        if (error || !updated) {
            console.error('updateOrder error:', error?.message ?? 'Position no longer open');
            return { success: false, message: "Position not found or already closed" };
        }

        revalidatePath('/market');
        return { success: true, message: "Position updated successfully" };
    } catch (e: unknown) {
        console.error('updateOrder error:', e);
        return { success: false, message: "Failed to update position. Please try again." };
    }
}
