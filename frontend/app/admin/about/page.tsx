"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { adminDeleteAbout } from "@/lib/admin-api";
import type { About, ApiResponse } from "@amaken/shared";
import { Plus, Pencil, Trash2, FileText, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="mt-2 text-sm text-gray-600">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminAboutPage() {
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: response, isLoading } = useQuery<ApiResponse<About[]>>({
    queryKey: ["admin-about"],
    queryFn: () => api.get("/about").then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminDeleteAbout(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-about"] });
      setDeleteId(null);
    },
  });

  const items: About[] = response?.data ?? [];

  return (
    <div className="bg-gray-50 p-6 min-h-screen">
      <ConfirmDialog
        open={deleteId !== null}
        title="Delete About Content"
        message="This action cannot be undone. Are you sure you want to delete this content?"
        onConfirm={() => {
          if (deleteId !== null) deleteMutation.mutate(deleteId);
        }}
        onCancel={() => setDeleteId(null)}
      />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">About Content Management</h1>
          <p className="text-sm text-gray-500">
            {items.length} item{items.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link
          href="/admin/about/add"
          className="inline-flex items-center gap-2 rounded-lg bg-[#17c788] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#15b078]"
        >
          <Plus className="h-4 w-4" />
          Add New
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-white shadow-sm border border-gray-100 p-6">
              <div className="space-y-3">
                <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-4 text-sm text-gray-500">No about content found.</p>
          <Link
            href="/admin/about/add"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#17c788] px-4 py-2 text-sm font-medium text-white hover:bg-[#15b078]"
          >
            <Plus className="h-4 w-4" />
            Add First Entry
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-xl bg-white shadow-sm border border-gray-100 p-6"
            >
              {item.image && (
                <div className="mb-4 overflow-hidden rounded-lg">
                  <img
                    src={item.image}
                    alt={item.title || "About image"}
                    className="h-40 w-full object-cover"
                  />
                </div>
              )}
              {!item.image && (
                <div className="mb-4 flex h-40 items-center justify-center rounded-lg bg-gray-50">
                  <ImageIcon className="h-10 w-10 text-gray-300" />
                </div>
              )}
              <h3 className="text-lg font-semibold text-gray-900">
                {item.title || "Untitled"}
              </h3>
              <p className="mt-2 line-clamp-3 text-sm text-gray-500">
                {item.content || "No content"}
              </p>
              <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-4">
                <Link
                  href={`/admin/about/${item.id}/edit`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Link>
                <button
                  onClick={() => setDeleteId(item.id)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
