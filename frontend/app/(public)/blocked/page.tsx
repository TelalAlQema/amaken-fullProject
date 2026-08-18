import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Account Blocked",
  robots: { index: false },
};

export default function BlockedPage() {
  return (
    <section className="flex min-h-[60vh] items-center justify-center bg-gray-50 py-16">
      <div className="mx-auto max-w-md px-4 text-center">
        <div className="rounded-2xl bg-white p-8 shadow-lg transition-transform hover:-translate-y-1">
          <Image src="/images/logo/amaken.png" alt="Amaken Real Estate" width={120} height={40} className="mx-auto mb-6" />
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg className="h-8 w-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h1 className="mb-2 text-xl font-bold text-navy">Account Blocked or Deleted</h1>
          <p className="mb-6 text-sm text-amaken-gray">
            Your account has been blocked or deleted. If you believe this is an error, please contact our support team.
          </p>
          <Link href="/contact" className="btn-primary w-full">
            Contact Support
          </Link>
        </div>
      </div>
    </section>
  );
}
