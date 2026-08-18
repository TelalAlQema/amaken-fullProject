import Link from "next/link";

interface BreadcrumbBannerProps {
  title: string;
  subtitle?: string;
  bgImage?: string;
  crumbs?: { label: string; href?: string }[];
}

export default function BreadcrumbBanner({ title, subtitle, bgImage = "/images/breadcromb.jpg", crumbs = [] }: BreadcrumbBannerProps) {
  return (
    <section
      className="relative flex min-h-[260px] items-center bg-cover bg-center py-16 md:min-h-[320px]"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute inset-0 bg-navy/80" />
      <div className="container-custom relative z-10">
        {crumbs.length > 0 && (
          <nav className="mb-3 flex items-center gap-2 text-sm text-gray-300">
            <Link href="/" className="hover:text-white">Home</Link>
            {crumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-2">
                <span>/</span>
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-white">{crumb.label}</Link>
                ) : (
                  <span className="text-white">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-3xl font-bold text-white md:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 text-gray-300">{subtitle}</p>}
      </div>
    </section>
  );
}
