import {BinanceTicker} from "@/lib/binance";

export interface Order {
    id: string;
    symbol: string;
    side: 'BUY' | 'SELL';
    amount: number;
    open_price: number;
    close_price?: number;
    pnl?: number;
    status: 'OPEN' | 'CLOSED';
    created_at: string;
    closed_at?: string;
    stop_loss?: number;
    take_profit?: number;
}

export interface PositionsTabsProps {
    activeTab: 'OPEN' | 'HISTORY';
    setActiveTab: (tab: 'OPEN' | 'HISTORY') => void;
    orders: Order[];
}

export interface PositionsTableProps {
    orders: Order[];
    activeTab: 'OPEN' | 'HISTORY';
    tickersData: BinanceTicker[] | undefined;
    onClose: (id: string, symbol: string) => void;
    onEdit: (id: string) => void;
}

export interface PositionRowProps {
    order: Order;
    activeTab: 'OPEN' | 'HISTORY';
    tickersData: BinanceTicker[] | undefined;
    onClose: (id: string, symbol: string) => void;
    onEdit: (id: string) => void;
}