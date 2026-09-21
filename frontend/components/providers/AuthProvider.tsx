"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@amaken/shared";
import { useAuthLoginMutation, useGetMeQuery } from "@/lib/redux/api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLogin] = useAuthLoginMutation();
  const router = useRouter();

  const { data: meData, isLoading: meLoading } = useGetMeQuery(undefined, {
    skip: typeof window === "undefined" || !localStorage.getItem("access_token"),
  });

  useEffect(() => {
    if (meData?.success && meData.data) {
      setUser(meData.data);
    }
  }, [meData]);

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await authLogin({ email, password });
      const payload = (result as { data?: { data?: { accessToken: string; refreshToken: string; user: User } } }).data;
      if (payload?.data) {
        localStorage.setItem("access_token", payload.data.accessToken);
        localStorage.setItem("refresh_token", payload.data.refreshToken);
        setUser(payload.data.user);
        return;
      }
      const err = (result as { error?: { data?: { error?: { message?: string } } } }).error;
      throw new Error(err?.data?.error?.message || "Login failed. Please check your credentials.");
    },
    [authLogin]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: meLoading && !user,
        isAuthenticated: !!user,
        login,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
