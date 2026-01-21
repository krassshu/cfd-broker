"use client"

import { useState, useEffect } from 'react';
import { signup, isEmailUnique } from '../auth/actions';
import { FormInput } from './_components/FormInput';
import { PasswordStrength } from './_components/PasswordStrength';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [emailError, setEmailError] = useState('');
    const [isCheckingEmail, setIsCheckingEmail] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        const validateAndCheckEmail = async () => {
            if (email.length === 0) {
                setEmailError('');
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailRegex.test(email)) {
                setEmailError('Enter a valid email format (e.g., name@domain.com).');
                return;
            }

            setIsCheckingEmail(true);
            try {
                const unique = await isEmailUnique(email);
                setEmailError(unique ? '' : 'This email address is already in use.');
            } catch (err) {
                console.error("Email verification error:", err);
            } finally {
                setIsCheckingEmail(false);
            }
        };

        const timer = setTimeout(validateAndCheckEmail, 500);
        return () => clearTimeout(timer);
    }, [email]);

    const isMatch = password === confirmPassword && password !== "";
    const isReady = password.length >= 8 && isMatch && !emailError && email.includes('@');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!isReady) return;

        const formData = new FormData(e.currentTarget);
        const result = await signup(formData);

        if (result?.error) {
            setEmailError(result.error);
        } else {
            setIsSubmitted(true);
        }
    };

    if (isSubmitted) {
        return (
            <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-10 shadow-xl border border-slate-200 text-center">
                <div className="text-5xl mb-4">📧</div>
                <h1 className="text-2xl font-bold text-blue-500">Check your email</h1>
                <p className="text-gray-600 mt-2">
                    We sent a confirmation link to <strong>{email}</strong>.
                    Please click it to activate your account.
                </p>
                <a href={"/login"} className="mt-6 text-blue-500 hover:underline font-medium">
                    Back to Login
                </a>
            </div>
        );
    }

    return (
        <div
            className="w-full max-w-md space-y-8 rounded-2xl bg-white px-10 py-7 shadow-xl border border-slate-200 text-black">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-blue-500">CryptoBroker</h1>
                <p className="text-sm text-gray-500 mt-2">Demo account registration</p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-10">
                <div className="space-y-8">
                    <FormInput
                        label={`Email ${isCheckingEmail ? '...' : ''}`}
                        name="email" type="email" value={email}
                        onChange={setEmail} isError={!!emailError} error={emailError}
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
                        <PasswordStrength password={password}/>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={!isReady}
                    className="w-full rounded-lg bg-blue-600 p-4 font-bold text-white shadow-lg hover:bg-blue-700 disabled:bg-gray-300 transition-all active:scale-95 cursor-pointer"
                >
                    Create Account
                </button>
            </form>

            <p className="text-center text-sm text-slate-500">
                {"Do you have an account?"} <a href="/login"
                    className="text-blue-500 font-semibold hover:underline">Login</a>
            </p>
        </div>
    );
}