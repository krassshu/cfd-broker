// ─── Trading ───────────────────────────────────────────
export const SPREAD_RATE = 0.0003;
export const LEVERAGE = 50;
export const MIN_TRADE_AMOUNT = 0.001;
export const MAX_TRADE_AMOUNT = 1_000_000;
export type TradeSide = 'BUY' | 'SELL';

// ─── Demo Account ──────────────────────────────────────
export const DEMO_FUND_OPTIONS = [1_000, 5_000, 10_000, 50_000] as const;
export const MAX_DEMO_BALANCE = 100_000;

// ─── Binance API ───────────────────────────────────────
export const BINANCE_REST_BASE = 'https://api.binance.com/api/v3';
export const BINANCE_TICKER_URL = `${BINANCE_REST_BASE}/ticker/24hr`;
export const BINANCE_KLINES_URL = `${BINANCE_REST_BASE}/klines`;
export const BINANCE_WS_BASE = 'wss://stream.binance.com';
export const BINANCE_ASSET_URL = 'https://bin.bnbstatic.com/static/assets/logos';

// ─── Rate Limits (requests / window_ms) ────────────────
export const RATE_LIMIT_TRADE = { max: 10, windowMs: 60_000 } as const;
export const RATE_LIMIT_CLOSE = { max: 20, windowMs: 60_000 } as const;
export const RATE_LIMIT_DEMO_FUNDS = { max: 5, windowMs: 60_000 } as const;
export const RATE_LIMIT_LOGIN = { max: 5, windowMs: 60_000 } as const;
export const RATE_LIMIT_SIGNUP = { max: 3, windowMs: 60_000 } as const;
export const RATE_LIMIT_RESET = { max: 3, windowMs: 60_000 } as const;

// ─── UI / Timing ───────────────────────────────────────
export const NAVBAR_HEIGHT_PX = 64;
export const TICKER_STALE_TIME_MS = 60 * 1000;
export const AUTH_TIMEOUT_MS = 5000;
export const METRICS_DEBOUNCE_MS = 100;
