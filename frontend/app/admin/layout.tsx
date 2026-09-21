"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminAuthProvider, useAdminAuth } from "@/components/providers/AdminAuthProvider";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { useGetSidebarCountsQuery } from "@/lib/redux/adminApi";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminAuthProvider>
  );
}

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAdminAuth();
  const router = useRouter();

  const isAuthPage =
    pathname === "/admin/login" || pathname === "/admin/login/email";

  const { data: countsData } = useGetSidebarCountsQuery(undefined, {
    skip: !isAuthenticated || isAuthPage,
  });

  const sidebarCounts =
    countsData?.success && countsData.data
      ? (countsData.data as Record<string, number>)
      : {};

  useEffect(() => {
    if (!isAuthPage && !isLoading && !isAuthenticated) {
      router.push("/admin/login");
    }
  }, [isLoading, isAuthenticated, router, isAuthPage]);

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar
        counts={sidebarCounts}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <AdminHeader onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
      <main className="pt-16 lg:pl-64">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
