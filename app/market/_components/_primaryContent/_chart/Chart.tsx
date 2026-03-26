"use client"
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickData, UTCTimestamp } from 'lightweight-charts';
import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTheme } from 'next-themes';
import { getKlines } from "@/lib/binance";
import ChartsToolbar from "@/app/market/_components/_primaryContent/_chart/ChartsToolbar";
import { useMarketStore } from "@/lib/store";
import { SPREAD_RATE, BINANCE_WS_BASE } from "@/lib/config";

/** How many candles to show on initial load / symbol change */
const VISIBLE_BARS = 100;

const CHART_THEMES = {
    dark: {
        textColor: '#94a3b8',
        gridColor: 'rgba(51, 65, 85, 0.3)',
        crosshairLabelBg: '#1e293b',
        borderColor: 'rgba(148, 163, 184, 0.2)',
    },
    light: {
        textColor: '#475569',
        gridColor: 'rgba(148, 163, 184, 0.3)',
        crosshairLabelBg: '#f1f5f9',
        borderColor: 'rgba(100, 116, 139, 0.2)',
    },
};

type ChartType = 'Candle' | 'Line' | 'Area' | 'Bar';

export default function Chart() {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<any> | null>(null);

    const lastCandleRef = useRef<CandlestickData | null>(null);

    const [activeInterval, setActiveInterval] = useState('1h');
    const [chartType, setChartType] = useState<ChartType>('Candle');
    const { resolvedTheme } = useTheme();

    const { activeSymbol, currentPrice } = useMarketStore();

    const { data, isLoading } = useQuery<CandlestickData[]>({
        queryKey: ['klines', activeSymbol, activeInterval],
        queryFn: async () => {
            const rawData = await getKlines(activeSymbol, activeInterval);
            return rawData as unknown as CandlestickData[];
        },
        staleTime: Infinity,
    });

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const themeKey = resolvedTheme === 'light' ? 'light' : 'dark';
        const colors = CHART_THEMES[themeKey];

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: colors.textColor,
                fontSize: 11,
            },
            grid: {
                vertLines: { color: colors.gridColor },
                horzLines: { color: colors.gridColor },
            },
            crosshair: {
                mode: 0,
                vertLine: { labelBackgroundColor: colors.crosshairLabelBg },
                horzLine: { labelBackgroundColor: colors.crosshairLabelBg },
            },
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight,
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
                borderColor: colors.borderColor,
                shiftVisibleRangeOnNewBar: true,
            },
            rightPriceScale: {
                borderColor: colors.borderColor,
                autoScale: true,
            },
        });

        chartRef.current = chart;

        const resizeObserver = new ResizeObserver((entries) => {
            if (entries.length === 0) return;
            window.requestAnimationFrame(() => {
                if (chartRef.current) {
                    const { width, height } = entries[0].contentRect;
                    chartRef.current.resize(width, height);
                }
            });
        });

        resizeObserver.observe(chartContainerRef.current);

        return () => {
            resizeObserver.disconnect();
            chart.remove();
        };
    }, []);

    // Update chart colors when theme changes
    useEffect(() => {
        if (!chartRef.current) return;
        const themeKey = resolvedTheme === 'light' ? 'light' : 'dark';
        const colors = CHART_THEMES[themeKey];

        chartRef.current.applyOptions({
            layout: { textColor: colors.textColor },
            grid: {
                vertLines: { color: colors.gridColor },
                horzLines: { color: colors.gridColor },
            },
            crosshair: {
                vertLine: { labelBackgroundColor: colors.crosshairLabelBg },
                horzLine: { labelBackgroundColor: colors.crosshairLabelBg },
            },
            timeScale: { borderColor: colors.borderColor },
            rightPriceScale: { borderColor: colors.borderColor },
        });
    }, [resolvedTheme]);

    // Create or recreate main series based on chart type
    useEffect(() => {
        if (!chartRef.current) return;

        // Remove existing series safely (may already be removed by chart destroy or StrictMode)
        if (seriesRef.current) {
            try {
                chartRef.current.removeSeries(seriesRef.current);
            } catch {
                // Series already removed or chart was recreated — safe to ignore
            }
            seriesRef.current = null;
        }

        // Create new series based on type
        let newSeries: ISeriesApi<any> | null = null;

        switch (chartType) {
            case 'Candle':
                newSeries = chartRef.current.addCandlestickSeries({
                    upColor: '#22c55e',
                    downColor: '#ef4444',
                    borderVisible: false,
                    wickUpColor: '#22c55e',
                    wickDownColor: '#ef4444',
                });
                break;
            case 'Line':
                newSeries = chartRef.current.addLineSeries({
                    color: '#3b82f6',
                    lineWidth: 2,
                });
                break;
            case 'Area':
                newSeries = chartRef.current.addAreaSeries({
                    lineColor: '#3b82f6',
                    topColor: 'rgba(59, 130, 246, 0.2)',
                    bottomColor: 'rgba(59, 130, 246, 0)',
                    lineWidth: 2,
                });
                break;
            case 'Bar':
                newSeries = chartRef.current.addBarSeries({
                    upColor: '#22c55e',
                    downColor: '#ef4444',
                });
                break;
        }

        seriesRef.current = newSeries;

        // Re-apply precision if data exists
        if (seriesRef.current && data && data.length > 0) {
            const firstPrice = data[data.length - 1].close;
            let precision = 2;
            let minMove = 0.01;

            if (firstPrice < 1) {
                precision = 8;
                minMove = 0.00000001;
            } else if (firstPrice < 50) {
                precision = 4;
                minMove = 0.0001;
            }

            seriesRef.current.applyOptions({
                priceFormat: { type: 'price', precision, minMove },
            });

            // Set data in appropriate format
            if (chartType === 'Candle' || chartType === 'Bar') {
                seriesRef.current.setData(data);
            } else {
                // Line and Area only need close prices
                const lineData = data.map((candle) => ({
                    time: candle.time,
                    value: candle.close,
                }));
                seriesRef.current.setData(lineData);
            }

            // Reset last candle ref so stale data doesn't cause update errors
            lastCandleRef.current = null;

            // Show only the last VISIBLE_BARS candles (allows scrolling left for history)
            const totalBars = data.length;
            chartRef.current.timeScale().setVisibleLogicalRange({
                from: totalBars - VISIBLE_BARS,
                to: totalBars + 10, // small right margin for live candles
            });
        }
    }, [chartType, data]);

    useEffect(() => {
        if (!seriesRef.current || !activeSymbol) return;

        const wsSymbol = activeSymbol.toLowerCase();
        const url = `${BINANCE_WS_BASE}/ws/${wsSymbol}@kline_${activeInterval}`;

        const ws = new WebSocket(url);

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (!message.k) return;
            const candle = message.k;
            const multiplier = 1 - SPREAD_RATE;

            const liveCandle = {
                time: (candle.t / 1000) as UTCTimestamp,
                open: parseFloat(candle.o) * multiplier,
                high: parseFloat(candle.h) * multiplier,
                low: parseFloat(candle.l) * multiplier,
                close: parseFloat(candle.c) * multiplier,
            };

            lastCandleRef.current = liveCandle;

            if (seriesRef.current) {
                try {
                    if (chartType === 'Line' || chartType === 'Area') {
                        seriesRef.current.update({ time: liveCandle.time, value: liveCandle.close });
                    } else {
                        seriesRef.current.update(liveCandle);
                    }
                } catch {
                    // Series may have been recreated during interval switch — safe to ignore
                }
            }
        };

        return () => {
            ws.close();
        };
    }, [activeInterval, activeSymbol, chartType]);

    useEffect(() => {
        if (!seriesRef.current || !lastCandleRef.current || currentPrice === 0) return;

        const spreadPrice = currentPrice * (1 - SPREAD_RATE);
        const currentCandle = lastCandleRef.current;

        const updatedCandle = {
            ...currentCandle,
            close: spreadPrice,
            high: Math.max(currentCandle.high, spreadPrice),
            low: Math.min(currentCandle.low, spreadPrice),
        };

        lastCandleRef.current = updatedCandle;
        try {
            if (chartType === 'Line' || chartType === 'Area') {
                seriesRef.current.update({ time: updatedCandle.time, value: updatedCandle.close });
            } else {
                seriesRef.current.update(updatedCandle);
            }
        } catch {
            // Series may have been recreated — stale update, safe to ignore
        }

    }, [currentPrice, chartType]);

    return (
        <div className="flex flex-col w-full h-full min-w-0 bg-card overflow-hidden">
            <ChartsToolbar
                activeInterval={activeInterval}
                setActiveInterval={setActiveInterval}
                chartType={chartType}
                setChartType={setChartType}
            />
            <div className="relative flex-1 min-h-0">
                {isLoading && !data && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-card/50 backdrop-blur-sm">
                        <div className="text-primary text-sm animate-pulse">Loading market data...</div>
                    </div>
                )}
                <div ref={chartContainerRef} className="w-full h-full" />
            </div>
        </div>
    );
}