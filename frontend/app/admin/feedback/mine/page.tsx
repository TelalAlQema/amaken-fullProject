"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Star, Trash2 } from "lucide-react";

interface Feedback {
  id: number;
  send_email?: string;
  receive_email?: string;
  rating?: number;
  description?: string;
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

export default function MyFeedbackPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-my-feedback"],
    queryFn: () => api.get("/feedback/my").then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/feedback/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-my-feedback"] });
    },
  });

  const items: Feedback[] = Array.isArray(data) ? data : data?.items ?? data?.data ?? [];

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this feedback?")) return;
    deleteMutation.mutate(id);
  };

  return (
    <div className="bg-gray-50 p-6 min-h-screen">
      <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-6">
        <h1 className="text-2xl font-bold text-[#0d1432] mb-6">My Feedback</h1>

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
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">To</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Rating</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Description</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((f) => (
                  <tr key={f.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3">{f.id}</td>
                    <td className="px-4 py-3">{f.receive_email ?? "-"}</td>
                    <td className="px-4 py-3">
                      <StarRating rating={f.rating ?? 0} />
                    </td>
                    <td className="px-4 py-3 max-w-[250px] truncate" title={f.description}>
                      {f.description ?? "-"}
                    </td>
                    <td className="px-4 py-3">
                      {f.created_at ? new Date(f.created_at).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(f.id)}
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
        )}
      </div>
    </div>
  );
}