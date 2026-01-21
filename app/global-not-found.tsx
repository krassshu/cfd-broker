import Image from "next/image";
import './globals.css'
import { Inter } from 'next/font/google'
import type { Metadata } from 'next'
import Link from "next/link";

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: '404 - Page Not Found',
    description: 'The page you are looking for does not exist.',
}

export default function NotFound() {
    return (
        <html lang="en" className="h-full">
        <body className={`${inter.className} h-full bg-slate-950`}>

        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden text-white">
            <div className="absolute inset-0 -z-30">
                <Image
                    src="/Error404.png"
                    alt="Crypto 404 Background"
                    fill
                    priority
                    className="object-cover"
                />
            </div>
            <div className="absolute inset-0 -z-20 bg-slate-950/40 backdrop-blur-[2px]" />
            <div
                className="absolute inset-0 -z-10 pointer-events-none"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, rgba(59, 130, 246, 0.2) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(59, 130, 246, 0.2) 1px, transparent 1px)
                    `,
                    backgroundSize: '40px 40px',
                    maskImage: 'radial-gradient(ellipse at center, black, transparent 90%)'
                }}
            />

            <div className="z-10 flex flex-col items-center space-y-10 px-4 text-center">
                <div className="relative">
                    <h1 className="text-7xl font-extrabold tracking-tighter sm:text-9xl text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-200 to-cyan-300 select-none">
                        404
                    </h1>
                    <span className="absolute top-1 left-1 -z-10 text-7xl sm:text-9xl font-extrabold tracking-tighter text-blue-700/50 blur-sm select-none">
                        404
                    </span>
                </div>

                <div className="space-y-3 max-w-lg">
                    <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                        Oops! Transaction failed.
                    </h2>
                    <p className="text-slate-200 text-base sm:text-lg font-medium drop-shadow-md">
                        {"The block you are looking for seems to be invalid or missing from the chain. Let's get you back to the market."}
                    </p>
                </div>

                <Link href="/dashboard"
                      className="group relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-blue-600 px-8 py-4 font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] active:scale-95">
                  <span className="relative z-10 flex items-center gap-2">
                    Return to Market
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                         className="transition-transform group-hover:translate-x-1">
                        <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                    </svg>
                  </span>
                    <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-600 to-blue-500 transition-opacity duration-300 group-hover:opacity-90"/>
                </Link>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent -z-10" />
        </div>

        </body>
        </html>
    )
}