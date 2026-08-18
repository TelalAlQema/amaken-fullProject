"use client";

import { usePathname } from "next/navigation";
import { Menu, LogOut, User } from "lucide-react";
import { useAdminAuth } from "@/components/providers/AdminAuthProvider";

interface AdminHeaderProps {
  onToggleSidebar: () => void;
}

const PAGE_TITLES: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/profile": "My Profile",
  "/admin/profile/edit": "Edit Profile",
  "/admin/profile/picture": "Edit Profile Picture",
  "/admin/profile/logo": "Edit Company Logo",
  "/admin/profile/links": "Edit Social Links",
  "/admin/profile/password": "Change Password",
  "/admin/properties": "View Properties",
  "/admin/properties/add": "Add Property",
  "/admin/properties/approval": "Under Approval",
  "/admin/users": "All Users",
  "/admin/users/admins": "Admins",
  "/admin/users/agents": "Agents",
  "/admin/users/builders": "Builders",
  "/admin/states": "States",
  "/admin/cities": "Cities",
  "/admin/contacts": "Contact Messages",
  "/admin/feedback/mine": "My Feedback",
  "/admin/feedback/company": "Company Feedback",
  "/admin/feedback/agents": "Agents Feedback",
  "/admin/leads": "Lead Details",
  "/admin/about": "View About",
  "/admin/about/add": "Add About Content",
  "/admin/team": "Team Members",
  "/admin/team/add": "Add Team Member",
  "/admin/accounts/registered": "Registered Accounts",
  "/admin/accounts/deleted": "Deleted Accounts",
  "/admin/accounts/blocked": "Blocked List",
};

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  const base = "/" + (pathname.split("/").filter(Boolean).slice(0, 2).join("/"));
  if (PAGE_TITLES[base]) return PAGE_TITLES[base];
  const segments = pathname.split("/").filter(Boolean);
  const last = segments[segments.length - 1];
  return last ? last.charAt(0).toUpperCase() + last.slice(1).replace(/-/g, " ") : "Dashboard";
}

export default function AdminHeader({ onToggleSidebar }: AdminHeaderProps) {
  const pathname = usePathname();
  const { admin, logout } = useAdminAuth();
  const title = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-amaken-gray hover:bg-gray-100 lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold text-navy">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {admin?.aimage ? (
            <img
              src={`/uploads/admin/${admin.aimage}`}
              alt={admin.aname || "Admin"}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <User className="h-4 w-4 text-primary" />
            </div>
          )}
          <span className="hidden text-sm font-medium text-navy sm:inline">
            {admin?.aname || "Admin"}
          </span>
        </div>
        <button
          onClick={logout}
          className="rounded-lg p-2 text-amaken-gray transition-colors hover:bg-red-50 hover:text-red-500"
          aria-label="Logout"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
