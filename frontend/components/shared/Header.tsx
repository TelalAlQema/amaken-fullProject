"use client";

import Link from "next/link";
import { useState } from "react";
import { CONTACT, SITE } from "@amaken/shared";
import { useAuth } from "@/components/providers/AuthProvider";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Our Team", href: "/team" },
  { label: "Properties", href: "/properties" },
  { label: "Agents", href: "/agents" },
  { label: "Blogs", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <>
      {/* Top Bar */}
      <div className="bg-navy text-sm text-gray-300">
        <div className="container-custom flex items-center justify-between py-2">
          <div className="flex items-center gap-4">
            <a href={`tel:${CONTACT.PHONE}`} className="flex items-center gap-1 hover:text-white">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              {CONTACT.PHONE}
            </a>
            <a href={`mailto:${CONTACT.EMAIL}`} className="hidden sm:flex items-center gap-1 hover:text-white">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              {CONTACT.EMAIL}
            </a>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 hover:text-white"
                >
                  <img
                    src={user?.uimage ? `/uploads/users/${user.uimage}` : "/images/user/default-user.jpg"}
                    alt=""
                    className="h-6 w-6 rounded-full object-cover"
                  />
                  <span className="hidden sm:inline">{user?.uname}</span>
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg bg-white py-2 shadow-lg">
                      <Link
                        href="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-amaken-gray hover:bg-gray-50 hover:text-navy"
                      >
                        My Profile
                      </Link>
                      <Link
                        href="/profile/edit"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-amaken-gray hover:bg-gray-50 hover:text-navy"
                      >
                        Edit Profile
                      </Link>
                      <Link
                        href="/profile/picture"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-amaken-gray hover:bg-gray-50 hover:text-navy"
                      >
                        Edit Profile Picture
                      </Link>
                      <Link
                        href="/profile/logo"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-amaken-gray hover:bg-gray-50 hover:text-navy"
                      >
                        Edit Company Logo
                      </Link>
                      <Link
                        href="/profile/links"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-amaken-gray hover:bg-gray-50 hover:text-navy"
                      >
                        Edit Social Links
                      </Link>
                      <Link
                        href="/my-properties"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-amaken-gray hover:bg-gray-50 hover:text-navy"
                      >
                        My Properties
                      </Link>
                      <Link
                        href="/submit-property"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-amaken-gray hover:bg-gray-50 hover:text-navy"
                      >
                        Submit Property
                      </Link>
                      <Link
                        href="/feedback"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-amaken-gray hover:bg-gray-50 hover:text-navy"
                      >
                        My Feedback
                      </Link>
                      <Link
                        href="/profile/password"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-amaken-gray hover:bg-gray-50 hover:text-navy"
                      >
                        Change Password
                      </Link>
                      <hr className="my-1" />
                      <button
                        onClick={() => { setUserMenuOpen(false); logout(); }}
                        className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50"
                      >
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="hover:text-white">Login</Link>
                <span className="text-gray-600">|</span>
                <Link href="/verify-email" className="hover:text-white">Register</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white shadow-sm">
        <div className="container-custom flex items-center justify-between py-3">
          <Link href="/" className="flex items-center">
            <img src="/images/logo/amaken.png" alt={SITE.NAME} className="h-10 w-auto" />
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-amaken-gray transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/submit-property"
              className="hidden rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-600 sm:inline-flex"
            >
              Submit Property
            </Link>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-lg p-2 text-amaken-gray hover:bg-gray-100 lg:hidden"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-gray-100 bg-white px-4 pb-4 lg:hidden">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block py-2.5 text-sm font-medium text-amaken-gray transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                <Link href="/profile" onClick={() => setMobileOpen(false)} className="block py-2.5 text-sm font-medium text-amaken-gray hover:text-primary">
                  My Profile
                </Link>
                <Link href="/my-properties" onClick={() => setMobileOpen(false)} className="block py-2.5 text-sm font-medium text-amaken-gray hover:text-primary">
                  My Properties
                </Link>
                <button
                  onClick={() => { setMobileOpen(false); logout(); }}
                  className="mt-2 block w-full rounded-lg bg-red-500 px-4 py-2.5 text-center text-sm font-semibold text-white"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)} className="mt-2 block rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-semibold text-white">
                  Login
                </Link>
                <Link href="/verify-email" onClick={() => setMobileOpen(false)} className="mt-2 block rounded-lg border-2 border-primary px-4 py-2.5 text-center text-sm font-semibold text-primary">
                  Register
                </Link>
              </>
            )}
            <Link
              href="/submit-property"
              onClick={() => setMobileOpen(false)}
              className="mt-2 block rounded-lg bg-primary px-4 py-2.5 text-center text-sm font-semibold text-white"
            >
              Submit Property
            </Link>
          </div>
        )}
      </header>
    </>
  );
}
