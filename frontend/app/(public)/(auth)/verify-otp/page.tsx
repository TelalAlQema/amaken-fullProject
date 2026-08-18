"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authVerifyOtp } from "@/lib/api";

export default function VerifyOtpPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || sessionStorage.getItem("reg_email") || "";
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
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = pasted.split("").concat(Array(6).fill("")).slice(0, 6);
    setOtp(newOtp);
    const lastFilled = Math.min(pasted.length, 5);
    document.getElementById(`otp-${lastFilled}`)?.focus();
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
      const { data } = await authVerifyOtp(email, code);
      if (data.success) {
        sessionStorage.setItem("reg_email", email);
        router.push("/register");
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || "Invalid OTP code";
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
      await (await import("@/lib/api")).authVerifyEmail(email);
    } catch {
      setError("Failed to resend OTP");
    }
  }, [email]);

  if (!email) {
    return (
      <div className="text-center">
        <p className="mb-4 text-sm text-red-600">No email provided. Please start registration again.</p>
        <Link href="/verify-email" className="text-primary hover:text-primary-600">
          Go to registration
        </Link>
      </div>
    );
  }

  return (
    <>
      <h2 className="mb-2 text-center font-heading text-2xl font-bold text-navy">
        Verify Email
      </h2>
      <p className="mb-6 text-center text-sm text-amaken-gray">
        Enter the 6-digit code sent to <span className="font-medium text-navy">{email}</span>
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

      <div className="mt-4 text-center">
        <Link href="/verify-email" className="text-sm text-amaken-gray hover:text-primary">
          Change email address
        </Link>
      </div>
    </>
  );
}
