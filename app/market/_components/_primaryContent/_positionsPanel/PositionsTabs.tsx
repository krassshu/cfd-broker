"use client";

import {PositionsTabsProps} from "@/app/market/_components/_primaryContent/_positionsPanel/types";

export function PositionsTabs({ activeTab, setActiveTab, orders }: PositionsTabsProps) {
    const openCount = orders.filter(o => o.status === 'OPEN').length;

    return (
        <div className="flex items-center border-b border-border/50 px-4 shrink-0">
            <button
                onClick={() => setActiveTab('OPEN')}
                className={`px-4 py-3 text-xs font-bold border-b-2 transition-colors ${
                    activeTab === 'OPEN' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-foreground cursor-pointer'
                }`}
            >
                OPEN POSITIONS ({openCount})
            </button>
            <button
                onClick={() => setActiveTab('HISTORY')}
                className={`px-4 py-3 text-xs font-bold border-b-2 transition-colors ${
                    activeTab === 'HISTORY' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-foreground cursor-pointer'
                }`}
            >
                HISTORY
            </button>
        </div>
    );
}