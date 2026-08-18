"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { deleteContact } from "@/lib/admin-api";
import { Trash2, ChevronLeft, ChevronRight } from "lucide-react";

interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  created_at?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function ContactsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const limit = 15;

  const { data, isLoading } = useQuery({
    queryKey: ["admin-contacts", page],
    queryFn: () =>
      api.get("/admin/contacts", { params: { page, limit } }).then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-contacts"] });
    },
  });

  const items: Contact[] = data?.items ?? [];
  const pagination: Pagination = data?.pagination ?? { page: 1, limit: 15, total: 0, totalPages: 0 };

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this contact submission?")) return;
    deleteMutation.mutate(id);
  };

  return (
    <div className="bg-gray-50 p-6 min-h-screen">
      <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#0d1432]">
            Contact Submissions
            {pagination.total > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({pagination.total} total)
              </span>
            )}
          </h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#17c788] border-t-transparent" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-center text-gray-500 py-12">No contact submissions found.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">ID</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Email</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Phone</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Subject</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Date</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((c) => (
                    <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3">{c.id}</td>
                      <td className="px-4 py-3">{c.name}</td>
                      <td className="px-4 py-3">{c.email}</td>
                      <td className="px-4 py-3">{c.phone}</td>
                      <td className="px-4 py-3 max-w-[200px] truncate">{c.subject}</td>
                      <td className="px-4 py-3">
                        {c.created_at ? new Date(c.created_at).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-gray-500">
                  Page {pagination.page} of {pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={14} /> Prev
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={page >= pagination.totalPages}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}