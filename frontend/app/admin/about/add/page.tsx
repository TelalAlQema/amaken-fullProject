"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { adminCreateAbout } from "@/lib/admin-api";
import { ArrowLeft, Upload, X } from "lucide-react";
import Link from "next/link";

export default function AddAboutPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    if (selected) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selected);
    } else {
      setPreview(null);
    }
  };

  const mutation = useMutation({
    mutationFn: () =>
      adminCreateAbout(
        { title: title || undefined, content },
        file ?? undefined
      ),
    onSuccess: () => router.push("/admin/about"),
  });

  return (
    <div className="bg-gray-50 p-6 min-h-screen">
      <div className="mb-6">
        <Link
          href="/admin/about"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to About
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Add About Content</h1>
      </div>

      <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-6">
        <div className="space-y-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Title <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="About section title"
              className="w-full rounded-lg border border-gray-200 py-2.5 px-3 text-sm focus:border-[#17c788] focus:outline-none focus:ring-1 focus:ring-[#17c788]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              placeholder="Write the about content here..."
              className="w-full rounded-lg border border-gray-200 py-2.5 px-3 text-sm focus:border-[#17c788] focus:outline-none focus:ring-1 focus:ring-[#17c788]"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Image <span className="text-gray-400">(optional)</span>
            </label>
            {preview ? (
              <div className="relative inline-block">
                <img
                  src={preview}
                  alt="Preview"
                  className="h-40 rounded-lg object-cover"
                />
                <button
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                  }}
                  className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-gray-200 p-8 transition-colors hover:border-[#17c788]">
                <Upload className="h-8 w-8 text-gray-400" />
                <span className="text-sm text-gray-500">Choose an image</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            )}
          </div>

          <div className="flex items-center gap-3 border-t border-gray-100 pt-6">
            <button
              onClick={() => mutation.mutate()}
              disabled={!content || mutation.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-[#17c788] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#15b078] disabled:opacity-50"
            >
              <Upload className="h-4 w-4" />
              {mutation.isPending ? "Creating..." : "Create About Content"}
            </button>
            <Link
              href="/admin/about"
              className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
          </div>

          {mutation.isError && (
            <p className="text-sm text-red-600">
              Failed to create about content. Please try again.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
