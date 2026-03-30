import Image from "next/image";
import ThemeToggle from "@/app/_components/ThemeToggle";

export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <main className="relative flex min-h-screen flex-col items-center justify-between py-6 overflow-hidden ">
            <div className="absolute inset-0 -z-10">
                <Image
                    src="/cryptobg.png"
                    alt=""
                    fill
                    priority
                    className="object-cover animate-pan opacity-15 dark:opacity-30 mix-blend-luminosity"
                />
                <div className="absolute inset-0 bg-linear-to-b from-background/90 via-background/50 to-background/95" />
                <div className="absolute inset-0 opacity-[0.06] text-foreground pointer-events-none"
                    style={{
                        backgroundImage: "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
                        backgroundSize: "48px 48px",
                    }}
                />
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px]" />
                <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]" />
            </div>

            <div className="absolute top-6 right-6 z-20">
                <ThemeToggle variant="auth" />
            </div>

            <div className="flex-1 flex flex-col items-center justify-center w-full relative z-10 px-6 mt-12 mb-8">
                {children}
            </div>

            <div className="relative z-10 w-full max-w-4xl px-6 mb-4">
                <div className="rounded-xl border border-border/30 bg-background/30 backdrop-blur-md p-5 shadow-sm">
                    <p className="text-center text-[11px] leading-relaxed text-muted-foreground/80">
                        <strong className="font-semibold text-foreground/80">Risk Warning:</strong> CFDs and Options are complex instruments and come with a high risk of losing
                        money rapidly due to leverage. 75% of retail investor accounts lose money
                        when trading CFDs with this provider. You should consider whether you
                        understand how CFDs and Options work and whether you can afford to take the
                        high risk of losing your money.
                    </p>
                </div>
            </div>

        </main>
    );
}