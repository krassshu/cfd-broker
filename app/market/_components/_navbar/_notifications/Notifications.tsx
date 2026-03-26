"use client";

import { useRef, useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useMarketStore } from "@/lib/store";

function timeAgo(timestamp: number): string {
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

export default function Notifications() {
    const [isOpen, setIsOpen] = useState(false);
    const [, forceUpdate] = useState(0);

    const notifications = useMarketStore((s) => s.notifications);
    const markAllAsRead = useMarketStore((s) => s.markAllAsRead);
    const clearNotifications = useMarketStore((s) => s.clearNotifications);

    const dropdownRef = useRef<HTMLDivElement>(null);

    // Refresh relative timestamps every minute while open
    useEffect(() => {
        if (!isOpen) return;
        const interval = setInterval(() => forceUpdate(n => n + 1), 60_000);
        return () => clearInterval(interval);
    }, [isOpen]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 cursor-pointer
                    ${isOpen ? 'bg-muted/20 text-foreground' : 'text-muted-foreground hover:bg-muted/10 hover:text-foreground'}
                `}
            >
                <Bell className="w-5 h-5" />

                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-[15px] w-[15px] items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-background">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-lg border border-border/50 bg-card/95 backdrop-blur-sm shadow-xl z-50 overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-border/50 flex justify-between items-center bg-muted/10">
                        <h3 className="font-semibold text-sm text-foreground">Notifications</h3>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                >
                                    Mark all as read
                                </button>
                            )}
                            {notifications.length > 0 && (
                                <button
                                    onClick={clearNotifications}
                                    className="text-[11px] font-medium text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                                >
                                    Clear all
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-3">
                                <Bell className="w-8 h-8 opacity-20" />
                                <p>No notifications</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border/30">
                                {notifications.map(notif => (
                                    <div
                                        key={notif.id}
                                        className={`p-4 hover:bg-muted/10 transition-colors cursor-pointer flex flex-col gap-1.5 ${!notif.read ? 'border-l-2 border-l-primary' : 'opacity-60'}`}
                                    >
                                        <p className="text-sm text-foreground leading-snug">
                                            {notif.message}
                                        </p>
                                        <span className="text-[10px] text-muted-foreground font-mono">
                                            {timeAgo(notif.timestamp)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
