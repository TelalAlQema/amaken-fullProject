"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { getMyProperties, getMyFeedback, getFeedbackAboutMe, deactivateAccount, activateAccount, deleteAccount } from "@/lib/api";
import type { Property, Feedback } from "@amaken/shared";

export default function ProfilePage() {
  const { user, setUser, logout } = useAuth();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [feedbackAboutMe, setFeedbackAboutMe] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [propRes, fbRes, aboutRes] = await Promise.allSettled([
          getMyProperties({ limit: 5 }),
          getMyFeedback({ limit: 10 }),
          getFeedbackAboutMe({ limit: 10 }),
        ]);
        if (propRes.status === "fulfilled" && propRes.value.data.success) {
          setProperties(propRes.value.data.data as Property[]);
        }
        if (fbRes.status === "fulfilled" && fbRes.value.data.success) {
          setFeedback(fbRes.value.data.data as Feedback[]);
        }
        if (aboutRes.status === "fulfilled" && aboutRes.value.data.success) {
          setFeedbackAboutMe(aboutRes.value.data.data as Feedback[]);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (!user) return null;

  const imageUrl = user.uimage
    ? `/uploads/users/${user.uimage}`
    : "/images/user/default-user.jpg";

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-white p-6 shadow-md">
        <div className="flex flex-col items-center gap-6 md:flex-row">
          <img
            src={imageUrl}
            alt={`${user.uname} ${user.lname}`}
            className="h-28 w-28 rounded-full border-4 border-primary object-cover"
          />
          <div className="text-center md:text-left">
            <h2 className="font-heading text-2xl font-bold text-navy">
              {user.uname} {user.lname}
            </h2>
            <p className="text-amaken-gray">{user.uemail}</p>
            <div className="mt-2 flex flex-wrap justify-center gap-2 md:justify-start">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {user.utype}
              </span>
              {user.uphone && (
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-amaken-gray">
                  {user.uphone}
                </span>
              )}
              {user.city && user.state && (
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-amaken-gray">
                  {user.city}, {user.state}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow-md text-center">
          <div className="text-3xl font-bold text-primary">{properties.length}</div>
          <div className="text-sm text-amaken-gray">Properties</div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-md text-center">
          <div className="text-3xl font-bold text-primary">{feedback.length}</div>
          <div className="text-sm text-amaken-gray">Reviews Given</div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow-md text-center">
          <div className="text-3xl font-bold text-primary">{feedbackAboutMe.length}</div>
          <div className="text-sm text-amaken-gray">Reviews Received</div>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-md">
        <h3 className="mb-4 font-heading text-lg font-bold text-navy">Profile Details</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <span className="text-sm text-amaken-gray">Full Name</span>
            <p className="font-medium text-navy">{user.uname} {user.lname}</p>
          </div>
          <div>
            <span className="text-sm text-amaken-gray">Email</span>
            <p className="font-medium text-navy">{user.uemail}</p>
          </div>
          <div>
            <span className="text-sm text-amaken-gray">Phone</span>
            <p className="font-medium text-navy">{user.uphone || "Not provided"}</p>
          </div>
          <div>
            <span className="text-sm text-amaken-gray">WhatsApp</span>
            <p className="font-medium text-navy">{user.wphone || "Not provided"}</p>
          </div>
          <div>
            <span className="text-sm text-amaken-gray">Gender</span>
            <p className="font-medium text-navy">{user.ugender || "Not specified"}</p>
          </div>
          <div>
            <span className="text-sm text-amaken-gray">Date of Birth</span>
            <p className="font-medium text-navy">{user.dateofbirth || "Not provided"}</p>
          </div>
          <div>
            <span className="text-sm text-amaken-gray">Address</span>
            <p className="font-medium text-navy">{user.Address || "Not provided"}</p>
          </div>
          <div>
            <span className="text-sm text-amaken-gray">City / State</span>
            <p className="font-medium text-navy">
              {user.city && user.state ? `${user.city}, ${user.state}` : "Not provided"}
            </p>
          </div>
          {user.utype === "Agent" && (
            <>
              <div>
                <span className="text-sm text-amaken-gray">Company</span>
                <p className="font-medium text-navy">{user.company || "Not provided"}</p>
              </div>
              <div>
                <span className="text-sm text-amaken-gray">Company Address</span>
                <p className="font-medium text-navy">{user.Companyaddress || "Not provided"}</p>
              </div>
            </>
          )}
        </div>
        <div className="mt-6">
          <Link href="/profile/edit" className="btn-primary">
            Edit Profile
          </Link>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-heading text-lg font-bold text-navy">Recent Properties</h3>
          <Link href="/my-properties" className="text-sm font-medium text-primary hover:text-primary-600">
            View All
          </Link>
        </div>
        {loading ? (
          <div className="py-8 text-center text-amaken-gray">Loading...</div>
        ) : properties.length === 0 ? (
          <div className="py-8 text-center text-amaken-gray">
            <p>No properties yet.</p>
            <Link href="/submit-property" className="mt-2 inline-block text-sm font-medium text-primary hover:text-primary-600">
              Submit your first property
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {properties.slice(0, 5).map((p) => (
              <Link
                key={p.id}
                href={`/properties/${p.id}`}
                className="flex items-center gap-4 rounded-lg border p-3 transition-colors hover:bg-gray-50"
              >
                <img
                  src={p.pimage ? `/uploads/properties/${p.pimage}` : "/images/house-floor-plan.png"}
                  alt={p.title}
                  className="h-14 w-14 rounded object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium text-navy line-clamp-1">{p.title}</p>
                  <p className="text-sm text-amaken-gray">{p.location}</p>
                </div>
                <span className="text-sm font-semibold text-primary">{p.price} {p.curr}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-lg bg-white p-6 shadow-md">
        <h3 className="mb-4 font-heading text-lg font-bold text-navy">Social Links</h3>
        <div className="flex gap-3">
          {user.website && (
            <a href={user.website} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-amaken-gray hover:bg-gray-200">
              Website
            </a>
          )}
          {user.fb && (
            <a href={user.fb} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-amaken-gray hover:bg-gray-200">
              Facebook
            </a>
          )}
          {user.linkedin && (
            <a href={user.linkedin} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-amaken-gray hover:bg-gray-200">
              LinkedIn
            </a>
          )}
          {user.instagram && (
            <a href={user.instagram} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-amaken-gray hover:bg-gray-200">
              Instagram
            </a>
          )}
          {user.tiktok && (
            <a href={user.tiktok} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-amaken-gray hover:bg-gray-200">
              TikTok
            </a>
          )}
          {user.twitter && (
            <a href={user.twitter} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-amaken-gray hover:bg-gray-200">
              Twitter
            </a>
          )}
          {!user.website && !user.fb && !user.linkedin && !user.instagram && !user.tiktok && !user.twitter && (
            <p className="text-sm text-amaken-gray">No social links added yet.</p>
          )}
        </div>
        <div className="mt-4">
          <Link href="/profile/links" className="text-sm font-medium text-primary hover:text-primary-600">
            Edit Social Links
          </Link>
        </div>
      </div>

      <div className="rounded-lg border border-red-200 bg-white p-6 shadow-md">
        <h3 className="mb-4 font-heading text-lg font-bold text-red-600">Account Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={async () => {
              if (!confirm(user.deactivate === 0 ? "Reactivate your account?" : "Deactivate your account? You can reactivate later.")) return;
              try {
                const fn = user.deactivate === 0 ? activateAccount : deactivateAccount;
                const { data } = await fn();
                if (data.success) {
                  setUser({ ...user, deactivate: user.deactivate === 0 ? 1 : 0 });
                  alert(user.deactivate === 0 ? "Account reactivated" : "Account deactivated");
                }
              } catch {
                alert("Action failed");
              }
            }}
            className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100"
          >
            {user.deactivate === 0 ? "Deactivate Account" : "Reactivate Account"}
          </button>
          <button
            onClick={async () => {
              if (!confirm("DELETE your account? This action cannot be undone!")) return;
              if (!confirm("Are you REALLY sure? All your data will be permanently deleted.")) return;
              try {
                const { data } = await deleteAccount();
                if (data.success) {
                  logout();
                }
              } catch {
                alert("Delete failed");
              }
            }}
            className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
