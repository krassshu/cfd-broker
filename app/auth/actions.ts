'use server'

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from 'next/headers';
import { rateLimit } from "@/lib/rate-limit";
import { RATE_LIMIT_LOGIN, RATE_LIMIT_SIGNUP, RATE_LIMIT_RESET } from "@/lib/config";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email: string): string | null {
    if (!email || email.trim().length === 0) return 'Email is required';
    if (!EMAIL_REGEX.test(email)) return 'Invalid email format';
    if (email.length > 254) return 'Email is too long';
    return null;
}

export async function login(formData: FormData) {
    const email = (formData.get('email') as string)?.trim();
    const password = formData.get('password') as string;

    const emailErr = validateEmail(email);
    if (emailErr) return redirect('/login?error=' + encodeURIComponent(emailErr));
    if (!password || password.length === 0) return redirect('/login?error=' + encodeURIComponent('Password is required'));

    if (!rateLimit(`login:${email.toLowerCase()}`, RATE_LIMIT_LOGIN.max, RATE_LIMIT_LOGIN.windowMs)) {
        return redirect('/login?error=' + encodeURIComponent('Too many login attempts. Please wait.'));
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        return redirect('/login?error=' + encodeURIComponent('Invalid email or password'));
    }

    revalidatePath('/', 'layout');
    redirect('/market');
}

export async function signup(formData: FormData) {
    const email = (formData.get('email') as string)?.trim();
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirm') as string;

    const emailErr = validateEmail(email);
    if (emailErr) return { success: false, message: emailErr };
    if (!password || password.length < 8) return { success: false, message: 'Password must be at least 8 characters' };
    if (password !== confirmPassword) return { success: false, message: 'Passwords do not match' };

    if (!rateLimit(`signup:${email.toLowerCase()}`, RATE_LIMIT_SIGNUP.max, RATE_LIMIT_SIGNUP.windowMs)) {
        return { success: false, message: 'Too many registration attempts. Please wait.' };
    }

    const supabase = await createClient();
    const headerList = await headers();
    const origin = headerList.get('origin');

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${origin}/auth/callback`,
        },
    });

    if (error) {
        if (error.message.toLowerCase().includes('already registered')) {
            return { success: true, message: 'Check your email for a confirmation link' };
        }
        return { success: false, message: 'Registration failed. Please try again.' };
    }

    return { success: true, message: 'Check your email for a confirmation link' };
}

export async function logout() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath('/', 'layout');
    redirect('/login');
}

export async function resetPasswordRequest(formData: FormData) {
    const email = (formData.get('email') as string)?.trim();

    const emailErr = validateEmail(email);
    if (emailErr) return { success: false, message: emailErr };

    if (!rateLimit(`reset:${email.toLowerCase()}`, RATE_LIMIT_RESET.max, RATE_LIMIT_RESET.windowMs)) {
        return { success: false, message: 'Too many reset requests. Please wait.' };
    }

    const supabase = await createClient();
    const headerList = await headers();
    const origin = headerList.get('origin');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/reset-password`,
        // NOTE: Supabase redirects here with ?code=... which the client stores
        // and only exchanges when the user submits the new password form.
    });

    if (error) {
        console.error('Password reset error:', error.message);
    }

    // Always return success to prevent email enumeration
    return { success: true, message: 'If an account exists, a reset link has been sent' };
}

export async function updatePassword(formData: FormData) {
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirm') as string;

    if (!password || password.length < 8) {
        return { success: false, message: 'Password must be at least 8 characters' };
    }
    if (password !== confirmPassword) {
        return { success: false, message: 'Passwords do not match' };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
        console.error('Password update error:', error.message);
        return { success: false, message: 'Failed to update password. Please try again.' };
    }

    await supabase.auth.signOut();

    revalidatePath('/', 'layout');
    redirect('/login?message=Password updated successfully');
}
