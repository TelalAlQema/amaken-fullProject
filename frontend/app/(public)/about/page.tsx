import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import BreadcrumbBanner from "@/components/shared/BreadcrumbBanner";
import AboutContent from "@/components/about/AboutContent";
import { CONTACT, SITE } from "@amaken/shared";

export const metadata: Metadata = {
  title: "About Amaken Real Estate | Dubai Property Experts & Investment Advisors",
  description:
    "Learn about Amaken Real Estate, a Dubai-based property brokerage helping buyers, sellers, tenants and investors with residential, commercial, ready and off-plan real estate across the UAE.",
  keywords: [
    "Amaken Real Estate",
    "Dubai real estate company",
    "Dubai real estate agency",
    "property consultants Dubai",
    "Dubai property investment",
    "UAE real estate",
    "off-plan property Dubai",
    "property management Dubai",
  ],
  alternates: { canonical: "https://amaken-realestate.com/about" },
  openGraph: {
    title: "About Amaken Real Estate | Dubai Property Experts & Investment Advisors",
    description:
      "Learn about Amaken Real Estate, a Dubai-based property brokerage helping buyers, sellers, tenants and investors with residential, commercial, ready and off-plan real estate across the UAE.",
    url: "https://amaken-realestate.com/about",
    siteName: "Amaken Real Estate",
    locale: "en_US",
    type: "website",
    images: [{ url: "/images/about.png", width: 800, height: 500 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Amaken Real Estate | Dubai Property Experts & Investment Advisors",
    description:
      "Learn about Amaken Real Estate, a Dubai-based property brokerage helping buyers, sellers, tenants and investors across the UAE.",
    images: ["/images/about.png"],
  },
  robots: { index: true, follow: true },
};

const SERVICES = [
  {
    title: "Property Buying",
    desc: "We help buyers identify and shortlist residential and commercial properties according to their requirements, budget and intended use.",
  },
  {
    title: "Property Selling",
    desc: "We support property owners with positioning, listing, marketing, buyer outreach and transaction coordination.",
  },
  {
    title: "Property Rental",
    desc: "We help tenants and landlords navigate residential and commercial rental opportunities with practical guidance throughout the process.",
  },
  {
    title: "Off-Plan Property",
    desc: "We connect clients with selected new-development opportunities and help them understand location, development features, payment structures and investment considerations.",
  },
  {
    title: "Property Listing & Marketing",
    desc: "We use professional property presentation, digital exposure, online listings, content and targeted marketing to improve property visibility.",
  },
  {
    title: "Investment Advisory",
    desc: "We help investors evaluate property opportunities through factors such as location, market positioning, expected rental demand, potential appreciation and portfolio objectives.",
  },
  {
    title: "Property Management",
    desc: "Where applicable, we support owners seeking structured assistance in managing their property interests and maintaining a reliable ownership experience.",
  },
];

const CORE_VALUES = [
  {
    title: "Integrity",
    desc: "We communicate honestly and aim to build trust through responsible professional conduct.",
  },
  {
    title: "Transparency",
    desc: "We believe clients should understand the opportunity, process and relevant considerations before making a decision.",
  },
  {
    title: "Client Focus",
    desc: "We listen first and tailor our recommendations to the client's actual requirements.",
  },
  {
    title: "Market Knowledge",
    desc: "We continuously develop our understanding of Dubai and the UAE property market.",
  },
  {
    title: "Innovation",
    desc: "We use digital tools, modern property marketing and technology to improve the real estate experience.",
  },
  {
    title: "Long-Term Relationships",
    desc: "We measure success not only by transactions, but by the quality of relationships we build.",
  },
];

const WHY_CHOOSE = [
  "Local Dubai Perspective — We understand the communities, property segments and market dynamics that shape Dubai real estate.",
  "Personalised Guidance — Recommendations are based on your requirements, not simply on available inventory.",
  "Residential & Commercial Coverage — We support both individual and business property requirements.",
  "Ready & Off-Plan Expertise — Clients can explore opportunities across secondary and primary markets.",
  "Digital-First Property Marketing — We combine property listings, content, digital marketing and technology to improve visibility.",
  "Investment Mindset — We consider the broader objective behind a property purchase, including income, growth and portfolio strategy.",
  "Professional Support — Our team aims to provide clear communication from the first enquiry through the next stage of the transaction.",
];

const jsonLdWebPage = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "About Amaken Real Estate",
  description:
    "Learn about Amaken Real Estate, a Dubai-based property brokerage helping buyers, sellers, tenants and investors with residential, commercial, ready and off-plan real estate across the UAE.",
  url: "https://amaken-realestate.com/about",
  inLanguage: "en",
  isPartOf: {
    "@type": "WebSite",
    name: SITE.NAME,
    url: "https://amaken-realestate.com",
  },
};

const jsonLdAgent = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: SITE.NAME,
  description:
    "Dubai-based real estate brokerage providing property buying, selling, rental, listing, off-plan and investment-focused real estate services across Dubai and the UAE.",
  url: "https://amaken-realestate.com",
  logo: "https://amaken-realestate.com/images/logo/amaken.png",
  address: {
    "@type": "PostalAddress",
    streetAddress: CONTACT.ADDRESS,
    addressLocality: CONTACT.ADDRESS_LOCALITY,
    addressCountry: CONTACT.ADDRESS_COUNTRY,
  },
  telephone: CONTACT.PHONE.replace(/\s/g, ""),
  email: CONTACT.EMAIL,
  sameAs: [
    "https://www.facebook.com/amakenrealestate",
    "https://www.instagram.com/amakenrealestate",
    "https://twitter.com/amakenrealestate",
    "https://www.linkedin.com/company/amakenrealestate",
    "https://www.youtube.com/@amakenrealestate",
  ],
};

const jsonLdBreadcrumb = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://amaken-realestate.com/" },
    { "@type": "ListItem", position: 2, name: "About Us", item: "https://amaken-realestate.com/about" },
  ],
};

const jsonLdFaq = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is Amaken Real Estate based in Dubai?",
      acceptedAnswer: { "@type": "Answer", text: "Yes. Amaken Real Estate is based in Dubai, UAE." },
    },
    {
      "@type": "Question",
      name: "What type of properties does Amaken deal with?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Amaken works with residential and commercial property opportunities, including ready, secondary and off-plan properties.",
      },
    },
    {
      "@type": "Question",
      name: "Does Amaken offer property for rent in Dubai?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Amaken supports residential and commercial rental requirements and provides property listing and rental-related services.",
      },
    },
    {
      "@type": "Question",
      name: "Does Amaken work with property investors?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Amaken provides investment-focused property guidance for clients evaluating opportunities in Dubai and the UAE.",
      },
    },
    {
      "@type": "Question",
      name: "Can I list my property with Amaken?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Property owners can contact Amaken to discuss listing and marketing their property.",
      },
    },
    {
      "@type": "Question",
      name: "Does Amaken work with overseas buyers?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Amaken can assist international clients exploring Dubai and UAE property opportunities, subject to applicable laws, regulations and transaction requirements.",
      },
    },
    {
      "@type": "Question",
      name: "How can I contact Amaken Real Estate?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Clients can contact Amaken through the official website, phone or email to discuss a property requirement or request an advisor consultation.",
      },
    },
  ],
};

function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export default function AboutPage() {
  return (
    <>
      <JsonLd data={jsonLdWebPage} />
      <JsonLd data={jsonLdAgent} />
      <JsonLd data={jsonLdBreadcrumb} />
      <JsonLd data={jsonLdFaq} />

      <BreadcrumbBanner
        title="About Us"
        subtitle="Learn more about Amaken Real Estate"
        crumbs={[{ label: "About Us" }]}
        as="h2"
      />

      <section className="py-12">
        <div className="container-custom">
          {/* Intro */}
          <div className="mb-16 grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h1 className="mb-4 text-3xl font-bold text-navy md:text-4xl">
                About Amaken Real Estate — Your Trusted Property Partner in Dubai
              </h1>
              <p className="mb-4 leading-relaxed text-amaken-gray">
                Amaken Real Estate is a Dubai-based real estate brokerage dedicated to helping individuals, families,
                businesses and investors make confident property decisions across Dubai and the UAE.
              </p>
              <p className="mb-4 leading-relaxed text-amaken-gray">
                We provide professional support across residential and commercial property sales, rentals, property
                listings, off-plan opportunities and investment-focused real estate advisory. Our approach combines
                local market knowledge, personalised service, digital property marketing and a clear understanding of
                each client&apos;s objectives.
              </p>
              <p className="leading-relaxed text-amaken-gray">
                Whether you are buying your first home, selling an existing property, searching for a rental, entering
                Dubai&apos;s off-plan market or building a property portfolio, Amaken Real Estate is here to make the
                journey simpler, clearer and more informed.
              </p>
            </div>
            <div className="relative h-80 overflow-hidden rounded-xl">
              <Image
                src="/images/about.png"
                alt="Amaken Real Estate team in Dubai, UAE"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* More Than a Property Transaction */}
          <div className="mb-16">
            <h2 className="mb-4 text-2xl font-bold text-navy">More Than a Property Transaction</h2>
            <p className="mb-4 leading-relaxed text-amaken-gray">
              We believe real estate is about more than a building, a contract or a transaction. A property can
              represent a home, a business opportunity, a source of income, long-term wealth or a strategic
              investment.
            </p>
            <p className="mb-4 leading-relaxed text-amaken-gray">
              That is why we begin by understanding the client: the purpose of the purchase, preferred location,
              budget, timeline, property type and investment objectives. We then work to identify opportunities that
              fit those requirements rather than offering a one-size-fits-all solution.
            </p>
            <p className="leading-relaxed text-amaken-gray">
              Our goal is to build relationships that continue beyond the transaction through responsive
              communication, professional guidance and long-term support.
            </p>
          </div>

          {/* Expertise */}
          <div className="mb-16">
            <h2 className="mb-4 text-2xl font-bold text-navy">Our Expertise Across Dubai &amp; the UAE</h2>
            <p className="mb-4 leading-relaxed text-amaken-gray">
              Dubai&apos;s property market includes established communities, emerging growth areas, luxury residences,
              commercial assets and a wide range of off-plan developments. Each segment has different considerations
              for homeowners, landlords and investors.
            </p>
            <p className="mb-4 leading-relaxed text-amaken-gray">
              Amaken Real Estate supports clients across primary, secondary and off-plan markets. We help clients
              explore opportunities based on location, property type, budget, lifestyle requirements, rental potential
              and long-term investment objectives.
            </p>
            <p className="leading-relaxed text-amaken-gray">
              Our team combines market awareness with digital tools and property information to help clients compare{" "}
              <Link href="/properties" className="text-primary underline hover:no-underline">
                opportunities in the Dubai property market
              </Link>{" "}
              and move forward with greater confidence.
            </p>
          </div>

          {/* Services */}
          <div className="mb-16">
            <h2 className="mb-8 text-2xl font-bold text-navy">Our Services</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {SERVICES.map((service) => (
                <div key={service.title} className="card p-6">
                  <h3 className="mb-2 text-base font-bold text-navy">{service.title}</h3>
                  <p className="text-sm leading-relaxed text-amaken-gray">{service.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mission & Vision */}
          <div className="mb-16 grid gap-8 sm:grid-cols-2">
            <div className="card p-8">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-2xl">
                🎯
              </div>
              <h2 className="mb-2 text-xl font-bold text-navy">Our Mission</h2>
              <p className="text-sm leading-relaxed text-amaken-gray">
                To provide professional, transparent and client-focused real estate services that help people make
                informed property decisions in Dubai and the UAE.
              </p>
            </div>
            <div className="card p-8">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-2xl">
                👁️
              </div>
              <h2 className="mb-2 text-xl font-bold text-navy">Our Vision</h2>
              <p className="text-sm leading-relaxed text-amaken-gray">
                To become a trusted real estate partner in the UAE, recognised for integrity, market knowledge,
                innovation, service quality and lasting client relationships.
              </p>
            </div>
          </div>

          {/* Core Values */}
          <div className="mb-16">
            <h2 className="mb-8 text-2xl font-bold text-navy">Our Core Values</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {CORE_VALUES.map((value) => (
                <div key={value.title} className="card p-6">
                  <h3 className="mb-2 text-base font-bold text-navy">{value.title}</h3>
                  <p className="text-sm leading-relaxed text-amaken-gray">{value.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Why Choose */}
          <div className="mb-16">
            <h2 className="mb-8 text-2xl font-bold text-navy">Why Choose Amaken Real Estate?</h2>
            <ul className="space-y-3">
              {WHY_CHOOSE.map((point) => (
                <li key={point} className="flex items-start gap-3 leading-relaxed text-amaken-gray">
                  <svg
                    className="mt-1 h-5 w-5 flex-shrink-0 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Buyer personas */}
          <div className="mb-16">
            <h2 className="mb-6 text-2xl font-bold text-navy">For Buyers, Sellers, Tenants &amp; Investors</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="card p-6">
                <h3 className="mb-2 text-base font-bold text-navy">For Buyers</h3>
                <p className="text-sm leading-relaxed text-amaken-gray">
                  Amaken helps turn a broad property search into a focused shortlist.{" "}
                  <Link href="/properties" className="text-primary underline hover:no-underline">
                    Browse properties for sale in Dubai
                  </Link>
                  .
                </p>
              </div>
              <div className="card p-6">
                <h3 className="mb-2 text-base font-bold text-navy">For Sellers</h3>
                <p className="text-sm leading-relaxed text-amaken-gray">
                  We help present and market properties to reach relevant potential buyers.{" "}
                  <Link href="/contact" className="text-primary underline hover:no-underline">
                    Speak with our team about listing your property
                  </Link>
                  .
                </p>
              </div>
              <div className="card p-6">
                <h3 className="mb-2 text-base font-bold text-navy">For Tenants</h3>
                <p className="text-sm leading-relaxed text-amaken-gray">
                  We help identify rental options that fit practical lifestyle and business requirements.{" "}
                  <Link href="/properties" className="text-primary underline hover:no-underline">
                    Explore rental properties in Dubai
                  </Link>
                  .
                </p>
              </div>
              <div className="card p-6">
                <h3 className="mb-2 text-base font-bold text-navy">For Investors</h3>
                <p className="text-sm leading-relaxed text-amaken-gray">
                  We provide market-oriented property guidance designed to help evaluate opportunities within the
                  context of a broader investment objective.{" "}
                  <Link href="/blog" className="text-primary underline hover:no-underline">
                    Read Dubai real estate investment insights
                  </Link>
                  .
                </p>
              </div>
            </div>
            <p className="mt-6 text-sm leading-relaxed text-amaken-gray">
              For international clients, we provide a local point of contact for exploring Dubai and UAE property
              opportunities and understanding the next steps in the acquisition process.
            </p>
          </div>

          {/* Commitment */}
          <div className="mb-16">
            <h2 className="mb-4 text-2xl font-bold text-navy">Our Commitment to Clients</h2>
            <p className="mb-4 leading-relaxed text-amaken-gray">
              Every client has a different reason for entering the property market. We respect that difference.
            </p>
            <p className="mb-4 leading-relaxed text-amaken-gray">
              At Amaken Real Estate, our commitment is to listen carefully, communicate clearly and provide practical
              support throughout the property journey. We aim to make complex property decisions easier to understand
              while helping clients identify opportunities that align with their goals.
            </p>
            <p className="leading-relaxed text-amaken-gray">
              Your property journey should be built on confidence, clarity and trust. That is the experience we aim to
              deliver at Amaken.
            </p>
          </div>
        </div>
      </section>

      {/* CMS Content + FAQ */}
      <AboutContent />

      {/* CTA */}
      <section className="bg-navy py-16">
        <div className="container-custom text-center">
          <h2 className="mb-3 text-2xl font-bold text-white md:text-3xl">
            Ready to Explore Your Next Property Opportunity?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-gray-300">
            Whether you are looking to buy, sell, rent or invest in Dubai, speak with the Amaken Real Estate team.
            Tell us your requirements, preferred location, budget and property objective. We will help you explore
            suitable opportunities and determine the right next step.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/properties" className="btn-primary">
              Explore Properties
            </Link>
            <Link href="/contact" className="btn-outline border-white text-white hover:bg-white hover:text-navy">
              Speak to an Advisor
            </Link>
            <Link href="/blog" className="btn-outline border-white text-white hover:bg-white hover:text-navy">
              Real Estate Insights
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}