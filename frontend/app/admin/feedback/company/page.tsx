"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Star } from "lucide-react";

interface Feedback {
  id: number;
  send_email?: string;
  receive_email?: string;
  rating?: number;
  description?: string;
  status?: string;
  created_at?: string;
}

function StarRating({ rating = 0 }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={16}
          className={i <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}
        />
      ))}
    </div>
  );
}

export default function CompanyFeedbackPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-company-feedback"],
    queryFn: async () => {
      try {
        const res = await api.get("/feedback/about-me");
        return res.data;
      } catch {
        const res = await api.get("/feedback/my");
        return res.data;
      }
    },
  });

  const items: Feedback[] = Array.isArray(data) ? data : data?.items ?? data?.data ?? [];

  return (
    <div className="bg-gray-50 p-6 min-h-screen">
      <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-6">
        <h1 className="text-2xl font-bold text-[#0d1432] mb-6">Company Feedback</h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#17c788] border-t-transparent" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-center text-gray-500 py-12">No feedback found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">ID</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">From</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Rating</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Description</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Date</th>
                </tr>
              </thead>
              <tbody>
                {items.map((f) => (
                  <tr key={f.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3">{f.id}</td>
                    <td className="px-4 py-3">{f.send_email ?? "-"}</td>
                    <td className="px-4 py-3">
                      <StarRating rating={f.rating ?? 0} />
                    </td>
                    <td className="px-4 py-3 max-w-[250px] truncate" title={f.description}>
                      {f.description ?? "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          f.status === "active"
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {f.status ?? "N/A"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {f.created_at ? new Date(f.created_at).toLocaleDateString() : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}