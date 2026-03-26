"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useMarketStore } from "@/lib/store";
import { closePosition, updateOrder } from "@/app/actions/trade";
import { toast } from "sonner";
import { Order } from "@/app/market/_components/_primaryContent/_positionsPanel/types";
import { BinanceTicker } from "@/lib/binance";

export const usePositions = () => {
    const [activeTab, setActiveTab] = useState<'OPEN' | 'HISTORY'>('OPEN');
    const [positions, setPositions] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);

    const supabase = createClient();

    const tickersMap = useMarketStore((state) => state.tickersMap);
    const addNotification = useMarketStore((state) => state.addNotification);
    const bumpPositionsVersion = useMarketStore((state) => state.bumpPositionsVersion);

    const positionsVersion = useMarketStore((state) => state.positionsVersion);

    const fetchPositions = useCallback(async () => {
        const { data } = await supabase
            .from('positions')
            .select('*')
            .order('created_at', { ascending: false });

        if (data) setPositions(data as Order[]);
        setIsLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchPositions();

        const channel = supabase.channel('realtime-positions')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'positions' }, () => {
                fetchPositions();
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [supabase, fetchPositions]);

    useEffect(() => {
        if (positionsVersion === 0) return;
        fetchPositions();
    }, [positionsVersion, fetchPositions]);

    const visibleOrders = useMemo(() => {
        return positions
            .filter(o => activeTab === 'OPEN' ? o.status === 'OPEN' : o.status !== 'OPEN')
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
    }, [positions, activeTab]);

    const handleClose = async (id: string, symbol: string) => {
        const ticker = tickersMap.get(symbol);
        const estimatedPrice = ticker ? parseFloat(ticker.lastPrice) : 0;

        if (estimatedPrice === 0) {
            toast.error("Market data not available yet, please try again.");
            return;
        }

        const previousPositions = [...positions];

        setPositions(prev => prev.map(o => {
            if (o.id === id) {
                const pnl = o.side === 'BUY'
                    ? (estimatedPrice - o.entry_price) * o.amount
                    : (o.entry_price - estimatedPrice) * o.amount;

                return {
                    ...o,
                    status: 'CLOSED',
                    exit_price: estimatedPrice,
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
                if (!res.success) {
                    setPositions(previousPositions);
                    throw new Error(res.message);
                }
                bumpPositionsVersion();
                const cleanSymbol = symbol.replace('USDT', '');
                addNotification(`${cleanSymbol} position closed. ${res.message}`);
                return res.message;
            },
            error: (err) => {
                setPositions(previousPositions);
                return `Error: ${err.message}`;
            }
        });
    };

    const openEditModal = (id: string) => {
        const order = positions.find(o => o.id === id);
        if (order) {
            setEditingOrder(order);
            setIsEditModalOpen(true);
        }
    };

    const handleSaveEdit = async (id: string, sl: number, tp: number) => {
        setPositions(prev => prev.map(o => o.id === id ? { ...o, stop_loss: sl || undefined, take_profit: tp || undefined } : o));
        setIsEditModalOpen(false);

        const promise = updateOrder(id, { stopLoss: sl, takeProfit: tp });

        toast.promise(promise, {
            loading: 'Updating risk settings...',
            success: (res) => {
                if (!res.success) throw new Error(res.message);
                return "Order updated";
            },
            error: "Update failed"
        });
    };

    const tickersData: BinanceTicker[] = useMemo(() => Array.from(tickersMap.values()), [tickersMap]);

    return {
        activeTab,
        orders: positions,
        visibleOrders,
        tickersData,
        isLoading,
        isEditModalOpen,
        editingOrder,
        setActiveTab,
        setIsEditModalOpen,
        handleClose,
        openEditModal,
        handleSaveEdit
    };
};
