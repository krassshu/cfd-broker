"use client";

import { Order } from "@/app/market/_components/_primaryContent/_positionsPanel/types";
import { PositionRow } from "./PositionRow";
import PositionsTableSkeleton from "./PositionsTableSkeleton";
import { BinanceTicker } from "@/lib/binance";

interface PositionsTableProps {
    orders: Order[];
    activeTab: 'OPEN' | 'HISTORY';
    tickersData?: BinanceTicker[];
    isLoading?: boolean;
    onClose: (id: string, symbol: string) => void;
    onEdit: (id: string) => void;
    onSymbolClick: (symbol: string) => void;
}

export const PositionsTable = ({ orders, activeTab, tickersData, isLoading, onClose, onEdit, onSymbolClick }: PositionsTableProps) => {
    return (
        <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full min-w-[800px] text-left border-collapse">
                <thead className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm text-[10px] font-bold text-muted uppercase tracking-wider border-b border-border/50">
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
                    <th className="px-4 py-3 text-right">
                        {activeTab === 'OPEN' ? 'Open Date' : 'Closed Date'}
                    </th>
                    <th className="px-4 py-3 text-center w-[80px]">Actions</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                {isLoading ? (
                    <PositionsTableSkeleton />
                ) : orders.length === 0 ? (
                    <tr>
                        <td colSpan={11} className="text-center py-12 text-muted text-xs">
                            No {activeTab.toLowerCase()} positions
                        </td>
                    </tr>
                ) : (
                    orders.map((order) => (
                        <PositionRow
                            key={order.id}
                            order={order}
                            activeTab={activeTab}
                            tickersData={tickersData}
                            onClose={onClose}
                            onEdit={onEdit}
                            onSymbolClick={onSymbolClick}
                        />
                    ))
                )}
                </tbody>
            </table>
        </div>
    );
};