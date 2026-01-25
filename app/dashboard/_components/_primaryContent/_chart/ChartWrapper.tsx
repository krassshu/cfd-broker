"use client"
import dynamic from 'next/dynamic';

const Chart = dynamic(() => import('./Chart'), {
    ssr: false,
    loading: () => <div className="w-full h-[400px] bg-card animate-pulse rounded-sm" />
});

export default Chart;