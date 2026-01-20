import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
    title: "Login",
    description: "Login page",
};

export default function Layout({children,}: Readonly<{ children: React.ReactNode }>) {
    return (
        <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gray-900/50">
            <div className="absolute inset-0 -z-10">
                <Image
                    src="/cryptobg.png"
                    alt="Crypto Background"
                    fill
                    priority
                    className="object-cover animate-pan"
                />
            </div>

            {children}

            <p className="mx-10 mt-5 text-center text-xs text-gray-400 relative z-10">
                CFDs and Options are complex instruments and come with a high risk of losing
                money rapidly due to leverage. 75% of retail investor accounts lose money
                when trading CFDs with this provider. You should consider whether you
                understand how CFDs and Options work and whether you can afford to take the
                high risk of losing your money.
            </p>
        </main>
    );
}