'use server'

import { createClient } from "./utils";
import { revalidatePath } from "next/cache";

export async function updateOrder(positionId: string, updates: { stopLoss?: number, takeProfit?: number }) {
    const supabase = await createClient();

    try {
        const { error } = await supabase
            .from('positions')
            .update({
                stop_loss: updates.stopLoss,
                take_profit: updates.takeProfit
            })
            .eq('id', positionId);

        if (error) throw error;

        revalidatePath('/market');
        return { success: true, message: "Position updated successfully" };
    } catch (e: any) {
        return { success: false, message: e.message || "Update failed" };
    }
}