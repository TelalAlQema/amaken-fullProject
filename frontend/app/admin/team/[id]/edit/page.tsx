"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import { api } from "@/lib/api";
import { adminUpdateTeamMember } from "@/lib/admin-api";
import type { TeamMember, ApiResponse } from "@amaken/shared";
import { ArrowLeft, Upload, X } from "lucide-react";
import Link from "next/link";

interface FormState {
  fname: string;
  lname: string;
  email: string;
  wnumber: string;
  pnumber: string;
  about: string;
  type: "leader" | "Team";
  position: string;
  fb: string;
  ig: string;
  linkdin: string;
  tiktok: string;
  twitter: string;
}

export default function EditTeamMemberPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [form, setForm] = useState<FormState>({
    fname: "",
    lname: "",
    email: "",
    wnumber: "",
    pnumber: "",
    about: "",
    type: "Team",
    position: "",
    fb: "",
    ig: "",
    linkdin: "",
    tiktok: "",
    twitter: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const { data: response, isLoading: fetching } = useQuery<ApiResponse<TeamMember[]>>({
    queryKey: ["admin-team"],
    queryFn: () => api.get("/team").then((r) => r.data),
  });

  const member = (response?.data ?? []).find((m) => m.id === id);

  useEffect(() => {
    if (member && !initialized) {
      setForm({
        fname: member.fname ?? "",
        lname: member.lname ?? "",
        email: member.email ?? "",
        wnumber: member.wnumber ?? "",
        pnumber: member.pnumber ?? "",
        about: member.about ?? "",
        type: member.type ?? "Team",
        position: member.position ?? "",
        fb: member.fb ?? "",
        ig: member.ig ?? "",
        linkdin: member.linkdin ?? "",
        tiktok: member.tiktok ?? "",
        twitter: member.twitter ?? "",
      });
      if (member.image) {
        setPreview(member.image);
      }
      setInitialized(true);
    }
  }, [member, initialized]);

  const set = (key: keyof FormState) => (val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    if (selected) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selected);
    }
  };

  const mutation = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v) fd.append(k, v);
      });
      if (file) fd.append("image", file);
      return adminUpdateTeamMember(id, fd);
    },
    onSuccess: () => router.push("/admin/team"),
  });

  if (fetching) {
    return (
      <div className="bg-gray-50 p-6 min-h-screen">
        <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-6">
          <div className="space-y-4">
            <div className="h-5 w-48 animate-pulse rounded bg-gray-200" />
            <div className="h-10 w-full animate-pulse rounded bg-gray-200" />
            <div className="h-10 w-full animate-pulse rounded bg-gray-200" />
            <div className="h-24 w-full animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="bg-gray-50 p-6 min-h-screen">
        <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-12 text-center">
          <p className="text-sm text-gray-500">Team member not found.</p>
          <Link
            href="/admin/team"
            className="mt-4 inline-flex items-center gap-1.5 text-sm text-[#17c788] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Team
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-6 min-h-screen">
      <div className="mb-6">
        <Link
          href="/admin/team"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Team
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Edit Team Member</h1>
      </div>

      <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-6">
        <div className="space-y-6">
          {/* Photo */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Photo
            </label>
            {preview ? (
              <div className="relative inline-block">
                <img
                  src={preview}
                  alt="Preview"
                  className="h-24 w-24 rounded-full object-cover"
                />
                <button
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                  }}
                  className="absolute -right-1 -top-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-dashed border-gray-200 p-6 transition-colors hover:border-[#17c788]">
                <Upload className="h-6 w-6 text-gray-400" />
                <span className="text-sm text-gray-500">Choose a photo</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            )}
          </div>

          {/* Name */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.fname}
                onChange={(e) => set("fname")(e.target.value)}
                placeholder="First name"
                className="w-full rounded-lg border border-gray-200 py-2.5 px-3 text-sm focus:border-[#17c788] focus:outline-none focus:ring-1 focus:ring-[#17c788]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.lname}
                onChange={(e) => set("lname")(e.target.value)}
                placeholder="Last name"
                className="w-full rounded-lg border border-gray-200 py-2.5 px-3 text-sm focus:border-[#17c788] focus:outline-none focus:ring-1 focus:ring-[#17c788]"
              />
            </div>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set("email")(e.target.value)}
                placeholder="Email address"
                className="w-full rounded-lg border border-gray-200 py-2.5 px-3 text-sm focus:border-[#17c788] focus:outline-none focus:ring-1 focus:ring-[#17c788]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Position <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.position}
                onChange={(e) => set("position")(e.target.value)}
                placeholder="e.g. CEO, Developer"
                className="w-full rounded-lg border border-gray-200 py-2.5 px-3 text-sm focus:border-[#17c788] focus:outline-none focus:ring-1 focus:ring-[#17c788]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                WhatsApp Number
              </label>
              <input
                type="text"
                value={form.wnumber}
                onChange={(e) => set("wnumber")(e.target.value)}
                placeholder="WhatsApp number"
                className="w-full rounded-lg border border-gray-200 py-2.5 px-3 text-sm focus:border-[#17c788] focus:outline-none focus:ring-1 focus:ring-[#17c788]"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="text"
                value={form.pnumber}
                onChange={(e) => set("pnumber")(e.target.value)}
                placeholder="Phone number"
                className="w-full rounded-lg border border-gray-200 py-2.5 px-3 text-sm focus:border-[#17c788] focus:outline-none focus:ring-1 focus:ring-[#17c788]"
              />
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Type <span className="text-red-500">*</span>
            </label>
            <select
              value={form.type}
              onChange={(e) => set("type")(e.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2.5 px-3 text-sm focus:border-[#17c788] focus:outline-none focus:ring-1 focus:ring-[#17c788]"
            >
              <option value="Team">Team</option>
              <option value="leader">Leader</option>
            </select>
          </div>

          {/* About */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              About
            </label>
            <textarea
              value={form.about}
              onChange={(e) => set("about")(e.target.value)}
              rows={4}
              placeholder="Brief description about this team member..."
              className="w-full rounded-lg border border-gray-200 py-2.5 px-3 text-sm focus:border-[#17c788] focus:outline-none focus:ring-1 focus:ring-[#17c788]"
            />
          </div>

          {/* Social Links */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-gray-700">Social Links</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(
                [
                  ["fb", "Facebook"],
                  ["ig", "Instagram"],
                  ["linkdin", "LinkedIn"],
                  ["tiktok", "TikTok"],
                  ["twitter", "Twitter"],
                ] as const
              ).map(([key, label]) => (
                <div key={key}>
                  <label className="mb-1.5 block text-xs font-medium text-gray-500">
                    {label}
                  </label>
                  <input
                    type="text"
                    value={form[key]}
                    onChange={(e) => set(key)(e.target.value)}
                    placeholder={`${label} URL`}
                    className="w-full rounded-lg border border-gray-200 py-2 px-3 text-sm focus:border-[#17c788] focus:outline-none focus:ring-1 focus:ring-[#17c788]"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3 border-t border-gray-100 pt-6">
            <button
              onClick={() => mutation.mutate()}
              disabled={
                !form.fname ||
                !form.lname ||
                !form.email ||
                !form.position ||
                mutation.isPending
              }
              className="inline-flex items-center gap-2 rounded-lg bg-[#17c788] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#15b078] disabled:opacity-50"
            >
              <Upload className="h-4 w-4" />
              {mutation.isPending ? "Saving..." : "Save Changes"}
            </button>
            <Link
              href="/admin/team"
              className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
          </div>

          {mutation.isError && (
            <p className="text-sm text-red-600">
              Failed to update team member. Please try again.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
