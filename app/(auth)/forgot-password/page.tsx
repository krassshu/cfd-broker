"use client";

import { useState } from "react";
import Link from "next/link";
import { Globe } from "lucide-react";
import { resetPasswordRequest } from "@/app/auth/actions";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const result = await resetPasswordRequest(formData);

        setLoading(false);

        if (result && !result.success) {
            setError(result.message);
        } else {
            setSent(true);
        }
    };

    if (sent) {
        return (
            <div className="w-full max-w-md space-y-6 rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl p-10 shadow-2xl text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-primary">Check your email</h1>
                <p className="text-muted text-sm">
                    We sent a password reset link to <span className="text-foreground font-medium">{email}</span>.
                    Click the link in the email to set a new password.
                </p>
                <p className="text-xs text-muted/50">
                    {"Didn't receive an email? Check your spam folder or try again."}
                </p>
                <Link
                    href="/login"
                    className="mt-4 inline-block text-primary hover:text-primary/80 font-medium transition-colors"
                >
                    Back to Login
                </Link>
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
                <p className="text-sm text-muted mt-2">Reset your password</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-6">
                    <div className="relative group">
                        <input
                            name="email"
                            type="email"
                            required
                            placeholder=" "
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`peer w-full border-b-2 bg-transparent p-3 pt-5 text-foreground outline-none transition-colors duration-300
                                ${error ? "border-b-red-400/50" : "border-b-border"}
                                focus:border-transparent`}
                        />
                        <label
                            className={`absolute left-3 top-4 text-sm transition-all duration-300 pointer-events-none
                                peer-focus:-top-2 peer-focus:left-0 peer-focus:text-xs
                                peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:left-0 peer-[:not(:placeholder-shown)]:text-xs
                                ${error
                                    ? "text-red-400"
                                    : "text-muted/70 peer-focus:text-primary peer-[:not(:placeholder-shown)]:text-muted"}`}
                        >
                            Email address
                        </label>
                        <div
                            className={`absolute bottom-0 left-0 h-[2px] w-full scale-x-0 transition-transform duration-500 origin-left peer-focus:scale-x-100
                                ${error ? "bg-red-400" : "bg-primary"}`}
                        />
                    </div>
                </div>

                {error && (
                    <p className="text-sm text-red-400 text-center font-medium animate-pulse">
                        {error}
                    </p>
                )}

                <p className="text-xs text-muted text-center -mt-2">
                    Enter the email associated with your account and we will send you a link to reset your password.
                </p>

                <button
                    type="submit"
                    disabled={loading || !email}
                    className="w-full rounded-lg bg-primary p-4 font-bold text-primary-foreground shadow-lg cursor-pointer hover:bg-primary/90 active:scale-[0.98] transition-all disabled:bg-muted/20 disabled:text-muted/50 disabled:cursor-not-allowed"
                >
                    {loading ? "Sending..." : "Send Reset Link"}
                </button>
            </form>

            <p className="text-center text-sm text-muted">
                Remember your password?{" "}
                <Link href="/login" className="text-primary font-semibold hover:text-primary/80 transition-colors">
                    Log in
                </Link>
            </p>
        </div>
    );
}
