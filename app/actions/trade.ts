'use server'

import { calculateExecutionPrice } from "@/lib/trading-math";
import { getTicker } from "@/lib/binance";

interface TradeState {
    success: boolean;
    message: string;
    data?: any;
}

export async function executeTrade(symbol: string, amount: number, side: 'BUY' | 'SELL'): Promise<TradeState> {
    try {
        const tickers = await getTicker();
        const ticker = tickers.find(t => t.symbol === symbol);

        if (!ticker) {
            return { success: false, message: "Asset unavailable" };
        }

        const currentRealPrice = parseFloat(ticker.lastPrice);

        const calculation = calculateExecutionPrice(currentRealPrice, side, amount);

        // 3. Tutaj będzie miejsce na sprawdzenie Salda Użytkownika w Supabase
        // const userBalance = ...
        // if (userBalance < calculation.totalCost) return { error: "Insufficient funds" }

        // 4. Tutaj będzie INSERT do tabeli 'orders' w Supabase

        // 5. Zwracamy wynik
        return {
            success: true,
            message: `${side} executed at $${calculation.executionPrice}`,
            data: calculation
        };

    } catch (e) {
        return { success: false, message: "Trade failed" };
    }
}