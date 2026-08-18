"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authVerifyForgotOtp } from "@/lib/api";

export default function ForgotPasswordVerifyPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || sessionStorage.getItem("reset_email") || "";
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (timer <= 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = pasted.split("").concat(Array(6).fill("")).slice(0, 6);
    setOtp(newOtp);
    document.getElementById(`otp-${Math.min(pasted.length, 5)}`)?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const { data } = await authVerifyForgotOtp(email, code);
      if (data.success && data.data?.resetToken) {
        sessionStorage.setItem("reset_token", data.data.resetToken);
        sessionStorage.setItem("reset_email", email);
        router.push("/reset-password");
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || "Invalid or expired OTP";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = useCallback(async () => {
    setCanResend(false);
    setTimer(30);
    setError("");
    try {
      await (await import("@/lib/api")).authForgotPassword(email);
    } catch {
      setError("Failed to resend OTP");
    }
  }, [email]);

  if (!email) {
    return (
      <div className="text-center">
        <p className="mb-4 text-sm text-red-600">No email provided. Please start again.</p>
        <Link href="/forgot-password" className="text-primary hover:text-primary-600">
          Go to forgot password
        </Link>
      </div>
    );
  }

  return (
    <>
      <h2 className="mb-2 text-center font-heading text-2xl font-bold text-navy">
        Verify Reset Code
      </h2>
      <p className="mb-2 text-center text-sm text-amaken-gray">
        Enter the 6-digit code sent to <span className="font-medium text-navy">{email}</span>
      </p>
      <p className="mb-6 text-center text-xs text-amber-600">
        Check spam and junk folders
      </p>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center gap-2">
          {otp.map((digit, i) => (
            <input
              key={i}
              id={`otp-${i}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={i === 0 ? handlePaste : undefined}
              className="h-12 w-12 rounded-lg border border-gray-300 text-center text-lg font-semibold text-navy focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </form>

      <div className="mt-4 text-center text-sm text-amaken-gray">
        {canResend ? (
          <button
            onClick={handleResend}
            className="font-semibold text-primary hover:text-primary-600"
          >
            Resend OTP
          </button>
        ) : (
          <span>Resend OTP in <span className="font-medium text-navy">{timer}s</span></span>
        )}
      </div>
    </>
  );
}
