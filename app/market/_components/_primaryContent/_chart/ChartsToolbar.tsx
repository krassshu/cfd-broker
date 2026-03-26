"use client"
import { useMarketStore } from "@/lib/store";
import OrderPanel from "./_orderPanel/OrderPanel";
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';

type ChartType = 'Candle' | 'Line' | 'Area' | 'Bar';

interface Props {
    activeInterval: string;
    setActiveInterval: (val: string) => void;
    chartType: ChartType;
    setChartType: (val: ChartType) => void;
}

export default function ChartsToolbar({
    activeInterval,
    setActiveInterval,
    chartType,
    setChartType,
}: Props) {
    const { activeSymbol, priceChangePercent } = useMarketStore();

    const displaySymbol = activeSymbol.replace("USDT", "/USDT");
    const isPositive = priceChangePercent >= 0;
    const intervals = ['1m', '5m', '15m', '1h', '4h', '1d', '1w'];
    const chartTypes: ChartType[] = ['Candle', 'Line', 'Area', 'Bar'];

    return (
        <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-card/50 h-14 shrink-0">
            <div className="flex items-center gap-3">
                <div className="flex flex-col leading-tight min-w-[80px]">
                    <span className="text-sm font-bold text-foreground">{displaySymbol}</span>
                    <span className={`text-[10px] font-bold ${isPositive ? 'text-up' : 'text-down'}`}>
                        {isPositive ? '▲' : '▼'} {isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%
                    </span>
                </div>

                <div className="flex items-center gap-2 ml-4 border-l border-border/50 pl-3">
                    {/* Interval Dropdown */}
                    <Listbox value={activeInterval} onChange={setActiveInterval}>
                        <div className="relative">
                            <ListboxButton className="px-2 py-1.5 text-[11px] font-bold rounded bg-border/30 text-foreground hover:bg-border/50 transition-colors cursor-pointer min-w-[40px] text-center">
                                {activeInterval.toUpperCase()}
                            </ListboxButton>
                            <ListboxOptions className="absolute left-0 mt-1 w-20 bg-card border border-border/50 rounded shadow-lg z-50 max-h-60 overflow-auto">
                                {intervals.map((int) => (
                                    <ListboxOption
                                        key={int}
                                        value={int}
                                        className={({ selected }) =>
                                            `px-2 py-1.5 text-[11px] font-bold cursor-pointer transition-colors ${selected ? 'bg-primary/20 text-primary' : 'text-foreground hover:bg-border/50'}`
                                        }
                                    >
                                        {int.toUpperCase()}
                                    </ListboxOption>
                                ))}
                            </ListboxOptions>
                        </div>
                    </Listbox>

                    {/* Chart Type Dropdown */}
                    <Listbox value={chartType} onChange={setChartType}>
                        <div className="relative">
                            <ListboxButton className="px-2 py-1.5 text-[11px] font-bold rounded bg-border/30 text-foreground hover:bg-border/50 transition-colors cursor-pointer">
                                {chartType}
                            </ListboxButton>
                            <ListboxOptions className="absolute left-0 mt-1 w-32 bg-card border border-border/50 rounded shadow-lg z-50">
                                {chartTypes.map((type) => (
                                    <ListboxOption
                                        key={type}
                                        value={type}
                                        className={({ selected }) =>
                                            `px-2 py-1.5 text-[11px] font-bold cursor-pointer transition-colors ${selected ? 'bg-primary/20 text-primary' : 'text-foreground hover:bg-border/50'}`
                                        }
                                    >
                                        {type}
                                    </ListboxOption>
                                ))}
                            </ListboxOptions>
                        </div>
                    </Listbox>
                </div>
            </div>
            <OrderPanel />
        </div>
    );
}