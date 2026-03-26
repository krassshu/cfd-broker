import { z } from 'zod';
import { MIN_TRADE_AMOUNT, MAX_TRADE_AMOUNT } from './config';

export const TradeSchema = z.object({
    symbol: z
        .string()
        .min(3, 'Symbol is required')
        .max(20, 'Symbol is too long')
        .regex(/^[A-Z0-9]+USDT$/, 'Symbol must be uppercase alphanumeric ending with USDT'),
    amount: z
        .number({ message: 'Amount must be a number' })
        .positive('Amount must be positive')
        .min(MIN_TRADE_AMOUNT, `Minimum trade amount is ${MIN_TRADE_AMOUNT}`)
        .max(MAX_TRADE_AMOUNT, `Maximum trade amount is ${MAX_TRADE_AMOUNT}`),
    side: z.enum(['BUY', 'SELL'] as const, {
        message: 'Side must be BUY or SELL'
    }),
});

export type TradeInput = z.infer<typeof TradeSchema>;

export const UpdateOrderSchema = z.object({
    positionId: z
        .string()
        .uuid('Position ID must be a valid UUID'),
    updates: z.object({
        stopLoss: z
            .number({ message: 'Stop Loss must be a number' })
            .nonnegative('Stop Loss must be non-negative')
            .optional(),
        takeProfit: z
            .number({ message: 'Take Profit must be a number' })
            .nonnegative('Take Profit must be non-negative')
            .optional(),
    }),
});

export type UpdateOrderInput = z.infer<typeof UpdateOrderSchema>;

export const ClosePositionSchema = z.object({
    positionId: z
        .string()
        .uuid('Position ID must be a valid UUID'),
});

export type ClosePositionInput = z.infer<typeof ClosePositionSchema>;

export function parseSchema<T>(
    schema: z.ZodType<T>,
    data: unknown
): { success: true; data: T } | { success: false; message: string } {
    const result = schema.safeParse(data);
    if (!result.success) {
        const issues = result.error.issues;
        const message = issues.map(i => i.message).join('. ') || 'Validation failed';
        return { success: false, message };
    }
    return { success: true, data: result.data };
}
