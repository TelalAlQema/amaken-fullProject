"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { getProperty, updateProperty } from "@/lib/api";
import { PROPERTY_TYPES, SELLING_TYPES, BHK_OPTIONS, PLAN_TYPES, DECORATION_TYPES, CURRENCIES } from "@amaken/shared";

export default function EditPropertyPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    title: "", pcontent: "", type: "Apartment", stype: "sale", bhk: "1 BHK",
    bedroom: "", bathroom: "", balcony: "", kitchen: "", hall: "", floor: "",
    price: "", curr: "AED", city: "", state: "", location: "", totalfloor: "",
    size: "", feature: "", status: "available", plan: "", decoration: "",
    video1: "", video2: "", video3: "", brochure: "", isFeatured: "0", specialoffer: "0",
  });

  const [images, setImages] = useState<Record<string, File | null>>({
    aimage: null, aimage1: null, aimage2: null, aimage3: null, aimage4: null,
    fimage: null, fimage1: null, fimage2: null,
  });
  const [imagePreviews, setImagePreviews] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchProperty() {
      try {
        const { data } = await getProperty(id);
        if (data.success && data.data) {
          const p = data.data;
          setFormData({
            title: p.title || "", pcontent: p.pcontent || "", type: p.type || "Apartment",
            stype: p.stype || "sale", bhk: p.bhk || "1 BHK",
            bedroom: p.bedroom || "", bathroom: p.bathroom || "", balcony: p.balcony || "",
            kitchen: p.kitchen || "", hall: p.hall || "", floor: p.floor || "",
            price: p.price || "", curr: p.curr || "AED", city: p.city || "",
            state: p.state || "", location: p.location || "", totalfloor: p.totalfloor || "",
            size: p.size || "", feature: p.feature || "", status: p.status || "available",
            plan: p.plan || "", decoration: p.decoration || "",
            video1: p.video1 || "", video2: p.video2 || "", video3: p.video3 || "",
            brochure: p.brochure || "", isFeatured: String(p.isFeatured || 0),
            specialoffer: String(p.offer || 0),
          });
          const imgs: Record<string, string> = {};
          if (p.pimage) imgs.aimage = `/uploads/properties/${p.pimage}`;
          if (p.pimage1) imgs.aimage1 = `/uploads/properties/${p.pimage1}`;
          if (p.pimage2) imgs.aimage2 = `/uploads/properties/${p.pimage2}`;
          if (p.pimage3) imgs.aimage3 = `/uploads/properties/${p.pimage3}`;
          if (p.pimage4) imgs.aimage4 = `/uploads/properties/${p.pimage4}`;
          if (p.mapimage) imgs.fimage = `/uploads/properties/${p.mapimage}`;
          if (p.topmapimage) imgs.fimage1 = `/uploads/properties/${p.topmapimage}`;
          if (p.groundmapimage) imgs.fimage2 = `/uploads/properties/${p.groundmapimage}`;
          setImagePreviews(imgs);
        }
      } catch {
        setError("Failed to load property");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchProperty();
  }, [id]);

  const update = (field: string, value: string) => setFormData((prev) => ({ ...prev, [field]: value }));

  const handleImageChange = (field: string, file: File | null) => {
    setImages((prev) => ({ ...prev, [field]: file }));
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreviews((prev) => ({ ...prev, [field]: ev.target?.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
      Object.entries(images).forEach(([k, v]) => { if (v) fd.append(k, v); });
      const { data } = await updateProperty(id, fd);
      if (data.success) {
        setSuccess("Property updated successfully");
        setTimeout(() => router.push("/my-properties"), 1500);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="rounded-lg bg-white p-6 shadow-md text-center text-amaken-gray">Loading...</div>;
  if (!user) return null;

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-6 font-heading text-xl font-bold text-navy">Edit Property</h2>

      {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>}
      {success && <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-600">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Title *</label>
          <input type="text" required value={formData.title} onChange={(e) => update("title", e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
          <textarea value={formData.pcontent} onChange={(e) => update("pcontent", e.target.value)} className="input-field" rows={4} />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Type</label>
            <select value={formData.type} onChange={(e) => update("type", e.target.value)} className="select-field">
              {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">For</label>
            <select value={formData.stype} onChange={(e) => update("stype", e.target.value)} className="select-field">
              {SELLING_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">BHK</label>
            <select value={formData.bhk} onChange={(e) => update("bhk", e.target.value)} className="select-field">
              {BHK_OPTIONS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {[
            { l: "Bedroom", f: "bedroom" }, { l: "Bathroom", f: "bathroom" },
            { l: "Balcony", f: "balcony" }, { l: "Kitchen", f: "kitchen" }, { l: "Hall", f: "hall" },
          ].map(({ l, f }) => (
            <div key={f}>
              <label className="mb-1 block text-sm font-medium text-gray-700">{l}</label>
              <input type="text" value={formData[f as keyof typeof formData]} onChange={(e) => update(f, e.target.value)} className="input-field" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="mb-1 block text-sm font-medium text-gray-700">Price *</label><input type="text" required value={formData.price} onChange={(e) => update("price", e.target.value.replace(/\D/g, ""))} className="input-field" /></div>
          <div><label className="mb-1 block text-sm font-medium text-gray-700">Currency</label><select value={formData.curr} onChange={(e) => update("curr", e.target.value)} className="select-field">{CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="mb-1 block text-sm font-medium text-gray-700">City *</label><input type="text" required value={formData.city} onChange={(e) => update("city", e.target.value)} className="input-field" /></div>
          <div><label className="mb-1 block text-sm font-medium text-gray-700">State *</label><input type="text" required value={formData.state} onChange={(e) => update("state", e.target.value)} className="input-field" /></div>
        </div>
        <div><label className="mb-1 block text-sm font-medium text-gray-700">Location *</label><input type="text" required value={formData.location} onChange={(e) => update("location", e.target.value)} className="input-field" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="mb-1 block text-sm font-medium text-gray-700">Floor</label><input type="text" value={formData.floor} onChange={(e) => update("floor", e.target.value)} className="input-field" /></div>
          <div><label className="mb-1 block text-sm font-medium text-gray-700">Size</label><input type="text" value={formData.size} onChange={(e) => update("size", e.target.value)} className="input-field" /></div>
        </div>
        <div><label className="mb-1 block text-sm font-medium text-gray-700">Features</label><textarea value={formData.feature} onChange={(e) => update("feature", e.target.value)} className="input-field" rows={3} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="mb-1 block text-sm font-medium text-gray-700">Plan</label><select value={formData.plan} onChange={(e) => update("plan", e.target.value)} className="select-field"><option value="">Select</option>{PLAN_TYPES.map((p) => <option key={p} value={p}>{p}</option>)}</select></div>
          <div><label className="mb-1 block text-sm font-medium text-gray-700">Decoration</label><select value={formData.decoration} onChange={(e) => update("decoration", e.target.value)} className="select-field"><option value="">Select</option>{DECORATION_TYPES.map((d) => <option key={d} value={d}>{d}</option>)}</select></div>
        </div>
        <div><label className="mb-1 block text-sm font-medium text-gray-700">Status</label><select value={formData.status} onChange={(e) => update("status", e.target.value)} className="select-field"><option value="available">Available</option><option value="sold out">Sold Out</option></select></div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-navy">Property Images</label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              { f: "aimage", l: "Image 1" }, { f: "aimage1", l: "Image 2" },
              { f: "aimage2", l: "Image 3" }, { f: "aimage3", l: "Image 4" },
              { f: "aimage4", l: "Image 5" }, { f: "fimage", l: "Floor Plan" },
              { f: "fimage1", l: "Basement Plan" }, { f: "fimage2", l: "Ground Plan" },
            ].map(({ f, l }) => (
              <div key={f}>
                <label className="mb-1 block text-xs font-medium text-gray-700">{l}</label>
                {imagePreviews[f] && <img src={imagePreviews[f]} alt={l} className="mb-2 h-20 w-20 rounded object-cover" />}
                <input type="file" accept="image/*" onChange={(e) => handleImageChange(f, e.target.files?.[0] || null)} className="input-field file:mr-2 file:rounded file:border-0 file:bg-primary/10 file:px-3 file:py-1 file:text-xs file:font-medium file:text-primary" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
            {saving ? "Updating..." : "Update Property"}
          </button>
          <button type="button" onClick={() => router.push("/my-properties")} className="btn-outline">Cancel</button>
        </div>
      </form>
    </div>
  );
}
