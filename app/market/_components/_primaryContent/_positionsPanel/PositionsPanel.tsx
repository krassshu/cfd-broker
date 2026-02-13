"use client"

import { useState, useEffect, useMemo } from "react";
import { createBrowserClient } from '@supabase/ssr'
import { useQueryClient } from "@tanstack/react-query";
import { BinanceTicker } from "@/lib/binance";
import { closePosition, updateOrder } from "@/app/actions/trade";
import { toast } from "sonner";
import { PositionsTabs } from "./PositionsTabs";
import { PositionsTable } from "./PositionsTable";
import { Order } from "@/app/market/_components/_primaryContent/_positionsPanel/types";
import EditOrderModal from "./EditOrderModal";

export default function PositionsPanel() {
    const [activeTab, setActiveTab] = useState<'OPEN' | 'HISTORY'>('OPEN');
    const [orders, setOrders] = useState<Order[]>([]);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const fetchOrders = async () => {
        const { data } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });
        if (data) setOrders(data as Order[]);
    };

    useEffect(() => {
        fetchOrders();
        const channel = supabase.channel('realtime orders')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
                fetchOrders();
            })
            .subscribe();

        return () => { supabase.removeChannel(channel) }
    }, []);

    const queryClient = useQueryClient();
    const tickersData = queryClient.getQueryData<BinanceTicker[]>(['binance-tickers']);

    const visibleOrders = useMemo(() => {
        return orders
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
    }, [orders, activeTab]);


    const handleClose = async (id: string, symbol: string) => {
        const ticker = tickersData?.find(t => t.symbol === symbol);
        const estimatedPrice = ticker ? parseFloat(ticker.lastPrice) : 0;

        if (estimatedPrice === 0) {
            toast.error("Waiting for market data...");
            return;
        }

        const previousOrders = [...orders];
        setOrders(prev => prev.map(o => {
            if (o.id === id) {
                const pnl = o.side === 'BUY'
                    ? (estimatedPrice - o.open_price) * o.amount
                    : (o.open_price - estimatedPrice) * o.amount;
                return {
                    ...o,
                    status: 'CLOSED',
                    close_price: estimatedPrice,
                    closed_at: new Date().toISOString(),
                    pnl
                };
            }
            return o;
        }));

        const promise = closePosition(id);

        toast.promise(promise, {
            loading: 'Closing position...',
            success: (res) => {
                if(!res.success) {
                    setOrders(previousOrders);
                    throw new Error(res.message);
                }
                return res.message;
            },
            error: (err) => {
                setOrders(previousOrders);
                return `Error: ${err.message}`;
            }
        });
    };

    const handleEditClick = (id: string) => {
        const order = orders.find(o => o.id === id);
        if (order) {
            setEditingOrder(order);
            setIsEditModalOpen(true);
        }
    };

    const handleSaveEdit = async (id: string, sl: number, tp: number) => {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, stop_loss: sl || undefined, take_profit: tp || undefined } : o));

        const promise = updateOrder(id, { stopLoss: sl, takeProfit: tp });

        toast.promise(promise, {
            loading: 'Updating risk settings...',
            success: (res) => {
                if(!res.success) throw new Error(res.message);
                return "Order updated";
            },
            error: "Update failed"
        });
    };

    return (
        <div className="flex flex-col h-full bg-card/30 text-sm font-sans relative">
            <PositionsTabs
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                orders={orders}
            />
            <PositionsTable
                orders={visibleOrders}
                activeTab={activeTab}
                tickersData={tickersData}
                onClose={handleClose}
                onEdit={handleEditClick}
            />
            <EditOrderModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                order={editingOrder}
                onSave={handleSaveEdit}
            />
        </div>
    );
}