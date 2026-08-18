"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { createProperty } from "@/lib/api";
import { PROPERTY_TYPES, SELLING_TYPES, BHK_OPTIONS, PLAN_TYPES, DECORATION_TYPES, CURRENCIES } from "@amaken/shared";

const STEPS = ["Basic Info", "Price & Location", "Features", "Images", "Review"];

export default function SubmitPropertyPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imagePreviews, setImagePreviews] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    pcontent: "",
    type: "Apartment",
    stype: "sale",
    bhk: "1 BHK",
    bedroom: "",
    bathroom: "",
    balcony: "",
    kitchen: "",
    hall: "",
    floor: "",
    price: "",
    curr: "AED",
    city: "",
    state: "",
    location: "",
    totalfloor: "",
    size: "",
    feature: "",
    status: "available",
    plan: "",
    decoration: "",
    video1: "",
    video2: "",
    video3: "",
    brochure: "",
    isFeatured: "0",
    specialoffer: "0",
  });

  const [images, setImages] = useState<Record<string, File | null>>({
    aimage: null, aimage1: null, aimage2: null, aimage3: null, aimage4: null,
    fimage: null, fimage1: null, fimage2: null,
  });

  const update = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleImageChange = (field: string, file: File | null) => {
    setImages((prev) => ({ ...prev, [field]: file }));
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreviews((prev) => ({ ...prev, [field]: ev.target?.result as string }));
      reader.readAsDataURL(file);
    } else {
      setImagePreviews((prev) => { const n = { ...prev }; delete n[field]; return n; });
    }
  };

  const handleSubmit = async () => {
    if (!images.aimage || !images.aimage1 || !images.aimage2 || !images.aimage3 || !images.aimage4) {
      setError("Please upload all 5 required property images");
      setStep(3);
      return;
    }
    setError("");
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
      Object.entries(images).forEach(([k, v]) => { if (v) fd.append(k, v); });
      const { data } = await createProperty(fd);
      if (data.success) {
        router.push("/my-properties");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit property");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-6 font-heading text-xl font-bold text-navy">Submit New Property</h2>

      <div className="mb-8 flex items-center">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
              i <= step ? "bg-primary text-white" : "bg-gray-200 text-gray-500"
            }`}>
              {i < step ? "\u2713" : i + 1}
            </div>
            <span className={`ml-2 hidden text-xs sm:inline ${i <= step ? "font-medium text-navy" : "text-gray-400"}`}>{s}</span>
            {i < STEPS.length - 1 && <div className={`mx-2 h-0.5 w-6 sm:w-12 ${i < step ? "bg-primary" : "bg-gray-200"}`} />}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      <div className="space-y-4">
        {step === 0 && (
          <>
            <h3 className="text-sm font-semibold text-navy">Basic Information</h3>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Title *</label>
              <input type="text" required value={formData.title} onChange={(e) => update("title", e.target.value)} className="input-field" placeholder="Property title" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
              <textarea value={formData.pcontent} onChange={(e) => update("pcontent", e.target.value)} className="input-field" rows={4} placeholder="Describe the property..." />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Property Type *</label>
                <select value={formData.type} onChange={(e) => update("type", e.target.value)} className="select-field">
                  {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">For *</label>
                <select value={formData.stype} onChange={(e) => update("stype", e.target.value)} className="select-field">
                  {SELLING_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">BHK *</label>
                <select value={formData.bhk} onChange={(e) => update("bhk", e.target.value)} className="select-field">
                  {BHK_OPTIONS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {[
                { label: "Bedroom", field: "bedroom" },
                { label: "Bathroom", field: "bathroom" },
                { label: "Balcony", field: "balcony" },
                { label: "Kitchen", field: "kitchen" },
                { label: "Hall", field: "hall" },
              ].map(({ label, field }) => (
                <div key={field}>
                  <label className="mb-1 block text-sm font-medium text-gray-700">{label} *</label>
                  <input type="text" required value={formData[field as keyof typeof formData]} onChange={(e) => update(field, e.target.value)} className="input-field" />
                </div>
              ))}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h3 className="text-sm font-semibold text-navy">Price & Location</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Price *</label>
                <input type="text" required value={formData.price} onChange={(e) => update("price", e.target.value.replace(/\D/g, ""))} className="input-field" placeholder="0" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Currency *</label>
                <select value={formData.curr} onChange={(e) => update("curr", e.target.value)} className="select-field">
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">City *</label>
                <input type="text" required value={formData.city} onChange={(e) => update("city", e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">State *</label>
                <input type="text" required value={formData.state} onChange={(e) => update("state", e.target.value)} className="input-field" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Location *</label>
              <input type="text" required value={formData.location} onChange={(e) => update("location", e.target.value)} className="input-field" placeholder="Full address or area" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Floor *</label>
                <input type="text" required value={formData.floor} onChange={(e) => update("floor", e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Total Floors</label>
                <input type="text" value={formData.totalfloor} onChange={(e) => update("totalfloor", e.target.value)} className="input-field" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Size (sqft) *</label>
              <input type="text" required value={formData.size} onChange={(e) => update("size", e.target.value.replace(/\D/g, ""))} className="input-field" />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h3 className="text-sm font-semibold text-navy">Features & Amenities</h3>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Features/Amenities</label>
              <textarea value={formData.feature} onChange={(e) => update("feature", e.target.value)} className="input-field" rows={4} placeholder="List features and amenities..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Plan</label>
                <select value={formData.plan} onChange={(e) => update("plan", e.target.value)} className="select-field">
                  <option value="">Select</option>
                  {PLAN_TYPES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Decoration</label>
                <select value={formData.decoration} onChange={(e) => update("decoration", e.target.value)} className="select-field">
                  <option value="">Select</option>
                  {DECORATION_TYPES.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Video/Brochure URLs</label>
              <div className="space-y-2">
                <input type="url" value={formData.video1} onChange={(e) => update("video1", e.target.value)} className="input-field" placeholder="Video URL 1" />
                <input type="url" value={formData.video2} onChange={(e) => update("video2", e.target.value)} className="input-field" placeholder="Video URL 2" />
                <input type="url" value={formData.video3} onChange={(e) => update("video3", e.target.value)} className="input-field" placeholder="Video URL 3" />
                <input type="url" value={formData.brochure} onChange={(e) => update("brochure", e.target.value)} className="input-field" placeholder="Brochure URL" />
              </div>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h3 className="text-sm font-semibold text-navy">Property Images & Status</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                { field: "aimage", label: "Image 1 *", required: true },
                { field: "aimage1", label: "Image 2 *", required: true },
                { field: "aimage2", label: "Image 3 *", required: true },
                { field: "aimage3", label: "Image 4 *", required: true },
                { field: "aimage4", label: "Image 5 *", required: true },
                { field: "fimage", label: "Floor Plan", required: false },
                { field: "fimage1", label: "Basement Floor Plan", required: false },
                { field: "fimage2", label: "Ground Floor Plan", required: false },
              ].map(({ field, label, required }) => (
                <div key={field}>
                  <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
                  <input
                    type="file"
                    required={required}
                    accept="image/*"
                    onChange={(e) => handleImageChange(field, e.target.files?.[0] || null)}
                    className="input-field file:mr-4 file:rounded-lg file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary hover:file:bg-primary/20"
                  />
                  {imagePreviews[field] && (
                    <img src={imagePreviews[field]} alt="Preview" className="mt-2 h-24 w-24 rounded object-cover" />
                  )}
                </div>
              ))}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Status *</label>
              <select value={formData.status} onChange={(e) => update("status", e.target.value)} className="select-field">
                <option value="available">Available</option>
                <option value="sold out">Sold Out</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Featured</label>
                <select value={formData.isFeatured} onChange={(e) => update("isFeatured", e.target.value)} className="select-field">
                  <option value="0">No</option>
                  <option value="1">Yes</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Special Offer</label>
                <select value={formData.specialoffer} onChange={(e) => update("specialoffer", e.target.value)} className="select-field">
                  <option value="0">No</option>
                  <option value="1">Yes</option>
                </select>
              </div>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h3 className="mb-4 text-sm font-semibold text-navy">Review & Submit</h3>
            <div className="space-y-3 rounded-lg bg-gray-50 p-4 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-amaken-gray">Title:</span> <span className="font-medium">{formData.title || "-"}</span></div>
                <div><span className="text-amaken-gray">Type:</span> <span className="font-medium">{formData.type}</span></div>
                <div><span className="text-amaken-gray">For:</span> <span className="font-medium">{formData.stype}</span></div>
                <div><span className="text-amaken-gray">BHK:</span> <span className="font-medium">{formData.bhk}</span></div>
                <div><span className="text-amaken-gray">Price:</span> <span className="font-medium">{formData.price} {formData.curr}</span></div>
                <div><span className="text-amaken-gray">City:</span> <span className="font-medium">{formData.city || "-"}</span></div>
                <div><span className="text-amaken-gray">Location:</span> <span className="font-medium">{formData.location || "-"}</span></div>
                <div><span className="text-amaken-gray">Status:</span> <span className="font-medium">{formData.status}</span></div>
              </div>
            </div>
          </>
        )}

        <div className="flex gap-3 pt-6">
          {step > 0 && (
            <button type="button" onClick={() => setStep(step - 1)} className="btn-outline">
              Previous
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button type="button" onClick={() => setStep(step + 1)} className="btn-primary">
              Next
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading} className="btn-primary disabled:cursor-not-allowed disabled:opacity-50">
              {loading ? "Submitting..." : "Submit Property"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
