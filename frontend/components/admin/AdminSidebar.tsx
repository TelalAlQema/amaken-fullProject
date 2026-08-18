"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  User,
  Users,
  Building2,
  MapPin,
  Home,
  MessageSquare,
  Phone,
  Star,
  FileText,
  ChevronDown,
  ChevronRight,
  X,
  LogOut,
  Settings,
} from "lucide-react";
import { useAdminAuth } from "@/components/providers/AdminAuthProvider";

interface AdminSidebarProps {
  counts: Record<string, number>;
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  label: string;
  href: string;
  icon: React.ElementType;
  countKey?: string;
}

interface MenuGroup {
  label: string;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    label: "Main",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    ],
  },
  {
    label: "Profile",
    items: [
      { label: "My Profile", href: "/admin/profile", icon: User },
      { label: "My Properties", href: "/admin/properties?mine=1", icon: Home },
      { label: "My Feedback", href: "/admin/feedback/mine", icon: Star },
      { label: "Edit Profile", href: "/admin/profile/edit", icon: Settings },
      { label: "Edit Profile Picture", href: "/admin/profile/picture", icon: User },
      { label: "Edit Company Logo", href: "/admin/profile/logo", icon: Building2 },
      { label: "Edit Social Links", href: "/admin/profile/links", icon: Settings },
      { label: "Change Password", href: "/admin/profile/password", icon: Settings },
    ],
  },
  {
    label: "All Users",
    items: [
      { label: "Admin", href: "/admin/users/admins", icon: Users, countKey: "admins" },
      { label: "Users", href: "/admin/users", icon: Users, countKey: "users" },
      { label: "Agent", href: "/admin/users/agents", icon: Users, countKey: "agents" },
      { label: "Builder", href: "/admin/users/builders", icon: Users, countKey: "builders" },
    ],
  },
  {
    label: "State & City",
    items: [
      { label: "State", href: "/admin/states", icon: MapPin },
      { label: "City", href: "/admin/cities", icon: MapPin },
    ],
  },
  {
    label: "Property Management",
    items: [
      { label: "Add Property", href: "/admin/properties/add", icon: Home },
      { label: "View Property", href: "/admin/properties", icon: Home, countKey: "totalProperties" },
      { label: "Under Approval", href: "/admin/properties/approval", icon: Home, countKey: "pendingApproval" },
    ],
  },
  {
    label: "Query",
    items: [
      { label: "Contact", href: "/admin/contacts", icon: Phone, countKey: "contacts" },
      { label: "Company Feedback", href: "/admin/feedback/company", icon: MessageSquare, countKey: "companyFeedback" },
      { label: "Agents Feedback", href: "/admin/feedback/agents", icon: MessageSquare, countKey: "agentFeedback" },
    ],
  },
  {
    label: "Leads Record",
    items: [
      { label: "Lead Details", href: "/admin/leads", icon: FileText, countKey: "leads" },
    ],
  },
  {
    label: "About Page",
    items: [
      { label: "Add About Content", href: "/admin/about/add", icon: FileText },
      { label: "View About", href: "/admin/about", icon: FileText, countKey: "aboutEntries" },
    ],
  },
  {
    label: "Teams Details",
    items: [
      { label: "Add Team Member", href: "/admin/team/add", icon: Users },
      { label: "List of the Team", href: "/admin/team", icon: Users, countKey: "teamMembers" },
    ],
  },
  {
    label: "Account Status",
    items: [
      { label: "Registered Account", href: "/admin/accounts/registered", icon: Users, countKey: "registeredAccounts" },
      { label: "Deleted Account", href: "/admin/accounts/deleted", icon: Users, countKey: "deletedAccounts" },
      { label: "Blocked List", href: "/admin/accounts/blocked", icon: Users, countKey: "blockedAccounts" },
    ],
  },
];

function SidebarContent({ counts, onClose }: { counts: Record<string, number>; onClose: () => void }) {
  const pathname = usePathname();
  const { logout } = useAdminAuth();
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (label: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    const basePath = href.split("?")[0];
    return pathname === basePath || pathname.startsWith(basePath + "/");
  };

  return (
    <div className="flex h-full flex-col bg-navy">
      <div className="flex items-center justify-between px-4 py-4">
        <Link href="/admin" className="flex items-center">
          <img
            src="/images/logo/amaken.png"
            alt="Amaken"
            className="h-10 w-auto rounded bg-white p-1"
          />
        </Link>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white lg:hidden"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-4 scrollbar-thin scrollbar-thumb-white/10">
        {menuGroups.map((group) => {
          const isCollapsed = collapsedGroups[group.label];
          return (
            <div key={group.label} className="mt-2">
              <button
                onClick={() => toggleGroup(group.label)}
                className="flex w-full items-center justify-between px-4 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400"
              >
                {group.label}
                {isCollapsed ? (
                  <ChevronRight className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </button>
              {!isCollapsed && (
                <ul className="mt-1 space-y-0.5">
                  {group.items.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;
                    const count = item.countKey ? counts[item.countKey] : undefined;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={onClose}
                          className={`flex items-center gap-3 rounded-r-lg px-4 py-2 text-sm transition-colors ${
                            active
                              ? "border-l-4 border-primary bg-primary/20 text-primary"
                              : "border-l-4 border-transparent text-gray-300 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          <Icon className="h-5 w-5 shrink-0" />
                          <span className="flex-1 truncate">{item.label}</span>
                          {count !== undefined && count > 0 && (
                            <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-white">
                              {count}
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

export default function AdminSidebar({ counts, isOpen, onClose }: AdminSidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">
        <SidebarContent counts={counts} onClose={onClose} />
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={onClose}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-full lg:hidden">
            <SidebarContent counts={counts} onClose={onClose} />
          </aside>
        </>
      )}
    </>
  );
}
