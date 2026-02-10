"use client"
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickData, UTCTimestamp } from 'lightweight-charts';
import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getKlines } from "@/lib/binance";
import ChartsToolbar from "@/app/market/_components/_primaryContent/_chart/ChartsToolbar";
import { useMarketStore } from "@/lib/store";
import { SPREAD_RATE } from "@/lib/trading-math";

export default function Chart() {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

    const [activeInterval, setActiveInterval] = useState('1h');
    const activeSymbol = useMarketStore((state) => state.activeSymbol);

    const { data, isLoading } = useQuery<CandlestickData[]>({
        queryKey: ['klines', activeSymbol, activeInterval],
        queryFn: async () => {
            const result = await getKlines(activeSymbol, activeInterval);
            return result as unknown as CandlestickData[];
        },
        staleTime: Infinity,
    });

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#94a3b8',
                fontSize: 11,
            },
            grid: {
                vertLines: { color: 'rgba(51, 65, 85, 0.3)' },
                horzLines: { color: 'rgba(51, 65, 85, 0.3)' },
            },
            crosshair: {
                mode: 0,
                vertLine: { labelBackgroundColor: '#1e293b' },
                horzLine: { labelBackgroundColor: '#1e293b' },
            },
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight,
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
                borderColor: 'rgba(148, 163, 184, 0.2)',
            },
            rightPriceScale: {
                borderColor: 'rgba(148, 163, 184, 0.2)',
                autoScale: true,
            },
        });

        seriesRef.current = chart.addCandlestickSeries({
            upColor: '#22c55e',
            downColor: '#ef4444',
            borderVisible: false,
            wickUpColor: '#22c55e',
            wickDownColor: '#ef4444',
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

    useEffect(() => {
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
                priceFormat: {
                    type: 'price',
                    precision: precision,
                    minMove: minMove,
                },
            });

            seriesRef.current.setData(data);

            chartRef.current?.timeScale().fitContent();
        }
    }, [data]);

    useEffect(() => {
        if (!data || !seriesRef.current || !activeSymbol) return;

        const wsSymbol = activeSymbol.toLowerCase();

        const url = `wss://stream.binance.com:9443/ws/${wsSymbol}@kline_${activeInterval}`;
        console.log("Connecting WS:", url);

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

            if (seriesRef.current) {
                seriesRef.current.update(liveCandle);
            }
        };

        ws.onerror = (err) => {
            if (ws.readyState !== WebSocket.CLOSED) {
                console.error("WS Error", err);
            }
        };

        return () => {
            ws.close();
        };

    }, [activeInterval, data, activeSymbol]);

    return (
        <div className="flex flex-col w-full h-full min-w-0 bg-card overflow-hidden">
            <ChartsToolbar
                activeInterval={activeInterval}
                setActiveInterval={setActiveInterval}
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