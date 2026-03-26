"use client";

import { useState, memo } from "react";
import Image from "next/image";
import { BINANCE_ASSET_URL } from "@/lib/config";

interface CryptoIconProps {
    symbol: string;
    size?: number;
    className?: string;
}

const CryptoIcon = memo(({ symbol, size = 24, className = "" }: CryptoIconProps) => {
    const cleanSymbol = symbol.replace("USDT", "");
    const [failed, setFailed] = useState(false);

    if (failed) {
        return (
            <div
                className={`flex items-center justify-center rounded-full bg-muted/30 border border-border/50 text-[9px] font-bold text-muted select-none ${className}`}
                style={{ width: size, height: size }}
            >
                {cleanSymbol.slice(0, 3)}
            </div>
        );
    }

    return (
        <div
            className={`relative rounded-full overflow-hidden bg-muted/30 border border-border/50 shrink-0 ${className}`}
            style={{ width: size, height: size }}
        >
            <Image
                src={`${BINANCE_ASSET_URL}/${cleanSymbol}.png`}
                alt={cleanSymbol}
                fill
                sizes={`${size}px`}
                className="object-cover"
                onError={() => setFailed(true)}
            />
        </div>
    );
});

CryptoIcon.displayName = "CryptoIcon";
export default CryptoIcon;
