"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { getAboutContent } from "@/lib/api";
import BreadcrumbBanner from "@/components/shared/BreadcrumbBanner";
import { BannerSkeleton } from "@/components/shared/Skeletons";
import type { About } from "@amaken/shared";

export default function AboutPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["about"],
    queryFn: () => getAboutContent(),
  });

  const aboutContent: About[] = data?.data?.data || [];

  return (
    <>
      <BreadcrumbBanner
        title="About Us"
        subtitle="Learn more about Amaken Real Estate"
        crumbs={[{ label: "About Us" }]}
      />

      <section className="py-12">
        <div className="container-custom">
          {/* Intro */}
          <div className="mb-16 grid items-center gap-12 md:grid-cols-2">
            <div>
              <h2 className="mb-4 text-3xl font-bold text-navy">Welcome to Amaken Real Estate</h2>
              <p className="mb-4 text-amaken-gray leading-relaxed">
                Amaken Real Estate is a leading real estate company based in Dubai, UAE. We specialize in providing
                comprehensive real estate services including property buying, selling, renting, and management.
              </p>
              <p className="text-amaken-gray leading-relaxed">
                With years of experience in the UAE real estate market, our team of expert agents is dedicated to
                helping you find the perfect property that meets your needs and budget.
              </p>
            </div>
            <div className="relative h-80 overflow-hidden rounded-xl">
              <Image src="/images/about.png" alt="About Amaken Real Estate" fill className="object-cover" />
            </div>
          </div>

          {/* CMS Content */}
          {isLoading ? (
            <div className="space-y-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 animate-pulse rounded-lg bg-gray-200" />
              ))}
            </div>
          ) : aboutContent.length > 0 ? (
            <div className="space-y-8">
              {aboutContent.map((item) => (
                <div key={item.id} className="grid items-center gap-8 md:grid-cols-2">
                  <div>
                    {item.title && <h3 className="mb-3 text-xl font-bold text-navy">{item.title}</h3>}
                    <div className="text-sm leading-relaxed text-amaken-gray prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: item.content }} />
                  </div>
                  {item.image && (
                    <div className="relative h-64 overflow-hidden rounded-lg">
                      <Image
                        src={item.image.startsWith("http") ? item.image : `/uploads/properties/${item.image}`}
                        alt={item.title || "About"}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-amaken-gray">About information will be available soon.</p>
            </div>
          )}

          {/* Mission & Vision */}
          <div className="mt-16 grid gap-8 sm:grid-cols-2">
            <div className="card p-8">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-2xl text-primary">🎯</div>
              <h3 className="mb-2 text-xl font-bold text-navy">Our Mission</h3>
              <p className="text-sm text-amaken-gray">To provide exceptional real estate services and help our clients make informed decisions in the Dubai property market.</p>
            </div>
            <div className="card p-8">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-2xl text-primary">👁️</div>
              <h3 className="mb-2 text-xl font-bold text-navy">Our Vision</h3>
              <p className="text-sm text-amaken-gray">To be the most trusted real estate partner in the UAE, known for integrity, professionalism, and client satisfaction.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
