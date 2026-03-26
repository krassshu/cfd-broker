import { SPREAD_RATE, LEVERAGE, type TradeSide } from './config';

export interface TradeCalculation {
    originalPrice: number;
    executionPrice: number;
    spreadAmount: number;
    totalCost: number;
    requiredMargin: number;
    liquidationPrice: number;
}

/** Returns the price at which a position gets liquidated based on leverage */
export function calculateLiquidationPrice(entryPrice: number, side: TradeSide, leverage: number = LEVERAGE): number {
    const maintenanceMargin = 1 / leverage;

    if (side === 'BUY') {
        return entryPrice * (1 - maintenanceMargin);
    } else {
        return entryPrice * (1 + maintenanceMargin);
    }
}

/** Applies spread to market price and computes margin, cost, and liquidation for a new trade */
export function calculateExecutionPrice(price: number, side: TradeSide, amount: number): TradeCalculation {
    const spreadAmount = price * SPREAD_RATE;
    const executionPrice = side === 'BUY'
        ? price + spreadAmount
        : price - spreadAmount;

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

/** Computes unrealized P&L for a single position */
export function calculatePositionPnL(
    side: TradeSide,
    entryPrice: number,
    currentPrice: number,
    amount: number
): number {
    if (side === 'BUY') {
        return (currentPrice - entryPrice) * amount;
    } else {
        return (entryPrice - currentPrice) * amount;
    }
}

/** Returns margin locked by a position (notional value / leverage) */
export function calculatePositionMargin(entryPrice: number, amount: number, leverage: number = LEVERAGE): number {
    return (entryPrice * amount) / leverage;
}

export function calculateClosePriceFromPnL(
    side: TradeSide,
    entryPrice: number,
    amount: number,
    targetPnL: number
): number {
    if (amount === 0) return 0;
    if (side === 'BUY') {
        return entryPrice + (targetPnL / amount);
    } else {
        return entryPrice - (targetPnL / amount);
    }
}

/** Calculate SL/TP price range limits. Returns { min, max } for the allowed price. */
export function calculateSlPriceLimits(
    side: TradeSide,
    entryPrice: number,
    currentPrice: number,
    liquidationPrice: number
): { min: number; max: number } {
    if (side === 'BUY') {
        // BUY SL: must be above liquidation and below current price
        return { min: liquidationPrice, max: currentPrice };
    } else {
        // SELL SL: must be below liquidation and above current price
        return { min: currentPrice, max: liquidationPrice };
    }
}

export function calculateTpPriceLimits(
    side: TradeSide,
    entryPrice: number,
    currentPrice: number
): { min: number; max: number } {
    if (side === 'BUY') {
        // BUY TP: must be above current price, no upper limit (use 10x entry as reasonable max)
        return { min: currentPrice, max: entryPrice * 10 };
    } else {
        // SELL TP: must be below current price, floor at 0
        return { min: 0.00000001, max: currentPrice };
    }
}

