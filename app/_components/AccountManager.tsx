"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useMarketStore, Position } from "@/lib/store";
import { closePosition } from "@/app/actions/trade";
import { toast } from "sonner";
import { METRICS_DEBOUNCE_MS } from "@/lib/config";

/** Headless component: syncs account data from Supabase, recalculates metrics on tick, auto-closes positions on SL/TP or when available capital <= 0 */
export default function AccountManager() {
    const setAccountData = useMarketStore((state) => state.setAccountData);
    const updateBalance = useMarketStore((state) => state.updateBalance);
    const calculateAccountMetrics = useMarketStore((state) => state.calculateAccountMetrics);
    const setFavorites = useMarketStore((state) => state.setFavorites);

    const tickersMap = useMarketStore((state) => state.tickersMap);
    const openPositions = useMarketStore((state) => state.openPositions);
    const balance = useMarketStore((state) => state.balance);
    const available = useMarketStore((state) => state.available);
    const positionsVersion = useMarketStore((state) => state.positionsVersion);

    const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
    const metricsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const supabase = createClient();

    /** Fetches balance, open positions, and favorites from Supabase */
    const fetchAccountData = useCallback(async () => {
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
                .select('id, symbol, side, amount, entry_price, liquidation_price, stop_loss, take_profit')
                .eq('user_id', user.id)
                .eq('status', 'OPEN');

            if (profile) {
                setAccountData(profile.balance, (positions as Position[]) || []);
            }

            const { data: favs } = await supabase
                .from('favorites')
                .select('*')
                .eq('user_id', user.id);

            if (favs) {
                setFavorites(favs as Array<{ symbol: string }>);
            }
        } catch (err) {
            console.error("Critical error in AccountManager:", err);
        }
    }, [supabase, setAccountData, setFavorites]);

    useEffect(() => {
        fetchAccountData();

        const balanceChannel = supabase.channel('profile-changes')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, (payload: { new: Record<string, unknown> }) => {
                if (payload.new && 'balance' in payload.new) {
                    updateBalance(payload.new.balance as number);
                }
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

    }, [fetchAccountData, updateBalance]);

    useEffect(() => {
        if (positionsVersion === 0) return;
        fetchAccountData();
    }, [positionsVersion, fetchAccountData]);

    useEffect(() => {
        if (tickersMap.size === 0) return;

        if (metricsTimerRef.current) clearTimeout(metricsTimerRef.current);

        metricsTimerRef.current = setTimeout(() => {
            calculateAccountMetrics();
        }, METRICS_DEBOUNCE_MS);

        return () => {
            if (metricsTimerRef.current) clearTimeout(metricsTimerRef.current);
        };
    }, [tickersMap, openPositions, balance, calculateAccountMetrics]);

    /** Auto-close logic: SL/TP per position + margin call when available <= 0 */
    useEffect(() => {
        if (tickersMap.size === 0 || openPositions.length === 0) return;

        type CloseReason = 'MARGIN_CALL' | 'STOP_LOSS' | 'TAKE_PROFIT';
        const positionsToClose: Array<{ pos: Position; reason: CloseReason }> = [];

        // Check SL/TP per position
        for (const pos of openPositions) {
            if (processingIds.has(pos.id)) continue;

            const ticker = tickersMap.get(pos.symbol);
            if (!ticker) continue;

            const currentPrice = parseFloat(ticker.lastPrice);
            if (isNaN(currentPrice) || currentPrice <= 0) continue;

            const slHit = pos.stop_loss
                ? (pos.side === 'BUY' ? currentPrice <= pos.stop_loss : currentPrice >= pos.stop_loss)
                : false;

            const tpHit = pos.take_profit
                ? (pos.side === 'BUY' ? currentPrice >= pos.take_profit : currentPrice <= pos.take_profit)
                : false;

            if (slHit) positionsToClose.push({ pos, reason: 'STOP_LOSS' });
            else if (tpHit) positionsToClose.push({ pos, reason: 'TAKE_PROFIT' });
        }

        // Account-level margin call: when available capital drops to 0 or below,
        // close positions starting from smallest volume to largest
        if (available <= 0 && positionsToClose.length === 0) {
            const sortedByVolume = [...openPositions]
                .filter(pos => !processingIds.has(pos.id))
                .sort((a, b) => a.amount - b.amount);

            for (const pos of sortedByVolume) {
                positionsToClose.push({ pos, reason: 'MARGIN_CALL' });
            }
        }

        if (positionsToClose.length === 0) return;

        // Sort: smallest volume first for margin call recovery
        positionsToClose.sort((a, b) => a.pos.amount - b.pos.amount);

        const processClosures = async () => {
            for (const { pos, reason } of positionsToClose) {
                setProcessingIds(prev => new Set(prev).add(pos.id));

                const toastMessages: Record<CloseReason, { title: string; description: string }> = {
                    MARGIN_CALL: { title: `Margin Call — ${pos.symbol}`, description: 'Available capital depleted. Closing position to restore margin.' },
                    STOP_LOSS:   { title: `Stop Loss triggered — ${pos.symbol}`, description: 'Price hit your stop loss. Closing position.' },
                    TAKE_PROFIT: { title: `Take Profit triggered — ${pos.symbol}`, description: 'Price hit your take profit. Closing position.' },
                };
                const { title, description } = toastMessages[reason];

                console.warn(`AUTO-CLOSE [${reason}] position ${pos.id} (Vol: ${pos.amount})`);
                toast.error(title, { description });

                try {
                    await closePosition(pos.id);
                    // After closing, re-fetch to update available capital
                    // If available is restored above 0, remaining positions survive
                    break; // Close one at a time, let metrics recalculate
                } catch (error) {
                    console.error(`Auto-close [${reason}] failed for:`, pos.id, error);
                } finally {
                    setProcessingIds(prev => {
                        const next = new Set(prev);
                        next.delete(pos.id);
                        return next;
                    });
                }
            }
        };

        processClosures();

    }, [tickersMap, openPositions, processingIds, available]);

    return null;
}
