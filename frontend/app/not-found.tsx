import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex min-h-[60vh] items-center justify-center bg-gray-50 py-16">
      <div className="mx-auto max-w-md px-4 text-center">
        <div className="mb-6 text-8xl font-bold text-primary/20">404</div>
        <h1 className="mb-3 text-2xl font-bold text-navy">Page Not Found</h1>
        <p className="mb-8 text-amaken-gray">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-primary">
            Back to Home
          </Link>
          <Link href="/properties" className="btn-outline">
            Browse Properties
          </Link>
        </div>
      </div>
    </section>
  );
}
