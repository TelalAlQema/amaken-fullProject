"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { deleteAccountRecord } from "@/lib/admin-api";
import type { DelAccount, ApiResponse } from "@amaken/shared";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Trash2,
  X,
  Mail,
  MailX,
  Ban,
} from "lucide-react";
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

export default function DeletedAccountsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: response, isLoading } = useQuery<ApiResponse<DelAccount[]>>({
    queryKey: ["admin-deleted-accounts", page],
    queryFn: () =>
      api
        .get("/admin/accounts/deleted", { params: { page, limit: 50 } })
        .then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAccountRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-deleted-accounts"] });
      setDeleteId(null);
    },
  });

  const items: DelAccount[] = response?.data ?? [];
  const pagination = response?.pagination;
  const total = pagination?.total ?? items.length;

  const filtered = items.filter((a) => {
    if (search) {
      const s = search.toLowerCase();
      return a.email?.toLowerCase().includes(s);
    }
    return true;
  });

  return (
    <div className="bg-gray-50 p-6 min-h-screen">
      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Record"
        message="Are you sure you want to delete this record? This action cannot be undone."
        onConfirm={() => {
          if (deleteId !== null) deleteMutation.mutate(deleteId);
        }}
        onCancel={() => setDeleteId(null)}
      />

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Deleted Accounts
          </h1>
          <p className="text-sm text-gray-500">
            {total} deleted account{total !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Account Tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        <Link
          href="/admin/accounts/registered"
          className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 bg-white hover:bg-gray-50"
        >
          <Mail className="h-4 w-4" />
          Registered
        </Link>
        <Link
          href="/admin/accounts/deleted"
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#17c788] px-4 py-2 text-sm font-medium text-white"
        >
          <MailX className="h-4 w-4" />
          Deleted
        </Link>
        <Link
          href="/admin/accounts/blocked"
          className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 bg-white hover:bg-gray-50"
        >
          <Ban className="h-4 w-4" />
          Blocked
        </Link>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none focus:border-[#17c788] focus:ring-2 focus:ring-[#17c788]/20"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Account Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  User Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Date
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-sm text-gray-500"
                  >
                    No deleted accounts found.
                  </td>
                </tr>
              ) : (
                filtered.map((account) => (
                  <tr
                    key={account.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                      {account.id}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                      {account.email}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="inline-flex rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                        {account.type}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="inline-flex rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700">
                        {account.utype}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                      {account.date
                        ? new Date(account.date).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <button
                        onClick={() => setDeleteId(account.id)}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
            <p className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.totalPages} ({total} results)
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <button
                onClick={() =>
                  setPage((p) => Math.min(pagination.totalPages, p + 1))
                }
                disabled={page >= pagination.totalPages}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
