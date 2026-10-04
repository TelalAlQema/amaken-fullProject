"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import ProfileSidebar from "@/components/dashboard/ProfileSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-[80vh] bg-gray-50 py-6 sm:py-8">
      <div className="container-custom">
        <div className="mb-6">
          <nav className="text-sm text-amaken-gray">
            <span className="hover:text-primary">Dashboard</span>
            <span className="mx-2">/</span>
            <span className="text-navy">Profile</span>
          </nav>
        </div>
        <div className="flex flex-col gap-6 lg:flex-row">
          <ProfileSidebar />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}