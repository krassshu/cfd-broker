"use client";

import { Star, TrendingUp, TrendingDown, List } from "lucide-react";

export type TabType = 'FAV' | 'ALL' | 'GAINERS' | 'LOSERS';

interface TabsProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
}

export default function Tabs({ activeTab, onTabChange }: TabsProps) {
    const tabs = [
        {
            id: 'FAV',
            icon: Star,
            label: 'Fav',
            activeClass: 'text-yellow-400'
        },
        {
            id: 'ALL',
            icon: List,
            label: 'All',
            activeClass: 'text-foreground'
        },
        {
            id: 'GAINERS',
            icon: TrendingUp,
            label: 'Gainers',
            activeClass: 'text-green-500'
        },
        {
            id: 'LOSERS',
            icon: TrendingDown,
            label: 'Losers',
            activeClass: 'text-red-500'
        },
    ];

    return (
        <div className="flex items-end w-full  pt-1 gap-1 border-b border-border/50 bg-background/50">
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;

                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id as TabType)}
                        title={tab.label}
                        className={`relative flex-1 flex items-center justify-center gap-2 h-8 px-2 text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer rounded-t-sm border-x border-t mb-[-1px] ${isActive ? `bg-card border-border border-b-card z-10 border-t-2 ${tab.activeClass}` : 'border-transparent text-muted hover:text-foreground hover:bg-muted/5 z-0'}`}
                    >
                        <Icon
                            size={14}
                            strokeWidth={2.5}
                            className={isActive && tab.id === 'FAV' ? "fill-current" : ""}
                        />
                        <span className="hidden lg:inline">{tab.label}</span>
                    </button>
                );
            })}
        </div>
    );
}