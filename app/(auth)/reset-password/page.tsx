"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import { updatePassword, logout } from "@/app/auth/actions";
import { PasswordStrength } from "@/app/(auth)/register/_components/PasswordStrength";
import { createClient } from "@/lib/supabase/client";
import type { AuthChangeEvent } from "@supabase/supabase-js";

export default function ResetPasswordPage() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const [sessionReady, setSessionReady] = useState(false);

    const router = useRouter();

    useEffect(() => {
        const supabase = createClient();
        let redirectTimer: ReturnType<typeof setTimeout> | null = null;

        // Listen for auth state changes — handles both:
        //  • Implicit flow: Supabase client auto-parses hash fragment tokens
        //  • Callback flow: session already exists when page loads
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent) => {
            if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
                // Cancel the "no session" redirect if it was pending
                if (redirectTimer) clearTimeout(redirectTimer);
                setSessionReady(true);
                setVerifying(false);
            }
        });

        // Also check for existing session (e.g. arrived from /auth/callback which already exchanged the code)
        supabase.auth.getUser().then(({ data: { user } }: { data: { user: unknown } }) => {
            if (user) {
                if (redirectTimer) clearTimeout(redirectTimer);
                setSessionReady(true);
                setVerifying(false);
            } else {
                // Give Supabase client time to process hash fragment tokens (implicit flow)
                // before giving up and redirecting to login
                redirectTimer = setTimeout(() => {
                    if (!sessionReady) {
                        router.replace("/login?error=Invalid or expired reset link. Please request a new one.");
                    }
                }, 3000);
            }
        });

        return () => {
            subscription.unsubscribe();
            if (redirectTimer) clearTimeout(redirectTimer);
        };
    }, [router, sessionReady]);

    const isMatch = password === confirmPassword && password !== "";
    const isReady = password.length >= 8 && isMatch && sessionReady;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!isReady) return;

        setError("");
        setLoading(true);

        const formData = new FormData();
        formData.set("password", password);
        formData.set("confirm", confirmPassword);

        const result = await updatePassword(formData);

        setLoading(false);

        if (result && !result.success) {
            setError(result.message);
        }
    };

    if (verifying) {
        return (
            <div className="w-full max-w-md rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl px-10 py-12 shadow-2xl text-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-muted">Verifying reset link...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md space-y-7 rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl px-10 py-8 shadow-2xl">
            <div className="text-center">
                <Link href="/" className="inline-flex items-center gap-2 text-3xl font-bold tracking-tight text-foreground hover:opacity-80 transition-opacity">
                    <Globe className="w-7 h-7 text-primary" />
                    <span>Crypto<span className="text-primary">Broker</span></span>
                </Link>
                <p className="text-sm text-muted mt-2">Set a new password</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-6">
                    <div className="relative group">
                        <input
                            name="password"
                            type="password"
                            required
                            placeholder=" "
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="peer w-full border-b-2 border-b-border bg-transparent p-3 pt-5 text-foreground outline-none transition-colors duration-300 focus:border-transparent"
                        />
                        <label className="absolute left-3 top-4 text-sm text-muted/70 transition-all duration-300 pointer-events-none peer-focus:-top-2 peer-focus:left-0 peer-focus:text-xs peer-focus:text-primary peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-muted">
                            New password
                        </label>
                        <div className="absolute bottom-0 left-0 h-[2px] w-full scale-x-0 bg-primary transition-transform duration-500 origin-left peer-focus:scale-x-100" />
                    </div>

                    <div className="space-y-2">
                        <div className="relative group">
                            <input
                                name="confirm"
                                type="password"
                                required
                                placeholder=" "
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={`peer w-full border-b-2 bg-transparent p-3 pt-5 text-foreground outline-none transition-colors duration-300 focus:border-transparent
                                    ${confirmPassword && !isMatch ? "border-b-red-400/50" : "border-b-border"}`}
                            />
                            <label
                                className={`absolute left-3 top-4 text-sm transition-all duration-300 pointer-events-none
                                    peer-focus:-top-2 peer-focus:left-0 peer-focus:text-xs
                                    peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-0 peer-[:not(:placeholder-shown)]:text-xs
                                    ${confirmPassword && !isMatch
                                        ? "text-red-400 peer-[:not(:placeholder-shown)]:text-red-400"
                                        : "text-muted/70 peer-focus:text-primary peer-[:not(:placeholder-shown)]:text-muted"}`}
                            >
                                Confirm new password
                            </label>
                            <div
                                className={`absolute bottom-0 left-0 h-[2px] w-full scale-x-0 transition-transform duration-500 origin-left peer-focus:scale-x-100
                                    ${confirmPassword && !isMatch ? "bg-red-400" : "bg-primary"}`}
                            />
                        </div>

                        <PasswordStrength password={password} />
                    </div>
                </div>

                {error && (
                    <p className="text-sm text-red-400 text-center font-medium animate-pulse">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={!isReady || loading}
                    className="w-full rounded-lg bg-primary p-4 font-bold text-primary-foreground shadow-lg cursor-pointer hover:bg-primary/90 active:scale-[0.98] transition-all disabled:bg-muted/20 disabled:text-muted/50 disabled:cursor-not-allowed"
                >
                    {loading ? "Updating..." : "Update Password"}
                </button>
            </form>

            <p className="text-center text-sm text-muted">
                <button
                    type="button"
                    onClick={() => logout()}
                    className="text-primary font-semibold hover:text-primary/80 transition-colors cursor-pointer"
                >
                    Back to Login
                </button>
            </p>
        </div>
    );
}
