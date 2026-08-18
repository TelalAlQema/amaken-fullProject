"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { updateMe } from "@/lib/api";
import { USER_TYPES, GENDERS } from "@amaken/shared";

export default function EditProfilePage() {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    date: "",
    phone: "",
    wphone: "",
    Address: "",
    gender: "Male",
    utype: "User",
    company: "",
    companyAddress: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fname: user.uname || "",
        lname: user.lname || "",
        date: user.dateofbirth || "",
        phone: user.uphone || "",
        wphone: user.wphone || "",
        Address: user.Address || "",
        gender: user.ugender || "Male",
        utype: user.utype || "User",
        company: user.company || "",
        companyAddress: user.Companyaddress || "",
      });
    }
  }, [user]);

  const update = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const { data } = await updateMe({
        uname: formData.fname,
        lname: formData.lname,
        dateofbirth: formData.date,
        uphone: formData.phone,
        wphone: formData.wphone,
        Address: formData.Address,
        ugender: formData.gender,
        utype: formData.utype,
        company: formData.company,
        Companyaddress: formData.companyAddress,
      });
      if (data.success && data.data) {
        setUser(data.data);
        setSuccess("Profile updated successfully");
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || "Update failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-6 font-heading text-xl font-bold text-navy">Edit Profile</h2>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}
      {success && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-600">{success}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">First Name *</label>
            <input type="text" required maxLength={50} value={formData.fname} onChange={(e) => update("fname", e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Last Name *</label>
            <input type="text" required maxLength={50} value={formData.lname} onChange={(e) => update("lname", e.target.value)} className="input-field" />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
          <input type="email" value={user.uemail} disabled className="input-field bg-gray-50" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Date of Birth *</label>
            <input type="date" required value={formData.date} onChange={(e) => update("date", e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Phone *</label>
            <input type="text" required maxLength={20} value={formData.phone} onChange={(e) => update("phone", e.target.value)} className="input-field" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">WhatsApp</label>
            <input type="text" maxLength={20} value={formData.wphone} onChange={(e) => update("wphone", e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Gender</label>
            <select value={formData.gender} onChange={(e) => update("gender", e.target.value)} className="select-field">
              {GENDERS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Address *</label>
          <input type="text" required maxLength={100} value={formData.Address} onChange={(e) => update("Address", e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Account Type</label>
          <div className="flex gap-4">
            {USER_TYPES.map((t) => (
              <label key={t} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="utype"
                  value={t}
                  checked={formData.utype === t}
                  onChange={(e) => update("utype", e.target.value)}
                  className="h-4 w-4 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700">{t}</span>
              </label>
            ))}
          </div>
        </div>
        {formData.utype === "Agent" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Company Name</label>
              <input type="text" value={formData.company} onChange={(e) => update("company", e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Company Address</label>
              <input type="text" value={formData.companyAddress} onChange={(e) => update("companyAddress", e.target.value)} className="input-field" />
            </div>
          </div>
        )}
        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={loading} className="btn-primary disabled:cursor-not-allowed disabled:opacity-50">
            {loading ? "Updating..." : "Update Profile"}
          </button>
          <button type="button" onClick={() => router.push("/profile")} className="btn-outline">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
