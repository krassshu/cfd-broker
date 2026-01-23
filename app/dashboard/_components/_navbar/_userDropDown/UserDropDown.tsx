import { ChevronDownIcon } from "lucide-react";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { Cog6ToothIcon } from "@heroicons/react/16/solid";
import Link from "next/link";

export default function UserDropDown() {
    return (
        <Popover className="relative">
            <PopoverButton className="flex items-center space-x-2 cursor-pointer outline-none group">
                <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                    JD
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
                    <Link href={"/dashboard/settings"} className="flex items-center w-full px-3 py-2 space-x-3 rounded-md cursor-pointer transition-colors hover:bg-muted/10 text-foreground">
                        <Cog6ToothIcon className="size-4 text-muted" />
                        <span className="text-sm font-medium">Settings</span>
                    </Link>

                    <div className="h-[1px] bg-border my-1" />

                    <button className="flex items-center w-full px-3 py-2 space-x-3 rounded-md cursor-pointer transition-colors hover:bg-red-500/10 text-red-500">
                        <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="text-sm font-medium">Logout</span>
                    </button>
                </div>
            </PopoverPanel>
        </Popover>
    );
}