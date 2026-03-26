"use client";

import Link from "next/link";
import { Globe } from "lucide-react";
import UserDropDown from "@/app/market/_components/_navbar/_userDropDown/UserDropDown";
import { useMarketStore } from "@/lib/store";
import Notifications from "@/app/market/_components/_navbar/_notifications/Notifications";
import ConnectionStatus from "@/app/market/_components/_navbar/ConnectionStatus";

export default function Navbar() {
    const equity = useMarketStore((state) => state.equity);

    return (
        <nav className="flex items-center justify-between bg-card px-3 md:px-6 h-14 md:h-16 border-b border-border shadow-sm transition-colors duration-300">
            <div className="flex items-center">
                <Link href="/" className="flex items-center gap-2 text-lg md:text-xl font-bold tracking-tight text-foreground select-none hover:opacity-80 transition-opacity">
                    <Globe className="w-5 h-5 text-primary" />
                    <span>Crypto<span className="text-primary">Broker</span></span>
                </Link>
            </div>
            <div className="flex items-center gap-2 md:gap-6">
                <Notifications/>
                <ConnectionStatus />
                <div className="text-right hidden sm:block">
                    <span className="text-xs uppercase font-semibold text-muted tracking-wider block leading-none">
                        Account Equity
                    </span>
                    <p className="text-sm font-mono font-bold text-foreground">
                        ${equity.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                </div>
                <UserDropDown/>
            </div>
        </nav>
    );
}
