"use client"
import { createChart, ColorType, IChartApi, ISeriesApi } from 'lightweight-charts';
import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import ChartsToolbar from "@/app/dashboard/_components/_primaryContent/_chart/ChartsToolbar";

const fetchKlines = async (interval: string) => {

    await new Promise(r => setTimeout(r, 500));

    const basePrice = interval === '1h' ? 97000 : 50000;
    return [
        { time: '2025-01-20', open: basePrice, high: basePrice + 2000, low: basePrice - 500, close: basePrice + 1000 },
        { time: '2025-01-21', open: basePrice + 1000, high: basePrice + 3000, low: basePrice, close: basePrice + 2500 },
        { time: '2025-01-22', open: basePrice + 2500, high: basePrice + 6000, low: basePrice + 2000, close: basePrice + 5000 },
    ];
};

export default function Chart() {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

    const [activeInterval, setActiveInterval] = useState('1h');

    const { data, isLoading } = useQuery({
        queryKey: ['klines', 'BTCUSDT', activeInterval],
        queryFn: () => fetchKlines(activeInterval),
        staleTime: 1000 * 30,
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
            width: chartContainerRef.current.clientWidth,
            height: chartContainerRef.current.clientHeight,
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
            }
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
                const { width, height } = entries[0].contentRect;
                if (width > 0 && height > 0) {
                    chart.resize(width, height);
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
            chartRef.current?.timeScale().fitContent();
        }
    }, [data]);

    return (
        <div className="flex flex-col w-full h-full min-w-0 bg-card overflow-hidden">
            <ChartsToolbar
                activeInterval={activeInterval}
                setActiveInterval={setActiveInterval}
            />
            <div className="relative flex-1 min-h-0">
                {isLoading && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-card/50 backdrop-blur-sm">
                        <div className="text-primary text-sm animate-pulse">Loading candles...</div>
                    </div>
                )}
                <div ref={chartContainerRef} className="w-full h-full" />
            </div>
        </div>
    );
}