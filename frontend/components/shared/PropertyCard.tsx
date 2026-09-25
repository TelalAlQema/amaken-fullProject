"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, type SyntheticEvent } from "react";
import type { Property } from "@amaken/shared";
import { formatPrice, getAssetUrl } from "@/lib/utils";

const FALLBACK_IMAGE = "/images/house-floor-plan.png";

interface PropertyCardProps {
  property: Property;
  variant?: "grid" | "list";
}

function ThumbnailStrip({
  images,
  activeIndex,
  onSelect,
}: {
  images: string[];
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="relative z-10 flex gap-1 overflow-x-auto p-2">
      {images.map((img, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect(i)}
          aria-label={`View image ${i + 1}`}
          className={`relative h-12 w-16 flex-shrink-0 overflow-hidden rounded border-2 transition-colors ${
            i === activeIndex ? "border-primary" : "border-transparent opacity-80 hover:opacity-100"
          }`}
        >
          <Image
            src={getAssetUrl(`/uploads/properties/${img}`)}
            alt=""
            width={64}
            height={48}
            className="h-full w-full object-cover"
            onError={(e: SyntheticEvent<HTMLImageElement>) => {
              e.currentTarget.src = FALLBACK_IMAGE;
            }}
          />
        </button>
      ))}
    </div>
  );
}

export default function PropertyCard({ property, variant = "grid" }: PropertyCardProps) {
  const images = [property.pimage, property.pimage1, property.pimage2, property.pimage3, property.pimage4, property.mapimage].filter(Boolean);
  const [activeIndex, setActiveIndex] = useState(0);

  const hasImages = images.length > 0;
  const mainImage = hasImages ? images[activeIndex % images.length] : FALLBACK_IMAGE;
  const imageUrl = hasImages ? getAssetUrl(`/uploads/properties/${mainImage}`) : FALLBACK_IMAGE;

  const onImageError = (e: SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = FALLBACK_IMAGE;
  };

  const prevImage = () => setActiveIndex((i) => (i - 1 + images.length) % images.length);
  const nextImage = () => setActiveIndex((i) => (i + 1) % images.length);

  const badges = (
    <>
      {property.offer === 1 && (
        <span className="absolute left-3 top-3 z-20 rounded bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">Special Offer</span>
      )}
      {property.plan && (
        <span className="absolute right-3 top-3 z-20 rounded bg-primary px-2 py-0.5 text-xs font-semibold text-white">{property.plan}</span>
      )}
    </>
  );

  if (variant === "list") {
    return (
      <div className="card flex flex-col overflow-hidden md:flex-row">
        <div className="relative h-64 w-full md:h-auto md:w-80">
          <Image src={imageUrl} alt={property.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 320px" onError={onImageError} />
          {badges}
          {images.length > 1 && (
            <>
              <button type="button" onClick={prevImage} className="absolute bottom-3 left-3 z-20 rounded-full bg-white/80 px-2.5 py-1 text-sm font-bold text-navy transition-colors hover:bg-white" aria-label="Previous image">‹</button>
              <button type="button" onClick={nextImage} className="absolute bottom-3 right-3 z-20 rounded-full bg-white/80 px-2.5 py-1 text-sm font-bold text-navy transition-colors hover:bg-white" aria-label="Next image">›</button>
              <span className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2 rounded bg-black/50 px-2 py-0.5 text-xs font-semibold text-white">
                {activeIndex + 1}/{images.length}
              </span>
            </>
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
            <Link href={`/properties/detail?id=${property.id}`} className="rounded bg-primary px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-600">
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
          onError={onImageError}
        />
        {badges}
        {images.length > 1 && (
          <button
            type="button"
            onClick={nextImage}
            className="absolute right-3 bottom-3 z-20 rounded-full bg-white/80 px-2.5 py-0.5 text-xs font-bold text-navy transition-colors hover:bg-white"
            aria-label="Next image"
          >
            {activeIndex + 1}/{images.length} ›
          </button>
        )}
      </div>
      {hasImages && <ThumbnailStrip images={images} activeIndex={activeIndex % images.length} onSelect={setActiveIndex} />}
      <div className="p-4 pt-0">
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
          <Link href={`/properties/detail?id=${property.id}`} className="text-xs font-semibold text-primary hover:underline">
            View Details →
          </Link>
        </div>
      </div>
    </div>
  );
}