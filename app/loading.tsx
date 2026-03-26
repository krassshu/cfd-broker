import { Globe, Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="w-full max-w-md space-y-6 rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl px-10 py-12 shadow-2xl">
            <div className="flex flex-col items-center gap-4">
                <Globe className="w-8 h-8 text-primary" />
                <span className="text-2xl font-bold tracking-tight text-foreground">
                    Crypto<span className="text-primary">Broker</span>
                </span>
            </div>
            <div className="flex justify-center py-6">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
        </div>
    );
}
