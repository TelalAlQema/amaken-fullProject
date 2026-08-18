"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Upload, Save } from "lucide-react";
import { api, updateProperty } from "@/lib/api";
import {
  PROPERTY_TYPES,
  SELLING_TYPES,
  BHK_OPTIONS,
  PLAN_TYPES,
  DECORATION_TYPES,
  CURRENCIES,
} from "@amaken/shared";
import type { Property, ApiResponse } from "@amaken/shared";

const STEPS = [
  "Basic Info",
  "Details",
  "Location",
  "Images",
  "Content",
] as const;

interface FormState {
  title: string;
  type: string;
  stype: string;
  bhk: string;
  plan: string;
  price: string;
  curr: string;
  decoration: string;
  status: string;
  bedroom: string;
  bathroom: string;
  balcony: string;
  kitchen: string;
  hall: string;
  floor: string;
  totalfloor: string;
  size: string;
  feature: string;
  location: string;
  city: string;
  state: string;
  pcontent: string;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-gray-200 py-2 px-3 text-sm focus:border-[#17c788] focus:outline-none focus:ring-1 focus:ring-[#17c788]"
    />
  );
}

function Select({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  placeholder?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-gray-200 py-2 px-3 text-sm focus:border-[#17c788] focus:outline-none focus:ring-1 focus:ring-[#17c788]"
    >
      <option value="">{placeholder || "Select..."}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>({
    title: "",
    type: "",
    stype: "",
    bhk: "",
    plan: "",
    price: "",
    curr: "AED",
    decoration: "",
    status: "available",
    bedroom: "",
    bathroom: "",
    balcony: "",
    kitchen: "",
    hall: "",
    floor: "",
    totalfloor: "",
    size: "",
    feature: "",
    location: "",
    city: "",
    state: "",
    pcontent: "",
  });
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [formReady, setFormReady] = useState(false);

  const { data: property, isLoading } = useQuery<Property>({
    queryKey: ["admin-property", id],
    queryFn: () =>
      api.get<ApiResponse<Property>>(`/properties/${id}`).then((r) => r.data.data as Property),
    enabled: !!id,
  });

  useEffect(() => {
    if (property && !formReady) {
      setForm({
        title: property.title || "",
        type: property.type || "",
        stype: property.stype || "",
        bhk: property.bhk || "",
        plan: property.plan || "",
        price: property.price || "",
        curr: property.curr || "AED",
        decoration: property.decoration || "",
        status: property.status || "available",
        bedroom: property.bedroom || "",
        bathroom: property.bathroom || "",
        balcony: property.balcony || "",
        kitchen: property.kitchen || "",
        hall: property.hall || "",
        floor: property.floor || "",
        totalfloor: property.totalfloor || "",
        size: property.size || "",
        feature: property.feature || "",
        location: property.location || "",
        city: property.city || "",
        state: property.state || "",
        pcontent: property.pcontent || "",
      });
      setFormReady(true);
    }
  }, [property, formReady]);

  const set = (key: keyof FormState) => (val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const setFile = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles((prev) => ({ ...prev, [key]: e.target.files?.[0] || null }));
  };

  const mutation = useMutation({
    mutationFn: () => {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        fd.append(k, v);
      });
      Object.entries(files).forEach(([k, v]) => {
        if (v) fd.append(k, v);
      });
      return updateProperty(id, fd);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-property", id] });
      router.push(`/admin/properties/${id}`);
    },
  });

  if (isLoading || !formReady) {
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

  const existingImages: { key: string; label: string; src: string }[] = [
    { key: "pimage", label: "Main", src: property.pimage },
    { key: "pimage1", label: "Image 2", src: property.pimage1 },
    { key: "pimage2", label: "Image 3", src: property.pimage2 },
    { key: "pimage3", label: "Image 4", src: property.pimage3 },
    { key: "pimage4", label: "Image 5", src: property.pimage4 },
  ];

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="bg-gray-50 p-6 min-h-screen">
      <div className="mb-6">
        <Link
          href={`/admin/properties/${id}`}
          className="mb-2 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Property
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Property</h1>
        <p className="text-sm text-gray-500">Update property listing</p>
      </div>

      <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-6">
        {/* Progress */}
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between text-sm text-gray-600">
            <span>
              Step {step + 1} of {STEPS.length}: {STEPS[step]}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-[#17c788] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between">
            {STEPS.map((s, i) => (
              <button
                key={s}
                onClick={() => setStep(i)}
                className={`text-xs ${i === step ? "font-semibold text-[#17c788]" : "text-gray-400"}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Step content */}
        <div className="min-h-[320px]">
          {step === 0 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Title">
                <Input value={form.title} onChange={set("title")} placeholder="Property title" />
              </Field>
              <Field label="Type">
                <Select value={form.type} onChange={set("type")} options={PROPERTY_TYPES} placeholder="Select type" />
              </Field>
              <Field label="Selling Type">
                <Select value={form.stype} onChange={set("stype")} options={SELLING_TYPES} placeholder="Select selling type" />
              </Field>
              <Field label="BHK">
                <Select value={form.bhk} onChange={set("bhk")} options={BHK_OPTIONS} placeholder="Select BHK" />
              </Field>
              <Field label="Plan">
                <Select value={form.plan} onChange={set("plan")} options={PLAN_TYPES} placeholder="Select plan" />
              </Field>
              <Field label="Price">
                <Input value={form.price} onChange={set("price")} placeholder="Price" type="number" />
              </Field>
              <Field label="Currency">
                <Select value={form.curr} onChange={set("curr")} options={CURRENCIES} />
              </Field>
              <Field label="Decoration">
                <Select value={form.decoration} onChange={set("decoration")} options={DECORATION_TYPES} placeholder="Select decoration" />
              </Field>
              <Field label="Status">
                <select
                  value={form.status}
                  onChange={(e) => set("status")(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 py-2 px-3 text-sm focus:border-[#17c788] focus:outline-none focus:ring-1 focus:ring-[#17c788]"
                >
                  <option value="available">Available</option>
                  <option value="sold out">Sold Out</option>
                </select>
              </Field>
            </div>
          )}

          {step === 1 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Bedroom">
                <Input value={form.bedroom} onChange={set("bedroom")} placeholder="e.g. 3" />
              </Field>
              <Field label="Bathroom">
                <Input value={form.bathroom} onChange={set("bathroom")} placeholder="e.g. 2" />
              </Field>
              <Field label="Balcony">
                <Input value={form.balcony} onChange={set("balcony")} placeholder="e.g. 1" />
              </Field>
              <Field label="Kitchen">
                <Input value={form.kitchen} onChange={set("kitchen")} placeholder="e.g. 1" />
              </Field>
              <Field label="Hall">
                <Input value={form.hall} onChange={set("hall")} placeholder="e.g. 1" />
              </Field>
              <Field label="Floor">
                <Input value={form.floor} onChange={set("floor")} placeholder="e.g. 5" />
              </Field>
              <Field label="Total Floor">
                <Input value={form.totalfloor} onChange={set("totalfloor")} placeholder="e.g. 12" />
              </Field>
              <Field label="Size (sqft)">
                <Input value={form.size} onChange={set("size")} placeholder="e.g. 1500" />
              </Field>
              <Field label="Feature">
                <Input value={form.feature} onChange={set("feature")} placeholder="Key features" />
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Location / Address">
                <Input value={form.location} onChange={set("location")} placeholder="Street / area" />
              </Field>
              <Field label="City">
                <Input value={form.city} onChange={set("city")} placeholder="e.g. Dubai" />
              </Field>
              <Field label="State / Emirate">
                <Input value={form.state} onChange={set("state")} placeholder="e.g. Dubai" />
              </Field>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {existingImages.map((img) => (
                  <Field key={img.key} label={img.label}>
                    <div className="space-y-2">
                      {img.src && (
                        <img
                          src={`/uploads/properties/${img.src}`}
                          alt={img.label}
                          className="h-24 w-full rounded-lg object-cover"
                        />
                      )}
                      <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-gray-200 p-3 transition-colors hover:border-[#17c788]">
                        <Upload className="h-5 w-5 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {files[img.key] ? files[img.key]!.name : img.src ? "Replace" : "Choose image"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={setFile(img.key)}
                        />
                      </label>
                    </div>
                  </Field>
                ))}
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  ["mapimage", "Map Image", property.mapimage],
                  ["topmapimage", "Top Map Image", property.topmapimage],
                  ["groundmapimage", "Ground Map Image", property.groundmapimage],
                ].map(([key, label, src]) => (
                  <Field key={key} label={label as string}>
                    <div className="space-y-2">
                      {src && (
                        <img
                          src={`/uploads/properties/${src}`}
                          alt={label as string}
                          className="h-24 w-full rounded-lg object-cover"
                        />
                      )}
                      <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-gray-200 p-3 transition-colors hover:border-[#17c788]">
                        <Upload className="h-5 w-5 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {files[key] ? files[key]!.name : src ? "Replace" : "Choose image"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={setFile(key)}
                        />
                      </label>
                    </div>
                  </Field>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <Field label="Description">
                <textarea
                  value={form.pcontent}
                  onChange={(e) => set("pcontent")(e.target.value)}
                  rows={10}
                  placeholder="Detailed property description..."
                  className="w-full rounded-lg border border-gray-200 py-2 px-3 text-sm focus:border-[#17c788] focus:outline-none focus:ring-1 focus:ring-[#17c788]"
                />
              </Field>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
          <button
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </button>

          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="flex items-center gap-2 rounded-lg bg-[#0d1432] px-4 py-2 text-sm font-medium text-white hover:bg-[#1a2248]"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              className="flex items-center gap-2 rounded-lg bg-[#17c788] px-4 py-2 text-sm font-medium text-white hover:bg-[#14b077] disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {mutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          )}
        </div>

        {mutation.isError && (
          <p className="mt-4 text-sm text-red-600">
            Failed to update property. Please try again.
          </p>
        )}
      </div>
    </div>
  );
}
