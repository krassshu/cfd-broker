"use client";

import { formatCurrency, formatDate } from "@/lib/utils";
import { PositionRowProps } from "@/app/market/_components/_primaryContent/_positionsPanel/types";
import CryptoIcon from "@/app/market/_components/_shared/CryptoIcon";

/** Single position table row — shows live P&L for open positions, stored P&L for history */
export function PositionRow({ order, activeTab, tickersData, onClose, onEdit }: PositionRowProps) {
    const cleanSymbol = order.symbol.replace('USDT', '');

    const ticker = tickersData?.find(t => t.symbol === order.symbol);
    // Fall back to entry price when the ticker hasn't loaded yet to avoid NaN renders
    const livePrice = ticker ? parseFloat(ticker.lastPrice) : order.entry_price;

    // Use live price for open positions, exit price (or entry as fallback) for history
    const calculationPrice = activeTab === 'OPEN' ? livePrice : (order.exit_price || order.entry_price);

    // For closed/liquidated positions use the stored P&L; for open ones calculate live
    let pnl = 0;
    if (order.status !== 'OPEN') {
        pnl = order.pnl || 0;
    } else {
        if (order.side === 'BUY') {
            pnl = (livePrice - order.entry_price) * order.amount;
        } else {
            pnl = (order.entry_price - livePrice) * order.amount;
        }
    }

    const marketValue = calculationPrice * order.amount;
    const isProfit = pnl >= 0;

    const cellClass = "px-4 py-3 whitespace-nowrap";
    const monoClass = "font-mono tracking-tight";

    return (
        <tr className="hover:bg-muted/5 transition-colors group border-b border-border/30 last:border-0 text-xs">
            <td className={cellClass}>
                <div className="flex items-center gap-3">
                    <CryptoIcon symbol={order.symbol} size={24} />
                    <div className="flex flex-col">
                        <span className="font-bold text-foreground leading-none">{cleanSymbol}</span>
                        <span className="text-[9px] text-yellow-500 font-bold mt-0.5">{order.leverage}x</span>
                    </div>
                </div>
            </td>

            <td className={`${cellClass} text-center`}>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${order.side === 'BUY' ? 'text-up bg-up/10 border-up/20' : 'text-down bg-down/10 border-down/20'}`}>
                    {order.side}
                </span>
            </td>
            <td className={`${cellClass} text-right`}>
                <div className="flex flex-col items-end">
                    <span className={`${monoClass} text-foreground`}>{formatCurrency(order.entry_price)}</span>
                    {activeTab === 'OPEN' && order.liquidation_price && (
                        <span className="text-[9px] text-orange-500/80 font-mono">
                            Liq: {formatCurrency(order.liquidation_price)}
                        </span>
                    )}
                </div>
            </td>
            <td className={`${cellClass} text-right`}>
                <div className="flex flex-col items-end">
                    <span className={`${monoClass} text-foreground`}>{order.amount}</span>
                </div>
            </td>
            <td className={`${cellClass} text-right`}>
                <span className={`${monoClass} text-muted-foreground`}>
                    {ticker ? formatCurrency(livePrice) : <span className="animate-pulse">...</span>}
                </span>
            </td>
            <td className={`${cellClass} text-right`}>
                <span className={`${monoClass} font-bold ${isProfit ? 'text-up' : 'text-down'}`}>
                    {pnl > 0 ? '+' : ''}{formatCurrency(pnl)}
                </span>
            </td>
            <td className={`${cellClass} text-right`}>
                <span className={`${monoClass} text-foreground`}>
                    {formatCurrency(marketValue)}
                </span>
            </td>
            <td className={`${cellClass} text-right`}>
                <span className={`${monoClass} ${order.stop_loss ? 'text-down/80' : 'text-muted/30'}`}>
                    {order.stop_loss || '-'}
                </span>
            </td>
            <td className={`${cellClass} text-right`}>
                <span className={`${monoClass} ${order.take_profit ? 'text-up/80' : 'text-muted/30'}`}>
                    {order.take_profit || '-'}
                </span>
            </td>
            <td className={`${cellClass} text-right text-muted-foreground text-[10px]`}>
                {activeTab === 'OPEN'
                    ? formatDate(order.created_at)
                    : order.closed_at ? formatDate(order.closed_at) : '-'
                }
            </td>
            <td className={`${cellClass} text-center`}>
                {activeTab === 'OPEN' && (
                    <div className="flex items-center justify-end gap-1">
                        <button
                            onClick={() => onEdit(order.id)}
                            className="p-1.5 text-muted hover:text-blue-400 hover:bg-blue-500/10 rounded transition-colors cursor-pointer"
                            title="Edit"
                            aria-label={`Edit ${cleanSymbol} position`}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                        </button>
                        <button
                            onClick={() => onClose(order.id, order.symbol)}
                            className="p-1.5 text-muted hover:text-red-500 hover:bg-red-500/10 rounded transition-colors cursor-pointer"
                            title="Close"
                            aria-label={`Close ${cleanSymbol} position`}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}
            </td>
        </tr>
    );
}
