import { useState } from "react";

export type TabType = 'Main' | 'Fav' | "Hot";

interface TabConfig {
    id: TabType;
    label: string;
}

export default function Tabs() {
    const [activeTab, setActiveTab] = useState<TabType>('Fav');

    const tabs: TabConfig[] = [
        { id: 'Fav', label: 'Favorites' },
        { id: 'Main', label: 'Markets' },
        {id:'Hot', label:'Hot'}
    ];

    return (
        <div className="flex justify-start items-center gap-1">
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            px-4 py-2 text-[11px] font-bold uppercase tracking-widest transition-all relative z-10 cursor-pointer
                            ${isActive
                            ? 'bg-card border border-border border-b-card text-primary rounded-t-sm -mb-[1px]'
                            : 'text-slate-500 hover:text-slate-300 bg-transparent border border-transparent'
                        }
                        `}
                    >
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}