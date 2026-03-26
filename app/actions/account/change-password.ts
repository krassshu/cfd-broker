'use server'

import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";

const PASSWORD_MIN_LENGTH = 8;
const RATE_LIMIT = { max: 5, windowMs: 60_000 };

export async function changePassword(
    currentPassword: string,
    newPassword: string,
    confirmPassword: string,
): Promise<{ success: boolean; message: string }> {
    // ── Validation ───────────────────────────────────────
    if (!currentPassword) {
        return { success: false, message: 'Current password is required.' };
    }
    if (!newPassword || newPassword.length < PASSWORD_MIN_LENGTH) {
        return { success: false, message: `New password must be at least ${PASSWORD_MIN_LENGTH} characters.` };
    }
    if (newPassword !== confirmPassword) {
        return { success: false, message: 'New passwords do not match.' };
    }
    if (currentPassword === newPassword) {
        return { success: false, message: 'New password must be different from the current one.' };
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return { success: false, message: 'Unauthorized.' };

    // ── Rate limit ───────────────────────────────────────
    if (!rateLimit(`change-pwd:${user.id}`, RATE_LIMIT.max, RATE_LIMIT.windowMs)) {
        return { success: false, message: 'Too many attempts. Please wait a moment.' };
    }

    // ── Verify current password by re-authenticating ─────
    const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
    });

    if (signInError) {
        return { success: false, message: 'Current password is incorrect.' };
    }

    // ── Update to new password ───────────────────────────
    const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
    });

    if (updateError) {
        console.error('Password update error:', updateError.message);
        return { success: false, message: 'Failed to update password. Please try again.' };
    }

    return { success: true, message: 'Password changed successfully.' };
}
