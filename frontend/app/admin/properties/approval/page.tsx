"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle, XCircle, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import {
  useAdminListPendingApprovalQuery,
  useApprovePropertyMutation,
  useDisapprovePropertyMutation,
} from "@/lib/redux/adminApi";
import DataTable from "@/components/admin/DataTable";
import { getAssetUrl } from "@/lib/utils";
import type { Property } from "@amaken/shared";

export default function ApprovalPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useAdminListPendingApprovalQuery({ page, limit: 20 });

  const [approveMut, approveState] = useApprovePropertyMutation();
  const [disapproveMut, disapproveState] = useDisapprovePropertyMutation();

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
          src={item.pimage ? getAssetUrl(`/uploads/properties/${item.pimage}`) : "/images/house-floor-plan.png"}
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
          href={`/admin/properties/detail?id=${item.id}`}
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
            href={`/admin/properties/detail?id=${item.id}`}
            className="rounded p-1.5 text-gray-500 hover:bg-gray-100"
            title="View"
          >
            <Eye className="h-4 w-4" />
          </Link>
          <button
            onClick={() => {
              if (window.confirm(`Approve "${item.title}"?`)) {
                approveMut(item.id).unwrap();
              }
            }}
            disabled={approveState.isLoading || disapproveState.isLoading}
            className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            <CheckCircle className="h-3.5 w-3.5" />
            Approve
          </button>
          <button
            onClick={() => {
              if (window.confirm(`Disapprove "${item.title}"?`)) {
                disapproveMut(item.id).unwrap();
              }
            }}
            disabled={approveState.isLoading || disapproveState.isLoading}
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
    <div className="bg-gray-50 min-h-screen">
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
