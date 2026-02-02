import { create } from 'zustand'

interface MarketState {
    activeSymbol: string;
    currentPrice: number;
    priceChangePercent: number;
    setActiveMarket: (symbol: string, price: number, change: number) => void;
}

export const useMarketStore = create<MarketState>((set) => ({
    activeSymbol: 'BTCUSDT',
    currentPrice: 0,
    priceChangePercent: 0,
    setActiveMarket: (symbol, price, change) => set({
        activeSymbol: symbol,
        currentPrice: price,
        priceChangePercent: change
    }),
}))