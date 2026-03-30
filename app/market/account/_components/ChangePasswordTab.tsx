"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff, Loader2, Check } from "lucide-react";
import { PasswordStrength } from "@/app/(auth)/register/_components/PasswordStrength";
import { changePassword } from "@/app/actions/account/change-password";

export default function ChangePasswordTab() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string; success: boolean } | null>(null);

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const isMatch = newPassword === confirmPassword && newPassword !== "";
    const isDifferent = currentPassword !== newPassword || newPassword === "";
    const isReady =
        currentPassword.length > 0 &&
        newPassword.length >= 8 &&
        isMatch &&
        isDifferent &&
        !loading;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isReady) return;

        setLoading(true);
        setMessage(null);
        try {
            const result = await changePassword(currentPassword, newPassword, confirmPassword);
            setMessage({ text: result.message, success: result.success });
            if (result.success) {
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            }
        } catch {
            setMessage({ text: "Network error. Please try again.", success: false });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h2 className="text-base font-semibold text-foreground">Change Password</h2>
                    <p className="text-xs text-muted">Update your account password</p>
                </div>
            </div>

            {message && (
                <div className={`p-3 rounded-lg text-sm font-medium ${
                    message.success
                        ? "bg-up/10 text-up border border-up/20"
                        : "bg-down/10 text-down border border-down/20"
                }`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Current Password */}
                <PasswordField
                    label="Current Password"
                    value={currentPassword}
                    onChange={setCurrentPassword}
                    show={showCurrent}
                    onToggle={() => setShowCurrent(!showCurrent)}
                    placeholder="Enter current password"
                    disabled={loading}
                />

                <div className="border-t border-section-border" />

                {/* New Password */}
                <PasswordField
                    label="New Password"
                    value={newPassword}
                    onChange={setNewPassword}
                    show={showNew}
                    onToggle={() => setShowNew(!showNew)}
                    placeholder="Enter new password"
                    disabled={loading}
                    hint={
                        newPassword.length > 0 && currentPassword.length > 0 && currentPassword === newPassword
                            ? "New password must be different from the current one"
                            : undefined
                    }
                    hintType="error"
                />

                {/* Confirm New Password */}
                <PasswordField
                    label="Confirm New Password"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    show={showConfirm}
                    onToggle={() => setShowConfirm(!showConfirm)}
                    placeholder="Repeat new password"
                    disabled={loading}
                    hint={
                        confirmPassword.length > 0 && !isMatch
                            ? "Passwords do not match"
                            : confirmPassword.length > 0 && isMatch
                              ? "Passwords match"
                              : undefined
                    }
                    hintType={confirmPassword.length > 0 && isMatch ? "success" : "error"}
                />

                {/* Password Strength — same as register */}
                <PasswordStrength password={newPassword} />

                {/* Submit */}
                <button
                    type="submit"
                    disabled={!isReady}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Check className="w-4 h-4" />
                    )}
                    {loading ? "Updating..." : "Change Password"}
                </button>
            </form>
        </div>
    );
}

// Reusable password field

function PasswordField({
    label,
    value,
    onChange,
    show,
    onToggle,
    placeholder,
    disabled,
    hint,
    hintType = "error",
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    show: boolean;
    onToggle: () => void;
    placeholder: string;
    disabled: boolean;
    hint?: string;
    hintType?: "error" | "success";
}) {
    return (
        <div>
            <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                {label}
            </label>
            <div className="relative">
                <input
                    type={show ? "text" : "password"}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    disabled={disabled}
                    className="w-full px-4 py-3 pr-11 rounded-xl border border-landing-card-border bg-card-surface text-sm text-foreground placeholder:text-muted outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all disabled:opacity-50"
                />
                <button
                    type="button"
                    onClick={onToggle}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors cursor-pointer"
                >
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            </div>
            {hint && (
                <p className={`mt-1.5 text-xs font-medium ${hintType === "success" ? "text-up" : "text-down"}`}>
                    {hint}
                </p>
            )}
        </div>
    );
}
