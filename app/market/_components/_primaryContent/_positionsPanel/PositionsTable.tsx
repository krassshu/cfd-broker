"use client";
import { PositionRow } from "./PositionRow";
import {PositionsTableProps} from "@/app/market/_components/_primaryContent/_positionsPanel/types";

export function PositionsTable({ orders, activeTab, tickersData, onClose, onEdit }: PositionsTableProps){
    const visibleOrders = orders
        .filter(o => activeTab === 'OPEN' ? o.status === 'OPEN' : o.status === 'CLOSED')
        .sort((a, b) => {
            if (activeTab === 'HISTORY') {
                const dateA = a.closed_at ? new Date(a.closed_at).getTime() : 0;
                const dateB = b.closed_at ? new Date(b.closed_at).getTime() : 0;
                return dateB - dateA;
            } else {
                const dateA = new Date(a.created_at).getTime();
                const dateB = new Date(b.created_at).getTime();
                return dateB - dateA;
            }
        });

    return (
        <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead className="sticky top-0 bg-card z-10 text-[10px] text-muted uppercase font-bold tracking-wider shadow-sm border-b border-border">
                {activeTab === 'HISTORY' ? (
                    <tr>
                        <th className="px-4 py-3">Symbol</th>
                        <th className="px-4 py-3 text-right">Order Price</th>
                        <th className="px-4 py-3 text-right">Close Price</th>
                        <th className="px-4 py-3 text-center">Direction</th>
                        <th className="px-4 py-3 text-right">Amount</th>
                        <th className="px-4 py-3 text-right">Mkt Value</th>
                        <th className="px-4 py-3 text-right">Total P/L</th>
                        <th className="px-4 py-3 text-right">SL</th>
                        <th className="px-4 py-3 text-right">TP</th>
                        <th className="px-4 py-3 text-right">Order Date</th>
                        <th className="px-4 py-3 text-right">Close Date</th>
                    </tr>
                ) : (
                    <tr>
                        <th className="px-4 py-3">Symbol</th>
                        <th className="px-4 py-3 text-center">Direction</th>
                        <th className="px-4 py-3 text-right">Open Price</th>
                        <th className="px-4 py-3 text-right">Amount</th>
                        <th className="px-4 py-3 text-right">Mkt Price</th>
                        <th className="px-4 py-3 text-right">Total P/L</th>
                        <th className="px-4 py-3 text-right">Mkt Value</th>
                        <th className="px-4 py-3 text-right">SL</th>
                        <th className="px-4 py-3 text-right">TP</th>
                        <th className="px-4 py-3 text-right">Open Date</th>
                        <th className="px-4 py-3 text-center w-24"></th>
                    </tr>
                )}
                </thead>
                <tbody className="divide-y divide-border/30 text-xs">
                {visibleOrders.map((order) => (
                    <PositionRow
                        key={order.id}
                        order={order}
                        activeTab={activeTab}
                        tickersData={tickersData}
                        onClose={onClose}
                        onEdit={onEdit}
                    />
                ))}

                {visibleOrders.length === 0 && (
                    <tr>
                        <td colSpan={11} className="px-4 py-12 text-center text-muted italic">
                            No {activeTab.toLowerCase()} positions found
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
}