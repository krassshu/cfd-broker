import {useMarketStore} from "@/lib/store";

interface Props {
    activeInterval: string;
    setActiveInterval: (val: string) => void;
}

export default function ChartsToolbar({ activeInterval, setActiveInterval }: Props) {
    const {activeSymbol, priceChangePercent} = useMarketStore();
    const displaySymbol = activeSymbol.replace("USDT", "/USDT");
    const isPositive = priceChangePercent >= 0;

    const intervals = ['1m', '5m', '15m', '1h', '4h', '1d'];

    return (
        <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-card/50">
            <div className="flex items-center gap-4">
                <div className="flex flex-col leading-tight">
                    <span className="text-sm font-bold text-foreground">{displaySymbol}</span>
                    <span className={`text-[10px] font-bold ${isPositive ? 'text-up' : 'text-down'}`}>
                        {isPositive ? '▲' : '▼'} {isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%
                    </span>
                </div>

                <div className="flex items-center gap-1 ml-4 border-l border-border/50 pl-4">
                    {intervals.map((int) => (
                        <button
                            key={int}
                            onClick={() => setActiveInterval(int)}
                            className={`px-2 py-1 text-[10px] font-bold rounded transition-colors cursor-pointer ${
                                activeInterval === int
                                    ? 'bg-primary/20 text-primary'
                                    : 'text-muted hover:bg-border/50 hover:text-foreground'
                            }`}
                        >
                            {int.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}