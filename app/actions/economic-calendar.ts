'use server'

import { fetchEconomicCalendar, type EconomicEvent } from '@/lib/economic-calendar';

/** Server action: get economic calendar events for a date range */
export async function getEconomicCalendar(
    fromISO: string,
    toISO: string,
): Promise<{ success: boolean; data: EconomicEvent[]; message?: string }> {
    try {
        const from = new Date(fromISO);
        const to = new Date(toISO);

        if (isNaN(from.getTime()) || isNaN(to.getTime())) {
            return { success: false, data: [], message: 'Invalid date range' };
        }

        const events = await fetchEconomicCalendar(from, to);
        return { success: true, data: events };
    } catch (err) {
        console.error('getEconomicCalendar error:', err);
        return { success: false, data: [], message: 'Failed to fetch economic calendar' };
    }
}
