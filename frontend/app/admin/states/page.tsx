"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { adminCreateState, adminUpdateState, adminDeleteState } from "@/lib/admin-api";
import type { State, ApiResponse } from "@amaken/shared";
import { Plus, Pencil, Trash2, MapPin, Check, X } from "lucide-react";

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

export default function AdminStatesPage() {
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: response, isLoading } = useQuery<ApiResponse<State[]>>({
    queryKey: ["admin-states"],
    queryFn: () => api.get("/states").then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: () => adminCreateState(newName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-states"] });
      setNewName("");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, sname }: { id: number; sname: string }) =>
      adminUpdateState(id, sname),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-states"] });
      setEditId(null);
      setEditName("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminDeleteState(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-states"] });
      setDeleteId(null);
    },
  });

  const items: State[] = response?.data ?? [];

  return (
    <div className="bg-gray-50 p-6 min-h-screen">
      <ConfirmDialog
        open={deleteId !== null}
        title="Delete State"
        message="This action cannot be undone. Are you sure you want to delete this state?"
        onConfirm={() => {
          if (deleteId !== null) deleteMutation.mutate(deleteId);
        }}
        onCancel={() => setDeleteId(null)}
      />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">State Management</h1>
        <p className="text-sm text-gray-500">
          {items.length} state{items.length !== 1 ? "s" : ""} total
        </p>
      </div>

      {/* Add New State */}
      <div className="mb-6 rounded-xl bg-white shadow-sm border border-gray-100 p-6">
        <h2 className="mb-3 text-sm font-medium text-gray-700">Add New State</h2>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newName.trim()) createMutation.mutate();
            }}
            placeholder="Enter state name"
            className="flex-1 rounded-lg border border-gray-200 py-2.5 px-3 text-sm focus:border-[#17c788] focus:outline-none focus:ring-1 focus:ring-[#17c788]"
          />
          <button
            onClick={() => {
              if (newName.trim()) createMutation.mutate();
            }}
            disabled={!newName.trim() || createMutation.isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-[#17c788] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#15b078] disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            {createMutation.isPending ? "Adding..." : "Add"}
          </button>
        </div>
        {createMutation.isError && (
          <p className="mt-2 text-sm text-red-600">Failed to add state.</p>
        )}
      </div>

      {/* States Table */}
      <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Name
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="px-4 py-3">
                      <div className="h-4 w-12 animate-pulse rounded bg-gray-200" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-4 w-20 animate-pulse rounded bg-gray-200 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-12 text-center text-sm text-gray-500">
                    <MapPin className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                    No states found. Add your first state above.
                  </td>
                </tr>
              ) : (
                items.map((state) => (
                  <tr
                    key={state.sid}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                      {state.sid}
                    </td>
                    <td className="px-4 py-3">
                      {editId === state.sid ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && editName.trim()) {
                              updateMutation.mutate({ id: state.sid, sname: editName });
                            }
                            if (e.key === "Escape") {
                              setEditId(null);
                            }
                          }}
                          autoFocus
                          className="w-full max-w-sm rounded-lg border border-[#17c788] py-1.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#17c788]"
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-900">
                          {state.sname}
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      {editId === state.sid ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              if (editName.trim()) {
                                updateMutation.mutate({ id: state.sid, sname: editName });
                              }
                            }}
                            className="rounded-lg p-1.5 text-green-600 hover:bg-green-50"
                            title="Save"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditId(null);
                              setEditName("");
                            }}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
                            title="Cancel"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setEditId(state.sid);
                              setEditName(state.sname);
                            }}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(state.sid)}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
