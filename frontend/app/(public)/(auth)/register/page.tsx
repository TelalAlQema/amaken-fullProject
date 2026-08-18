"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authRegister } from "@/lib/api";
import { PROPERTY_TYPES, USER_TYPES, GENDERS, BHK_OPTIONS, SELLING_TYPES, PLAN_TYPES, DECORATION_TYPES, CURRENCIES } from "@amaken/shared";

export default function RegisterPage() {
  const router = useRouter();
  const email = sessionStorage.getItem("reg_email") || "";

  useEffect(() => {
    if (!email) router.push("/verify-email");
  }, [email, router]);

  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    phone: "",
    wphone: "",
    date: "",
    city: "",
    state: "",
    Address: "",
    gender: "Male",
    utype: "User",
    company: "",
    companyAddress: "",
    password: "",
    cpass: "",
    website: "",
    facebook: "",
    linkedin: "",
    instagram: "",
    tiktok: "",
    twitter: "",
  });

  const update = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const passwordChecks = {
    length: formData.password.length >= 8 && formData.password.length <= 16,
    case: /[A-Z]/.test(formData.password) && /[a-z]/.test(formData.password),
    number: /\d/.test(formData.password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
  };
  const allPasswordChecks = Object.values(passwordChecks).every(Boolean);
  const passwordsMatch = formData.password === formData.cpass && formData.cpass.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await authRegister({
        uname: formData.fname,
        lname: formData.lname,
        email,
        phone: formData.phone,
        password: formData.password,
        utype: formData.utype,
        dateofbirth: formData.date,
        Address: formData.Address,
        city: formData.city,
        state: formData.state,
        ugender: formData.gender,
        wphone: formData.wphone,
        company: formData.company,
        Companyaddress: formData.companyAddress,
        website: formData.website,
        facebook: formData.facebook,
        linkedin: formData.linkedin,
        instagram: formData.instagram,
        tiktok: formData.tiktok,
        twitter: formData.twitter,
      });
      if (data.success && data.data) {
        localStorage.setItem("access_token", data.data.accessToken);
        localStorage.setItem("refresh_token", data.data.refreshToken);
        sessionStorage.removeItem("reg_email");
        router.push("/profile");
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || "Registration failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!email) return null;

  const totalSteps = 3;

  return (
    <>
      <h2 className="mb-2 text-center font-heading text-2xl font-bold text-navy">
        Create Account
      </h2>

      <div className="mb-6 flex items-center justify-center gap-2">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                i + 1 <= step
                  ? "bg-primary text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {i + 1 < step ? (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            {i < totalSteps - 1 && (
              <div className={`h-0.5 w-12 ${i + 1 < step ? "bg-primary" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {step === 1 && (
          <>
            <h3 className="text-sm font-semibold text-navy">Personal Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">First Name *</label>
                <input type="text" required value={formData.fname} onChange={(e) => update("fname", e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Last Name *</label>
                <input type="text" required value={formData.lname} onChange={(e) => update("lname", e.target.value)} className="input-field" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
              <input type="email" value={email} disabled className="input-field bg-gray-50" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Date of Birth *</label>
                <input type="date" required value={formData.date} onChange={(e) => update("date", e.target.value)} className="input-field" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Phone *</label>
                <input type="text" required maxLength={15} value={formData.phone} onChange={(e) => update("phone", e.target.value)} className="input-field" placeholder="+971..." />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">WhatsApp</label>
                <input type="text" maxLength={15} value={formData.wphone} onChange={(e) => update("wphone", e.target.value)} className="input-field" placeholder="+971..." />
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
              <label className="mb-1 block text-sm font-medium text-gray-700">Address *</label>
              <input type="text" required maxLength={100} value={formData.Address} onChange={(e) => update("Address", e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Account Type *</label>
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
              <div className="grid grid-cols-2 gap-3">
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
            <button type="button" onClick={() => setStep(2)} className="btn-primary w-full">
              Next
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h3 className="text-sm font-semibold text-navy">Social Links (Optional)</h3>
            <p className="text-xs text-red-500">All of these are optional fields</p>
            {formData.utype === "Agent" && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Website</label>
                <input type="url" value={formData.website} onChange={(e) => update("website", e.target.value)} className="input-field" placeholder="https://" />
              </div>
            )}
            {(["facebook", "linkedin", "instagram", "tiktok", "twitter"] as const).map((platform) => (
              <div key={platform}>
                <label className="mb-1 block text-sm font-medium text-gray-700 capitalize">{platform}</label>
                <input type="url" value={formData[platform]} onChange={(e) => update(platform, e.target.value)} className="input-field" placeholder="https://" />
              </div>
            ))}
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="btn-outline flex-1">
                Back
              </button>
              <button type="button" onClick={() => setStep(3)} className="btn-primary flex-1">
                Next
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h3 className="text-sm font-semibold text-navy">Create Password</h3>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Password *</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => update("password", e.target.value)}
                className="input-field"
                placeholder="8-16 characters"
              />
              {formData.password && (
                <div className="mt-2 space-y-1 text-xs">
                  <div className={passwordChecks.length ? "text-green-600" : "text-red-500"}>
                    {passwordChecks.length ? "\u2713" : "\u2717"} 8-16 characters
                  </div>
                  <div className={passwordChecks.case ? "text-green-600" : "text-red-500"}>
                    {passwordChecks.case ? "\u2713" : "\u2717"} Uppercase and lowercase
                  </div>
                  <div className={passwordChecks.number ? "text-green-600" : "text-red-500"}>
                    {passwordChecks.number ? "\u2713" : "\u2717"} At least 1 number
                  </div>
                  <div className={passwordChecks.special ? "text-green-600" : "text-red-500"}>
                    {passwordChecks.special ? "\u2713" : "\u2717"} At least 1 special character
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Confirm Password *</label>
              <input
                type="password"
                required
                value={formData.cpass}
                onChange={(e) => update("cpass", e.target.value)}
                className="input-field"
                disabled={!allPasswordChecks}
              />
              {formData.cpass && (
                <p className={`mt-1 text-xs ${passwordsMatch ? "text-green-600" : "text-red-500"}`}>
                  {passwordsMatch ? "\u2713 Passwords match" : "\u2717 Passwords don't match"}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(2)} className="btn-outline flex-1">
                Back
              </button>
              <button
                type="submit"
                disabled={loading || !allPasswordChecks || !passwordsMatch}
                className="btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Creating Account..." : "Register"}
              </button>
            </div>
          </>
        )}
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-3 text-gray-400">or</span>
        </div>
      </div>

      <p className="text-center text-sm text-amaken-gray">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary hover:text-primary-600">
          Login
        </Link>
      </p>
    </>
  );
}
