import Navbar from "@/app/market/_components/_navbar/Navbar";
import MarketManager from "@/app/_components/MarketManager";
import AccountManager from "@/app/_components/AccountManager";
import DynamicTitle from "@/app/_components/DynamicTitle";
import ErrorBoundary from "@/app/_components/ErrorBoundary";
import MarketLoadingScreen from "@/app/market/_components/MarketLoadingScreen";

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className="bg-background text-foreground flex flex-col h-screen overflow-hidden relative">
            <div className="absolute inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,#80808018_1px,transparent_1px),linear-gradient(to_bottom,#80808018_1px,transparent_1px)] bg-size-[48px_48px]" />
            <MarketManager />
            <AccountManager />
            <DynamicTitle />
            <MarketLoadingScreen />
            <div className="flex flex-col flex-1 h-full relative z-10">
                <Navbar />
                <ErrorBoundary>
                    <main className="flex-1 overflow-auto relative">
                        {children}
                    </main>
                </ErrorBoundary>
            </div>
        </div>
    );
}