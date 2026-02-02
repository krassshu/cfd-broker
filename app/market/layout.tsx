import Navbar from "@/app/market/_components/_navbar/Navbar";

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className="bg-background text-foreground flex flex-col h-screen overflow-hidden">
            <Navbar />
            <main className="flex-1 overflow-auto relative bg-background">
                {children}
            </main>
        </div>
    );
}