"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";

const MENU_ITEMS = [
  { label: "My Profile", href: "/profile" },
  { label: "My Properties", href: "/my-properties" },
  { label: "Featured Properties", href: "/my-properties/featured" },
  { label: "Edit Profile", href: "/profile/edit" },
  { label: "Edit Profile Picture", href: "/profile/picture" },
  { label: "Edit Company Logo", href: "/profile/logo" },
  { label: "Edit Social Links", href: "/profile/links" },
  { label: "Change Password", href: "/profile/password" },
  { label: "My Feedback", href: "/feedback" },
  { label: "Feedback About Me", href: "/feedback/about-me" },
  { label: "Submit Property", href: "/submit-property" },
];

export default function ProfileSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const imageUrl = user?.uimage
    ? `/uploads/users/${user.uimage}`
    : "/images/user/default-user.jpg";

  return (
    <div className="w-full shrink-0 lg:w-64">
      <div className="rounded-lg bg-white shadow-md">
        <div className="border-b p-6 text-center">
          <img
            src={imageUrl}
            alt={`${user?.uname || ""} ${user?.lname || ""}`}
            className="mx-auto mb-3 h-20 w-20 rounded-full border-2 border-primary object-cover"
          />
          <h3 className="font-heading text-lg font-bold text-navy">
            {user?.uname} {user?.lname}
          </h3>
          <p className="text-sm text-amaken-gray">{user?.uemail}</p>
          <span className="mt-2 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {user?.utype || "User"}
          </span>
        </div>
        <nav className="p-2">
          {MENU_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-4 py-2.5 text-sm transition-colors ${
                pathname === item.href
                  ? "bg-primary/10 font-semibold text-primary"
                  : "text-amaken-gray hover:bg-gray-50 hover:text-navy"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <button
            onClick={logout}
            className="mt-2 w-full rounded-lg px-4 py-2.5 text-left text-sm text-red-500 transition-colors hover:bg-red-50"
          >
            Logout
          </button>
        </nav>
      </div>
    </div>
  );
}
