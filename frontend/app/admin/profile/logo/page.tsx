"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminAuth } from "@/components/providers/AdminAuthProvider";
import { getAdminProfile, uploadAdminLogo, removeAdminLogo } from "@/lib/admin-api";
import type { Admin } from "@amaken/shared";
import { ArrowLeft, Upload, Trash2, X } from "lucide-react";

export default function AdminChangeLogoPage() {
  const { setAdmin } = useAdminAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"upload" | "delete">("upload");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-profile"],
    queryFn: async () => {
      const { data } = await getAdminProfile();
      return data.success ? (data.data as Admin) : null;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadAdminLogo(file),
    onSuccess: (res) => {
      if (res.data.success) {
        const updatedLogo = res.data.data?.image || "";
        setAdmin({ ...data!, companylogo: updatedLogo });
        queryClient.invalidateQueries({ queryKey: ["admin-profile"] });
        setSuccess("Company logo updated successfully");
        setError("");
        setShowModal(false);
        setPreview(null);
        setSelectedFile(null);
      }
    },
    onError: (err: Error) => {
      setError(err.message || "Upload failed");
      setSuccess("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => removeAdminLogo(),
    onSuccess: (res) => {
      if (res.data.success) {
        setAdmin({ ...data!, companylogo: "" });
        queryClient.invalidateQueries({ queryKey: ["admin-profile"] });
        setSuccess("Company logo removed successfully");
        setError("");
        setShowModal(false);
      }
    },
    onError: (err: Error) => {
      setError(err.message || "Remove failed");
      setSuccess("");
    },
  });

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
    setSuccess("");
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    setModalMode("upload");
    setShowModal(true);
  };

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const currentLogo = data.companylogo
    ? `/uploads/users/${data.companylogo}`
    : "/images/user/company-logo.png";

  return (
    <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-6">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.push("/admin/profile")} className="text-amaken-gray hover:text-navy transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="font-heading text-xl font-bold text-navy">Edit Company Logo</h2>
      </div>

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
          className="h-40 w-40 rounded-lg border-2 border-primary object-contain shadow-md"
        />
        <div className="flex gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-600 transition-colors"
          >
            <Upload className="h-4 w-4" />
            Upload New Logo
          </button>
          {data.companylogo && (
            <button
              onClick={() => {
                setModalMode("delete");
                setShowModal(true);
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-6 py-2.5 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
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
                {modalMode === "upload" ? "Upload Logo" : "Remove Logo"}
              </h3>
              <button onClick={() => { setShowModal(false); setPreview(null); setSelectedFile(null); }} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            {preview && (
              <div className="mb-4 text-center">
                <img src={preview} alt="Preview" className="mx-auto h-32 w-32 rounded-lg border-2 border-primary object-contain" />
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => { setShowModal(false); setPreview(null); setSelectedFile(null); }} className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-navy hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              {modalMode === "upload" && selectedFile ? (
                <button
                  onClick={() => uploadMutation.mutate(selectedFile)}
                  disabled={uploadMutation.isPending}
                  className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-600 transition-colors disabled:opacity-50"
                >
                  {uploadMutation.isPending ? "Uploading..." : "Upload"}
                </button>
              ) : (
                <button
                  onClick={() => deleteMutation.mutate()}
                  disabled={deleteMutation.isPending}
                  className="flex-1 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {deleteMutation.isPending ? "Removing..." : "Remove"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-6">
        <Link href="/admin/profile" className="text-sm text-amaken-gray hover:text-primary">
          &larr; Back to profile
        </Link>
      </div>
    </div>
  );
}
