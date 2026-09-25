"use client";

import Image from "next/image";
import { useGetAboutContentQuery } from "@/lib/redux/api";
import Accordion from "@/components/shared/Accordion";
import { getAssetUrl } from "@/lib/utils";
import type { About } from "@amaken/shared";

const FAQS = [
  {
    question: "Is Amaken Real Estate based in Dubai?",
    answer: "Yes. Amaken Real Estate is based in Dubai, UAE.",
  },
  {
    question: "What type of properties does Amaken deal with?",
    answer: "Amaken works with residential and commercial property opportunities, including ready, secondary and off-plan properties.",
  },
  {
    question: "Does Amaken offer property for rent in Dubai?",
    answer: "Yes. Amaken supports residential and commercial rental requirements and provides property listing and rental-related services.",
  },
  {
    question: "Does Amaken work with property investors?",
    answer: "Yes. Amaken provides investment-focused property guidance for clients evaluating opportunities in Dubai and the UAE.",
  },
  {
    question: "Can I list my property with Amaken?",
    answer: "Yes. Property owners can contact Amaken to discuss listing and marketing their property.",
  },
  {
    question: "Does Amaken work with overseas buyers?",
    answer: "Yes. Amaken can assist international clients exploring Dubai and UAE property opportunities, subject to applicable laws, regulations and transaction requirements.",
  },
  {
    question: "How can I contact Amaken Real Estate?",
    answer: "Clients can contact Amaken through the official website, phone or email to discuss a property requirement or request an advisor consultation.",
  },
];

export default function AboutContent() {
  const { data, isLoading } = useGetAboutContentQuery();

  const aboutContent: About[] = data?.data || [];

  return (
    <>
      {isLoading ? (
        <div className="space-y-8 py-12">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-3">
              <div className="h-6 w-2/3 animate-pulse rounded bg-gray-200" />
              <div className="h-32 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="h-64 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-3">
              <div className="h-6 w-2/3 animate-pulse rounded bg-gray-200" />
              <div className="h-32 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="h-64 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      ) : aboutContent.length > 0 ? (
        <section className="py-12">
          <div className="container-custom">
            <h2 className="section-heading">Company Updates & Insights</h2>
            <div className="space-y-8">
              {aboutContent.map((item) => (
                <div key={item.id} className="grid items-center gap-8 md:grid-cols-2">
                  <div>
                    {item.title && <h3 className="mb-3 text-xl font-bold text-navy">{item.title}</h3>}
                    <div
                      className="prose prose-sm max-w-none text-amaken-gray"
                      dangerouslySetInnerHTML={{ __html: item.content }}
                    />
                  </div>
                  {item.image && (
                    <div className="relative h-64 overflow-hidden rounded-lg">
                      <Image
                        src={getAssetUrl(`/uploads/properties/${item.image}`)}
                        alt={item.title || "Amaken Real Estate"}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="py-12">
        <div className="container-custom max-w-4xl">
          <h2 className="section-heading">Frequently Asked Questions</h2>
          <Accordion items={FAQS} />
        </div>
      </section>
    </>
  );
}