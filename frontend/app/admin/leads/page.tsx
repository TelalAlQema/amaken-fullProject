"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { adminListLeads } from "@/lib/admin-api";
import {
  Trash2,
  ChevronLeft,
  ChevronRight,
  Download,
  CheckSquare,
  Square,
  Filter,
} from "lucide-react";

interface PropertyLead {
  id: number;
  pid: number;
  title?: string;
  name: string;
  email: string;
  phone: string;
  nationality?: string;
  created_at?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function LeadsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showExportMenu, setShowExportMenu] = useState(false);

  const params = useMemo(
    () => ({ page, limit, ...(from && { from }), ...(to && { to }) }),
    [page, limit, from, to]
  );

  const { data: response, isLoading } = useQuery({
    queryKey: ["admin-leads", params],
    queryFn: () => adminListLeads(params),
  });

  const singleDeleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/leads/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-leads"] });
      setSelectedIds(new Set());
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: number[]) => api.post("/admin/leads/bulk-delete", { ids }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-leads"] });
      setSelectedIds(new Set());
    },
  });

  const resultData = response?.data?.data as Record<string, unknown> | undefined;
  const items: PropertyLead[] = (resultData?.items as PropertyLead[]) ?? (response?.data?.data as unknown as PropertyLead[]) ?? [];
  const pagination: Pagination = (resultData?.pagination as Pagination) ?? { page: 1, limit: 15, total: 0, totalPages: 0 };

  const allSelected = items.length > 0 && items.every((l) => selectedIds.has(l.id));

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((l) => l.id)));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSingleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;
    singleDeleteMutation.mutate(id);
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} selected lead(s)?`)) return;
    bulkDeleteMutation.mutate(Array.from(selectedIds));
  };

  const handleExport = async (mode: string) => {
    setShowExportMenu(false);
    try {
      const response = await api.get("/admin/leads/export", {
        params: { mode, page, limit: 50, from, to },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "property_leads.xls");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert("Export failed. Please try again.");
    }
  };

  return (
    <div className="bg-gray-50 p-6 min-h-screen">
      <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-[#0d1432]">
            Property Leads
            {pagination.total > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({pagination.total} total)
              </span>
            )}
          </h1>
          <div className="flex gap-2">
            {selectedIds.size > 0 && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-1.5 px-3 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <Trash2 size={14} />
                Delete ({selectedIds.size})
              </button>
            )}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm bg-[#17c788] text-white rounded-lg hover:bg-[#15b37a] transition-colors"
              >
                <Download size={14} />
                Export
              </button>
              {showExportMenu && (
                <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <button
                    onClick={() => handleExport("all")}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    Export All
                  </button>
                  <button
                    onClick={() => handleExport("current")}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    Export Current Page
                  </button>
                  <button
                    onClick={() => handleExport("range")}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    Export Range
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <span className="text-sm text-gray-600">Date range:</span>
          </div>
          <input
            type="date"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#17c788]/30 focus:border-[#17c788]"
          />
          <span className="text-gray-400 self-center">to</span>
          <input
            type="date"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#17c788]/30 focus:border-[#17c788]"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#17c788] border-t-transparent" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-center text-gray-500 py-12">No leads found.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-4 py-3 text-left w-10">
                      <button onClick={toggleSelectAll} className="text-gray-400 hover:text-gray-600">
                        {allSelected ? (
                          <CheckSquare size={16} className="text-[#17c788]" />
                        ) : (
                          <Square size={16} />
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">ID</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Property</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Email</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Phone</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Nationality</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Date</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((l) => (
                    <tr key={l.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleSelect(l.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {selectedIds.has(l.id) ? (
                            <CheckSquare size={16} className="text-[#17c788]" />
                          ) : (
                            <Square size={16} />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">{l.id}</td>
                      <td className="px-4 py-3">
                        {l.title ?? `#${l.pid}`}
                      </td>
                      <td className="px-4 py-3">{l.name}</td>
                      <td className="px-4 py-3">{l.email}</td>
                      <td className="px-4 py-3">{l.phone}</td>
                      <td className="px-4 py-3">{l.nationality ?? "-"}</td>
                      <td className="px-4 py-3">
                        {l.created_at ? new Date(l.created_at).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleSingleDelete(l.id)}
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