"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAdminAuth } from "@/components/providers/AdminAuthProvider";
import { getAdminProfile } from "@/lib/admin-api";
import type { Admin } from "@amaken/shared";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Building2,
  Globe,
  Edit,
  Camera,
  Shield,
  Link as LinkIcon,
} from "lucide-react";

export default function AdminProfilePage() {
  const { admin } = useAdminAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-profile"],
    queryFn: async () => {
      const { data } = await getAdminProfile();
      return data.success ? (data.data as Admin) : null;
    },
    initialData: admin as Admin | null,
  });

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const avatarUrl = data.aimage
    ? `/uploads/users/${data.aimage}`
    : "/images/user/default-user.jpg";

  const infoItems = [
    { label: "Phone", value: data.aphone, icon: Phone },
    { label: "WhatsApp", value: data.awphone, icon: Phone },
    { label: "Gender", value: data.agender, icon: User },
    { label: "Date of Birth", value: data.adateofbirth, icon: Calendar },
    { label: "Address", value: data.aAddress, icon: MapPin },
    { label: "Agency", value: data.agency, icon: Building2 },
    { label: "City", value: data.acity, icon: MapPin },
    { label: "State", value: data.astate, icon: MapPin },
    { label: "Website", value: data.website, icon: Globe },
    { label: "Company Address", value: data.acompanyAddress, icon: Building2 },
  ];

  const socialLinks = [
    { label: "Facebook", value: data.afb, color: "bg-blue-50 text-blue-600 hover:bg-blue-100" },
    { label: "Instagram", value: data.ainstagram, color: "bg-pink-50 text-pink-600 hover:bg-pink-100" },
    { label: "Twitter", value: data.atwitter, color: "bg-sky-50 text-sky-600 hover:bg-sky-100" },
    { label: "LinkedIn", value: data.alinkedin, color: "bg-blue-50 text-blue-700 hover:bg-blue-100" },
    { label: "TikTok", value: data.atiktok, color: "bg-gray-100 text-gray-800 hover:bg-gray-200" },
  ].filter((s) => s.value);

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100">
        <div className="h-32 bg-gradient-to-r from-navy to-primary" />
        <div className="relative px-6 pb-6">
          <div className="-mt-16 flex flex-col items-center gap-4 sm:flex-row sm:items-end">
            <img
              src={avatarUrl}
              alt={`${data.aname} ${data.alname}`}
              className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-md"
            />
            <div className="flex-1 text-center sm:text-left pb-2">
              <h1 className="font-heading text-2xl font-bold text-navy">
                {data.aname} {data.alname}
              </h1>
              <p className="text-amaken-gray">{data.aemail}</p>
              <span className="mt-1 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {data.atype}
              </span>
            </div>
            <div className="flex gap-2 pb-2">
              <Link
                href="/admin/profile/edit"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600 transition-colors"
              >
                <Edit className="h-4 w-4" />
                Edit Profile
              </Link>
              <Link
                href="/admin/profile/picture"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-navy hover:bg-gray-50 transition-colors"
              >
                <Camera className="h-4 w-4" />
                Photo
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {infoItems.map((item) => (
          <div
            key={item.label}
            className="rounded-xl bg-white shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-amaken-gray">{item.label}</p>
                <p className="font-medium text-navy">
                  {item.value || "Not provided"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {socialLinks.length > 0 && (
        <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-6">
          <div className="mb-4 flex items-center gap-2">
            <LinkIcon className="h-5 w-5 text-primary" />
            <h2 className="font-heading text-lg font-bold text-navy">
              Social Links
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.value!}
                target="_blank"
                rel="noopener noreferrer"
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${link.color}`}
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="mt-4">
            <Link
              href="/admin/profile/links"
              className="text-sm font-medium text-primary hover:text-primary-600"
            >
              Edit Social Links
            </Link>
          </div>
        </div>
      )}

      <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-6">
        <h2 className="mb-4 font-heading text-lg font-bold text-navy">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/profile/password"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-navy hover:bg-gray-50 transition-colors"
          >
            <Shield className="h-4 w-4" />
            Change Password
          </Link>
          <Link
            href="/admin/profile/logo"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-navy hover:bg-gray-50 transition-colors"
          >
            <Building2 className="h-4 w-4" />
            Change Logo
          </Link>
          <Link
            href="/admin/profile/links"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-navy hover:bg-gray-50 transition-colors"
          >
            <LinkIcon className="h-4 w-4" />
            Social Links
          </Link>
        </div>
      </div>
    </div>
  );
}
