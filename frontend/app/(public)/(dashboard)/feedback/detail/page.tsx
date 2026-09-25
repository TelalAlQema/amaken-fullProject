"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useGetFeedbackQuery } from "@/lib/redux/api";
import type { Feedback } from "@amaken/shared";

function ViewFeedbackContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = Number(searchParams.get("id"));
  const { data, isLoading } = useGetFeedbackQuery(id, { skip: !id });

  const fb = (data?.success ? data.data : null) as Feedback | null;

  if (!user) return null;

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-6 font-heading text-xl font-bold text-navy">View Feedback</h2>

      {isLoading ? (
        <div className="py-12 text-center text-amaken-gray">Loading...</div>
      ) : !fb ? (
        <div className="py-12 text-center text-amaken-gray">Feedback not found.</div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-sm text-amaken-gray">From:</span>
              <span className="font-medium text-navy">{fb.send_email}</span>
            </div>
            <div className="mb-3 flex items-center gap-2">
              <span className="text-sm text-amaken-gray">To:</span>
              <span className="font-medium text-navy">{fb.receive_email}</span>
            </div>
            <div className="mb-3 flex items-center gap-2">
              <span className="text-sm text-amaken-gray">Rating:</span>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <svg key={i} className={`h-5 w-5 ${i < fb.rating ? "text-yellow-400" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
            <div className="mb-3 flex items-center gap-2">
              <span className="text-sm text-amaken-gray">Status:</span>
              <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                fb.status === 1 ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
              }`}>
                {fb.status === 1 ? "Approved" : "Pending"}
              </span>
            </div>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold text-navy">Feedback Content</h3>
            <p className="rounded-lg bg-gray-50 p-4 text-sm text-amaken-gray">{fb.fdescription}</p>
          </div>
          <div className="flex gap-3">
            {fb.send_email === user.uemail && (
              <Link href={`/feedback/edit?id=${fb.fid}`} className="btn-primary">
                Edit Feedback
              </Link>
            )}
            <button onClick={() => router.back()} className="btn-outline">
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ViewFeedbackPage() {
  return (
    <Suspense fallback={<div className="rounded-lg bg-white p-6 shadow-md text-center text-amaken-gray">Loading...</div>}>
      <ViewFeedbackContent />
    </Suspense>
  );
}
