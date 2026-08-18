"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";
import Image from "next/image";
import { adminVerifyPin } from "@/lib/admin-api";

export default function AdminPinPage() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!pin || pin.length < 4 || pin.length > 6) {
      setError("PIN must be 4-6 digits");
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await adminVerifyPin(pin);
      if (data.success) {
        localStorage.setItem("admin_pin_verified", "true");
        router.push("/admin/login/email");
      } else {
        setError(data.error?.message || "Invalid PIN. Please try again.");
      }
    } catch {
      setError("Invalid PIN. Please try again.");
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
            <h1 className="text-2xl font-bold text-[#0d1432]">Admin Panel</h1>
            <p className="mt-1 text-sm text-gray-500">
              Enter your PIN to continue
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="pin"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              PIN
            </label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                id="pin"
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter PIN"
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm text-[#0d1432] placeholder:text-gray-400 focus:border-[#17c788] focus:outline-none focus:ring-1 focus:ring-[#17c788]"
                autoFocus
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
            disabled={isLoading || !pin}
            className="w-full rounded-lg bg-[#17c788] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#15b87c] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Verifying...
              </span>
            ) : (
              "Verify PIN"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
