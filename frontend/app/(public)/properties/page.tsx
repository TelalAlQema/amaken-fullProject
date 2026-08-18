"use client";

import { Suspense, useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { getProperties } from "@/lib/api";
import PropertyCard from "@/components/shared/PropertyCard";
import Pagination from "@/components/shared/Pagination";
import EmptyState from "@/components/shared/EmptyState";
import BreadcrumbBanner from "@/components/shared/BreadcrumbBanner";
import { PropertyCardSkeleton } from "@/components/shared/Skeletons";
import { PROPERTY_TYPES, SELLING_TYPES, BHK_OPTIONS, PLAN_TYPES, DECORATION_TYPES } from "@amaken/shared";
import type { Property } from "@amaken/shared";

function PropertiesContent() {
  const searchParams = useSearchParams();

  const [view, setView] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    type: searchParams.get("type") || "",
    stype: searchParams.get("stype") || "",
    bhk: searchParams.get("bhk") || "",
    plan: searchParams.get("plan") || "",
    decoration: searchParams.get("decoration") || "",
    city: searchParams.get("city") || "",
    state: searchParams.get("state") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    minSize: searchParams.get("minSize") || "",
    maxSize: searchParams.get("maxSize") || "",
    sort: searchParams.get("sort") || "",
    offer: searchParams.get("offer") || "",
  });

  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);

  const queryParams = useMemo(() => {
    const params: Record<string, string | number> = { page, limit: 12 };
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params[key] = value;
    });
    return params;
  }, [filters, page]);

  const { data, isLoading } = useQuery({
    queryKey: ["properties", "list", queryParams],
    queryFn: () => getProperties(queryParams),
  });

  const properties: Property[] = data?.data?.data || [];
  const pagination = data?.data?.pagination;

  const updateFilter = useCallback((key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: "", type: "", stype: "", bhk: "", plan: "", decoration: "",
      city: "", state: "", minPrice: "", maxPrice: "", minSize: "", maxSize: "",
      sort: "", offer: "",
    });
    setPage(1);
  }, []);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <>
      <BreadcrumbBanner
        title="Discover Your Perfect Home"
        subtitle="Browse our extensive collection of properties in Dubai"
        crumbs={[{ label: "Properties" }]}
      />

      <section className="py-8">
        <div className="container-custom">
          {/* Search Bar */}
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by location, property name..."
                value={filters.search}
                onChange={(e) => updateFilter("search", e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                  showFilters ? "border-primary bg-primary text-white" : "border-gray-300 text-amaken-gray hover:border-primary"
                }`}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
                {activeFilterCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs">{activeFilterCount}</span>
                )}
              </button>
              <div className="flex overflow-hidden rounded-lg border border-gray-300">
                <button
                  onClick={() => setView("grid")}
                  className={`p-3 transition-colors ${view === "grid" ? "bg-primary text-white" : "text-amaken-gray hover:bg-gray-50"}`}
                  aria-label="Grid view"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setView("list")}
                  className={`p-3 transition-colors ${view === "list" ? "bg-primary text-white" : "text-amaken-gray hover:bg-gray-50"}`}
                  aria-label="List view"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-amaken-gray">Type</label>
                  <select value={filters.type} onChange={(e) => updateFilter("type", e.target.value)} className="select-field">
                    <option value="">All Types</option>
                    {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-amaken-gray">For</label>
                  <select value={filters.stype} onChange={(e) => updateFilter("stype", e.target.value)} className="select-field">
                    <option value="">All</option>
                    {SELLING_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-amaken-gray">Bedrooms</label>
                  <select value={filters.bhk} onChange={(e) => updateFilter("bhk", e.target.value)} className="select-field">
                    <option value="">Any</option>
                    {BHK_OPTIONS.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-amaken-gray">Plan</label>
                  <select value={filters.plan} onChange={(e) => updateFilter("plan", e.target.value)} className="select-field">
                    <option value="">All</option>
                    {PLAN_TYPES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-amaken-gray">Min Price (AED)</label>
                  <input type="number" placeholder="No min" value={filters.minPrice} onChange={(e) => updateFilter("minPrice", e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-amaken-gray">Max Price (AED)</label>
                  <input type="number" placeholder="No max" value={filters.maxPrice} onChange={(e) => updateFilter("maxPrice", e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-amaken-gray">Decoration</label>
                  <select value={filters.decoration} onChange={(e) => updateFilter("decoration", e.target.value)} className="select-field">
                    <option value="">All</option>
                    {DECORATION_TYPES.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-amaken-gray">Sort By</label>
                  <select value={filters.sort} onChange={(e) => updateFilter("sort", e.target.value)} className="select-field">
                    <option value="">Default</option>
                    <option value="newest">Newest</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <button onClick={clearFilters} className="text-sm text-primary hover:underline">Clear All Filters</button>
                <span className="text-sm text-amaken-gray">
                  {pagination ? `${pagination.total} properties found` : ""}
                </span>
              </div>
            </div>
          )}

          {/* Results */}
          {isLoading ? (
            <div className={view === "grid" ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
              {Array.from({ length: 6 }).map((_, i) => (
                <PropertyCardSkeleton key={i} />
              ))}
            </div>
          ) : properties.length > 0 ? (
            <>
              <div className={view === "grid" ? "grid gap-6 sm:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
                {properties.map((p) => (
                  <PropertyCard key={p.id} property={p} variant={view} />
                ))}
              </div>
              {pagination && (
                <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
              )}
            </>
          ) : (
            <EmptyState
              title="No properties found"
              description="Try adjusting your filters to see more results."
              actionLabel="Clear Filters"
              actionHref="/properties"
            />
          )}
        </div>
      </section>
    </>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={
      <>
        <div className="h-64 animate-pulse bg-gray-200" />
        <div className="container-custom py-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
          </div>
        </div>
      </>
    }>
      <PropertiesContent />
    </Suspense>
  );
}
