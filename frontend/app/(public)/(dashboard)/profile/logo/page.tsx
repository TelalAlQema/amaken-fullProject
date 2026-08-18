"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { uploadLogo, removeLogo } from "@/lib/api";

export default function CompanyLogoPage() {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);

  if (!user) return null;

  const currentLogo = user.ucompanylogo
    ? `/uploads/users/${user.ucompanylogo}`
    : "/images/user/company-logo.png";

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      setError("Only JPEG, PNG, WebP, and GIF images are allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }
    setSelectedFile(file);
    setError("");
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    setShowModal(true);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setLoading(true);
    setError("");
    try {
      const { data } = await uploadLogo(selectedFile);
      if (data.success) {
        setUser({ ...user, ucompanylogo: data.data!.image });
        setSuccess("Company logo updated. It will be reviewed by our team.");
        setShowModal(false);
        setPreview(null);
        setSelectedFile(null);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await removeLogo();
      if (data.success) {
        setUser({ ...user, ucompanylogo: "" });
        setSuccess("Company logo removed successfully");
        setShowModal(false);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Remove failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-6 font-heading text-xl font-bold text-navy">Edit Company Logo</h2>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}
      {success && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-600">{success}</div>
      )}

      <div className="flex flex-col items-center gap-6">
        <img
          src={preview || currentLogo}
          alt="Company Logo"
          className="h-40 w-40 rounded-lg border-2 border-primary object-contain"
        />
        <div className="flex gap-3">
          <button onClick={() => fileInputRef.current?.click()} className="btn-primary">
            Upload New Logo
          </button>
          {user.ucompanylogo && (
            <button onClick={() => setShowModal(true)} className="btn-outline border-red-300 text-red-500 hover:bg-red-50 hover:text-red-600">
              Remove Logo
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileSelect}
          className="hidden"
        />
        <p className="text-xs text-amaken-gray">Allowed: JPEG, PNG, WebP, GIF. Max size: 5MB</p>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-heading text-lg font-bold text-navy">
                {preview ? "Upload Logo" : "Remove Logo"}
              </h3>
              <button onClick={() => { setShowModal(false); setPreview(null); setSelectedFile(null); }} className="text-gray-400 hover:text-gray-600">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {preview && (
              <div className="mb-4 text-center">
                <img src={preview} alt="Preview" className="mx-auto h-32 w-32 rounded-lg border-2 border-primary object-contain" />
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => { setShowModal(false); setPreview(null); setSelectedFile(null); }} className="btn-outline flex-1">
                Cancel
              </button>
              {preview ? (
                <button onClick={handleUpload} disabled={loading} className="btn-primary flex-1 disabled:opacity-50">
                  {loading ? "Uploading..." : "Upload"}
                </button>
              ) : (
                <button onClick={handleRemove} disabled={loading} className="flex-1 rounded-lg bg-red-500 px-6 py-3 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50">
                  {loading ? "Removing..." : "Remove"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-6">
        <button onClick={() => router.push("/profile")} className="text-sm text-amaken-gray hover:text-primary">
          &larr; Back to profile
        </button>
      </div>
    </div>
  );
}
