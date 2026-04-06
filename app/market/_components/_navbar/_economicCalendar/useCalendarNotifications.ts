"use client";

import { useEffect, useRef } from "react";
import { getEconomicCalendar } from "@/app/actions/economic-calendar";
import { useMarketStore } from "@/lib/store";
import { startOfDay, endOfDay, fmtNum } from "./utils";

const POLL_INTERVAL_MS = 60_000;

export function useCalendarNotifications() {
    const calendarSubscriptions = useMarketStore((s) => s.calendarSubscriptions);
    const notifiedEventIds = useMarketStore((s) => s.notifiedEventIds);
    const addCalendarNotification = useMarketStore((s) => s.addCalendarNotification);
    const markEventNotified = useMarketStore((s) => s.markEventNotified);
    const cleanExpiredSubscriptions = useMarketStore((s) => s.cleanExpiredSubscriptions);

    // Clean up subscriptions from previous days on mount
    useEffect(() => {
        cleanExpiredSubscriptions();
    }, [cleanExpiredSubscriptions]);

    // Refs to always read latest values inside the interval callback
    const subsRef = useRef(calendarSubscriptions);
    const notifiedRef = useRef(notifiedEventIds);
    subsRef.current = calendarSubscriptions;
    notifiedRef.current = notifiedEventIds;

    useEffect(() => {
        if (calendarSubscriptions.length === 0) return;

        let active = true;

        async function check() {
            if (!active) return;
            const subs = subsRef.current;
            if (subs.length === 0) return;

            try {
                const now = new Date();
                const result = await getEconomicCalendar(
                    startOfDay(now).toISOString(),
                    endOfDay(now).toISOString(),
                );
                if (!result.success || !active) return;

                const nowMs = now.getTime();

                for (const event of result.data) {
                    const isPast = new Date(event.time).getTime() <= nowMs;
                    const isSubscribed = subs.includes(event.id);
                    const alreadyNotified = notifiedRef.current.includes(event.id);

                    if (isSubscribed && isPast && !alreadyNotified && event.actual !== null) {
                        const vs = event.estimate !== null
                            ? ` (vs forecast: ${fmtNum(event.estimate)})`
                            : "";
                        const msg = `${event.currency} ${event.event}: Actual ${fmtNum(event.actual)}${vs}`;
                        addCalendarNotification(msg, event.id);
                        markEventNotified(event.id);
                    }
                }
            } catch {
                // Will retry on next interval
            }
        }

        // Check immediately, then poll every minute
        check();
        const interval = setInterval(check, POLL_INTERVAL_MS);

        return () => {
            active = false;
            clearInterval(interval);
        };
    }, [calendarSubscriptions, addCalendarNotification, markEventNotified]);
}
