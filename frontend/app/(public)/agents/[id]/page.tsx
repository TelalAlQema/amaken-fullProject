"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getProperties } from "@/lib/api";
import BreadcrumbBanner from "@/components/shared/BreadcrumbBanner";
import PropertyCard from "@/components/shared/PropertyCard";
import { ProfileSkeleton } from "@/components/shared/Skeletons";
import { CONTACT } from "@amaken/shared";
import type { Property } from "@amaken/shared";

export default function AgentDetailPage() {
  const params = useParams();
  const agentEmail = params.id as string;

  const { data, isLoading } = useQuery({
    queryKey: ["properties", "agent", agentEmail],
    queryFn: () => getProperties({ limit: 50, page: 1 }),
    enabled: !!agentEmail,
  });

  const allProperties: Property[] = data?.data?.data || [];
  const agentProperties = allProperties.filter(
    (p) => p.aemail === decodeURIComponent(agentEmail) || p.email === decodeURIComponent(agentEmail)
  );

  const agentName = decodeURIComponent(agentEmail).split("@")[0];

  if (isLoading) {
    return (
      <>
        <div className="h-64 animate-pulse bg-gray-200" />
        <div className="container-custom py-12"><ProfileSkeleton /></div>
      </>
    );
  }

  return (
    <>
      <BreadcrumbBanner
        title={agentName}
        crumbs={[{ label: "Agents", href: "/agents" }, { label: agentName }]}
      />

      <section className="py-12">
        <div className="container-custom">
          {/* Agent Info */}
          <div className="mb-8 card p-6">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-primary/20 bg-gray-100">
                <Image src="/images/user/default-user.jpg" alt={agentName} width={80} height={80} className="h-full w-full object-cover" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-navy">{agentName}</h2>
                <p className="text-sm text-primary">Real Estate Agent</p>
                <p className="text-xs text-amaken-gray">{agentProperties.length} Properties Listed</p>
              </div>
              <div className="ml-auto flex gap-2">
                <a
                  href={`mailto:${decodeURIComponent(agentEmail)}`}
                  className="rounded-full bg-primary/10 p-2.5 text-primary transition-colors hover:bg-primary hover:text-white"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </a>
                <a
                  href={`https://wa.me/${CONTACT.WHATSAPP}?text=Hello, I'm interested in properties listed by ${agentName}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-[#25D366]/10 p-2.5 text-[#25D366] transition-colors hover:bg-[#25D366] hover:text-white"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Agent Properties */}
          <h3 className="mb-4 text-lg font-bold text-navy">
            Properties by {agentName} ({agentProperties.length})
          </h3>
          {agentProperties.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {agentProperties.map((p) => <PropertyCard key={p.id} property={p} />)}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-amaken-gray">No properties listed by this agent yet.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
