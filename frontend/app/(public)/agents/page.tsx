"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { getProperties } from "@/lib/api";
import BreadcrumbBanner from "@/components/shared/BreadcrumbBanner";
import { ProfileSkeleton } from "@/components/shared/Skeletons";
import type { Property } from "@amaken/shared";

export default function AgentsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["agents"],
    queryFn: () => getProperties({ limit: 50, page: 1 }),
  });

  const properties: Property[] = data?.data?.data || [];

  const agentMap = new Map<string, { properties: Property[]; email: string }>();
  properties.forEach((p) => {
    const email = p.aemail || p.email;
    if (!agentMap.has(email)) {
      agentMap.set(email, { properties: [], email });
    }
    agentMap.get(email)!.properties.push(p);
  });

  const agents = Array.from(agentMap.values());

  return (
    <>
      <BreadcrumbBanner
        title="Our Agents"
        subtitle="Meet our experienced real estate agents in Dubai"
        crumbs={[{ label: "Agents" }]}
      />

      <section className="py-12">
        <div className="container-custom">
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => <ProfileSkeleton key={i} />)}
            </div>
          ) : agents.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {agents.map((agent, i) => (
                <div key={i} className="card p-6 text-center">
                  <div className="mx-auto mb-3 h-24 w-24 overflow-hidden rounded-full border-4 border-primary/20 bg-gray-100">
                    <Image
                      src="/images/user/default-user.jpg"
                      alt={agent.email}
                      width={96}
                      height={96}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <h3 className="font-semibold text-navy">{agent.email.split("@")[0]}</h3>
                  <p className="text-xs text-amaken-gray">Real Estate Agent</p>
                  <p className="mt-1 text-sm text-primary">{agent.properties.length} Properties</p>
                  <div className="mt-4 flex justify-center gap-2">
                    <a
                      href={`mailto:${agent.email}`}
                      className="rounded-full bg-primary/10 p-2 text-primary transition-colors hover:bg-primary hover:text-white"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </a>
                    <a
                      href={`tel:${agent.properties[0]?.aemail || ""}`}
                      className="rounded-full bg-navy/10 p-2 text-navy transition-colors hover:bg-navy hover:text-white"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <p className="text-amaken-gray">No agents found at the moment.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
