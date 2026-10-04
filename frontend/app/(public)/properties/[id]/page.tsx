"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getProperty, submitLead, getProperties } from "@/lib/api";
import BreadcrumbBanner from "@/components/shared/BreadcrumbBanner";
import PropertyCard from "@/components/shared/PropertyCard";
import { PropertyCardSkeleton } from "@/components/shared/Skeletons";
import { formatPrice } from "@/lib/utils";
import { CONTACT } from "@amaken/shared";
import type { Property } from "@amaken/shared";

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = Number(params.id);

  const [activeImage, setActiveImage] = useState(0);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadForm, setLeadForm] = useState({ name: "", email: "", phone: "", nationality: "" });
  const [leadSuccess, setLeadSuccess] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["property", id],
    queryFn: () => getProperty(id),
    enabled: !!id,
  });

  const { data: sidebarData } = useQuery({
    queryKey: ["properties", "sidebar", id],
    queryFn: () => getProperties({ limit: 4, page: 1 }),
  });

  const leadMutation = useMutation({
    mutationFn: () => submitLead(id, leadForm),
    onSuccess: () => {
      setLeadSuccess(true);
      setLeadForm({ name: "", email: "", phone: "", nationality: "" });
      setTimeout(() => setShowLeadModal(false), 2000);
    },
  });

  const property: Property | undefined = data?.data?.data as Property | undefined;
  const sidebarProperties: Property[] = sidebarData?.data?.data || [];

  if (isLoading) {
    return (
      <>
        <div className="h-64 animate-pulse bg-gray-200" />
        <div className="container-custom py-12">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-96 animate-pulse rounded-lg bg-gray-200" />
              <div className="h-8 w-1/2 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
            </div>
            <div className="h-64 animate-pulse rounded-lg bg-gray-200" />
          </div>
        </div>
      </>
    );
  }

  if (!property) {
    return (
      <div className="container-custom py-20 text-center">
        <h1 className="text-2xl font-bold text-navy">Property Not Found</h1>
        <p className="mt-2 text-amaken-gray">The property you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <Link href="/properties" className="btn-primary mt-6 inline-flex">Browse Properties</Link>
      </div>
    );
  }

  const images = [property.pimage, property.pimage1, property.pimage2, property.pimage3, property.pimage4]
    .filter(Boolean)
    .map((img) => img.startsWith("http") ? img : `/uploads/properties/${img}`);

  const features: { key: string; value: string }[] = [];
  if (property.feature) {
    try {
      const parsed = JSON.parse(property.feature);
      if (typeof parsed === "object") {
        Object.entries(parsed).forEach(([k, v]) => features.push({ key: k, value: String(v) }));
      }
    } catch {
      property.feature.split(",").forEach((f) => {
        const [k, v] = f.split(":");
        if (k) features.push({ key: k.trim(), value: v?.trim() || "Yes" });
      });
    }
  }

  return (
    <>
      <BreadcrumbBanner
        title={property.title}
        crumbs={[
          { label: "Properties", href: "/properties" },
          { label: property.title },
        ]}
      />

      <section className="py-8">
        <div className="container-custom">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Image Gallery */}
              {images.length > 0 && (
                <div className="mb-6">
                  <div className="relative mb-3 h-[400px] overflow-hidden rounded-lg lg:h-[500px]">
                    <Image
                      src={images[activeImage]}
                      alt={property.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 66vw"
                      priority
                    />
                    {property.offer === 1 && (
                      <span className="absolute left-4 top-4 rounded bg-red-500 px-3 py-1 text-sm font-semibold text-white">Special Offer</span>
                    )}
                  </div>
                  {images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {images.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveImage(i)}
                          className={`relative h-20 flex-shrink-0 w-28 overflow-hidden rounded-md border-2 transition-colors ${
                            i === activeImage ? "border-primary" : "border-transparent"
                          }`}
                        >
                          <Image src={img} alt={`View ${i + 1}`} fill className="object-cover" sizes="112px" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Property Details */}
              <div className="mb-6">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="rounded bg-primary/10 px-3 py-1 text-sm font-medium text-primary">{property.type}</span>
                  <span className="rounded bg-navy/10 px-3 py-1 text-sm font-medium text-navy capitalize">{property.stype}</span>
                  {property.status && (
                    <span className={`rounded px-3 py-1 text-sm font-medium ${property.status === "available" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {property.status}
                    </span>
                  )}
                  {property.plan && (
                    <span className="rounded bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">{property.plan}</span>
                  )}
                </div>

                <h1 className="mb-2 text-2xl font-bold text-navy">{property.title}</h1>

                <div className="mb-4 flex items-center gap-2 text-amaken-gray">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {property.location}{property.city ? `, ${property.city}` : ""}{property.state ? `, ${property.state}` : ""}
                </div>

                <div className="text-3xl font-bold text-primary">
                  {formatPrice(Number(property.price), property.curr)}
                  {property.stype === "rent" && <span className="text-sm font-normal text-amaken-gray"> /year</span>}
                </div>
              </div>

              {/* Specs */}
              <div className="mb-6 grid grid-cols-3 gap-4 rounded-lg bg-gray-50 p-4 sm:grid-cols-6">
                {[
                  { label: "Bedroom", value: property.bedroom },
                  { label: "Bathroom", value: property.bathroom },
                  { label: "Sqft", value: property.size },
                  { label: "Balcony", value: property.balcony },
                  { label: "Kitchen", value: property.kitchen },
                  { label: "Hall", value: property.hall },
                ].filter((s) => s.value).map((spec) => (
                  <div key={spec.label} className="text-center">
                    <div className="text-lg font-semibold text-navy">{spec.value}</div>
                    <div className="text-xs text-amaken-gray">{spec.label}</div>
                  </div>
                ))}
              </div>

              {/* Description */}
              {property.pcontent && (
                <div className="mb-6">
                  <h2 className="mb-3 text-xl font-bold text-navy">Description</h2>
                  <div className="prose prose-sm max-w-none text-amaken-gray" dangerouslySetInnerHTML={{ __html: property.pcontent }} />
                </div>
              )}

              {/* Property Summary */}
              <div className="mb-6 rounded-lg border border-gray-200 p-4">
                <h2 className="mb-3 text-xl font-bold text-navy">Property Summary</h2>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    { label: "Property Type", value: property.type },
                    { label: "BHK", value: property.bhk },
                    { label: "Floor", value: property.floor },
                    { label: "Total Floor", value: property.totalfloor },
                    { label: "City", value: property.city },
                    { label: "State", value: property.state },
                    { label: "Decoration", value: property.decoration },
                    { label: "Reference", value: `AMK-${property.id}` },
                  ].filter((s) => s.value).map((item) => (
                    <div key={item.label} className="flex justify-between border-b border-gray-100 py-2">
                      <span className="text-amaken-gray">{item.label}</span>
                      <span className="font-medium text-navy">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features/Amenities */}
              {features.length > 0 && (
                <div className="mb-6">
                  <h2 className="mb-3 text-xl font-bold text-navy">Features & Amenities</h2>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-amaken-gray">
                        <svg className="h-4 w-4 flex-shrink-0 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{f.key}: {f.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Floor Plans */}
              {property.mapimage && (
                <div className="mb-6">
                  <h2 className="mb-3 text-xl font-bold text-navy">Floor Plans</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {[property.mapimage, property.topmapimage, property.groundmapimage].filter(Boolean).map((plan, i) => (
                      <div key={i} className="overflow-hidden rounded-lg border border-gray-200">
                        <Image
                          src={plan.startsWith("http") ? plan : `/uploads/properties/${plan}`}
                          alt={`Floor Plan ${i + 1}`}
                          width={400}
                          height={300}
                          className="h-auto w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Videos */}
              {property.video1 && (
                <div className="mb-6">
                  <h2 className="mb-3 text-xl font-bold text-navy">Videos</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {[property.video1, property.video2, property.video3].filter(Boolean).map((video, i) => (
                      <div key={i} className="aspect-video overflow-hidden rounded-lg">
                        <iframe
                          src={video}
                          className="h-full w-full"
                          allowFullScreen
                          title={`Property video ${i + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Agent Card */}
              <div className="rounded-lg border border-gray-200 p-5">
                <h3 className="mb-3 font-bold text-navy">Listed by</h3>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 overflow-hidden rounded-full bg-gray-200">
                    <Image
                      src="/images/user/default-user.jpg"
                      alt="Agent"
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-navy">{property.aemail || "Amaken Agent"}</p>
                    <p className="text-xs text-amaken-gray">Real Estate Agent</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => setShowLeadModal(true)}
                    className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
                  >
                    Contact Agent
                  </button>
                  <a
                    href={`https://wa.me/${CONTACT.WHATSAPP}?text=Hi, I'm interested in ${encodeURIComponent(property.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#25D366] py-2.5 text-sm font-semibold text-[#25D366] transition-colors hover:bg-[#25D366] hover:text-white"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    WhatsApp
                  </a>
                  <a
                    href={`mailto:${CONTACT.EMAIL}?subject=Inquiry about ${encodeURIComponent(property.title)}`}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 py-2.5 text-sm font-semibold text-amaken-gray transition-colors hover:border-primary hover:text-primary"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Email
                  </a>
                </div>
              </div>

              {/* Featured Properties Sidebar */}
              {sidebarProperties.length > 0 && (
                <div className="rounded-lg border border-gray-200 p-5">
                  <h3 className="mb-3 font-bold text-navy">Featured Properties</h3>
                  <div className="space-y-3">
                    {sidebarProperties.slice(0, 3).map((p) => (
                      <Link key={p.id} href={`/properties/${p.id}`} className="flex gap-3 rounded p-2 transition-colors hover:bg-gray-50">
                        <div className="relative h-16 w-20 flex-shrink-0 overflow-hidden rounded">
                          <Image
                            src={p.pimage?.startsWith("http") ? p.pimage : `/uploads/properties/${p.pimage || "0.png"}`}
                            alt={p.title}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="line-clamp-1 text-sm font-medium text-navy">{p.title}</p>
                          <p className="text-xs text-amaken-gray">{p.location}</p>
                          <p className="text-sm font-semibold text-primary">{formatPrice(Number(p.price), p.curr)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Map */}
              <div className="rounded-lg border border-gray-200 p-5">
                <h3 className="mb-3 font-bold text-navy">Location</h3>
                <div className="aspect-video overflow-hidden rounded-lg bg-gray-100">
                  <iframe
                    src={`https://www.google.com/maps?q=${encodeURIComponent(`${property.location}, ${property.city}, ${property.state}`)}&output=embed`}
                    className="h-full w-full border-0"
                    allowFullScreen
                    loading="lazy"
                    title="Property location"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lead Modal */}
      {showLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            {leadSuccess ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <svg className="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-navy">Thank You!</h3>
                <p className="mt-1 text-sm text-amaken-gray">The agent will contact you shortly.</p>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-navy">Contact Agent</h3>
                  <button onClick={() => setShowLeadModal(false)} className="text-gray-400 hover:text-gray-600">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    leadMutation.mutate();
                  }}
                  className="space-y-3"
                >
                  <input
                    type="text"
                    placeholder="Your Name"
                    required
                    value={leadForm.name}
                    onChange={(e) => setLeadForm((p) => ({ ...p, name: e.target.value }))}
                    className="input-field"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    required
                    value={leadForm.email}
                    onChange={(e) => setLeadForm((p) => ({ ...p, email: e.target.value }))}
                    className="input-field"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    required
                    value={leadForm.phone}
                    onChange={(e) => setLeadForm((p) => ({ ...p, phone: e.target.value }))}
                    className="input-field"
                  />
                  <input
                    type="text"
                    placeholder="Nationality"
                    value={leadForm.nationality}
                    onChange={(e) => setLeadForm((p) => ({ ...p, nationality: e.target.value }))}
                    className="input-field"
                  />
                  <button
                    type="submit"
                    disabled={leadMutation.isPending}
                    className="w-full btn-primary disabled:opacity-60"
                  >
                    {leadMutation.isPending ? "Sending..." : "Submit Inquiry"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
