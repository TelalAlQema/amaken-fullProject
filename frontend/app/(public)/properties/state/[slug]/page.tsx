"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { getPropertiesByState } from "@/lib/api";
import PropertyCard from "@/components/shared/PropertyCard";
import Pagination from "@/components/shared/Pagination";
import EmptyState from "@/components/shared/EmptyState";
import BreadcrumbBanner from "@/components/shared/BreadcrumbBanner";
import { PropertyCardSkeleton } from "@/components/shared/Skeletons";

export default function StatePropertiesPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["properties", "state", slug, page],
    queryFn: () => getPropertiesByState(slug, { page, limit: 12 }),
    enabled: !!slug,
  });

  const properties = data?.data?.data || [];
  const pagination = data?.data?.pagination;

  return (
    <>
      <BreadcrumbBanner
        title={`Properties in ${decodeURIComponent(slug)}`}
        subtitle={`Browse all properties in ${decodeURIComponent(slug)}`}
        crumbs={[{ label: "Properties", href: "/properties" }, { label: decodeURIComponent(slug) }]}
      />

      <section className="py-12">
        <div className="container-custom">
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
            </div>
          ) : properties.length > 0 ? (
            <>
              <div className="mb-6 text-sm text-amaken-gray">
                {pagination ? `${pagination.total} properties found` : `${properties.length} properties`}
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {properties.map((p: any) => <PropertyCard key={p.id} property={p} />)}
              </div>
              {pagination && (
                <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
              )}
            </>
          ) : (
            <EmptyState
              title={`No properties in ${decodeURIComponent(slug)}`}
              description="Check back later or browse properties in other locations."
              actionLabel="Browse All Properties"
              actionHref="/properties"
            />
          )}
        </div>
      </section>
    </>
  );
}
