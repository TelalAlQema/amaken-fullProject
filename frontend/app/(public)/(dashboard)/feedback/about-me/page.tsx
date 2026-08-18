"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { getFeedbackAboutMe } from "@/lib/api";
import type { Feedback } from "@amaken/shared";

export default function FeedbackAboutMePage() {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const { data } = await getFeedbackAboutMe();
        if (data.success && data.data) setFeedback(data.data as Feedback[]);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  if (!user) return null;

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-2 font-heading text-xl font-bold text-navy">Feedback About Me</h2>
      <p className="mb-6 text-sm text-amaken-gray">
        Reviews and feedback that others have left about you.
      </p>

      {loading ? (
        <div className="py-12 text-center text-amaken-gray">Loading...</div>
      ) : feedback.length === 0 ? (
        <div className="py-12 text-center text-amaken-gray">No feedback received yet.</div>
      ) : (
        <div className="space-y-4">
          {feedback.map((fb) => (
            <div key={fb.fid} className="rounded-lg border p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium text-navy">{fb.send_email}</span>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <svg key={i} className={`h-4 w-4 ${i < fb.rating ? "text-yellow-400" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-sm text-amaken-gray">{fb.fdescription}</p>
              <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                fb.status === 1 ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
              }`}>
                {fb.status === 1 ? "Approved" : "Pending"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
