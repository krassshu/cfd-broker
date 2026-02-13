import Navbar from "@/app/market/_components/_navbar/Navbar";
import MarketManager from "@/app/_components/MarketManager";
import AccountManager from "@/app/_components/AccountManager";

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className="bg-background text-foreground flex flex-col h-screen overflow-hidden">
            <MarketManager />
            <AccountManager />
            <Navbar />
            <main className="flex-1 overflow-auto relative bg-background">
                {children}
            </main>
        </div>
    );
}