"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authRegister } from "@/lib/api";

export default function SocialRegisterPage() {
  const router = useRouter();
  const email = sessionStorage.getItem("reg_email") || "";
  const regData = sessionStorage.getItem("reg_form_data");

  useEffect(() => {
    if (!email || !regData) router.push("/verify-email");
  }, [email, regData, router]);

  const [formData, setFormData] = useState({
    website: "",
    facebook: "",
    linkedin: "",
    instagram: "",
    tiktok: "",
    twitter: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regData) return;
    setError("");
    setLoading(true);
    try {
      const data = JSON.parse(regData);
      const { data: result } = await authRegister({
        ...data,
        email,
        ...Object.fromEntries(Object.entries(formData).filter(([, v]) => v)),
      });
      if (result.success && result.data) {
        localStorage.setItem("access_token", result.data.accessToken);
        localStorage.setItem("refresh_token", result.data.refreshToken);
        sessionStorage.removeItem("reg_email");
        sessionStorage.removeItem("reg_form_data");
        router.push("/profile");
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || "Registration failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!email || !regData) return null;

  return (
    <>
      <h2 className="mb-2 text-center font-heading text-2xl font-bold text-navy">
        Social Links
      </h2>
      <p className="mb-6 text-center text-sm text-amaken-gray">
        Add your social media profiles (all optional)
      </p>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {(["website", "facebook", "linkedin", "instagram", "tiktok", "twitter"] as const).map((platform) => (
          <div key={platform}>
            <label className="mb-1 block text-sm font-medium text-gray-700 capitalize">{platform}</label>
            <input
              type="url"
              value={formData[platform]}
              onChange={(e) => update(platform, e.target.value)}
              className="input-field"
              placeholder="https://"
            />
          </div>
        ))}
        <p className="text-xs text-red-500">All of these are optional fields</p>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      <div className="mt-4 text-center">
        <Link href="/register" className="text-sm text-amaken-gray hover:text-primary">
          Back to personal details
        </Link>
      </div>
    </>
  );
}
