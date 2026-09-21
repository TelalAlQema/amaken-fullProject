"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/components/providers/AdminAuthProvider";
import {
  useGetAdminProfileQuery,
  useUpdateAdminProfileMutation,
} from "@/lib/redux/adminApi";
import type { Admin } from "@amaken/shared";
import { Save, ArrowLeft } from "lucide-react";

export default function AdminEditProfilePage() {
  const { setAdmin } = useAdminAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    aname: "",
    alname: "",
    aphone: "",
    agency: "",
    astate: "",
    acity: "",
    agender: "Male",
    adateofbirth: "",
    aAddress: "",
    awphone: "",
    website: "",
    afb: "",
    ainstagram: "",
    atwitter: "",
    atiktok: "",
    alinkedin: "",
  });

  const { data: response, isLoading } = useGetAdminProfileQuery();
  const data = response?.data ?? null;

  useEffect(() => {
    if (data) {
      setFormData({
        aname: data.aname || "",
        alname: data.alname || "",
        aphone: data.aphone || "",
        agency: data.agency || "",
        astate: data.astate || "",
        acity: data.acity || "",
        agender: data.agender || "Male",
        adateofbirth: data.adateofbirth || "",
        aAddress: data.aAddress || "",
        awphone: data.awphone || "",
        website: data.website || "",
        afb: data.afb || "",
        ainstagram: data.ainstagram || "",
        atwitter: data.atwitter || "",
        atiktok: data.atiktok || "",
        alinkedin: data.alinkedin || "",
      });
    }
  }, [data]);

  const [mutation, mutationState] = useUpdateAdminProfileMutation();

  const update = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    mutation(formData)
      .unwrap()
      .then((res) => {
        if (res.success && res.data) {
          setAdmin(res.data as Admin);
          setSuccess("Profile updated successfully");
          setError("");
        }
      })
      .catch((err) => {
        const msg =
          err?.data?.error?.message || err?.message || "Update failed";
        setError(msg);
        setSuccess("");
      });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-6">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.push("/admin/profile")} className="text-amaken-gray hover:text-navy transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="font-heading text-xl font-bold text-navy">Edit Profile</h2>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}
      {success && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-600">{success}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">First Name</label>
            <input type="text" required maxLength={50} value={formData.aname} onChange={(e) => update("aname", e.target.value)} className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-navy outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Last Name</label>
            <input type="text" required maxLength={50} value={formData.alname} onChange={(e) => update("alname", e.target.value)} className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-navy outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
            <input type="text" maxLength={20} value={formData.aphone} onChange={(e) => update("aphone", e.target.value)} className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-navy outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">WhatsApp</label>
            <input type="text" maxLength={20} value={formData.awphone} onChange={(e) => update("awphone", e.target.value)} className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-navy outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Gender</label>
            <select value={formData.agender} onChange={(e) => update("agender", e.target.value)} className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-navy outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors">
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Date of Birth</label>
            <input type="date" value={formData.adateofbirth} onChange={(e) => update("adateofbirth", e.target.value)} className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-navy outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors" />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Address</label>
          <input type="text" maxLength={100} value={formData.aAddress} onChange={(e) => update("aAddress", e.target.value)} className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-navy outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Agency</label>
            <input type="text" value={formData.agency} onChange={(e) => update("agency", e.target.value)} className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-navy outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Website</label>
            <input type="url" value={formData.website} onChange={(e) => update("website", e.target.value)} className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-navy outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors" placeholder="https://" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">City</label>
            <input type="text" value={formData.acity} onChange={(e) => update("acity", e.target.value)} className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-navy outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">State</label>
            <input type="text" value={formData.astate} onChange={(e) => update("astate", e.target.value)} className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-navy outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Facebook</label>
            <input type="url" value={formData.afb} onChange={(e) => update("afb", e.target.value)} className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-navy outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors" placeholder="https://" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Instagram</label>
            <input type="url" value={formData.ainstagram} onChange={(e) => update("ainstagram", e.target.value)} className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-navy outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors" placeholder="https://" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Twitter</label>
            <input type="url" value={formData.atwitter} onChange={(e) => update("atwitter", e.target.value)} className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-navy outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors" placeholder="https://" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">LinkedIn</label>
            <input type="url" value={formData.alinkedin} onChange={(e) => update("alinkedin", e.target.value)} className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-navy outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors" placeholder="https://" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">TikTok</label>
            <input type="url" value={formData.atiktok} onChange={(e) => update("atiktok", e.target.value)} className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-navy outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors" placeholder="https://" />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={mutationState.isLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-600 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {mutationState.isLoading ? "Saving..." : "Save Changes"}
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
