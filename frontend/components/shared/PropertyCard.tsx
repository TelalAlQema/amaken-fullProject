import Link from "next/link";
import Image from "next/image";
import type { Property } from "@amaken/shared";
import { formatPrice } from "@/lib/utils";

interface PropertyCardProps {
  property: Property;
  variant?: "grid" | "list";
}

export default function PropertyCard({ property, variant = "grid" }: PropertyCardProps) {
  const images = [property.pimage, property.pimage1, property.pimage2, property.pimage3, property.pimage4].filter(Boolean);
  const mainImage = images[0] || "/images/house-floor-plan.png";
  const imageUrl = mainImage.startsWith("http") ? mainImage : `/uploads/properties/${mainImage}`;

  if (variant === "list") {
    return (
      <div className="card flex flex-col overflow-hidden md:flex-row">
        <div className="relative h-64 w-full md:h-auto md:w-80">
          <Image src={imageUrl} alt={property.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 320px" />
          {property.offer === 1 && (
            <span className="absolute left-3 top-3 rounded bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">Special Offer</span>
          )}
          {property.plan && (
            <span className="absolute right-3 top-3 rounded bg-primary px-2 py-0.5 text-xs font-semibold text-white">{property.plan}</span>
          )}
        </div>
        <div className="flex flex-1 flex-col p-5">
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{property.type}</span>
            <span className="rounded bg-navy/10 px-2 py-0.5 text-xs font-medium text-navy">{property.stype}</span>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-navy">{property.title}</h3>
          <p className="mb-3 text-sm text-amaken-gray">{property.location}{property.city ? `, ${property.city}` : ""}{property.state ? `, ${property.state}` : ""}</p>
          <div className="mb-3 flex items-center gap-4 text-sm text-amaken-gray">
            {property.bedroom && <span className="flex items-center gap-1"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" /></svg>{property.bedroom} Bed</span>}
            {property.bathroom && <span className="flex items-center gap-1"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>{property.bathroom} Bath</span>}
            {property.size && <span className="flex items-center gap-1"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>{property.size} sqft</span>}
          </div>
          <div className="mt-auto flex items-center justify-between">
            <span className="text-xl font-bold text-primary">{formatPrice(Number(property.price), property.curr)}</span>
            <Link href={`/properties/${property.id}`} className="rounded bg-primary px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-600">
              View Details
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card group overflow-hidden">
      <div className="relative h-56 w-full overflow-hidden">
        <Image
          src={imageUrl}
          alt={property.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {property.offer === 1 && (
          <span className="absolute left-3 top-3 rounded bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">Special Offer</span>
        )}
        {property.plan && (
          <span className="absolute right-3 top-3 rounded bg-primary px-2 py-0.5 text-xs font-semibold text-white">{property.plan}</span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <div className="p-4">
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{property.type}</span>
          <span className="rounded bg-navy/10 px-2 py-0.5 text-xs font-medium text-navy capitalize">{property.stype}</span>
        </div>
        <h3 className="mb-1 line-clamp-1 text-base font-semibold text-navy">{property.title}</h3>
        <p className="mb-2 text-xs text-amaken-gray">
          {property.location}{property.city ? `, ${property.city}` : ""}
        </p>
        <div className="mb-3 flex items-center gap-3 text-xs text-amaken-gray">
          {property.bedroom && <span>{property.bedroom} Bed</span>}
          {property.bathroom && <span>{property.bathroom} Bath</span>}
          {property.size && <span>{property.size} sqft</span>}
        </div>
        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <span className="text-lg font-bold text-primary">{formatPrice(Number(property.price), property.curr)}</span>
          <Link href={`/properties/${property.id}`} className="text-xs font-semibold text-primary hover:underline">
            View Details →
          </Link>
        </div>
      </div>
    </div>
  );
}
