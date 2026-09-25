"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { SITE } from "@amaken/shared";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/profile");
    }
  }, [isLoading, isAuthenticated, router]);

  return (
    <div className="min-h-[80vh] bg-gray-50 py-12">
      <div className="container-custom">
        <div className="mx-auto max-w-md">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-block">
              <img
                src="/images/logo/amaken.png"
                alt={SITE.NAME}
                className="mx-auto h-12 w-auto"
              />
            </Link>
          </div>
          <div className="rounded-xl bg-white p-8 shadow-lg">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}