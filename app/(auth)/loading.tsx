import { Globe } from "lucide-react";

export default function Loading() {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background opacity-100 transition-opacity duration-500">

            {/* Standardowy tag style – w pełni bezpieczny dla Server Components */}
            <style>{`
                @keyframes custom-progress {
                    0% { width: 0%; transform: translateX(0); }
                    50% { width: 70%; }
                    100% { width: 100%; transform: translateX(0); }
                }
                .animate-custom-progress {
                    animation: custom-progress 2s ease-in-out infinite;
                }
                
                @keyframes dotPulse {
                    0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
                    40% { opacity: 1; transform: scale(1.2); }
                }
                .animate-dot-pulse-0 { animation: dotPulse 1.4s ease-in-out infinite; animation-delay: 0s; }
                .animate-dot-pulse-1 { animation: dotPulse 1.4s ease-in-out infinite; animation-delay: 0.2s; }
                .animate-dot-pulse-2 { animation: dotPulse 1.4s ease-in-out infinite; animation-delay: 0.4s; }
            `}</style>

            {/* Grid background */}
            <div
                className="absolute inset-0 opacity-[0.04]"
                style={{
                    backgroundImage:
                        "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
                    backgroundSize: "48px 48px",
                }}
            />

            {/* Radial glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />

            {/* Content */}
            <div className="relative flex flex-col items-center gap-8">

                {/* Animated globe */}
                <div className="relative">
                    {/* Orbit rings */}
                    <div className="absolute inset-0 -m-6">
                        <div className="w-[calc(100%+48px)] h-[calc(100%+48px)] rounded-full border border-primary/10 animate-[spin_8s_linear_infinite]">
                            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary/60" />
                        </div>
                    </div>
                    <div className="absolute inset-0 -m-12">
                        <div className="w-[calc(100%+96px)] h-[calc(100%+96px)] rounded-full border border-primary/5 animate-[spin_14s_linear_infinite_reverse]">
                            <div className="absolute -top-1 left-1/3 w-1.5 h-1.5 rounded-full bg-primary/30" />
                        </div>
                    </div>

                    {/* Pulse ring */}
                    <div className="absolute inset-0 -m-3 rounded-full border-2 border-primary/20 animate-ping" style={{ animationDuration: "2s" }} />

                    {/* Globe icon */}
                    <div className="relative w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <Globe className="w-8 h-8 text-primary animate-[pulse_2s_ease-in-out_infinite]" />
                    </div>
                </div>

                {/* Brand */}
                <div className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                    <span className="text-foreground">Crypto</span>
                    <span className="text-primary">Broker</span>
                </div>

                {/* Status line */}
                <div className="flex flex-col items-center gap-4">
                    {/* Progress bar */}
                    <div className="w-48 h-0.5 bg-border/30 rounded-full overflow-hidden">
                        <div className="h-full bg-primary/60 rounded-full animate-custom-progress" />
                    </div>
                </div>
            </div>
        </div>
    );
}