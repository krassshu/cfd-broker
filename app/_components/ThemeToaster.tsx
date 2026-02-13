"use client"

import { useTheme } from "next-themes";
import { Toaster } from "sonner";

export default function ThemeToaster() {
    const { theme } = useTheme();

    return (
        <Toaster
            theme={theme as 'light' | 'dark' | 'system'}
            position="bottom-right"
            richColors
        />
    );
}