"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authVerifyEmail } from "@/lib/api";

export default function VerifyEmailPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const { data } = await authVerifyEmail(email);
      if (data.success) {
        sessionStorage.setItem("reg_email", email);
        setSuccess("OTP has been sent to your email");
        setTimeout(() => {
          router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
        }, 1000);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || "Failed to send OTP";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="mb-2 text-center font-heading text-2xl font-bold text-navy">
        Create Account
      </h2>
      <p className="mb-6 text-center text-sm text-amaken-gray">
        Enter your email to receive a verification code
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
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input-field"
            placeholder="Enter your email"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Sending OTP..." : "Send OTP"}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-3 text-gray-400">or</span>
        </div>
      </div>

      <p className="text-center text-sm text-amaken-gray">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary hover:text-primary-600">
          Login
        </Link>
      </p>
    </>
  );
}
