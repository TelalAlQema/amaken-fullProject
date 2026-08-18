"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { Admin } from "@amaken/shared";
import { api } from "@/lib/api";

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
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchAdmin = useCallback(async () => {
    const token = localStorage.getItem("admin_access_token") || localStorage.getItem("access_token");
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const { data } = await api.get("/admin/profile");
      if (data.success && data.data) {
        setAdmin(data.data as Admin);
      } else {
        localStorage.removeItem("admin_access_token");
        localStorage.removeItem("admin_refresh_token");
        localStorage.removeItem("admin_pin_verified");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      }
    } catch {
      localStorage.removeItem("admin_access_token");
      localStorage.removeItem("admin_refresh_token");
      localStorage.removeItem("admin_pin_verified");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmin();
  }, [fetchAdmin]);

  const login = async (email: string, password: string) => {
    const { data } = await api.post("/admin/login", { email, password });
    if (data.success && data.data) {
      localStorage.setItem("admin_access_token", data.data.accessToken);
      localStorage.setItem("admin_refresh_token", data.data.refreshToken);
      localStorage.setItem("access_token", data.data.accessToken);
      localStorage.setItem("refresh_token", data.data.refreshToken);
      localStorage.setItem("admin_pin_verified", "true");
      setAdmin(data.data.admin);
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem("admin_access_token");
    localStorage.removeItem("admin_refresh_token");
    localStorage.removeItem("admin_pin_verified");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setAdmin(null);
    router.push("/admin/login");
  }, [router]);

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        isLoading,
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
