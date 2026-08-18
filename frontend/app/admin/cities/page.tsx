"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { adminCreateCity, adminUpdateCity, adminDeleteCity } from "@/lib/admin-api";
import type { City, State, ApiResponse } from "@amaken/shared";
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

export default function AdminCitiesPage() {
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState("");
  const [newSid, setNewSid] = useState<number>(0);
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editSid, setEditSid] = useState<number>(0);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: citiesRes, isLoading: citiesLoading } = useQuery<ApiResponse<City[]>>({
    queryKey: ["admin-cities"],
    queryFn: () => api.get("/cities").then((r) => r.data),
  });

  const { data: statesRes } = useQuery<ApiResponse<State[]>>({
    queryKey: ["admin-states"],
    queryFn: () => api.get("/states").then((r) => r.data),
  });

  const states: State[] = statesRes?.data ?? [];
  const cities: City[] = citiesRes?.data ?? [];

  const stateMap = states.reduce<Record<number, string>>((acc, s) => {
    acc[s.sid] = s.sname;
    return acc;
  }, {});

  const createMutation = useMutation({
    mutationFn: () => adminCreateCity(newName, newSid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cities"] });
      setNewName("");
      setNewSid(0);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, cname, sid }: { id: number; cname: string; sid: number }) =>
      adminUpdateCity(id, cname, sid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cities"] });
      setEditId(null);
      setEditName("");
      setEditSid(0);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminDeleteCity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-cities"] });
      setDeleteId(null);
    },
  });

  return (
    <div className="bg-gray-50 p-6 min-h-screen">
      <ConfirmDialog
        open={deleteId !== null}
        title="Delete City"
        message="This action cannot be undone. Are you sure you want to delete this city?"
        onConfirm={() => {
          if (deleteId !== null) deleteMutation.mutate(deleteId);
        }}
        onCancel={() => setDeleteId(null)}
      />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">City Management</h1>
        <p className="text-sm text-gray-500">
          {cities.length} cit{cities.length !== 1 ? "ies" : "y"} total
        </p>
      </div>

      {/* Add New City */}
      <div className="mb-6 rounded-xl bg-white shadow-sm border border-gray-100 p-6">
        <h2 className="mb-3 text-sm font-medium text-gray-700">Add New City</h2>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Enter city name"
            className="flex-1 rounded-lg border border-gray-200 py-2.5 px-3 text-sm focus:border-[#17c788] focus:outline-none focus:ring-1 focus:ring-[#17c788]"
          />
          <select
            value={newSid}
            onChange={(e) => setNewSid(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-200 py-2.5 px-3 text-sm focus:border-[#17c788] focus:outline-none focus:ring-1 focus:ring-[#17c788] sm:w-48"
          >
            <option value={0}>Select State</option>
            {states.map((s) => (
              <option key={s.sid} value={s.sid}>
                {s.sname}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              if (newName.trim() && newSid) createMutation.mutate();
            }}
            disabled={!newName.trim() || !newSid || createMutation.isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-[#17c788] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#15b078] disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            {createMutation.isPending ? "Adding..." : "Add"}
          </button>
        </div>
        {createMutation.isError && (
          <p className="mt-2 text-sm text-red-600">Failed to add city.</p>
        )}
      </div>

      {/* Cities Table */}
      <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  City Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  State
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {citiesLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : cities.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-sm text-gray-500">
                    <MapPin className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                    No cities found. Add your first city above.
                  </td>
                </tr>
              ) : (
                cities.map((city) => (
                  <tr
                    key={city.cid}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                      {city.cid}
                    </td>
                    <td className="px-4 py-3">
                      {editId === city.cid ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          autoFocus
                          className="w-full max-w-xs rounded-lg border border-[#17c788] py-1.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#17c788]"
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-900">
                          {city.cname}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editId === city.cid ? (
                        <select
                          value={editSid}
                          onChange={(e) => setEditSid(Number(e.target.value))}
                          className="w-full max-w-xs rounded-lg border border-[#17c788] py-1.5 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#17c788]"
                        >
                          <option value={0}>Select State</option>
                          {states.map((s) => (
                            <option key={s.sid} value={s.sid}>
                              {s.sname}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-sm text-gray-600">
                          {stateMap[city.sid] ?? `State #${city.sid}`}
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      {editId === city.cid ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              if (editName.trim() && editSid) {
                                updateMutation.mutate({
                                  id: city.cid,
                                  cname: editName,
                                  sid: editSid,
                                });
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
                              setEditSid(0);
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
                              setEditId(city.cid);
                              setEditName(city.cname);
                              setEditSid(city.sid);
                            }}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(city.cid)}
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
