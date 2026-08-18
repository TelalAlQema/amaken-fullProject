import Link from "next/link";
import { CONTACT, SITE } from "@amaken/shared";

const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Properties", href: "/properties" },
  { label: "Agents", href: "/agents" },
  { label: "Our Team", href: "/team" },
  { label: "Contact", href: "/contact" },
  { label: "Blog", href: "/blog" },
];

const SOCIAL_LINKS = [
  { label: "Facebook", href: "https://www.facebook.com/amakenrealestate", icon: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" },
  { label: "Instagram", href: "https://www.instagram.com/amakenrealestate", icon: "M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zM17.5 6.5h.01" },
  { label: "Twitter", href: "https://twitter.com/amakenrealestate", icon: "M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/amakenrealestate", icon: "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 2a2 2 0 110 4 2 2 0 010-4z" },
  { label: "YouTube", href: "https://www.youtube.com/@amakenrealestate", icon: "M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.43zM9.75 15.02V8.48l5.75 3.27-5.75 3.27z" },
  { label: "TikTok", href: "https://www.tiktok.com/@amakenrealestate", icon: "M9 12a4 4 0 104 4V4a5 5 0 005 5" },
];

export default function Footer() {
  return (
    <footer className="bg-navy text-gray-400">
      <div className="container-custom py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* About */}
          <div>
            <img src="/images/logo/amaken.png" alt={SITE.NAME} className="mb-4 h-10 w-auto brightness-0 invert" />
            <p className="mb-4 text-sm leading-relaxed">
              {SITE.TAGLINE}. Your trusted partner in finding the perfect property in Dubai and the UAE.
            </p>
            <div className="flex gap-3">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-primary"
                  aria-label={social.label}
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path d={social.icon} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Quick Links</h3>
            <ul className="space-y-2">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm transition-colors hover:text-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <a href="https://maps.google.com/?q=Al+Reem+Tower+Dubai" target="_blank" rel="noopener noreferrer" className="text-sm hover:text-primary">
                  {CONTACT.ADDRESS}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <svg className="h-4 w-4 flex-shrink-0 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                <a href={`tel:${CONTACT.PHONE}`} className="text-sm hover:text-primary">{CONTACT.PHONE}</a>
              </li>
              <li className="flex items-center gap-2">
                <svg className="h-4 w-4 flex-shrink-0 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <a href={`mailto:${CONTACT.EMAIL}`} className="text-sm hover:text-primary">{CONTACT.EMAIL}</a>
              </li>
            </ul>
          </div>

          {/* Business Hours */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Business Hours</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between"><span>Sun - Sat</span><span>9:00 AM - 9:00 PM</span></li>
              <li className="flex justify-between"><span>Friday</span><span>Closed</span></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/10">
        <div className="container-custom flex flex-col items-center justify-between gap-2 py-4 sm:flex-row">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} {SITE.NAME}. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-gray-500">
            <Link href="/terms" className="hover:text-primary">Terms & Conditions</Link>
            <Link href="/privacy" className="hover:text-primary">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
