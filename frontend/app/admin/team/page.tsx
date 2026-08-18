"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { adminDeleteTeamMember } from "@/lib/admin-api";
import type { TeamMember, ApiResponse } from "@amaken/shared";
import { Plus, Pencil, Trash2, Users, Mail, Phone } from "lucide-react";
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

function TypeBadge({ type }: { type: string }) {
  if (type === "leader") {
    return (
      <span className="inline-flex rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700">
        Leader
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
      Team
    </span>
  );
}

export default function AdminTeamPage() {
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: response, isLoading } = useQuery<ApiResponse<TeamMember[]>>({
    queryKey: ["admin-team"],
    queryFn: () => api.get("/team").then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminDeleteTeamMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-team"] });
      setDeleteId(null);
    },
  });

  const items: TeamMember[] = response?.data ?? [];

  return (
    <div className="bg-gray-50 p-6 min-h-screen">
      <ConfirmDialog
        open={deleteId !== null}
        title="Delete Team Member"
        message="This action cannot be undone. Are you sure you want to delete this team member?"
        onConfirm={() => {
          if (deleteId !== null) deleteMutation.mutate(deleteId);
        }}
        onCancel={() => setDeleteId(null)}
      />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
          <p className="text-sm text-gray-500">
            {items.length} member{items.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link
          href="/admin/team/add"
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
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 animate-pulse rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
                  <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-4 text-sm text-gray-500">No team members found.</p>
          <Link
            href="/admin/team/add"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#17c788] px-4 py-2 text-sm font-medium text-white hover:bg-[#15b078]"
          >
            <Plus className="h-4 w-4" />
            Add First Member
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((member) => (
            <div
              key={member.id}
              className="rounded-xl bg-white shadow-sm border border-gray-100 p-6"
            >
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={`${member.fname} ${member.lname}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#17c788]/10 text-lg font-bold text-[#17c788]">
                      {member.fname?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-gray-900">
                    {member.fname} {member.lname}
                  </h3>
                  {member.position && (
                    <p className="text-sm text-gray-500">{member.position}</p>
                  )}
                  <div className="mt-1">
                    <TypeBadge type={member.type} />
                  </div>
                </div>
              </div>

              {member.email && (
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                  <Mail className="h-3.5 w-3.5" />
                  <span className="truncate">{member.email}</span>
                </div>
              )}
              {member.pnumber && (
                <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                  <Phone className="h-3.5 w-3.5" />
                  <span>{member.pnumber}</span>
                </div>
              )}

              {member.about && (
                <p className="mt-3 line-clamp-2 text-xs text-gray-400">
                  {member.about}
                </p>
              )}

              <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-4">
                <Link
                  href={`/admin/team/${member.id}/edit`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Link>
                <button
                  onClick={() => setDeleteId(member.id)}
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
