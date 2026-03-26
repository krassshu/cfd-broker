"use client";

import { useEffect, useRef, useCallback } from "react";
import { useMarketStore } from "@/lib/store";
import { getTicker } from "@/lib/binance";
import { BINANCE_WS_BASE } from "@/lib/config";

const MAX_RECONNECT_DELAY_MS = 30_000;
const INITIAL_RECONNECT_DELAY_MS = 1_000;

export default function MarketManager() {
    const setInitialMarketData = useMarketStore((state) => state.setInitialMarketData);
    const updateTickersBatch = useMarketStore((state) => state.updateTickersBatch);
    const updateActiveSymbolData = useMarketStore((state) => state.updateActiveSymbolData);
    const activeSymbol = useMarketStore((state) => state.activeSymbol);
    const setWsConnected = useMarketStore((state) => state.setWsConnected);

    const listSocketRef = useRef<WebSocket | null>(null);
    const listReconnectAttempt = useRef(0);
    const listReconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const createReconnectingWs = useCallback((
        url: string,
        onMessage: (data: unknown) => void,
        socketRef: React.MutableRefObject<WebSocket | null>,
        attemptRef: React.MutableRefObject<number>,
        timerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>,
        label: string
    ) => {
        let isCancelled = false;

        const connect = () => {
            if (isCancelled) return;

            const ws = new WebSocket(url);
            socketRef.current = ws;

            ws.onopen = () => {
                if (isCancelled) { ws.close(); return; }
                attemptRef.current = 0;
                if (label === 'MarketList') setWsConnected(true);
            };

            ws.onmessage = (event) => {
                if (isCancelled) return;
                try {
                    const data = JSON.parse(event.data);
                    onMessage(data);
                } catch (e) {
                    console.error(`${label} parse error:`, e);
                }
            };

            ws.onerror = (error) => {
                if (!isCancelled) {
                    console.error(`${label} WebSocket error:`, error);
                }
            };

            ws.onclose = () => {
                if (socketRef.current === ws) {
                    socketRef.current = null;
                }
                if (label === 'MarketList') setWsConnected(false);

                if (!isCancelled) {
                    const delay = Math.min(
                        INITIAL_RECONNECT_DELAY_MS * Math.pow(2, attemptRef.current),
                        MAX_RECONNECT_DELAY_MS
                    );
                    attemptRef.current++;
                    console.warn(`${label} disconnected. Reconnecting in ${delay}ms (attempt ${attemptRef.current})`);

                    timerRef.current = setTimeout(connect, delay);
                }
            };
        };

        connect();

        return () => {
            isCancelled = true;
            if (timerRef.current) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
            if (socketRef.current) {
                socketRef.current.close();
                socketRef.current = null;
            }
        };
    }, [setWsConnected]);

    useEffect(() => {
        let isMounted = true;
        let cleanupWs: (() => void) | null = null;

        const init = async () => {
            try {
                const data = await getTicker();
                if (isMounted) setInitialMarketData(data);

                cleanupWs = createReconnectingWs(
                    `${BINANCE_WS_BASE}/ws/!ticker@arr`,
                    (message) => {
                        if (Array.isArray(message)) {
                            updateTickersBatch(message);
                        }
                    },
                    listSocketRef,
                    listReconnectAttempt,
                    listReconnectTimer,
                    'MarketList'
                );
            } catch (error) {
                console.error("Market Init Error:", error);
            }
        };

        init();

        return () => {
            isMounted = false;
            if (cleanupWs) cleanupWs();
        };
    }, []);

    useEffect(() => {
        if (!activeSymbol) return;

        const symbolLower = activeSymbol.toLowerCase();
        const url = `${BINANCE_WS_BASE}/ws/${symbolLower}@ticker`;

        const socketRef = { current: null as WebSocket | null };
        const attemptRef = { current: 0 };
        const timerRef = { current: null as ReturnType<typeof setTimeout> | null };

        const cleanup = createReconnectingWs(
            url,
            (msg: unknown) => {
                const data = msg as { c?: string; P?: string };
                if (data.c) {
                    const price = parseFloat(data.c);
                    const change = data.P ? parseFloat(data.P) : undefined;
                    if (!isNaN(price)) {
                        updateActiveSymbolData(price, change);
                    }
                }
            },
            socketRef,
            attemptRef,
            timerRef,
            `ActiveSymbol(${activeSymbol})`
        );

        return cleanup;
    }, [activeSymbol, createReconnectingWs, updateActiveSymbolData]);

    return null;
}
