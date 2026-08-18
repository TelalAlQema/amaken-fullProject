"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { createFeedback } from "@/lib/api";

export default function SubmitFeedbackPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [receiverEmail, setReceiverEmail] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      setError("Please select a rating");
      return;
    }
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const { data } = await createFeedback({
        receive_email: receiverEmail,
        fdescription: content,
        rating,
      });
      if (data.success) {
        setSuccess("Feedback submitted successfully");
        setTimeout(() => router.push("/feedback"), 1500);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit feedback");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-6 font-heading text-xl font-bold text-navy">Submit Feedback</h2>

      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>}
      {success && <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-600">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Receiver Email *</label>
          <input
            type="email"
            required
            value={receiverEmail}
            onChange={(e) => setReceiverEmail(e.target.value)}
            className="input-field"
            placeholder="agent@example.com"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Rating *</label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none"
              >
                <svg
                  className={`h-8 w-8 ${star <= (hoverRating || rating) ? "text-yellow-400" : "text-gray-300"}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Feedback *</label>
          <textarea
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="input-field"
            rows={7}
            maxLength={1500}
            placeholder="Share your experience..."
          />
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
            {loading ? "Submitting..." : "Submit Feedback"}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-outline">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
