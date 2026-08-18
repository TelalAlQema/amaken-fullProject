"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { adminUserStatus, adminDeleteUser } from "@/lib/admin-api";
import type { User, ApiResponse } from "@amaken/shared";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Trash2,
  ShieldOff,
  Snowflake,
  Sun,
  X,
  UserCheck,
  Users,
  Building2,
} from "lucide-react";
import Link from "next/link";

interface UsersResponse {
  items: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function getStatusBadge(user: User) {
  if (user.adminblock === 1)
    return { label: "Frozen", className: "bg-yellow-100 text-yellow-700" };
  if (user.deactivate === 0)
    return { label: "Deactivated", className: "bg-red-100 text-red-700" };
  return { label: "Active", className: "bg-green-100 text-green-700" };
}

function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  danger,
}: {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
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
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${
              danger
                ? "bg-red-600 hover:bg-red-700"
                : "bg-[#17c788] hover:bg-[#15b078]"
            }`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminAgentsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    userId: number;
    action: string;
    title: string;
    message: string;
    danger?: boolean;
  } | null>(null);

  const { data: response, isLoading } = useQuery<ApiResponse<UsersResponse>>({
    queryKey: ["admin-agents", page],
    queryFn: () =>
      api
        .get("/admin/users/agents", { params: { page, limit: 50 } })
        .then((r) => r.data),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, action }: { id: number; action: string }) =>
      adminUserStatus(id, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-agents"] });
      setConfirmAction(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminDeleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-agents"] });
      setConfirmAction(null);
    },
  });

  const items: User[] = response?.data?.items ?? [];
  const pagination = response?.data?.pagination;
  const total = pagination?.total ?? 0;

  const filtered = items.filter((u) => {
    if (search) {
      const s = search.toLowerCase();
      return (
        u.uname?.toLowerCase().includes(s) ||
        u.lname?.toLowerCase().includes(s) ||
        u.uemail?.toLowerCase().includes(s)
      );
    }
    return true;
  });

  const handleStatusAction = (userId: number, action: string) => {
    setOpenMenuId(null);
    const labels: Record<string, { title: string; message: string }> = {
      activate: {
        title: "Activate Agent",
        message: "Are you sure you want to activate this agent?",
      },
      deactivate: {
        title: "Deactivate Agent",
        message: "Are you sure you want to deactivate this agent?",
      },
      freeze: {
        title: "Freeze Agent",
        message: "Are you sure you want to freeze this agent?",
      },
      unfreeze: {
        title: "Unfreeze Agent",
        message: "Are you sure you want to unfreeze this agent?",
      },
    };
    const info = labels[action] ?? { title: "Confirm", message: "Are you sure?" };
    setConfirmAction({ userId, action, ...info });
  };

  const handleDelete = (userId: number) => {
    setOpenMenuId(null);
    setConfirmAction({
      userId,
      action: "delete",
      title: "Delete Agent",
      message:
        "This action cannot be undone. Are you sure you want to delete this agent?",
      danger: true,
    });
  };

  const executeConfirm = () => {
    if (!confirmAction) return;
    if (confirmAction.action === "delete") {
      deleteMutation.mutate(confirmAction.userId);
    } else {
      statusMutation.mutate({
        id: confirmAction.userId,
        action: confirmAction.action,
      });
    }
  };

  return (
    <div className="bg-gray-50 p-6 min-h-screen">
      <ConfirmDialog
        open={!!confirmAction}
        title={confirmAction?.title ?? ""}
        message={confirmAction?.message ?? ""}
        danger={confirmAction?.danger}
        onConfirm={executeConfirm}
        onCancel={() => setConfirmAction(null)}
      />

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Agent Management
          </h1>
          <p className="text-sm text-gray-500">
            {total} total agent{total !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 bg-white hover:bg-gray-50"
        >
          <Users className="h-4 w-4" />
          All
        </Link>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 bg-white hover:bg-gray-50"
        >
          <Users className="h-4 w-4" />
          Users
        </Link>
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#17c788] px-4 py-2 text-sm font-medium text-white">
          <UserCheck className="h-4 w-4" />
          Agents
        </span>
        <Link
          href="/admin/users/builders"
          className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 bg-white hover:bg-gray-50"
        >
          <Building2 className="h-4 w-4" />
          Builders
        </Link>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
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
                  Avatar
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Phone
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-sm text-gray-500"
                  >
                    No agents found.
                  </td>
                </tr>
              ) : (
                filtered.map((user) => {
                  const status = getStatusBadge(user);
                  return (
                    <tr
                      key={user.uid}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                        {user.uid}
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-200">
                          {user.uimage ? (
                            <img
                              src={user.uimage}
                              alt={user.uname}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-[#17c788]/10 text-xs font-semibold text-[#17c788]">
                              {user.uname?.charAt(0)?.toUpperCase()}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                        {user.uname} {user.lname}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                        {user.uemail}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                        {user.uphone || "—"}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className="inline-flex rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                          {user.utype}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <div className="relative inline-block">
                          <button
                            onClick={() =>
                              setOpenMenuId(
                                openMenuId === user.uid ? null : user.uid
                              )
                            }
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                          {openMenuId === user.uid && (
                            <>
                              <div
                                className="fixed inset-0 z-40"
                                onClick={() => setOpenMenuId(null)}
                              />
                              <div className="absolute right-0 z-50 mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                                {user.deactivate === 0 ? (
                                  <button
                                    onClick={() =>
                                      handleStatusAction(user.uid, "activate")
                                    }
                                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                  >
                                    <Sun className="h-4 w-4 text-green-500" />
                                    Activate
                                  </button>
                                ) : (
                                  <button
                                    onClick={() =>
                                      handleStatusAction(user.uid, "deactivate")
                                    }
                                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                  >
                                    <ShieldOff className="h-4 w-4 text-red-500" />
                                    Deactivate
                                  </button>
                                )}
                                {user.adminblock === 1 ? (
                                  <button
                                    onClick={() =>
                                      handleStatusAction(user.uid, "unfreeze")
                                    }
                                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                  >
                                    <Sun className="h-4 w-4 text-blue-500" />
                                    Unfreeze
                                  </button>
                                ) : (
                                  <button
                                    onClick={() =>
                                      handleStatusAction(user.uid, "freeze")
                                    }
                                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                  >
                                    <Snowflake className="h-4 w-4 text-yellow-500" />
                                    Freeze
                                  </button>
                                )}
                                <hr className="my-1 border-gray-100" />
                                <button
                                  onClick={() => handleDelete(user.uid)}
                                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
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
