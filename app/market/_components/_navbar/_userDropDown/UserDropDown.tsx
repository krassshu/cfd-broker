"use client";

import { useState, useEffect } from "react";
import { ChevronDownIcon, LogOut, Sun, Moon, UserCircle } from "lucide-react";
import { Popover, PopoverButton, PopoverPanel, CloseButton } from "@headlessui/react";
import { logout } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "next-themes";
import Link from "next/link";

export default function UserDropDown() {
    const [initials, setInitials] = useState("--");
    const { theme, setTheme } = useTheme();
    const isDark = theme === "dark";

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user } }: { data: { user: { email?: string } | null } }) => {
            if (user?.email) {
                // Take first letter of email local part, uppercase
                const local = user.email.split('@')[0] || '';
                // Try to extract two initials: split by dots/underscores/hyphens
                const parts = local.split(/[._-]/);
                if (parts.length >= 2) {
                    setInitials((parts[0][0] + parts[1][0]).toUpperCase());
                } else {
                    setInitials(local.slice(0, 2).toUpperCase());
                }
            }
        });
    }, []);

    return (
        <Popover className="relative">
            <PopoverButton className="flex items-center space-x-2 cursor-pointer outline-none group">
                <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm select-none">
                    {initials}
                </div>
                <ChevronDownIcon
                    aria-hidden="true"
                    className="size-4 text-muted group-hover:text-foreground transition-colors"
                />
            </PopoverButton>

            <PopoverPanel
                transition
                className="absolute right-0 z-50 mt-2 w-48 origin-top-right transition data-closed:scale-95 data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-150 data-leave:ease-in"
            >
                <div className="bg-card border border-border rounded-lg shadow-xl overflow-hidden p-1">
                    <CloseButton as={Link} href="/market/account"
                        className="flex items-center w-full px-3 py-2 space-x-3 rounded-md cursor-pointer transition-colors hover:bg-muted/10 text-foreground outline-none"
                    >
                        <UserCircle className="size-4"/>
                        <span className="text-sm font-medium">Account</span>
                    </CloseButton>
                    <button
                        onClick={() => setTheme(isDark ? "light" : "dark")}
                        className="flex items-center w-full px-3 py-2 space-x-3 rounded-md cursor-pointer transition-colors hover:bg-muted/10 text-foreground outline-none"
                    >
                        {isDark ? <Sun className="size-4"/> : <Moon className="size-4"/>}
                        <span className="text-sm font-medium">{isDark ? "Light mode" : "Dark mode"}</span>
                    </button>
                    <div className="border-t border-border my-1" />
                    <form action={logout}>
                        <button type="submit"
                                className="flex items-center w-full px-3 py-2 space-x-3 rounded-md cursor-pointer transition-colors hover:bg-red-500/10 text-red-500 outline-none">
                            <LogOut className="size-4"/>
                            <span className="text-sm font-medium">Logout</span>
                        </button>
                    </form>
                </div>
            </PopoverPanel>
        </Popover>
    );
}
