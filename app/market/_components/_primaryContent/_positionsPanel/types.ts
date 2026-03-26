import {BinanceTicker} from "@/lib/binance";

// Represents a single trading position as stored in the database.
export interface Order {
    id: string;
    user_id: string;
    symbol: string;
    side: 'BUY' | 'SELL';
    amount: number;
    status: 'OPEN' | 'CLOSED' | 'LIQUIDATED';
    entry_price: number;
    exit_price?: number;
    leverage: number;
    margin: number;
    liquidation_price?: number;
    pnl?: number;
    stop_loss?: number;
    take_profit?: number;
    created_at: string;
    closed_at?: string;
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
    tickersData?: BinanceTicker[];
    onClose: (id: string, symbol: string) => void;
    onEdit: (id: string) => void;
}
