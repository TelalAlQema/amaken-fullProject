"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { adminLogin } from "@/lib/admin-api";

export default function AdminEmailPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const pinVerified = localStorage.getItem("admin_pin_verified");
    if (!pinVerified) {
      router.replace("/admin/login");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await adminLogin(email, password);
      if (data.success && data.data) {
        const { accessToken, refreshToken } = data.data;
        localStorage.setItem("admin_access_token", accessToken);
        localStorage.setItem("admin_refresh_token", refreshToken);
        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("refresh_token", refreshToken);
        localStorage.setItem("admin_pin_verified", "true");
        router.push("/admin");
      } else {
        setError(data.error?.message || "Invalid credentials. Please try again.");
      }
    } catch {
      setError("Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0d1432] p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl">
        <div className="flex flex-col items-center gap-4 mb-8">
          <Image
            src="/images/logo/amaken.png"
            alt="Amaken"
            width={80}
            height={80}
            className="rounded-xl"
            priority
          />
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#0d1432]">Admin Login</h1>
            <p className="mt-1 text-sm text-gray-500">
              Enter your credentials
            </p>
          </div>
        </div>

        <div className="mb-6">
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-1 text-sm text-[#17c788] hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to PIN Entry
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm text-[#0d1432] placeholder:text-gray-400 focus:border-[#17c788] focus:outline-none focus:ring-1 focus:ring-[#17c788]"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm text-[#0d1432] placeholder:text-gray-400 focus:border-[#17c788] focus:outline-none focus:ring-1 focus:ring-[#17c788]"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className="w-full rounded-lg bg-[#17c788] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#15b87c] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
