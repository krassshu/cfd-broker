import Image from "next/image";
import ThemeToggle from "@/app/_components/ThemeToggle";

/** Shared auth layout: crypto background, theme toggle, risk disclaimer */
export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background">
            <div className="absolute inset-0 -z-10">
                <Image
                    src="/cryptobg.png"
                    alt=""
                    fill
                    priority
                    className="object-cover animate-pan opacity-30 dark:opacity-30 opacity-10"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background/80" />
            </div>

            <div className="absolute top-5 right-6 z-20">
                <ThemeToggle variant="auth" />
            </div>

            <div className="relative z-10 w-full flex flex-col items-center px-6">
                {children}
            </div>

            <p className="relative z-10 mx-8 mt-8 max-w-xl text-center text-[11px] leading-relaxed text-muted/60">
                CFDs and Options are complex instruments and come with a high risk of losing
                money rapidly due to leverage. 75% of retail investor accounts lose money
                when trading CFDs with this provider. You should consider whether you
                understand how CFDs and Options work and whether you can afford to take the
                high risk of losing your money.
            </p>
        </main>
    );
}
