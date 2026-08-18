"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminAuth } from "@/components/providers/AdminAuthProvider";
import { getAdminProfile, updateAdminLinks } from "@/lib/admin-api";
import type { Admin } from "@amaken/shared";
import { ArrowLeft, Save } from "lucide-react";

export default function AdminSocialLinksPage() {
  const { setAdmin } = useAdminAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [links, setLinks] = useState({
    website: "",
    facebook: "",
    linkedin: "",
    instagram: "",
    tiktok: "",
    twitter: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-profile"],
    queryFn: async () => {
      const { data } = await getAdminProfile();
      return data.success ? (data.data as Admin) : null;
    },
  });

  useEffect(() => {
    if (data) {
      setLinks({
        website: data.website || "",
        facebook: data.afb || "",
        linkedin: data.alinkedin || "",
        instagram: data.ainstagram || "",
        tiktok: data.atiktok || "",
        twitter: data.atwitter || "",
      });
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: (payload: Record<string, string>) => updateAdminLinks(payload),
    onSuccess: (res) => {
      if (res.data.success) {
        setAdmin({
          ...data!,
          website: links.website,
          afb: links.facebook,
          alinkedin: links.linkedin,
          ainstagram: links.instagram,
          atiktok: links.tiktok,
          atwitter: links.twitter,
        });
        queryClient.invalidateQueries({ queryKey: ["admin-profile"] });
        setSuccess("Social links updated successfully");
        setError("");
      }
    },
    onError: (err: Error) => {
      setError(err.message || "Update failed");
      setSuccess("");
    },
  });

  const update = (field: string, value: string) =>
    setLinks((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    mutation.mutate(links);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const fields = [
    { key: "website", label: "Website", type: "url" },
    { key: "facebook", label: "Facebook", type: "url" },
    { key: "linkedin", label: "LinkedIn", type: "url" },
    { key: "instagram", label: "Instagram", type: "url" },
    { key: "tiktok", label: "TikTok", type: "url" },
    { key: "twitter", label: "Twitter", type: "url" },
  ] as const;

  return (
    <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-6">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.push("/admin/profile")} className="text-amaken-gray hover:text-navy transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="font-heading text-xl font-bold text-navy">Edit Social Links</h2>
          <p className="text-xs text-red-500">All fields are optional</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}
      {success && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-600">{success}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((field) => (
          <div key={field.key}>
            <label className="mb-1 block text-sm font-medium text-gray-700">{field.label}</label>
            <input
              type={field.type}
              value={links[field.key as keyof typeof links]}
              onChange={(e) => update(field.key, e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-navy outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
              placeholder="https://"
            />
          </div>
        ))}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-600 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {mutation.isPending ? "Saving..." : "Save Links"}
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
