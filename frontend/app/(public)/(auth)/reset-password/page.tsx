"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authResetPassword } from "@/lib/api";

export default function ResetPasswordPage() {
  const router = useRouter();
  const email = sessionStorage.getItem("reset_email") || "";
  const resetToken = sessionStorage.getItem("reset_token") || "";

  useEffect(() => {
    if (!email || !resetToken) router.push("/forgot-password");
  }, [email, resetToken, router]);

  const [password, setPassword] = useState("");
  const [cpass, setCpass] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const checks = {
    length: password.length >= 8 && password.length <= 16,
    case: /[A-Z]/.test(password) && /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
  const allChecks = Object.values(checks).every(Boolean);
  const passwordsMatch = password === cpass && cpass.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const { data } = await authResetPassword(email, resetToken, password);
      if (data.success) {
        sessionStorage.removeItem("reset_email");
        sessionStorage.removeItem("reset_token");
        setSuccess("Password updated successfully! Redirecting to login...");
        setTimeout(() => router.push("/login"), 2000);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || "Failed to reset password";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!email || !resetToken) return null;

  return (
    <>
      <h2 className="mb-2 text-center font-heading text-2xl font-bold text-navy">
        Reset Password
      </h2>
      <p className="mb-6 text-center text-sm text-amaken-gray">
        Create a new password for <span className="font-medium text-navy">{email}</span>
      </p>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-600">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">New Password *</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field pr-10"
              placeholder="8-16 characters"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {showPassword ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                ) : (
                  <>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </>
                )}
              </svg>
            </button>
          </div>
          {password && (
            <div className="mt-2 space-y-1 text-xs">
              <div className={checks.length ? "text-green-600" : "text-red-500"}>
                {checks.length ? "\u2713" : "\u2717"} 8-16 characters
              </div>
              <div className={checks.case ? "text-green-600" : "text-red-500"}>
                {checks.case ? "\u2713" : "\u2717"} Uppercase and lowercase
              </div>
              <div className={checks.number ? "text-green-600" : "text-red-500"}>
                {checks.number ? "\u2713" : "\u2717"} At least 1 number
              </div>
              <div className={checks.special ? "text-green-600" : "text-red-500"}>
                {checks.special ? "\u2713" : "\u2717"} At least 1 special character
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Confirm Password *</label>
          <input
            type={showPassword ? "text" : "password"}
            required
            value={cpass}
            onChange={(e) => setCpass(e.target.value)}
            className="input-field"
            disabled={!allChecks}
          />
          {cpass && (
            <p className={`mt-1 text-xs ${passwordsMatch ? "text-green-600" : "text-red-500"}`}>
              {passwordsMatch ? "\u2713 Passwords match" : "\u2717 Passwords don't match"}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !allChecks || !passwordsMatch}
          className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link href="/login" className="text-sm text-amaken-gray hover:text-primary">
          Back to login
        </Link>
      </div>
    </>
  );
}
