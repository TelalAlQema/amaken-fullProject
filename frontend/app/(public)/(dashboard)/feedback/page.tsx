"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { getMyFeedback, deleteFeedback } from "@/lib/api";
import type { Feedback } from "@amaken/shared";

export default function MyFeedbackPage() {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const { data } = await getMyFeedback();
      if (data.success && data.data) {
        setFeedback(data.data as Feedback[]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFeedback(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this feedback?")) return;
    try {
      await deleteFeedback(id);
      fetchFeedback();
    } catch {
      alert("Failed to delete feedback");
    }
  };

  if (!user) return null;

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-2 font-heading text-xl font-bold text-navy">My Feedback</h2>
      <p className="mb-6 text-sm text-amaken-gray">
        Feedback with status &quot;Approved&quot; will appear on testimonials.
      </p>

      {loading ? (
        <div className="py-12 text-center text-amaken-gray">Loading...</div>
      ) : feedback.length === 0 ? (
        <div className="py-12 text-center text-amaken-gray">
          <p>No feedback yet.</p>
          <Link href="/agents" className="mt-2 inline-block text-primary hover:text-primary-600">
            Browse agents to leave feedback
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-xs uppercase text-amaken-gray">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Receiver</th>
                <th className="px-4 py-3 hidden sm:table-cell">Feedback</th>
                <th className="px-4 py-3">Rating</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {feedback.map((fb, i) => (
                <tr key={fb.fid} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-amaken-gray">{i + 1}</td>
                  <td className="px-4 py-3">
                    <Link href={`/users/0?email=${encodeURIComponent(fb.receive_email)}`} className="font-medium text-navy hover:text-primary">
                      {fb.receive_email}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-amaken-gray line-clamp-1 hidden sm:table-cell max-w-xs">
                    {fb.fdescription}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }, (_, i) => (
                        <svg key={i} className={`h-4 w-4 ${i < fb.rating ? "text-yellow-400" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      fb.status === 1 ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {fb.status === 1 ? "Approved" : "Pending"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link href={`/feedback/${fb.fid}/edit`} className="text-primary hover:text-primary-600" title="Edit">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </Link>
                      <button onClick={() => handleDelete(fb.fid)} className="text-red-500 hover:text-red-600" title="Delete">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
