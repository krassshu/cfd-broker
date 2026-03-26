"use client"

import { useState } from 'react';
import { signup } from '@/app/auth/actions';
import { FormInput } from './_components/FormInput';
import { PasswordStrength } from './_components/PasswordStrength';
import Link from "next/link";
import { Globe } from "lucide-react";

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [formError, setFormError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailFormatError = email.length > 0 && !emailRegex.test(email)
        ? 'Enter a valid email format (e.g., name@domain.com).'
        : '';

    const isMatch = password === confirmPassword && password !== "";
    const isReady = password.length >= 8 && isMatch && !emailFormatError && email.includes('@') && !isSubmitting;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!isReady) return;

        setFormError('');
        setIsSubmitting(true);

        try {
            const formData = new FormData(e.currentTarget);
            const result = await signup(formData);

            if (result && !result.success) {
                setFormError(result.message);
            } else {
                setIsSubmitted(true);
            }
        } catch {
            setFormError('An unexpected error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="w-full max-w-md space-y-6 rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl p-10 shadow-2xl text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-primary">Check your email</h1>
                <p className="text-muted text-sm">
                    We sent a confirmation link to <span className="text-foreground font-medium">{email}</span>.
                    Please click it to activate your account.
                </p>
                <Link href="/login" className="mt-4 inline-block text-primary hover:text-primary/80 font-medium transition-colors">
                    Back to Login
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md space-y-7 rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl px-10 py-8 shadow-2xl">
            <div className="text-center">
                <Link href="/" className="inline-flex items-center gap-2 text-3xl font-bold text-foreground hover:opacity-80 transition-opacity">
                    <Globe className="w-7 h-7 text-primary" />
                    <span>Crypto<span className="text-primary">Broker</span></span>
                </Link>
                <p className="text-sm text-muted mt-2">Demo account registration</p>
            </div>

            {formError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
                    {formError}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-6">
                    <FormInput
                        label="Email"
                        name="email" type="email" value={email}
                        onChange={setEmail} isError={!!emailFormatError} error={emailFormatError}
                    />

                    <FormInput
                        label="Password" name="password" type="password"
                        value={password} onChange={setPassword}
                    />

                    <div className="space-y-2">
                        <FormInput
                            label="Confirm Password" name="confirm" type="password"
                            value={confirmPassword} onChange={setConfirmPassword}
                            isError={confirmPassword !== "" && !isMatch}
                        />
                        <PasswordStrength password={password} />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={!isReady}
                    className="w-full rounded-lg bg-primary p-4 font-bold text-primary-foreground shadow-lg hover:bg-primary/90 disabled:bg-muted/20 disabled:text-muted/50 transition-all active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Creating Account...' : 'Create Account'}
                </button>
            </form>

            <p className="text-center text-sm text-muted">
                {"Already have an account? "}
                <Link href="/login" className="text-primary font-semibold hover:text-primary/80 transition-colors">
                    Login
                </Link>
            </p>
        </div>
    );
}
