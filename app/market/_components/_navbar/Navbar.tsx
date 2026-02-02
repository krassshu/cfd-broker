import { SwitchTheme } from "@/app/_components/_switchTheme/SwitchTheme";
import UserDropDown from "@/app/market/_components/_navbar/_userDropDown/UserDropDown";

export default function Navbar() {
    return (
        <nav className="flex items-center justify-between bg-card px-6 h-16 border-b border-border shadow-sm transition-colors duration-300">
            <div className="flex items-center">
                <h1 className="text-xl font-bold tracking-tight text-foreground select-none">
                    Crypto<span className="text-primary">Broker</span>
                </h1>
            </div>
            <div className="flex items-center gap-6">
                <div className="text-right">
                    <span className="text-xs uppercase font-semibold text-muted tracking-wider block leading-none">
                        Account Equity
                    </span>
                    <p className="text-sm font-mono font-bold text-foreground">€1,200.50</p>
                </div>
                <SwitchTheme />
                <UserDropDown/>
            </div>
        </nav>
    );
}