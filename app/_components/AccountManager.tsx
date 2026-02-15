"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from '@supabase/ssr'
import { useMarketStore, Position, Favorite } from "@/lib/store";
import { closePosition } from "@/app/actions/trade/trade";
import { toast } from "sonner";

export default function AccountManager() {
    const setAccountData = useMarketStore((state) => state.setAccountData);
    const updateBalance = useMarketStore((state) => state.updateBalance);
    const calculateAccountMetrics = useMarketStore((state) => state.calculateAccountMetrics);
    const setFavorites = useMarketStore((state) => state.setFavorites);

    const tickersMap = useMarketStore((state) => state.tickersMap);
    const openPositions = useMarketStore((state) => state.openPositions);

    const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        const fetchAccountData = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('balance')
                    .eq('id', user.id)
                    .single();

                const { data: positions } = await supabase
                    .from('positions')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('status', 'OPEN');

                if (profile) {
                    setAccountData(profile.balance, (positions as any[]) || []);
                }

                const { data: favs } = await supabase
                    .from('favorites')
                    .select('*')
                    .eq('user_id', user.id);

                if (favs) {
                    setFavorites(favs as Favorite[]);
                }
            } catch (err) {
                console.error("Critical error in AccountManager:", err);
            }
        };

        fetchAccountData();

        const balanceChannel = supabase.channel('profile-changes')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, (payload: any) => {
                if (payload.new) updateBalance(payload.new.balance);
            })
            .subscribe();

        const positionsChannel = supabase.channel('positions-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'positions' }, () => {
                fetchAccountData();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(balanceChannel);
            supabase.removeChannel(positionsChannel);
        };

    }, [setAccountData, updateBalance, setFavorites]);

    useEffect(() => {
        if (tickersMap.size > 0) {
            calculateAccountMetrics();
        }
    }, [tickersMap, openPositions, calculateAccountMetrics]);

    useEffect(() => {
        if (tickersMap.size === 0 || openPositions.length === 0) return;

        const positionsToLiquidate: Position[] = []

        openPositions.forEach(pos => {
            if (processingIds.has(pos.id)) return;

            const ticker = tickersMap.get(pos.symbol);
            if (!ticker) return;

            const currentPrice = parseFloat(ticker.lastPrice);

            const liqPrice = pos.liquidation_price;

            if (!liqPrice) return;

            const isLiquidated = pos.side === 'BUY'
                ? currentPrice <= liqPrice
                : currentPrice >= liqPrice;

            if (isLiquidated) {
                positionsToLiquidate.push(pos);
            }
        });

        if (positionsToLiquidate.length === 0) return;

        positionsToLiquidate.sort((a, b) => a.amount - b.amount);

        const processLiquidations = async () => {
            for (const pos of positionsToLiquidate) {
                setProcessingIds(prev => new Set(prev).add(pos.id));

                console.warn(`LIQUIDATING POSITION ${pos.id} (Vol: ${pos.amount})`);
                toast.error(`Liquidating ${pos.symbol}`, {
                    description: `Price hit liquidation level. Closing position.`
                });

                try {
                    await closePosition(pos.id);
                } catch (error) {
                    console.error("Liquidation failed for:", pos.id, error);

                    setProcessingIds(prev => {
                        const next = new Set(prev);
                        next.delete(pos.id);
                        return next;
                    });
                }
            }
        };

        processLiquidations();

    }, [tickersMap, openPositions, processingIds]);

    return null;
}