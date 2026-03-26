'use server'

import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";
import { parseSchema } from "@/lib/schemas";
import { MAX_DEMO_BALANCE, RATE_LIMIT_DEMO_FUNDS } from "@/lib/config";

const AddFundsSchema = z.object({
    amount: z.number()
        .int("Amount must be a whole number")
        .positive("Amount must be positive")
        .max(MAX_DEMO_BALANCE, `Amount cannot exceed $${MAX_DEMO_BALANCE.toLocaleString()}`),
});

/** Adds demo funds to the user's balance via RPC (with direct INSERT fallback) */
export async function addDemoFunds(amount: number): Promise<{ success: boolean; message: string; newBalance?: number }> {
    const validation = parseSchema(AddFundsSchema, { amount });
    if (!validation.success) return { success: false, message: validation.message };

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Unauthorized" };

    if (!rateLimit(`demo-funds:${user.id}`, RATE_LIMIT_DEMO_FUNDS.max, RATE_LIMIT_DEMO_FUNDS.windowMs)) {
        return { success: false, message: "Too many requests. Please wait a moment." };
    }

    // Check current balance first
    const { data: profile } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', user.id)
        .single();

    const currentBalance = profile?.balance ?? 0;

    if (currentBalance + amount > MAX_DEMO_BALANCE) {
        const remaining = Math.max(0, MAX_DEMO_BALANCE - currentBalance);
        return {
            success: false,
            message: `Cannot add $${amount.toLocaleString()}. Maximum balance is $${MAX_DEMO_BALANCE.toLocaleString()}, you can add up to $${remaining.toLocaleString()}.`,
        };
    }

    try {
        // Try RPC first (SECURITY DEFINER, bypasses RLS)
        const { data, error } = await supabase.rpc('add_demo_funds', {
            p_user_id: user.id,
            p_amount: amount,
            p_max_balance: MAX_DEMO_BALANCE,
        });

        if (!error && data) {
            const result = data as { success: boolean; message: string; new_balance?: number };
            return {
                success: result.success,
                message: result.message,
                newBalance: result.new_balance,
            };
        }

        // Fallback: direct INSERT (RLS allows insert for own user_id)
        console.warn('RPC add_demo_funds failed, falling back to direct INSERT:', error?.message);

        // Re-check balance before fallback INSERT to prevent race conditions
        const { data: freshProfile } = await supabase
            .from('profiles')
            .select('balance')
            .eq('id', user.id)
            .single();

        const freshBalance = freshProfile?.balance ?? 0;
        if (freshBalance + amount > MAX_DEMO_BALANCE) {
            const remaining = Math.max(0, MAX_DEMO_BALANCE - freshBalance);
            return {
                success: false,
                message: `Cannot add $${amount.toLocaleString()}. You can add up to $${remaining.toLocaleString()}.`,
            };
        }

        const { error: txErr } = await supabase
            .from('transactions')
            .insert({
                user_id: user.id,
                amount,
                type: 'DEPOSIT',
            });

        if (txErr) throw txErr;

        return {
            success: true,
            message: `$${amount.toLocaleString()} added to your demo account.`,
            newBalance: freshBalance + amount,
        };
    } catch (e) {
        console.error('addDemoFunds error:', e);
        return { success: false, message: "Failed to add funds. Please try again." };
    }
}
