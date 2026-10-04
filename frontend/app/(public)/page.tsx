"use client";

import Link from "next/link";
import Image from "next/image";
import { useGetPropertiesQuery, useGetAboutContentQuery } from "@/lib/redux/api";
import PropertyCard from "@/components/shared/PropertyCard";
import HeroSearch from "@/components/shared/HeroSearch";
import { PropertyCardSkeleton } from "@/components/shared/Skeletons";
import { CONTACT, SITE } from "@amaken/shared";
import type { Property, About, TeamMember } from "@amaken/shared";

const WHAT_WE_DO = [
  { icon: "flaticon-seller", title: "Selling Service", desc: "Find your perfect home with our expert guidance through Dubai's real estate market." },
  { icon: "flaticon-rent", title: "Rental Service", desc: "Discover the best rental properties tailored to your lifestyle and budget." },
  { icon: "flaticon-list", title: "Property Listing", desc: "List your property with us and reach thousands of potential buyers and tenants." },
  { icon: "flaticon-pin", title: "Best Areas In Dubai", desc: "Explore prime locations in Dubai curated by our experienced agents." },
];

const WHY_CHOOSE_US = [
  { icon: "flaticon-medal", title: "Top Rated", desc: "Award-winning real estate services in Dubai" },
  { icon: "flaticon-reward", title: "Experience Quality", desc: "Over a decade of trusted service in the UAE market" },
  { icon: "flaticon-user", title: "Experienced Agents", desc: "Professional agents who understand your needs" },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Discussion", desc: "Tell us what you're looking for and we'll help define your requirements." },
  { step: "02", title: "Files Review", desc: "We review all paperwork and handle the documentation process." },
  { step: "03", title: "Acquire", desc: "Finalize your deal and move into your new property." },
];

const POPULAR_PLACES = [
  { name: "Dubai", slug: "Dubai", color: "from-primary to-primary-600" },
  { name: "Abu Dhabi", slug: "Abu Dhabi", color: "from-navy to-navy-light" },
  { name: "Sharjah", slug: "Sharjah", color: "from-primary-700 to-primary-800" },
  { name: "Ajman", slug: "Ajman", color: "from-navy-900 to-navy" },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: "Amaken Real Estate",
  description: "Find your dream property in Dubai. Browse villas, apartments, townhouses and more with Amaken Real Estate.",
  url: "https://amaken-realestate.com",
  logo: "https://amaken-realestate.com/images/logo/amaken.png",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Al Reem Tower, Office 1301",
    addressLocality: "Dubai",
    addressRegion: "Dubai",
    addressCountry: "AE",
  },
  telephone: "+971558965353",
  email: "info@amaken-realestate.com",
  sameAs: [
    "https://www.facebook.com/amakenrealestate",
    "https://www.instagram.com/amakenrealestate",
    "https://twitter.com/amakenrealestate",
    "https://www.linkedin.com/company/amakenrealestate",
    "https://www.youtube.com/@amakenrealestate",
  ],
};

export default function HomePage() {
  const { data: offPlanData, isLoading: offPlanLoading } = useGetPropertiesQuery({ plan: "Off Plan", limit: 6, page: 1 });
  console.log("offPlanData +++++++++++++++++++", offPlanData);

  const { data: offerData } = useGetPropertiesQuery({ offer: "1", limit: 4, page: 1 });

  const { data: recentData, isLoading: recentLoading } = useGetPropertiesQuery({ limit: 6, page: 1, sort: "date_desc" });

  const { data: aboutData } = useGetAboutContentQuery();

  const offPlanProperties: Property[] = offPlanData?.data || [];
  const offerProperties: Property[] = offerData?.data || [];
  const recentProperties: Property[] = recentData?.data || [];
  const aboutContent: About[] = aboutData?.data || [];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section */}
      <section
        className="relative flex min-h-[540px] items-center bg-cover bg-center md:h-[70vh] md:min-h-[600px]"
        style={{ backgroundImage: "url('/images/banner/main.png')" }}
      >
        {/* Left-side content overlay */}
        <div className="absolute left-0 top-1/2 w-[38vw] -translate-y-1/2 bg-navy/60 rounded-tr-[200px] rounded-br-[200px]">
          <div className="px-6 py-10 sm:px-8 sm:py-12 md:px-12 md:py-14">
            <div className="max-w-3xl">
              <h1 className="mb-4 text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
                <span className="text-secondary pr-4">
                  Let us Help You Find
                </span>
                Your Dream Home
              </h1>

              <p className="mb-8 text-lg text-gray-200">
                Your trusted partner in finding the perfect property in Dubai and
                the UAE. We offer the best deals on villas, apartments, and
                commercial properties.
              </p>

            
            </div>
          </div>
        </div>
      </section>
      <section className="bg-primary py-4 sm:py-6">
        <div className="container-custom">
          <HeroSearch />
        </div>
      </section>
      {/* Off Plan Section */}
      <section className="py-12 sm:py-16">
        <div className="container-custom">
          <div className="mb-8 flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-navy md:text-3xl">Off Plan Properties</h2>
              <p className="mt-1 text-amaken-gray">Explore exclusive off-plan investment opportunities</p>
            </div>
            <Link href="/properties?plan=Off+Plan" className="text-sm font-semibold text-primary hover:underline">
              View All →
            </Link>
          </div>
          {offPlanLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
            </div>
          ) : offPlanProperties.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {offPlanProperties.map((p) => <PropertyCard key={p.id} property={p} />)}
            </div>
          ) : (
            <p className="py-12 text-center text-amaken-gray">No off-plan properties available at the moment.</p>
          )}
        </div>
      </section>

      {/* Special Offers */}
      {offerProperties.length > 0 && (
        <section className="bg-gray-50 py-12 sm:py-16">
          <div className="container-custom">
            <div className="mb-8 flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-navy md:text-3xl">Special Offers</h2>
                <p className="mt-1 text-amaken-gray">Don't miss these exclusive deals</p>
              </div>
              <Link href="/properties?offer=1" className="text-sm font-semibold text-primary hover:underline">
                View All →
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {offerProperties.map((p) => <PropertyCard key={p.id} property={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* What We Do */}
      <section
        className="relative min-h-[70vh] overflow-hidden bg-cover bg-center py-12 sm:py-16"
        style={{ backgroundImage: "url('/images/what.png')" }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-primary/40" />

        <div className="container-custom relative z-10">

          {/* Section Heading */}
          <div className="text-center">
            <h1 className="section-heading text-secondary">
              What We Do
            </h1>

            <p className="section-subheading text-white/90 text-xl">
              Comprehensive real estate solutions for every need
            </p>
          </div>

          {/* Services */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {WHAT_WE_DO.map((item, i) => (
              <div
                key={i}
                className="card bg-navy/60 p-6 text-center backdrop-blur-xs"
              >
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-3xl text-secondary">
                  <span
                    className={`flaticon ${item.icon}`}
                    aria-hidden="true"
                  />
                </div>

                <h3 className="mb-2 text-lg font-semibold text-secondary">
                  {item.title}
                </h3>

                <p className="text-sm text-gray-200">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Recent Properties */}
      <section className="bg-gray-50 py-12 sm:py-16">
        <div className="container-custom">
          <div className="mb-8 flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-navy md:text-3xl">Recent Properties</h2>
              <p className="mt-1 text-amaken-gray">Latest listings added to our portfolio</p>
            </div>
            <Link href="/properties" className="text-sm font-semibold text-primary hover:underline">
              View All →
            </Link>
          </div>
          {recentLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
            </div>
          ) : recentProperties.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recentProperties.map((p) => <PropertyCard key={p.id} property={p} />)}
            </div>
          ) : (
            <p className="py-12 text-center text-amaken-gray">No properties available yet.</p>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section
        className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-cover bg-center py-12 sm:py-16"
        style={{ backgroundImage: "url('/images/1.png')" }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-primary/10" />

        {/* Centered Content */}
        <div className="container-custom relative z-10 w-full">
          <div className="text-center">

            {/* Heading */}
            <h2 className="section-heading mb-10 text-secondary">
              Why Choose Us
            </h2>

            {/* Cards */}
            <div className="grid gap-8 sm:grid-cols-3">
              {WHY_CHOOSE_US.map((item, i) => (
                <div
                  key={i}
                  className="card bg-navy/60 p-8 text-center backdrop-blur-xs"
                >
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-3xl text-secondary">
                    <span
                      className={`flaticon ${item.icon}`}
                      aria-hidden="true"
                    />
                  </div>

                  <h3 className="mb-2 text-lg font-semibold text-secondary">
                    {item.title}
                  </h3>

                  <p className="text-sm text-gray-200">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 sm:py-16">
        <div className="container-custom">
          <h2 className="section-heading">How It Works</h2>
          <p className="section-subheading">Simple steps to find your perfect property</p>
          <div className="grid gap-8 sm:grid-cols-3">
            {HOW_IT_WORKS.map((item, i) => (
              <div key={i} className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-white">
                  {item.step}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-navy">{item.title}</h3>
                <p className="text-sm text-amaken-gray">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievement Counters */}
      <section className="bg-primary py-12">
        <div className="container-custom">
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-4 md:gap-8">
            {[
              { label: "Property Available", value: "500+" },
              { label: "Sale Properties", value: "300+" },
              { label: "Rent Properties", value: "200+" },
              { label: "Registered Users", value: "1000+" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl font-bold text-white sm:text-3xl md:text-4xl">{stat.value}</div>
                <div className="mt-1 text-sm text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Places */}
      <section className="py-12 sm:py-16">
        <div className="container-custom">
          <h2 className="section-heading">Popular Places</h2>
          <p className="section-subheading">Explore properties in the most sought-after locations</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {POPULAR_PLACES.map((place, i) => (
              <Link
                key={i}
                href={`/properties/state?slug=${place.slug}`}
                className={`group relative flex h-40 items-end overflow-hidden rounded-xl bg-gradient-to-br ${place.color} p-6 transition-transform hover:scale-[1.02]`}
              >
                <div>
                  <h3 className="text-xl font-bold text-white">{place.name}</h3>
                  <p className="text-sm text-white/80">Browse properties →</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* About Preview */}
      {aboutContent.length > 0 && (
        <section className="bg-gray-50 py-12 sm:py-16">
          <div className="container-custom">
            <div className="grid items-center gap-12 md:grid-cols-2">
              <div>
                <h2 className="mb-4 text-2xl font-bold text-navy md:text-3xl">About Amaken Real Estate</h2>
                <div className="space-y-4 text-amaken-gray">
                  {aboutContent.slice(0, 2).map((item) => (
                    <div key={item.id}>
                      {item.title && <h3 className="text-lg font-semibold text-navy">{item.title}</h3>}
                      <p className="text-sm" dangerouslySetInnerHTML={{ __html: item.content.substring(0, 300) + "..." }} />
                    </div>
                  ))}
                </div>
                <Link href="/about" className="btn-primary mt-6 inline-flex">
                  Learn More
                </Link>
              </div>
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl sm:aspect-[16/10] lg:aspect-auto lg:h-80">
                <Image
                  src="/images/about.png"
                  alt="About Amaken"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1023px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-navy py-12 sm:py-16">
        <div className="container-custom text-center">
          <h2 className="mb-4 text-3xl font-bold text-white">Ready to Find Your Dream Property?</h2>
          <p className="mb-8 text-gray-300">Contact us today and let our expert agents help you find the perfect home.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <a href={`tel:${CONTACT.PHONE}`} className="btn-primary">
              Call Us Now
            </a>
            <Link href="/contact" className="rounded-lg border-2 border-white px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-navy">
              Send Message
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
