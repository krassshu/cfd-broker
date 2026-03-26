import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import Providers from "@/app/providers";
import ThemeToaster from "@/app/_components/ThemeToaster";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: {
        default: "CryptoBroker — Trade Crypto with Up to 50x Leverage",
        template: "%s | CryptoBroker",
    },
    description:
        "Trade 100+ cryptocurrency CFDs with up to 50x leverage. Real-time Binance prices, professional charts, and built-in risk management. Start free with a $10,000 demo account.",
    metadataBase: new URL("https://crypto-broker.app"),
    openGraph: {
        type: "website",
        siteName: "CryptoBroker",
        locale: "en_US",
    },
};

export default function RootLayout({children,}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}>
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={true}
        >
            <Providers>
                {children}
                <ThemeToaster />
            </Providers>
        </ThemeProvider>
        </body>
        </html>
    );
}