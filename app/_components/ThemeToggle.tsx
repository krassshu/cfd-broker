"use client";

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

interface ThemeToggleProps {
    variant?: "default" | "auth" | "navbar";
}

const VARIANTS = {
    default: {
        button: "relative flex items-center justify-center w-10 h-10 rounded-md transition-all duration-300 hover:bg-muted/10 cursor-pointer border border-border",
        iconSize: "h-5 w-5",
        darkColor: "text-white",
        lightColor: "text-slate-900",
        placeholder: "w-10 h-10",
    },
    auth: {
        button: "flex items-center justify-center w-9 h-9 rounded-lg border border-border/50 bg-card/40 backdrop-blur-sm hover:bg-card/60 transition-colors cursor-pointer",
        iconSize: "h-4 w-4",
        darkColor: "text-foreground",
        lightColor: "text-foreground",
        placeholder: "w-9 h-9",
    },
    navbar: {
        button: "flex items-center justify-center w-9 h-9 rounded-lg hover:bg-primary/20 transition-colors cursor-pointer",
        iconSize: "h-4 w-4",
        darkColor: "text-primary",
        lightColor: "text-foreground",
        placeholder: "w-9 h-9",
    },
} as const;

export default function ThemeToggle({ variant = "default" }: ThemeToggleProps) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    const styles = VARIANTS[variant];

    if (!mounted) return <div className={styles.placeholder} />;

    const isDark = theme === "dark";

    return (
        <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={styles.button}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
            {isDark ? (
                <Sun className={`${styles.iconSize} ${styles.darkColor} transition-all`} />
            ) : (
                <Moon className={`${styles.iconSize} ${styles.lightColor} transition-all`} />
            )}
        </button>
    );
}
