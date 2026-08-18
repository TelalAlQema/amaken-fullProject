import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Thank You",
  robots: { index: false },
};

export default function ThankYouPage() {
  return (
    <section className="flex min-h-[60vh] items-center justify-center bg-gradient-to-br from-primary/10 via-white to-navy/5 py-16">
      <div className="mx-auto max-w-md px-4 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <svg className="h-10 w-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="mb-3 text-3xl font-bold text-navy">Thank You!</h1>
        <p className="mb-8 text-amaken-gray">
          Your submission has been received. We will get back to you shortly.
        </p>
        <Link href="/" className="btn-primary">
          Back to Home
        </Link>
      </div>
    </section>
  );
}
