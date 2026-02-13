"use client";

import Image from "next/image";
import {PositionRowProps} from "@/app/market/_components/_primaryContent/_positionsPanel/types";
import {formatCurrency, formatDate} from "@/app/lib/utils";


export function PositionRow({ order, activeTab, tickersData, onClose, onEdit }: PositionRowProps) {
    const cleanSymbol = order.symbol.replace('USDT', '');

    const ticker = tickersData?.find(t => t.symbol === order.symbol);
    const livePrice = ticker ? parseFloat(ticker.lastPrice) : order.open_price;

    const calculationPrice = activeTab === 'OPEN' ? livePrice : (order.close_price || order.open_price);

    let pnl = 0;
    if (order.status === 'CLOSED') {
        pnl = order.pnl || 0;
    } else {
        if (order.side === 'BUY') {
            pnl = (livePrice - order.open_price) * order.amount;
        } else {
            pnl = (order.open_price - livePrice) * order.amount;
        }
    }

    const marketValue = calculationPrice * order.amount;
    const isProfit = pnl >= 0;

    if (activeTab === 'HISTORY') {
        return (
            <tr className="hover:bg-muted/5 transition-colors group border-b border-border/30 last:border-0">
                <td className="px-4 py-3 font-bold text-foreground">{cleanSymbol}</td>
                <td className="px-4 py-3 text-right font-mono text-muted">{formatCurrency(order.open_price)}</td>
                <td className="px-4 py-3 text-right font-mono text-foreground">{formatCurrency(order.close_price || 0)}</td>
                <td className="px-4 py-3 text-center">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${order.side === 'BUY' ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'}`}>{order.side}</span>
                </td>
                <td className="px-4 py-3 text-right font-mono text-muted">{order.amount}</td>
                <td className="px-4 py-3 text-right font-mono text-muted">${formatCurrency(marketValue)}</td>
                <td className={`px-4 py-3 text-right font-bold font-mono ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
                    {pnl > 0 ? '+' : ''}{formatCurrency(pnl)}
                </td>
                <td className="px-4 py-3 text-right text-muted">-</td>
                <td className="px-4 py-3 text-right text-muted">-</td>
                <td className="px-4 py-3 text-right text-[10px] text-muted">{formatDate(order.created_at)}</td>
                <td className="px-4 py-3 text-right text-[10px] text-foreground">{order.closed_at ? formatDate(order.closed_at) : '-'}</td>
            </tr>
        );
    }

    return (
        <tr className="hover:bg-muted/5 transition-colors group border-b border-border/30 last:border-0">
            <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                    <div className="relative w-5 h-5 rounded-full overflow-hidden bg-slate-800 shrink-0">
                        <Image
                            src={`https://bin.bnbstatic.com/static/assets/logos/${cleanSymbol}.png`}
                            alt={cleanSymbol} fill className="object-cover"
                            onError={(e) => (e.currentTarget.src = 'https://bin.bnbstatic.com/static/assets/logos/BTC.png')}
                        />
                    </div>
                    <span className="font-bold text-foreground">{cleanSymbol}</span>
                </div>
            </td>

            <td className="px-4 py-3 text-center">
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${order.side === 'BUY' ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'}`}>{order.side}</span>
            </td>
            <td className="px-4 py-3 text-right font-mono text-muted">{formatCurrency(order.open_price)}</td>
            <td className="px-4 py-3 text-right font-mono text-foreground">{order.amount}</td>
            <td className="px-4 py-3 text-right font-mono text-muted">{formatCurrency(livePrice)}</td>
            <td className={`px-4 py-3 text-right font-bold font-mono ${isProfit ? 'text-green-500' : 'text-red-500'}`}>
                {pnl > 0 ? '+' : ''}{formatCurrency(pnl)}
            </td>
            <td className="px-4 py-3 text-right font-mono text-muted">${formatCurrency(marketValue)}</td>
            <td className="px-4 py-3 text-right text-muted">{order.stop_loss || '-'}</td>
            <td className="px-4 py-3 text-right text-muted">{order.take_profit || '-'}</td>
            <td className="px-4 py-3 text-right text-[10px] text-muted">{formatDate(order.created_at)}</td>
            <td className="px-4 py-3 text-center">
                <div className="flex items-center justify-end gap-2">
                    <button
                        onClick={() => onEdit(order.id)}
                        className="p-1.5 text-muted hover:text-blue-400 hover:bg-blue-500/10 rounded transition-colors"
                        title="Edit Position"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => onClose(order.id, order.symbol)}
                        className="p-1.5 text-muted hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                        title="Close Position"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    );
}