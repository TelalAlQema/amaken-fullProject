"use client";

import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  Search,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { adminListProperties, adminDeleteProperty } from "@/lib/admin-api";
import DataTable from "@/components/admin/DataTable";
import type { Property } from "@amaken/shared";
import { PROPERTY_TYPES, SELLING_TYPES, PROPERTY_STATUS } from "@amaken/shared";

interface PropertiesResponse {
  success: boolean;
  data: Property[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function AdminPropertiesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [stypeFilter, setStypeFilter] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, typeFilter, stypeFilter]);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-properties", page, debouncedSearch, statusFilter, typeFilter, stypeFilter],
    queryFn: () =>
      adminListProperties({
        page,
        limit: 20,
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
        type: typeFilter || undefined,
        stype: stypeFilter || undefined,
      }).then((r) => ({
        success: r.data.success,
        data: (r.data.data as Property[]) ?? [],
        pagination: r.data.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 0 },
      })),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminDeleteProperty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-properties"] });
    },
  });

  const properties = data?.data || [];
  const pagination = data?.pagination;

  const handleDelete = useCallback(
    (item: Property) => {
      if (window.confirm(`Delete property "${item.title}"? This cannot be undone.`)) {
        deleteMutation.mutate(item.id);
      }
    },
    [deleteMutation],
  );

  const columns = [
    {
      key: "id",
      label: "ID",
      render: (item: Property) => (
        <span className="text-gray-500">#{item.id}</span>
      ),
    },
    {
      key: "pimage",
      label: "Image",
      render: (item: Property) => (
        <img
          src={item.pimage ? `/uploads/properties/${item.pimage}` : "/images/house-floor-plan.png"}
          alt={item.title}
          className="h-12 w-12 rounded object-cover"
        />
      ),
    },
    {
      key: "title",
      label: "Title",
      render: (item: Property) => (
        <span className="font-medium text-gray-900">{item.title}</span>
      ),
    },
    {
      key: "type",
      label: "Type",
      render: (item: Property) => (
        <span className="text-gray-600">{item.type}</span>
      ),
    },
    {
      key: "price",
      label: "Price",
      render: (item: Property) => (
        <span className="font-medium text-gray-900">
          {item.curr} {Number(item.price).toLocaleString()}
        </span>
      ),
    },
    {
      key: "location",
      label: "Location",
      render: (item: Property) => (
        <span className="text-gray-600">{item.city || item.location}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (item: Property) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            item.status === "available"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {item.status}
        </span>
      ),
    },
    {
      key: "adminapproval",
      label: "Approval",
      render: (item: Property) =>
        item.adminapproval === 1 ? (
          <span className="inline-flex items-center justify-center rounded-full bg-green-100 p-1">
            <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </span>
        ) : (
          <span className="inline-flex items-center justify-center rounded-full bg-red-100 p-1">
            <svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </span>
        ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (item: Property) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/properties/${item.id}`}
            className="rounded p-1.5 text-gray-500 hover:bg-gray-100"
            title="View"
          >
            <Eye className="h-4 w-4" />
          </Link>
          <Link
            href={`/admin/properties/${item.id}/edit`}
            className="rounded p-1.5 text-gray-500 hover:bg-gray-100"
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <button
            onClick={() => handleDelete(item)}
            disabled={deleteMutation.isPending}
            className="rounded p-1.5 text-red-500 hover:bg-red-50 disabled:opacity-50"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-gray-50 p-6 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
        <p className="text-sm text-gray-500">Manage all property listings</p>
      </div>

      <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-6">
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-200 py-2 px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">All Status</option>
            {PROPERTY_STATUS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-gray-200 py-2 px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">All Types</option>
            {PROPERTY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select
            value={stypeFilter}
            onChange={(e) => setStypeFilter(e.target.value)}
            className="rounded-lg border border-gray-200 py-2 px-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">All Selling Types</option>
            {SELLING_TYPES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <DataTable
          columns={columns}
          data={properties as (Property & Record<string, unknown>)[]}
          isLoading={isLoading}
          emptyMessage="No properties found"
          pagination={
            pagination
              ? {
                  page: pagination.page,
                  totalPages: pagination.totalPages,
                  total: pagination.total,
                  onPageChange: setPage,
                }
              : undefined
          }
        />
      </div>
    </div>
  );
}
