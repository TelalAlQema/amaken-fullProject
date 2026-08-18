"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getUserProfile } from "@/lib/api";
import BreadcrumbBanner from "@/components/shared/BreadcrumbBanner";
import PropertyCard from "@/components/shared/PropertyCard";
import StarRating from "@/components/shared/StarRating";
import { ProfileSkeleton } from "@/components/shared/Skeletons";
import { CONTACT } from "@amaken/shared";
import type { User } from "@amaken/shared";

export default function UserProfilePage() {
  const params = useParams();
  const id = Number(params.id);

  const { data, isLoading } = useQuery({
    queryKey: ["user", id],
    queryFn: () => getUserProfile(id),
    enabled: !!id,
  });

  const user: User | undefined = data?.data?.data as User | undefined;

  if (isLoading) {
    return (
      <>
        <div className="h-64 animate-pulse bg-gray-200" />
        <div className="container-custom py-12"><ProfileSkeleton /></div>
      </>
    );
  }

  if (!user) {
    return (
      <div className="container-custom py-20 text-center">
        <h1 className="text-2xl font-bold text-navy">User Not Found</h1>
        <Link href="/properties" className="btn-primary mt-4 inline-flex">Browse Properties</Link>
      </div>
    );
  }

  const avatarSrc = user.uimage?.startsWith("http") ? user.uimage : user.uimage ? `/uploads/users/${user.uimage}` : "/images/user/default-user.jpg";

  return (
    <>
      <BreadcrumbBanner
        title={`${user.uname} ${user.lname}`}
        crumbs={[{ label: "Profile" }]}
      />

      <section className="py-12">
        <div className="container-custom">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <div className="card p-6 text-center">
                <div className="mx-auto mb-4 h-28 w-28 overflow-hidden rounded-full border-4 border-primary/20 bg-gray-100">
                  <Image src={avatarSrc} alt={`${user.uname} ${user.lname}`} width={112} height={112} className="h-full w-full object-cover" />
                </div>
                <h2 className="text-xl font-bold text-navy">{user.uname} {user.lname}</h2>
                <p className="mt-1 text-sm capitalize text-primary">{user.utype}</p>
                {user.company && <p className="mt-1 text-sm text-amaken-gray">{user.company}</p>}
                {user.city && <p className="mt-1 text-xs text-amaken-gray">{user.city}{user.state ? `, ${user.state}` : ""}</p>}

                <div className="mt-4 flex justify-center gap-2">
                  <a href={`mailto:${user.uemail}`} className="rounded-full bg-primary/10 p-2.5 text-primary transition-colors hover:bg-primary hover:text-white">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </a>
                  {user.uphone && (
                    <a href={`tel:${user.uphone}`} className="rounded-full bg-navy/10 p-2.5 text-navy transition-colors hover:bg-navy hover:text-white">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </a>
                  )}
                  <a
                    href={`https://wa.me/${CONTACT.WHATSAPP}?text=Hello, I found your profile on Amaken Real Estate`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-[#25D366]/10 p-2.5 text-[#25D366] transition-colors hover:bg-[#25D366] hover:text-white"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </a>
                </div>

                {/* Social Links */}
                <div className="mt-4 flex justify-center gap-2">
                  {user.fb && <a href={user.fb} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600"><svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /></svg></a>}
                  {user.linkedin && <a href={user.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-700"><svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 2a2 2 0 110 4 2 2 0 010-4z" /></svg></a>}
                  {user.instagram && <a href={user.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-600"><svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="5" /><circle cx="17.5" cy="6.5" r="1.5" /></svg></a>}
                  {user.twitter && <a href={user.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400"><svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" /></svg></a>}
                </div>

                <div className="mt-4 border-t border-gray-100 pt-4 text-left text-sm">
                  {user.Address && <p className="mb-1 text-amaken-gray"><span className="font-medium text-navy">Address:</span> {user.Address}</p>}
                  {user.company && <p className="mb-1 text-amaken-gray"><span className="font-medium text-navy">Company:</span> {user.company}</p>}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-2">
              <div className="card p-6">
                <h3 className="mb-4 text-lg font-bold text-navy">About</h3>
                <p className="text-sm text-amaken-gray">
                  {user.uname} is a {user.utype?.toLowerCase()} based in {user.city || "Dubai"}, UAE.
                  {user.company ? ` Working at ${user.company}.` : ""}
                  {" "}Member since {user.date ? new Date(user.date).getFullYear() : "N/A"}.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
