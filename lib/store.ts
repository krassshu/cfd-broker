import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { BinanceTicker } from './binance';
import { calculatePositionPnL, calculatePositionMargin } from './trading-math';
import { LEVERAGE, type TradeSide } from './config';

/** Safe parseFloat that returns fallback instead of NaN */
function safeParseFloat(value: string, fallback: number = 0): number {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? fallback : parsed;
}

export interface TradeNotification {
    id: string;
    message: string;
    timestamp: number;
    read: boolean;
}

export interface Position {
    id: string;
    symbol: string;
    side: TradeSide;
    amount: number;
    entry_price: number;
    liquidation_price: number;
    stop_loss?: number;
    take_profit?: number;
}

interface MarketState {
    tickersMap: Map<string, BinanceTicker>;
    isMarketLoading: boolean;
    activeSymbol: string;
    currentPrice: number;
    priceChangePercent: number;
    balance: number;
    equity: number;
    usedMargin: number;
    available: number;
    openPositions: Position[];
    favorites: Set<string>;
    positionsVersion: number;
    notifications: TradeNotification[];
    wsConnected: boolean;
    setWsConnected: (connected: boolean) => void;
    bumpPositionsVersion: () => void;
    addNotification: (message: string) => void;
    markAllAsRead: () => void;
    clearNotifications: () => void;
    setInitialMarketData: (data: BinanceTicker[]) => void;
    updateTickersBatch: (tickers: Array<{ s: string; c: string; P: string }>) => void;
    setActiveSymbol: (symbol: string) => void;
    updateActiveSymbolData: (price: number, change?: number) => void;
    setAccountData: (balance: number, positions: Position[]) => void;
    updateBalance: (balance: number) => void;
    calculateAccountMetrics: () => void;
    setFavorites: (favorites: Array<{ symbol: string }>) => void;
    addFavorite: (symbol: string) => void;
    removeFavorite: (symbol: string) => void;
}

export const useMarketStore = create<MarketState>()(persist((set) => ({
    tickersMap: new Map(),
    isMarketLoading: true,
    activeSymbol: 'BTCUSDT',
    currentPrice: 0,
    priceChangePercent: 0,

    balance: 0,
    equity: 0,
    usedMargin: 0,
    available: 0,
    openPositions: [],
    favorites: new Set(),
    positionsVersion: 0,
    notifications: [],
    wsConnected: false,

    setWsConnected: (connected) => set({ wsConnected: connected }),

    bumpPositionsVersion: () => set((state) => ({ positionsVersion: state.positionsVersion + 1 })),

    addNotification: (message) => set((state) => ({
        notifications: [
            { id: crypto.randomUUID(), message, timestamp: Date.now(), read: false },
            ...state.notifications
        ].slice(0, 50)
    })),

    markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true }))
    })),

    clearNotifications: () => set({ notifications: [] }),

    /** Populates tickersMap from initial API fetch and sets active symbol price */
    setInitialMarketData: (data) => {
        const map = new Map<string, BinanceTicker>();
        data.forEach(t => map.set(t.symbol, t));
        set((state) => {
            const activeTicker = map.get(state.activeSymbol);
            return {
                tickersMap: map,
                isMarketLoading: false,
                currentPrice: activeTicker ? safeParseFloat(activeTicker.lastPrice, state.currentPrice) : state.currentPrice,
                priceChangePercent: activeTicker ? safeParseFloat(activeTicker.priceChangePercent, state.priceChangePercent) : state.priceChangePercent
            };
        });
    },

    /** Applies batch WebSocket ticker updates to the map and refreshes active symbol price */
    updateTickersBatch: (tickerUpdates) => set((state) => {
        const newMap = new Map(state.tickersMap);
        let activeSymbolUpdate: { price: number; change: number } | null = null;

        for (const t of tickerUpdates) {
            const symbol = t.s;
            if (newMap.has(symbol)) {
                const prev = newMap.get(symbol)!;
                newMap.set(symbol, { ...prev, lastPrice: t.c, priceChangePercent: t.P || prev.priceChangePercent });
            }
            if (symbol === state.activeSymbol) {
                const price = safeParseFloat(t.c);
                const change = safeParseFloat(t.P);
                if (price > 0) {
                    activeSymbolUpdate = { price, change };
                }
            }
        }

        return {
            tickersMap: newMap,
            ...(activeSymbolUpdate ? { currentPrice: activeSymbolUpdate.price, priceChangePercent: activeSymbolUpdate.change } : {})
        };
    }),

    setActiveSymbol: (symbol) => set((state) => {
        const ticker = state.tickersMap.get(symbol);
        return {
            activeSymbol: symbol,
            currentPrice: ticker ? safeParseFloat(ticker.lastPrice) : 0,
            priceChangePercent: ticker ? safeParseFloat(ticker.priceChangePercent) : 0
        };
    }),

    updateActiveSymbolData: (price, change) => set((state) => ({
        currentPrice: price,
        priceChangePercent: change !== undefined ? change : state.priceChangePercent
    })),

    setAccountData: (balance, positions) => set({
        balance,
        openPositions: positions,
        equity: balance,
        usedMargin: 0,
        available: balance
    }),

    updateBalance: (balance) => set({ balance }),

    /** Recalculates equity, used margin, and available capital from live prices across all open positions */
    calculateAccountMetrics: () => set((state) => {
        let totalUnrealizedPnL = 0;
        let totalUsedMargin = 0;

        for (const pos of state.openPositions) {
            const ticker = state.tickersMap.get(pos.symbol);
            if (ticker) {
                const currentPrice = safeParseFloat(ticker.lastPrice);
                if (currentPrice > 0) {
                    totalUnrealizedPnL += calculatePositionPnL(pos.side, pos.entry_price, currentPrice, pos.amount);
                    // Used = half of required margin per position
                    totalUsedMargin += calculatePositionMargin(pos.entry_price, pos.amount, LEVERAGE) / 2;
                }
            }
        }

        const equity = state.balance + totalUnrealizedPnL;
        // Available = Balance - Used + Unrealized P/L = Equity - Used
        const available = equity - totalUsedMargin;

        return { equity, usedMargin: totalUsedMargin, available };
    }),

    setFavorites: (favs) => set({
        favorites: new Set(favs.map(f => f.symbol))
    }),

    addFavorite: (symbol) => set((state) => {
        const newSet = new Set(state.favorites);
        newSet.add(symbol);
        return { favorites: newSet };
    }),

    removeFavorite: (symbol) => set((state) => {
        const newSet = new Set(state.favorites);
        newSet.delete(symbol);
        return { favorites: newSet };
    })
}), {
    name: 'cfd-notifications',
    partialize: (state) => ({ notifications: state.notifications }),
}))
