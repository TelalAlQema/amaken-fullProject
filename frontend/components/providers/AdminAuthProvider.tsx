"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { Admin } from "@amaken/shared";
import {
  useAdminLoginMutation,
  useGetAdminProfileQuery,
} from "@/lib/redux/adminApi";

interface AdminAuthContextType {
  admin: Admin | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setAdmin: (admin: Admin | null) => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const router = useRouter();
  const [adminLogin] = useAdminLoginMutation();

  const { data: profileData, isLoading: profileLoading } = useGetAdminProfileQuery(
    undefined,
    {
      skip:
        typeof window === "undefined" ||
        !localStorage.getItem("admin_access_token"),
    }
  );

  useEffect(() => {
    if (profileData?.success && profileData.data) {
      setAdmin(profileData.data);
    }
  }, [profileData]);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await adminLogin({ email, password });
      const payload = (result as { data?: { data?: { accessToken: string; refreshToken: string; admin: Admin } } }).data;
      if (payload?.data) {
        localStorage.setItem("admin_access_token", payload.data.accessToken);
        localStorage.setItem("admin_refresh_token", payload.data.refreshToken);
        localStorage.setItem("admin_pin_verified", "true");
        setAdmin(payload.data.admin);
        return;
      }
      const err = (result as { error?: { data?: { error?: { message?: string } } } }).error;
      throw new Error(err?.data?.error?.message || "Login failed. Please check your credentials.");
    },
    [adminLogin]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("admin_access_token");
    localStorage.removeItem("admin_refresh_token");
    localStorage.removeItem("admin_pin_verified");
    setAdmin(null);
    router.push("/admin/login");
  }, [router]);

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        isLoading: profileLoading && !admin,
        isAuthenticated: !!admin,
        login,
        logout,
        setAdmin,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}
