"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { api } from "@/lib/api";
import type { Property } from "@amaken/shared";

export default function FeaturedPropertiesPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const { data } = await api.get("/properties/my", { params: { isFeatured: 1 } });
        if (data.success && data.data) {
          setProperties(data.data as Property[]);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-[80vh] bg-gray-50 py-8">
      <div className="container-custom">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-heading text-2xl font-bold text-navy">My Listed Properties</h1>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          {loading ? (
            <div className="py-12 text-center text-amaken-gray">Loading...</div>
          ) : properties.length === 0 ? (
            <div className="py-12 text-center text-amaken-gray">
              <p>No featured properties.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {properties.map((p) => (
                <div key={p.id} className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center">
                  <img
                    src={p.pimage ? `/uploads/properties/${p.pimage}` : "/images/house-floor-plan.png"}
                    alt={p.title}
                    className="h-32 w-32 rounded object-cover"
                  />
                  <div className="flex-1">
                    <Link href={`/properties/${p.id}`} className="font-heading text-lg font-bold text-navy hover:text-primary">
                      {p.title}
                    </Link>
                    <p className="mt-1 text-sm text-amaken-gray">{p.location}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-amaken-gray">
                      <span>{p.type}</span>
                      <span>|</span>
                      <span>{p.bhk}</span>
                      <span>|</span>
                      <span>{p.stype}</span>
                      <span>|</span>
                      <span>{p.size} sqft</span>
                    </div>
                    <p className="mt-2 text-lg font-bold text-primary">{p.price} {p.curr}</p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/properties/${p.id}`} className="rounded-lg bg-primary/10 px-3 py-2 text-xs font-medium text-primary hover:bg-primary/20">
                      View
                    </Link>
                    <Link href={`/submit-property/${p.id}/edit`} className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-600 hover:bg-amber-100">
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
