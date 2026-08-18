"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { CheckCircle, XCircle, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import {
  adminListPendingApproval,
  approveProperty,
  disapproveProperty,
} from "@/lib/admin-api";
import DataTable from "@/components/admin/DataTable";
import type { Property, ApiResponse } from "@amaken/shared";

interface ApprovalResponse {
  success: boolean;
  data: Property[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function ApprovalPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-properties-approval", page],
    queryFn: () =>
      adminListPendingApproval(page, 20).then((r) => ({
        success: r.data.success,
        data: (r.data.data as Property[]) ?? [],
        pagination: r.data.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 0 },
      })),
  });

  const approveMut = useMutation({
    mutationFn: (id: number) => approveProperty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-properties-approval"] });
      queryClient.invalidateQueries({ queryKey: ["admin-properties"] });
    },
  });

  const disapproveMut = useMutation({
    mutationFn: (id: number) => disapproveProperty(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-properties-approval"] });
      queryClient.invalidateQueries({ queryKey: ["admin-properties"] });
    },
  });

  const properties = data?.data || [];
  const pagination = data?.pagination;

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
        <Link
          href={`/admin/properties/${item.id}`}
          className="font-medium text-[#17c788] hover:underline"
        >
          {item.title}
        </Link>
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
      key: "date",
      label: "Date",
      render: (item: Property) => (
        <span className="text-sm text-gray-500">
          {item.date ? new Date(item.date).toLocaleDateString() : "-"}
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
          <button
            onClick={() => {
              if (window.confirm(`Approve "${item.title}"?`)) {
                approveMut.mutate(item.id);
              }
            }}
            disabled={approveMut.isPending || disapproveMut.isPending}
            className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            <CheckCircle className="h-3.5 w-3.5" />
            Approve
          </button>
          <button
            onClick={() => {
              if (window.confirm(`Disapprove "${item.title}"?`)) {
                disapproveMut.mutate(item.id);
              }
            }}
            disabled={approveMut.isPending || disapproveMut.isPending}
            className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            <XCircle className="h-3.5 w-3.5" />
            Disapprove
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-gray-50 p-6 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Under Approval</h1>
        <p className="text-sm text-gray-500">Properties waiting for admin approval</p>
      </div>

      <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-6">
        <DataTable
          columns={columns}
          data={properties as (Property & Record<string, unknown>)[]}
          isLoading={isLoading}
          emptyMessage="No properties pending approval"
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
