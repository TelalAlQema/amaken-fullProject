"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { updateSocialLinks } from "@/lib/api";

export default function SocialLinksPage() {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    if (user) {
      setLinks({
        website: user.website || "",
        facebook: user.fb || "",
        linkedin: user.linkedin || "",
        instagram: user.instagram || "",
        tiktok: user.tiktok || "",
        twitter: user.twitter || "",
      });
    }
  }, [user]);

  const update = (field: string, value: string) =>
    setLinks((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const { data } = await updateSocialLinks(links);
      if (data.success) {
        setUser({
          ...user!,
          website: links.website,
          fb: links.facebook,
          linkedin: links.linkedin,
          instagram: links.instagram,
          tiktok: links.tiktok,
          twitter: links.twitter,
        });
        setSuccess("Social links updated successfully");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-2 font-heading text-xl font-bold text-navy">Edit Social Links</h2>
      <p className="mb-6 text-xs text-red-500">All fields are optional</p>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}
      {success && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-600">{success}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {user.utype === "Agent" && (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Website</label>
            <input type="url" value={links.website} onChange={(e) => update("website", e.target.value)} className="input-field" placeholder="https://" />
          </div>
        )}
        {(["facebook", "linkedin", "instagram", "tiktok", "twitter"] as const).map((platform) => (
          <div key={platform}>
            <label className="mb-1 block text-sm font-medium text-gray-700 capitalize">{platform}</label>
            <input type="url" value={links[platform]} onChange={(e) => update(platform, e.target.value)} className="input-field" placeholder="https://" />
          </div>
        ))}
        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={loading} className="btn-primary disabled:cursor-not-allowed disabled:opacity-50">
            {loading ? "Updating..." : "Update Links"}
          </button>
          <button type="button" onClick={() => router.push("/profile")} className="btn-outline">
            Cancel
          </button>
        </div>
      </form>

      {user.linkpagedate && (
        <p className="mt-4 text-xs text-amaken-gray">
          Last updated: {new Date(user.linkpagedate).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
