"use client"
import Tabs from "@/app/_components/_tabs/Tabs";

export default function SymbolsList() {
    return (
        <div className="h-full flex-shrink-0 flex flex-col">
            <Tabs />
            <div className="w-80 h-[calc(100vh-140px)] bg-card border border-border rounded-sm rounded-tl-none shadow-xl overflow-hidden">
                <div className="p-3 border-b border-border/50">
                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold uppercase">
                        <span>Symbol</span>
                        <span>Price</span>
                        <span className="text-right">24h %</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="p-8 text-center text-slate-600 text-xs">
                        No assets found in this category
                    </div>
                </div>
            </div>
        </div>
    )
}