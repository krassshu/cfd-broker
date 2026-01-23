"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function SwitchTheme() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="w-10 h-10" />
    }

    const isDark = theme === "dark";

    return (
        <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="relative flex items-center justify-center w-10 h-10 rounded-md transition-all duration-300 hover:bg-muted/10  border border-border cursor-pointer"
            aria-label="Toggle Theme"
        >
            {isDark ? (
                <Sun className="h-5 w-5 text-white transition-all scale-100" />
            ) : (
                <Moon className="h-5 w-5 text-slate-900 transition-all scale-100" />
            )}
        </button>
    );
}