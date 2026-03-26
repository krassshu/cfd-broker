const store = new Map<string, number[]>();
const MAX_STORE_ENTRIES = 10_000;

// Clean up stale entries every 2 minutes to prevent memory leaks
const CLEANUP_INTERVAL_MS = 2 * 60 * 1000;
const RETENTION_MS = 5 * 60 * 1000;

const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, timestamps] of store.entries()) {
        const recent = timestamps.filter(t => now - t < RETENTION_MS);
        if (recent.length === 0) {
            store.delete(key);
        } else {
            store.set(key, recent);
        }
    }
}, CLEANUP_INTERVAL_MS);

// Don't prevent Node.js process from exiting (important for serverless/edge)
if (typeof cleanupTimer?.unref === 'function') {
    cleanupTimer.unref();
}

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now();

    // Evict oldest entries if store is too large
    if (store.size > MAX_STORE_ENTRIES) {
        const keysToDelete = Array.from(store.keys()).slice(0, Math.floor(MAX_STORE_ENTRIES * 0.1));
        keysToDelete.forEach(k => store.delete(k));
    }

    const timestamps = store.get(key) || [];
    const recent = timestamps.filter(t => now - t < windowMs);

    if (recent.length >= limit) {
        return false;
    }

    recent.push(now);
    store.set(key, recent);
    return true;
}
