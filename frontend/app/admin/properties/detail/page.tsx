"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  EyeOff,
  Eye,
  Snowflake,
  ExternalLink,
  MapPin,
  Bed,
  Bath,
  Maximize,
} from "lucide-react";
import { useGetPropertyQuery } from "@/lib/redux/api";
import {
  useApprovePropertyMutation,
  useDisapprovePropertyMutation,
  useHidePropertyMutation,
  useDisplayPropertyMutation,
  useFreezePropertyMutation,
  useReleasePropertyMutation,
  useAdminDeletePropertyMutation,
} from "@/lib/redux/adminApi";
import type { Property } from "@amaken/shared";
import { getAssetUrl } from "@/lib/utils";

function PropertyDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = Number(searchParams.get("id"));
  const [lightbox, setLightbox] = useState<string | null>(null);

  const { data: propertyResponse, isLoading } = useGetPropertyQuery(id, {
    skip: !id,
  });
  const property = propertyResponse?.data;

  const [approveMut, approveState] = useApprovePropertyMutation();
  const [disapproveMut, disapproveState] = useDisapprovePropertyMutation();
  const [hideMut, hideState] = useHidePropertyMutation();
  const [displayMut, displayState] = useDisplayPropertyMutation();
  const [freezeMut, freezeState] = useFreezePropertyMutation();
  const [releaseMut, releaseState] = useReleasePropertyMutation();

  const [deleteMutation, deleteState] = useAdminDeletePropertyMutation();

  if (isLoading) {
    return (
      <div className="bg-gray-50 p-6 min-h-screen">
        <div className="space-y-4">
          <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
          <div className="h-64 animate-pulse rounded-xl bg-gray-200" />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="bg-gray-50 p-6 min-h-screen">
        <p className="text-gray-500">Property not found.</p>
      </div>
    );
  }

  const images = [
    { key: "pimage", label: "Main", src: property.pimage },
    { key: "pimage1", label: "Image 2", src: property.pimage1 },
    { key: "pimage2", label: "Image 3", src: property.pimage2 },
    { key: "pimage3", label: "Image 4", src: property.pimage3 },
    { key: "pimage4", label: "Image 5", src: property.pimage4 },
  ].filter((img) => img.src);

  const handleDelete = () => {
    if (window.confirm("Delete this property? This cannot be undone.")) {
      deleteMutation(id)
        .unwrap()
        .then(() => router.push("/admin/properties"));
    }
  };

  const actionBtn = (label: string, fn: () => void, color: string, icon: React.ReactNode, loading?: boolean) => (
    <button
      onClick={fn}
      disabled={loading}
      className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 ${color}`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="bg-gray-50 p-6 min-h-screen">
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightbox(null)}
        >
          <img
            src={lightbox}
            alt="Enlarged"
            className="max-h-[90vh] max-w-full rounded-lg object-contain"
          />
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            href="/admin/properties"
            className="mb-2 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Properties
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{property.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/properties/edit?id=${id}`}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Pencil className="h-4 w-4" /> Edit
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleteState.isLoading}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>
      </div>

      {/* Badges */}
      <div className="mb-6 flex flex-wrap gap-2">
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
            property.status === "available" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {property.status}
        </span>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
            property.adminapproval === 1 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {property.adminapproval === 1 ? "Approved" : "Pending Approval"}
        </span>
        <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
          {property.type}
        </span>
        <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800">
          {property.stype}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Images + Description */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Images</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {images.map((img) => (
                <button
                  key={img.key}
                  onClick={() =>
                    setLightbox(getAssetUrl(`/uploads/properties/${img.src}`))
                  }
                  className="group relative overflow-hidden rounded-lg border border-gray-200"
                >
                  <img
                    src={getAssetUrl(`/uploads/properties/${img.src}`)}
                    alt={img.label}
                    className="h-32 w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <span className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1 text-center text-xs text-white">
                    {img.label}
                  </span>
                </button>
              ))}
            </div>
            {!images.length && (
              <p className="text-sm text-gray-400">No images uploaded.</p>
            )}
          </div>

          {/* Description */}
          <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Description</h2>
            <div className="prose prose-sm max-w-none text-gray-600">
              {property.pcontent || <span className="italic text-gray-400">No description</span>}
            </div>
          </div>

          {/* Owner Info */}
          <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Owner</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-900">{property.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">User ID</p>
                <p className="text-sm font-medium text-gray-900">#{property.uid}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Info + Actions */}
        <div className="space-y-6">
          {/* Price + Info */}
          <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-6">
            <p className="mb-1 text-2xl font-bold text-[#0d1432]">
              {property.curr} {Number(property.price).toLocaleString()}
            </p>
            <p className="mb-4 flex items-center gap-1 text-sm text-gray-500">
              <MapPin className="h-4 w-4" /> {property.location}, {property.city}, {property.state}
            </p>

            <div className="space-y-3 border-t border-gray-100 pt-4">
              {[
                ["Type", property.type],
                ["BHK", property.bhk],
                ["Plan", property.plan],
                ["Decoration", property.decoration],
                ["Selling Type", property.stype],
                ["Status", property.status],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-medium text-gray-900">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rooms */}
          <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Rooms & Size</h2>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  ["Bedroom", property.bedroom],
                  ["Bathroom", property.bathroom],
                  ["Balcony", property.balcony],
                  ["Kitchen", property.kitchen],
                  ["Hall", property.hall],
                  ["Floor", `${property.floor} / ${property.totalfloor}`],
                  ["Size", `${property.size} sqft`],
                ] as [string, string][]
              ).map(([label, val]) => (
                <div key={label} className="flex items-center gap-2 rounded-lg bg-gray-50 p-3">
                  <div>
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="text-sm font-medium text-gray-900">{val || "-"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Approval Actions */}
          <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Actions</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {actionBtn("Approve", () => approveMut(id).unwrap(), "bg-green-600 hover:bg-green-700", <CheckCircle className="h-4 w-4" />, approveState.isLoading)}
                {actionBtn("Disapprove", () => disapproveMut(id).unwrap(), "bg-red-600 hover:bg-red-700", <XCircle className="h-4 w-4" />, disapproveState.isLoading)}
                {actionBtn("Hide", () => hideMut(id).unwrap(), "bg-yellow-500 hover:bg-yellow-600", <EyeOff className="h-4 w-4" />, hideState.isLoading)}
                {actionBtn("Display", () => displayMut(id).unwrap(), "bg-emerald-600 hover:bg-emerald-700", <Eye className="h-4 w-4" />, displayState.isLoading)}
                {actionBtn("Freeze", () => freezeMut(id).unwrap(), "bg-blue-600 hover:bg-blue-700", <Snowflake className="h-4 w-4" />, freezeState.isLoading)}
                {actionBtn("Release", () => releaseMut(id).unwrap(), "bg-green-600 hover:bg-green-700", <ExternalLink className="h-4 w-4" />, releaseState.isLoading)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PropertyDetailPage() {
  return (
    <Suspense fallback={
      <div className="bg-gray-50 p-6 min-h-screen">
        <div className="space-y-4">
          <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
          <div className="h-64 animate-pulse rounded-xl bg-gray-200" />
        </div>
      </div>
    }>
      <PropertyDetailContent />
    </Suspense>
  );
}
