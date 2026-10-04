"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getUserProfile } from "@/lib/api";
import BreadcrumbBanner from "@/components/shared/BreadcrumbBanner";
import StarRating from "@/components/shared/StarRating";
import { ProfileSkeleton } from "@/components/shared/Skeletons";
import type { User } from "@amaken/shared";

export default function ProfileDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  const { data, isLoading } = useQuery({
    queryKey: ["user", id],
    queryFn: () => getUserProfile(id),
    enabled: !!id,
  });

  const user: User | undefined = data?.data?.data as User | undefined;

  if (isLoading) {
    return (
      <>
        <div className="h-64 animate-pulse bg-gray-200" />
        <div className="container-custom py-12"><ProfileSkeleton /></div>
      </>
    );
  }

  if (!user) {
    return (
      <div className="container-custom py-20 text-center">
        <h1 className="text-2xl font-bold text-navy">Profile Not Found</h1>
        <Link href="/properties" className="btn-primary mt-4 inline-flex">Browse Properties</Link>
      </div>
    );
  }

  return (
    <>
      <BreadcrumbBanner
        title={`${user.uname} ${user.lname}`}
        crumbs={[{ label: "Users", href: "/agents" }, { label: `${user.uname} ${user.lname}` }]}
      />

      <section className="py-12">
        <div className="container-custom max-w-2xl">
          <div className="card p-8">
            <div className="mb-6 text-center">
              <h2 className="text-xl font-bold text-navy">{user.uname} {user.lname}</h2>
              <p className="mt-1 text-sm capitalize text-primary">{user.utype}</p>
              {user.company && <p className="text-sm text-amaken-gray">{user.company}</p>}
            </div>

            <div className="mb-6 rounded-lg bg-gray-50 p-4">
              <h3 className="mb-3 font-semibold text-navy">Contact Information</h3>
              <div className="space-y-2 text-sm text-amaken-gray">
                <p>Email: {user.uemail}</p>
                {user.uphone && <p>Phone: {user.uphone}</p>}
                {user.city && <p>Location: {user.city}{user.state ? `, ${user.state}` : ""}</p>}
              </div>
            </div>

            {/* Feedback Form */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="mb-4 font-semibold text-navy">Leave Feedback</h3>
              <form className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-navy">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className="text-2xl text-gray-300 hover:text-yellow-400"
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-navy">Your Feedback</label>
                  <textarea
                    rows={4}
                    className="input-field resize-none"
                    placeholder="Share your experience with this user..."
                  />
                </div>
                <button type="submit" className="btn-primary">
                  Submit Feedback
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
