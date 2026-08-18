"use client";

import ProfileSidebar from "@/components/dashboard/ProfileSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[80vh] bg-gray-50 py-8">
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
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
