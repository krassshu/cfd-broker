'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import {calculateExecutionPrice, LEVERAGE} from "@/lib/trading-math";
import { getTicker } from "@/lib/binance";
import { revalidatePath } from "next/cache";

async function createClient() {
    const cookieStore = await cookies()
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll() },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
                },
            },
        }
    )
}

export async function executeTrade(symbol: string, amount: number, side: 'BUY' | 'SELL') {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: "Unauthorized" };

    try {
        const tickers = await getTicker();
        const ticker = tickers.find(t => t.symbol === symbol);
        if (!ticker) return { success: false, message: "Asset unavailable" };

        const currentRealPrice = parseFloat(ticker.lastPrice);

        const { executionPrice, requiredMargin, liquidationPrice } = calculateExecutionPrice(currentRealPrice, side, amount);

        const { data: profile } = await supabase.from('profiles').select('balance').eq('id', user.id).single();

        if (!profile || profile.balance < requiredMargin) {
            return { success: false, message: "Insufficient balance for margin" };
        }

        const { error } = await supabase.from('positions').insert({
            user_id: user.id,
            symbol: symbol,
            side: side,
            amount: amount,
            entry_price: executionPrice,
            leverage: LEVERAGE,
            margin: requiredMargin,
            liquidation_price: liquidationPrice,

            status: 'OPEN'
        });

        if (error) throw error;

        await supabase.from('transactions').insert({
            user_id: user.id,
            amount: -requiredMargin,
            type: 'MARGIN_LOCK',
            reference_id: null
        });

        revalidatePath('/market');
        return { success: true, message: "Position Opened", data: { executionPrice } };

    } catch (e: any) {
        return { success: false, message: e.message || "Trade failed" };
    }
}

export async function closePosition(orderId: string) {
    const supabase = await createClient();

    try {
        const { data: order } = await supabase.from('orders').select('*').eq('id', orderId).single();
        if (!order) return { success: false, message: "Order not found" };

        if (order.status === 'CLOSED') return { success: false, message: "Order already closed" };

        const tickers = await getTicker();
        const ticker = tickers.find((t: any) => t.symbol === order.symbol);

        if (!ticker) return { success: false, message: "Market closed or unavailable" };

        const currentPrice = parseFloat(ticker.lastPrice);

        let pnl = 0;
        if (order.side === 'BUY') {
            pnl = (currentPrice - order.open_price) * order.amount;
        } else {
            pnl = (order.open_price - currentPrice) * order.amount;
        }

        const { error } = await supabase.from('orders').update({
            status: 'CLOSED',
            close_price: currentPrice,
            closed_at: new Date().toISOString(),
            pnl: pnl
        }).eq('id', orderId);

        if (error) throw error;

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

export async function updateOrder(orderId: string, updates: { stopLoss?: number, takeProfit?: number }) {
    const supabase = await createClient();

    try {
        const { error } = await supabase
            .from('orders')
            .update({
                stop_loss: updates.stopLoss,
                take_profit: updates.takeProfit
            })
            .eq('id', orderId);

        if (error) throw error;

        revalidatePath('/market');
        return { success: true, message: "Order updated successfully" };
    } catch (e: any) {
        return { success: false, message: e.message || "Update failed" };
    }
}