export const SPREAD_RATE = 0.001;

export interface TradeCalculation {
    originalPrice: number;
    executionPrice: number;
    spreadAmount: number;
    totalCost: number;
}

export function calculateExecutionPrice(price: number, side: 'BUY' | 'SELL', amount: number): TradeCalculation {
    const spreadAmount = price * SPREAD_RATE;

    let executionPrice = 0;

    if (side === 'BUY') {
        executionPrice = price + spreadAmount;
    } else {
        executionPrice = price - spreadAmount;
    }

    return {
        originalPrice: price,
        executionPrice: Number(executionPrice.toFixed(8)),
        spreadAmount: Number(spreadAmount.toFixed(8)),
        totalCost: Number((executionPrice * amount).toFixed(2))
    };
}