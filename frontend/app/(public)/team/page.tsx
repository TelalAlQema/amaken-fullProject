"use client";

import Image from "next/image";
import { useGetTeamMembersQuery } from "@/lib/redux/api";
import BreadcrumbBanner from "@/components/shared/BreadcrumbBanner";
import { ProfileSkeleton } from "@/components/shared/Skeletons";
import { getAssetUrl } from "@/lib/utils";
import type { TeamMember } from "@amaken/shared";

function TeamCard({ member }: { member: TeamMember }) {
  const imgSrc = getAssetUrl(`/uploads/properties/${member.image || "0.png"}`);

  const socials = [
    member.fb && {
      href: member.fb,
      label: `${member.fname} on Facebook`,
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
        </svg>
      ),
    },
    member.ig && {
      href: member.ig,
      label: `${member.fname} on Instagram`,
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="17.5" cy="6.5" r="1.5" />
        </svg>
      ),
    },
    member.linkdin && {
      href: member.linkdin,
      label: `${member.fname} on LinkedIn`,
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 2a2 2 0 110 4 2 2 0 010-4z" />
        </svg>
      ),
    },
  ].filter(Boolean) as { href: string; label: string; icon: React.ReactNode }[];

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl bg-navy shadow">
      {/* The 3D flip is pointer/keyboard only (sm and up). Touch devices have no
          hover, so below `sm` the bio and socials render inline underneath
          instead — otherwise they are unreachable on every phone and tablet. */}
      <div className="relative aspect-[4/5] w-full sm:aspect-auto sm:h-80 sm:[transform-style:preserve-3d]">
        {/* Front */}
        <div className="absolute inset-0 overflow-hidden rounded-xl [backface-visibility:hidden]">
          <Image
            src={imgSrc}
            alt={`${member.fname} ${member.lname}`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <h3 className="text-lg font-bold text-white">
              {member.fname} {member.lname}
            </h3>
            <p className="text-sm font-medium text-secondary">{member.position}</p>
          </div>
        </div>

        {/* Back — sm and up only */}
        <div className="absolute inset-0 hidden rounded-xl bg-navy p-6 [backface-visibility:hidden] [transform:rotateY(180deg)] sm:block sm:group-hover:[transform:rotateY(180deg)] sm:group-focus-within:[transform:rotateY(180deg)]">
          <h3 className="mb-1 text-lg font-bold text-white">
            {member.fname} {member.lname}
          </h3>
          <p className="mb-4 text-sm font-medium text-secondary">{member.position}</p>
          {member.about && (
            <p className="mb-4 line-clamp-6 text-sm leading-relaxed text-gray-300">
              {member.about}
            </p>
          )}
          <div className="flex gap-3">
            {socials.map((s) => (
              <a
                key={s.href}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="rounded p-1 text-gray-400 transition-colors hover:text-secondary"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Inline detail for small screens — always rendered, never hover-gated */}
      <div className="flex flex-col p-5 sm:hidden">
        <p className="mb-3 text-sm font-medium text-secondary">{member.position}</p>
        {member.about && (
          <p className="mb-4 text-sm leading-relaxed text-gray-300">{member.about}</p>
        )}
        {socials.length > 0 && (
          <div className="flex gap-4">
            {socials.map((s) => (
              <a
                key={s.href}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="text-gray-400 transition-colors hover:text-secondary"
              >
                {s.icon}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TeamPage() {
  const { data, isLoading } = useGetTeamMembersQuery();

  const members: TeamMember[] = data?.data || [];
  const leaders = members.filter((m) => m.type === "leader");
  const team = members.filter((m) => m.type !== "leader");

  return (
    <>
      <BreadcrumbBanner
        title="Our Team"
        subtitle="Meet the people behind Amaken Real Estate"
        bgImage="/images/ourteam.png"
        crumbs={[{ label: "Team" }]}
      />

      <section className="py-12">
        <div className="container-custom">
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => <ProfileSkeleton key={i} />)}
            </div>
          ) : (
            <>
              {leaders.length > 0 && (
                <div className="mb-12">
                  <h2 className="section-heading">Team Leaders</h2>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {leaders.map((m) => <TeamCard key={m.id} member={m} />)}
                  </div>
                </div>
              )}

              {team.length > 0 && (
                <div>
                  <h2 className="section-heading">Our Members</h2>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {team.map((m) => <TeamCard key={m.id} member={m} />)}
                  </div>
                </div>
              )}

              {members.length === 0 && (
                <div className="py-16 text-center">
                  <p className="text-amaken-gray">Team information will be available soon.</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
