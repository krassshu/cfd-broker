import { create } from 'zustand'
import { BinanceTicker } from './binance';

const LEVERAGE = 50;

export interface Position {
    id: string;
    symbol: string;
    side: 'BUY' | 'SELL';
    amount: number;
    open_price: number;
    liquidation_price:number;
}

export interface Favorite {
    id: string;
    symbol: string;
}

interface MarketState {
    tickersMap: Map<string, BinanceTicker>;
    isMarketLoading: boolean;
    activeSymbol: string;
    currentPrice: number;
    priceChangePercent: number;
    balance: number;
    equity: number;
    freeMargin: number;
    openPositions: Position[]
    favorites: Set<string>;
    setInitialMarketData: (data: BinanceTicker[]) => void;
    updateTickersBatch: (tickers: any[]) => void;
    setActiveSymbol: (symbol: string) => void;
    updateActiveSymbolData: (price: number, change?: number) => void;
    setAccountData: (balance: number, positions: Position[]) => void;
    updateBalance: (balance: number) => void;
    calculateAccountMetrics: () => void;
    setFavorites: (favorites: Favorite[]) => void;
    addFavorite: (symbol: string) => void;
    removeFavorite: (symbol: string) => void;
}

export const useMarketStore = create<MarketState>((set) => ({
    tickersMap: new Map(),
    isMarketLoading: true,
    activeSymbol: 'BTCUSDT',
    currentPrice: 0,
    priceChangePercent: 0,

    balance: 0,
    equity: 0,
    freeMargin: 0,
    openPositions: [],
    favorites: new Set(),

    setInitialMarketData: (data) => {
        const map = new Map();
        data.forEach(t => map.set(t.symbol, t));
        set((state) => {
            const activeTicker = map.get(state.activeSymbol);
            return {
                tickersMap: map,
                isMarketLoading: false,
                currentPrice: activeTicker ? parseFloat(activeTicker.lastPrice) : state.currentPrice,
                priceChangePercent: activeTicker ? parseFloat(activeTicker.priceChangePercent) : state.priceChangePercent
            };
        });
    },

    updateTickersBatch: (tickerUpdates) => set((state) => {
        const newMap = new Map(state.tickersMap);
        let activeSymbolUpdate = null;

        for (const t of tickerUpdates) {
            const symbol = t.s;
            if (newMap.has(symbol)) {
                const prev = newMap.get(symbol)!;
                newMap.set(symbol, { ...prev, lastPrice: t.c, priceChangePercent: t.P || prev.priceChangePercent });
            }
            if (symbol === state.activeSymbol) {
                activeSymbolUpdate = { price: parseFloat(t.c), change: parseFloat(t.P) };
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
            currentPrice: ticker ? parseFloat(ticker.lastPrice) : 0,
            priceChangePercent: ticker ? parseFloat(ticker.priceChangePercent) : 0
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
        freeMargin: balance
    }),

    updateBalance: (balance) => set({ balance }),

    calculateAccountMetrics: () => set((state) => {
        let totalUnrealizedPnL = 0;
        let usedMargin = 0;

        state.openPositions.forEach(pos => {
            const ticker = state.tickersMap.get(pos.symbol);
            if (ticker) {
                const currentPrice = parseFloat(ticker.lastPrice);

                let pnl = 0;
                if (pos.side === 'BUY') {
                    pnl = (currentPrice - pos.open_price) * pos.amount;
                } else {
                    pnl = (pos.open_price - currentPrice) * pos.amount;
                }
                totalUnrealizedPnL += pnl;

                usedMargin += (pos.open_price * pos.amount) / LEVERAGE;
            }
        });

        const equity = state.balance + totalUnrealizedPnL;

        const freeMargin = Math.max(0, equity - usedMargin);

        return { equity, freeMargin };
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
}))