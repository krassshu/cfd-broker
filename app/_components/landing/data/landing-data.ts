import {
    Shield,
    TrendingUp,
    Zap,
    Headphones,
    Wallet,
    CreditCard,
    ArrowUpDown,
    BarChart3,
    Clock,
    Target,
} from "lucide-react";

export const WHY_CHOOSE = [
    {
        icon: Shield,
        title: "Safe and secure",
        description: "Row-level security, encrypted sessions, and isolated user data. Your account and trades are protected at every layer.",
    },
    {
        icon: TrendingUp,
        title: "Good investment",
        description: "Amplify your positions with up to 50x leverage on all crypto pairs. Control $5,000 worth of crypto with just $100 margin.",
    },
    {
        icon: Zap,
        title: "Instant execution",
        description: "Orders execute in milliseconds with real-time Binance price feeds. No requotes, no slippage on standard market conditions.",
    },
    {
        icon: Headphones,
        title: "Multi Currency Support",
        description: "Trade Bitcoin, Ethereum, Solana, and 100+ altcoins. All quoted against USDT with live market data around the clock.",
    },
];

export const STEPS = [
    {
        icon: Wallet,
        step: "01",
        title: "Create Wallet",
        description: "Sign up with your email in under a minute. Get a free $10,000 demo balance instantly.",
    },
    {
        icon: CreditCard,
        step: "02",
        title: "Make Payment",
        description: "Fund your practice account or start trading immediately with virtual money. Zero risk.",
    },
    {
        icon: ArrowUpDown,
        step: "03",
        title: "Buy and sell",
        description: "Open your first position on 100+ crypto pairs with real-time market data and 50x leverage.",
    },
];

export const FEATURES_GRID = [
    {
        icon: TrendingUp,
        title: "Free trial Account",
        description: "Start with $10,000 virtual balance. Learn the platform, test strategies, zero risk involved.",
    },
    {
        icon: BarChart3,
        title: "Guide by Experts",
        description: "Professional TradingView charts with multiple timeframes and candlestick pattern analysis.",
    },
    {
        icon: Target,
        title: "Affordable",
        description: "Zero commission trading. Only pay the spread — transparent pricing with no hidden fees.",
    },
    {
        icon: Clock,
        title: "24/7 Live Support",
        description: "Crypto never sleeps. Trade any time of day, any day of the week with always-on market access.",
    },
];

export const WORLD_STATS = [
    { value: "32K+", label: "Happy Users" },
    { value: "250+", label: "Markets" },
    { value: "87+", label: "Countries" },
];

export const SOCIAL_LINKS = [
    {label: "Twitter", path: "M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"},
    { label: "Facebook", path: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" },
    { label: "LinkedIn", path: "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" },
];

export const FOOTER_PRODUCTS = [
    { label: "Spot Trading", href: "#features" },
    { label: "Leverage", href: "#features" },
    { label: "CFD Wallet", href: "#features" },
    { label: "Converter", href: "#features" },
];

export const FOOTER_PAGES = [
    { label: "Register", href: "/register", internal: true },
    { label: "Log in", href: "/login", internal: true },
    { label: "FAQ", href: "#faq" },
    { label: "Market", href: "/market", internal: true },
];
