"use client";

import { useState } from "react";
import { ArrowLeft, Wallet, BarChart3, KeyRound } from "lucide-react";
import Link from "next/link";
import DemoBalanceTab from "./_components/DemoBalanceTab";
import AccountStatsTab from "./_components/AccountStatsTab";
import ChangePasswordTab from "./_components/ChangePasswordTab";

const TABS = [
    { id: "balance", label: "Demo Balance", icon: Wallet },
    { id: "stats", label: "Account Stats", icon: BarChart3 },
    { id: "security", label: "Security", icon: KeyRound },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<TabId>("balance");

    return (
        <div className="h-full overflow-y-auto">
            <div className="max-w-5xl mx-auto px-4 py-6">
                {/* Header — back left, tabs center */}
                <div className="flex items-center mb-8">
                    <Link
                        href="/market"
                        className="w-9 h-9 rounded-lg border border-landing-card-border bg-card-surface hover:bg-card-surface-hover flex items-center justify-center transition-all shrink-0"
                    >
                        <ArrowLeft className="w-4 h-4 text-foreground" />
                    </Link>

                    <div className="flex-1 flex justify-center">
                        <div className="flex gap-1 p-1 rounded-xl bg-card-surface border border-landing-card-border">
                            {TABS.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                                            isActive
                                                ? "bg-primary text-primary-foreground shadow-sm"
                                                : "text-muted hover:text-foreground hover:bg-card-surface-hover"
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Spacer to balance the back button */}
                    <div className="w-9 shrink-0" />
                </div>

                {/* Tab Content */}
                {activeTab === "balance" && (
                    <div className="max-w-lg mx-auto">
                        <DemoBalanceTab />
                    </div>
                )}
                {activeTab === "stats" && <AccountStatsTab />}
                {activeTab === "security" && (
                    <div className="max-w-lg mx-auto">
                        <ChangePasswordTab />
                    </div>
                )}
            </div>
        </div>
    );
}
