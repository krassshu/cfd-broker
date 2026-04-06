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
    type?: 'trade' | 'calendar';
    meta?: { eventId?: string };
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
    /** Monotonically increasing counter — bumped on every ticker batch update to guarantee
     *  downstream selectors (SymbolsList, PositionRow, etc.) always detect the change,
     *  even when Map reference equality is unreliable across frameworks/middlewares. */
    tickersVersion: number;
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
    calendarSubscriptions: string[];
    notifiedEventIds: string[];
    highlightEventId: string | null;
    calendarShouldOpen: boolean;
    // Persisted calendar filters
    calendarSelectedCurrencies: string[];
    calendarSelectedImpacts: string[];
    calendarCustomDateFrom: string | null;
    calendarCustomDateTo: string | null;
    setWsConnected: (connected: boolean) => void;
    bumpPositionsVersion: () => void;
    addNotification: (message: string) => void;
    addCalendarNotification: (message: string, eventId: string) => void;
    markAllAsRead: () => void;
    clearNotifications: () => void;
    addCalendarSubscription: (eventId: string) => void;
    removeCalendarSubscription: (eventId: string) => void;
    markEventNotified: (eventId: string) => void;
    openCalendarWithHighlight: (eventId: string) => void;
    clearCalendarHighlight: () => void;
    cleanExpiredSubscriptions: () => void;
    setCalendarSelectedCurrencies: (currencies: string[]) => void;
    setCalendarSelectedImpacts: (impacts: string[]) => void;
    setCalendarCustomDateRange: (from: string | null, to: string | null) => void;
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
    tickersVersion: 0,
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
    calendarSubscriptions: [],
    notifiedEventIds: [],
    highlightEventId: null,
    calendarShouldOpen: false,
    calendarSelectedCurrencies: [],
    calendarSelectedImpacts: ["high", "medium", "low"],
    calendarCustomDateFrom: null,
    calendarCustomDateTo: null,

    setWsConnected: (connected) => set({ wsConnected: connected }),

    bumpPositionsVersion: () => set((state) => ({ positionsVersion: state.positionsVersion + 1 })),

    addNotification: (message) => set((state) => ({
        notifications: [
            { id: crypto.randomUUID(), message, timestamp: Date.now(), read: false, type: 'trade' as const },
            ...state.notifications
        ].slice(0, 50)
    })),

    addCalendarNotification: (message, eventId) => set((state) => ({
        notifications: [
            { id: crypto.randomUUID(), message, timestamp: Date.now(), read: false, type: 'calendar' as const, meta: { eventId } },
            ...state.notifications
        ].slice(0, 50)
    })),

    markAllAsRead: () => set((state) => ({
        notifications: state.notifications.map(n => ({ ...n, read: true }))
    })),

    clearNotifications: () => set({ notifications: [] }),

    addCalendarSubscription: (eventId) => set((state) => ({
        calendarSubscriptions: state.calendarSubscriptions.includes(eventId)
            ? state.calendarSubscriptions
            : [...state.calendarSubscriptions, eventId]
    })),

    removeCalendarSubscription: (eventId) => set((state) => ({
        calendarSubscriptions: state.calendarSubscriptions.filter(id => id !== eventId)
    })),

    markEventNotified: (eventId) => set((state) => ({
        notifiedEventIds: state.notifiedEventIds.includes(eventId)
            ? state.notifiedEventIds
            : [...state.notifiedEventIds, eventId]
    })),

    openCalendarWithHighlight: (eventId) => set({
        highlightEventId: eventId,
        calendarShouldOpen: true,
    }),

    clearCalendarHighlight: () => set({
        highlightEventId: null,
        calendarShouldOpen: false,
    }),

    cleanExpiredSubscriptions: () => set((state) => {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const extractDate = (id: string): Date | null => {
            // IDs: jb_<ISO date>_<index> or ff_<ISO date>_<index>
            const parts = id.split('_');
            if (parts.length < 3) return null;
            const dateStr = parts.slice(1, -1).join('_');
            const d = new Date(dateStr);
            return isNaN(d.getTime()) ? null : d;
        };

        const validSubs = state.calendarSubscriptions.filter(id => {
            const date = extractDate(id);
            if (!date) return true; // keep if unparseable
            return date >= todayStart;
        });

        const validNotified = state.notifiedEventIds.filter(id => {
            const date = extractDate(id);
            if (!date) return false; // discard stale notified IDs
            return date >= todayStart;
        });

        return { calendarSubscriptions: validSubs, notifiedEventIds: validNotified };
    }),

    setCalendarSelectedCurrencies: (currencies) => set({ calendarSelectedCurrencies: currencies }),
    setCalendarSelectedImpacts: (impacts) => set({ calendarSelectedImpacts: impacts }),
    setCalendarCustomDateRange: (from, to) => set({ calendarCustomDateFrom: from, calendarCustomDateTo: to }),

    /** Populates tickersMap from initial API fetch and sets active symbol price */
    setInitialMarketData: (data) => {
        const map = new Map<string, BinanceTicker>();
        data.forEach(t => map.set(t.symbol, t));
        set((state) => {
            const activeTicker = map.get(state.activeSymbol);
            return {
                tickersMap: map,
                tickersVersion: state.tickersVersion + 1,
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
            tickersVersion: state.tickersVersion + 1,
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

    /** Updates active symbol price AND its tickersMap entry so all consumers
     *  (SymbolsList, PositionRow, calculateAccountMetrics) see live data. */
    updateActiveSymbolData: (price, change) => set((state) => {
        const priceStr = price.toString();
        const changeStr = change !== undefined ? change.toString() : undefined;
        const priceChangePercent = change !== undefined ? change : state.priceChangePercent;

        // Also update the active symbol inside tickersMap so derived data stays fresh
        const existingTicker = state.tickersMap.get(state.activeSymbol);
        let tickersMap = state.tickersMap;
        let tickersVersion = state.tickersVersion;

        if (existingTicker) {
            const updatedTicker = {
                ...existingTicker,
                lastPrice: priceStr,
                ...(changeStr !== undefined ? { priceChangePercent: changeStr } : {}),
            };
            const newMap = new Map(state.tickersMap);
            newMap.set(state.activeSymbol, updatedTicker);
            tickersMap = newMap;
            tickersVersion = state.tickersVersion + 1;
        }

        return { currentPrice: price, priceChangePercent, tickersMap, tickersVersion };
    }),

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
    partialize: (state) => ({
        notifications: state.notifications,
        calendarSubscriptions: state.calendarSubscriptions,
        notifiedEventIds: state.notifiedEventIds,
        calendarSelectedCurrencies: state.calendarSelectedCurrencies,
        calendarSelectedImpacts: state.calendarSelectedImpacts,
        calendarCustomDateFrom: state.calendarCustomDateFrom,
        calendarCustomDateTo: state.calendarCustomDateTo,
    }),
}))
