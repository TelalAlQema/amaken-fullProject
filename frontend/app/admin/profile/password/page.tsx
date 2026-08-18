"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { changeAdminPassword } from "@/lib/admin-api";
import { ArrowLeft, Eye, EyeOff, Save } from "lucide-react";

export default function AdminChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const checks = {
    length: newPassword.length >= 8,
    case: /[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword),
    number: /\d/.test(newPassword),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
  };
  const allChecks = Object.values(checks).every(Boolean);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  const mutation = useMutation({
    mutationFn: () => changeAdminPassword(currentPassword, newPassword),
    onSuccess: (res) => {
      if (res.data.success) {
        setSuccess("Password changed successfully");
        setError("");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    },
    onError: (err: Error) => {
      setError(err.message || "Password change failed");
      setSuccess("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    mutation.mutate();
  };

  return (
    <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-6">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.push("/admin/profile")} className="text-amaken-gray hover:text-navy transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="font-heading text-xl font-bold text-navy">Change Password</h2>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}
      {success && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-600">{success}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Current Password *</label>
          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 pr-10 text-sm text-navy outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
            />
            <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showCurrent ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">New Password *</label>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 pr-10 text-sm text-navy outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
              placeholder="Minimum 8 characters"
            />
            <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {newPassword && (
            <div className="mt-2 space-y-1 text-xs">
              <div className={checks.length ? "text-green-600" : "text-red-500"}>
                {checks.length ? "\u2713" : "\u2717"} Minimum 8 characters
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
          <label className="mb-1 block text-sm font-medium text-gray-700">Confirm New Password *</label>
          <input
            type={showNew ? "text" : "password"}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-navy outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
            disabled={!allChecks}
          />
          {confirmPassword && (
            <p className={`mt-1 text-xs ${passwordsMatch ? "text-green-600" : "text-red-500"}`}>
              {passwordsMatch ? "\u2713 Passwords match" : "\u2717 Passwords don't match"}
            </p>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={mutation.isPending || !allChecks || !passwordsMatch}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-600 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {mutation.isPending ? "Changing..." : "Change Password"}
          </button>
          <Link
            href="/admin/profile"
            className="rounded-lg border border-gray-200 px-6 py-2.5 text-sm font-medium text-navy hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
