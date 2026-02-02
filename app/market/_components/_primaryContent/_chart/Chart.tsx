"use client"
import { createChart, ColorType, IChartApi, ISeriesApi } from 'lightweight-charts';
import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getKlines } from "@/lib/binance";
import ChartsToolbar from "@/app/market/_components/_primaryContent/_chart/ChartsToolbar";
import {useMarketStore} from "@/lib/store";

interface CryptoData {
    symbols: string;
    changePercent:string;
}

export default function Chart() {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

    const [activeInterval, setActiveInterval] = useState('1h');
    const activeSymbol = useMarketStore((state) => state.activeSymbol);
    const { data, isLoading } = useQuery({
        queryKey: ['klines', activeSymbol, activeInterval],
        queryFn: () => getKlines(activeSymbol, activeInterval),
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
                vertLine: {
                    labelBackgroundColor: '#1e293b',
                },
                horzLine: {
                    labelBackgroundColor: '#1e293b',
                },
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
            },
        });

        const series = chart.addCandlestickSeries({
            upColor: '#22c55e',
            downColor: '#ef4444',
            borderVisible: false,
            wickUpColor: '#22c55e',
            wickDownColor: '#ef4444',
        });

        seriesRef.current = series;
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
        if (seriesRef.current && data) {
            seriesRef.current.setData(data);
        }
    }, [data]);

    useEffect(() => {
        if (!data || !seriesRef.current || !activeSymbol) return;

        const wsSymbol = activeSymbol.toLowerCase();
        const wsInterval = activeInterval;

        const url = `wss://stream.binance.com:9443/ws/${wsSymbol}@kline_${wsInterval}`;
        
        const ws = new WebSocket(url);

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);

            if (!message.k) return;

            const candle = message.k;

            const liveCandle = {
                time: candle.t / 1000,
                open: parseFloat(candle.o),
                high: parseFloat(candle.h),
                low: parseFloat(candle.l),
                close: parseFloat(candle.c),
            };

            if (seriesRef.current) {
                seriesRef.current.update(liveCandle);
            }
        };

        ws.onerror = (err) => {
            if (ws.readyState !== WebSocket.CLOSED) {
            }
        };

        return () => {
            ws.close();
        };

    }, [activeInterval, data]);

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