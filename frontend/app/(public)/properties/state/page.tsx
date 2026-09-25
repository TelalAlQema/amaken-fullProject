"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useGetPropertiesByStateQuery } from "@/lib/redux/api";
import PropertyCard from "@/components/shared/PropertyCard";
import Pagination from "@/components/shared/Pagination";
import EmptyState from "@/components/shared/EmptyState";
import BreadcrumbBanner from "@/components/shared/BreadcrumbBanner";
import { PropertyCardSkeleton } from "@/components/shared/Skeletons";

function StatePropertiesContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug") || "";
  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetPropertiesByStateQuery(
    { slug, params: { page, limit: 12 } },
    { skip: !slug }
  );

  const properties = data?.data || [];
  const pagination = data?.pagination;

  return (
    <>
      <BreadcrumbBanner
        title={`Properties in ${slug}`}
        subtitle={`Browse all properties in ${slug}`}
        crumbs={[{ label: "Properties", href: "/properties" }, { label: slug }]}
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
              title={`No properties in ${slug}`}
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

export default function StatePropertiesPage() {
  return (
    <Suspense fallback={
      <div className="container-custom py-12">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
        </div>
      </div>
    }>
      <StatePropertiesContent />
    </Suspense>
  );
}
