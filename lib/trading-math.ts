export const SPREAD_RATE = 0.001;
export const LEVERAGE = 50;

export interface TradeCalculation {
    originalPrice: number;
    executionPrice: number;
    spreadAmount: number;
    totalCost: number;
    requiredMargin: number;
    liquidationPrice: number;
}

export function calculateLiquidationPrice(entryPrice: number, side: 'BUY' | 'SELL', leverage: number): number {

    const maintenanceMargin = 1 / leverage;

    if (side === 'BUY') {
        return entryPrice * (1 - maintenanceMargin);
    } else {
        return entryPrice * (1 + maintenanceMargin);
    }
}

export function calculateExecutionPrice(price: number, side: 'BUY' | 'SELL', amount: number): TradeCalculation {
    const spreadAmount = price * SPREAD_RATE;
    let executionPrice = 0;

    if (side === 'BUY') {
        executionPrice = price + spreadAmount;
    } else {
        executionPrice = price - spreadAmount;
    }

    const totalCost = executionPrice * amount;
    const requiredMargin = totalCost / LEVERAGE;
    const liquidationPrice = calculateLiquidationPrice(executionPrice, side, LEVERAGE);

    return {
        originalPrice: price,
        executionPrice: Number(executionPrice.toFixed(8)),
        spreadAmount: Number(spreadAmount.toFixed(8)),
        totalCost: Number(totalCost.toFixed(2)),
        requiredMargin: Number(requiredMargin.toFixed(2)),
        liquidationPrice: Number(liquidationPrice.toFixed(8))
    };
}