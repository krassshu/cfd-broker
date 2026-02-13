"use client";

import { useEffect, useRef } from "react";
import { useMarketStore } from "@/lib/store";
import { getTicker } from "@/lib/binance";

export default function MarketManager() {
    const setInitialMarketData = useMarketStore((state) => state.setInitialMarketData);
    const updateTickersBatch = useMarketStore((state) => state.updateTickersBatch);
    const updateActiveSymbolData = useMarketStore((state) => state.updateActiveSymbolData);
    const activeSymbol = useMarketStore((state) => state.activeSymbol);

    const listSocketRef = useRef<WebSocket | null>(null);
    const activeSocketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        const init = async () => {
            try {
                const data = await getTicker();
                setInitialMarketData(data);

                if (!listSocketRef.current) {
                    const ws = new WebSocket('wss://stream.binance.com/ws/!ticker@arr');
                    listSocketRef.current = ws;

                    ws.onmessage = (event) => {
                        const message = JSON.parse(event.data);
                        if (Array.isArray(message)) {
                            updateTickersBatch(message);
                        }
                    };
                }
            } catch (error) {
                console.error("Market Init Error:", error);
            }
        };

        init();

        return () => {
            if (listSocketRef.current) {
                listSocketRef.current.close();
                listSocketRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!activeSymbol) return;

        if (activeSocketRef.current) activeSocketRef.current.close();

        const symbolLower = activeSymbol.toLowerCase();
        const url = `wss://stream.binance.com/ws/${symbolLower}@ticker`;

        const ws = new WebSocket(url);
        activeSocketRef.current = ws;

        ws.onmessage = (event) => {
            const msg = JSON.parse(event.data);
            const price = parseFloat(msg.c);
            const change = parseFloat(msg.P);

            if (!isNaN(price)) {
                updateActiveSymbolData(price, change);
            }
        };

        return () => {
            if (activeSocketRef.current) {
                activeSocketRef.current.close();
                activeSocketRef.current = null;
            }
        };
    }, [activeSymbol]);

    return null;
}