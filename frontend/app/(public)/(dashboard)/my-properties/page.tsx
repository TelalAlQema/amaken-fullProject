"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { getMyProperties, deleteProperty } from "@/lib/api";
import type { Property } from "@amaken/shared";

export default function MyPropertiesPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;
      const { data } = await getMyProperties(params);
      if (data.success && data.data) {
        setProperties(data.data as Property[]);
        if (data.pagination) setTotalPages(data.pagination.totalPages);
      }
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this property?")) return;
    try {
      await deleteProperty(id);
      fetchProperties();
    } catch {
      alert("Failed to delete property");
    }
  };

  if (!user) return null;

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-heading text-xl font-bold text-navy">My Properties</h2>
        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="select-field w-auto"
          >
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="sold out">Sold Out</option>
          </select>
          <Link href="/submit-property" className="btn-primary">
            + Add Property
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-amaken-gray">Loading properties...</div>
      ) : properties.length === 0 ? (
        <div className="py-12 text-center text-amaken-gray">
          <p>No properties found.</p>
          <Link href="/submit-property" className="mt-2 inline-block text-primary hover:text-primary-600">
            Submit your first property
          </Link>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-xs uppercase text-amaken-gray">
                  <th className="px-4 py-3">Property</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Price</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 hidden md:table-cell">Date</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {properties.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.pimage ? `/uploads/properties/${p.pimage}` : "/images/house-floor-plan.png"}
                          alt={p.title}
                          className="h-12 w-12 rounded object-cover"
                        />
                        <div>
                          <Link href={`/properties/${p.id}`} className="font-medium text-navy hover:text-primary line-clamp-1">
                            {p.title}
                          </Link>
                          <p className="text-xs text-amaken-gray">{p.location}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-amaken-gray">{p.type}</td>
                    <td className="px-4 py-3 font-medium text-navy hidden sm:table-cell">{p.price} {p.curr}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.status === "available" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-amaken-gray hidden md:table-cell">{p.date}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link href={`/properties/${p.id}`} className="text-primary hover:text-primary-600" title="View">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </Link>
                        <Link href={`/submit-property/${p.id}/edit`} className="text-amber-500 hover:text-amber-600" title="Edit">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </Link>
                        <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-600" title="Delete">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="rounded-lg border px-3 py-1 text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-amaken-gray">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="rounded-lg border px-3 py-1 text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
