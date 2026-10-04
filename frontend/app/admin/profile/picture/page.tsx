"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/components/providers/AdminAuthProvider";
import {
  useGetAdminProfileQuery,
  useUploadAdminAvatarMutation,
  useRemoveAdminAvatarMutation,
} from "@/lib/redux/adminApi";
import type { ApiResponse } from "@amaken/shared";
import { ArrowLeft, Upload, Trash2, X } from "lucide-react";
import { getAssetUrl } from "@/lib/utils";

export default function AdminChangePicturePage() {
  const { setAdmin } = useAdminAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"upload" | "delete">("upload");

  const { data: response, isLoading } = useGetAdminProfileQuery();
  const data = response?.data ?? null;

  const [uploadMutation, uploadState] = useUploadAdminAvatarMutation();
  const [deleteMutation, deleteState] = useRemoveAdminAvatarMutation();

  const handleUpload = () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append("avatar", selectedFile);
    uploadMutation(formData)
      .unwrap()
      .then((res) => {
        const updatedImage = (res as ApiResponse<{ image: string }>).data?.image || "";
        setAdmin({ ...data!, aimage: updatedImage });
        setSuccess("Profile picture updated successfully");
        setError("");
        setShowModal(false);
        setPreview(null);
        setSelectedFile(null);
      })
      .catch((err) => {
        setError(err?.data?.message || err?.message || "Upload failed");
        setSuccess("");
      });
  };

  const handleDelete = () => {
    deleteMutation()
      .unwrap()
      .then(() => {
        setAdmin({ ...data!, aimage: "" });
        setSuccess("Profile picture removed successfully");
        setError("");
        setShowModal(false);
      })
      .catch((err) => {
        setError(err?.data?.message || err?.message || "Remove failed");
        setSuccess("");
      });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Only JPEG, PNG, and WebP images are allowed");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be less than 2MB");
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

  const currentImage = getAssetUrl(data.aimage ? `/uploads/users/${data.aimage}` : "/images/user/default-user.jpg");

  return (
    <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-6">
      <div className="mb-6 flex items-center gap-3">
        <button onClick={() => router.push("/admin/profile")} className="text-amaken-gray hover:text-navy transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="font-heading text-xl font-bold text-navy">Edit Profile Picture</h2>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}
      {success && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-600">{success}</div>
      )}

      <div className="flex flex-col items-center gap-6">
        <img
          src={preview || currentImage}
          alt="Profile"
          className="h-40 w-40 rounded-full border-4 border-primary object-cover shadow-md"
        />
        <div className="flex w-full max-w-sm flex-col gap-3 sm:flex-row">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600 sm:w-auto sm:justify-start"
          >
            <Upload className="h-4 w-4" />
            Upload New Picture
          </button>
          {data.aimage && (
            <button
              onClick={() => {
                setModalMode("delete");
                setShowModal(true);
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-6 py-2.5 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Remove Picture
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
        <p className="text-xs text-amaken-gray">Allowed: JPEG, PNG, WebP. Max size: 2MB</p>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-heading text-lg font-bold text-navy">
                {modalMode === "upload" ? "Upload Picture" : "Remove Picture"}
              </h3>
              <button onClick={() => { setShowModal(false); setPreview(null); setSelectedFile(null); }} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            {preview && (
              <div className="mb-4 text-center">
                <img src={preview} alt="Preview" className="mx-auto h-32 w-32 rounded-full border-2 border-primary object-cover" />
              </div>
            )}
            <div className="flex w-full max-w-sm flex-col gap-3 sm:flex-row">
              <button onClick={() => { setShowModal(false); setPreview(null); setSelectedFile(null); }} className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-navy hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              {modalMode === "upload" && selectedFile ? (
                <button
                  onClick={handleUpload}
                  disabled={uploadState.isLoading}
                  className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-600 transition-colors disabled:opacity-50"
                >
                  {uploadState.isLoading ? "Uploading..." : "Upload"}
                </button>
              ) : (
                <button
                  onClick={handleDelete}
                  disabled={deleteState.isLoading}
                  className="flex-1 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {deleteState.isLoading ? "Removing..." : "Remove"}
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
