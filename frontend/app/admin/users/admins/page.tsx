"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Admin, ApiResponse } from "@amaken/shared";
import {
  Search,
  Users,
  UserCheck,
  Building2,
  Shield,
  X,
} from "lucide-react";
import Link from "next/link";

export default function AdminAdminsPage() {
  const [search, setSearch] = useState("");

  const { data: response, isLoading } = useQuery<ApiResponse<Admin[]>>({
    queryKey: ["admin-admins"],
    queryFn: () =>
      api.get("/admin/users/admins").then((r) => r.data),
  });

  const items: Admin[] = response?.data ?? [];
  const total = items.length;

  const filtered = items.filter((a) => {
    if (search) {
      const s = search.toLowerCase();
      return (
        a.aname?.toLowerCase().includes(s) ||
        a.alname?.toLowerCase().includes(s) ||
        a.aemail?.toLowerCase().includes(s)
      );
    }
    return true;
  });

  return (
    <div className="bg-gray-50 p-6 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Admin Management
          </h1>
          <p className="text-sm text-gray-500">
            {total} admin{total !== 1 ? "s" : ""} registered
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
          href="/admin/users/agents"
          className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 bg-white hover:bg-gray-50"
        >
          <UserCheck className="h-4 w-4" />
          Agents
        </Link>
        <Link
          href="/admin/users/builders"
          className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 bg-white hover:bg-gray-50"
        >
          <Building2 className="h-4 w-4" />
          Builders
        </Link>
        <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#17c788] px-4 py-2 text-sm font-medium text-white">
          <Shield className="h-4 w-4" />
          Admins
        </span>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
                  Join Date
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-sm text-gray-500"
                  >
                    No admins found.
                  </td>
                </tr>
              ) : (
                filtered.map((admin) => (
                  <tr
                    key={admin.aid}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                      {admin.aid}
                    </td>
                    <td className="px-4 py-3">
                      <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-200">
                        {admin.aimage ? (
                          <img
                            src={admin.aimage}
                            alt={admin.aname}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-[#0d1432]/10 text-xs font-semibold text-[#0d1432]">
                            {admin.aname?.charAt(0)?.toUpperCase()}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                      {admin.aname} {admin.alname}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                      {admin.aemail}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                      {admin.aphone || "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className="inline-flex rounded-full bg-[#0d1432]/10 px-2.5 py-0.5 text-xs font-medium text-[#0d1432]">
                        {admin.atype || "Admin"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                      {admin.joinadate
                        ? new Date(admin.joinadate).toLocaleDateString()
                        : "—"}
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
