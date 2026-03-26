"use client";

import { useEffect } from "react";
import { useMarketStore } from "@/lib/store";

const BASE_TITLE = "CryptoBroker";

export default function DynamicTitle() {
    const openPositions = useMarketStore((state) => state.openPositions);
    const tickersMap = useMarketStore((state) => state.tickersMap);
    const balance = useMarketStore((state) => state.balance);
    const equity = useMarketStore((state) => state.equity);

    useEffect(() => {
        if (openPositions.length === 0) {
            document.title = BASE_TITLE;
            return;
        }

        const unrealizedPnL = equity - balance;
        const sign = unrealizedPnL >= 0 ? "+" : "";
        const formatted = `${sign}${unrealizedPnL.toFixed(2)}$`;

        document.title = `(${formatted}) ${BASE_TITLE}`;
    }, [openPositions, tickersMap, balance, equity]);

    // Restore title on unmount (e.g. navigating away from /market)
    useEffect(() => {
        return () => {
            document.title = BASE_TITLE;
        };
    }, []);

    return null;
}
