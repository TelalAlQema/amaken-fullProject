"use client";

import Link from "next/link";
import Image from "next/image";
import BreadcrumbBanner from "@/components/shared/BreadcrumbBanner";

const BLOG_POSTS = [
  {
    slug: "off-plan-vs-secondary-market-dubai",
    title: "Off-Plan vs Secondary Market in Dubai: A Comprehensive Guide",
    excerpt: "Explore the key differences between buying off-plan and secondary market properties in Dubai's dynamic real estate landscape.",
    category: "Investment",
    author: "Amaken Team",
    date: "2024-12-15",
    readTime: "8 min read",
    image: "/images/banner/main.png",
  },
  {
    slug: "top-10-areas-to-invest-in-dubai-2025",
    title: "Top 10 Areas to Invest in Dubai 2025",
    excerpt: "Discover the most promising areas for real estate investment in Dubai for 2025, from emerging neighborhoods to established communities.",
    category: "Investment",
    author: "Amaken Team",
    date: "2024-12-10",
    readTime: "6 min read",
    image: "/images/about.png",
  },
  {
    slug: "dubai-rental-market-trends",
    title: "Dubai Rental Market Trends: What Tenants Need to Know",
    excerpt: "Stay informed about the latest rental market trends in Dubai, including pricing, demand shifts, and upcoming regulatory changes.",
    category: "Market Trends",
    author: "Amaken Team",
    date: "2024-12-05",
    readTime: "5 min read",
    image: "/images/what.png",
  },
];

export default function BlogPage() {
  return (
    <>
      <BreadcrumbBanner
        title="Our Blog"
        subtitle="Stay updated with the latest Dubai real estate news and insights"
        crumbs={[{ label: "Blog" }]}
      />

      <section className="py-12">
        <div className="container-custom">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Posts */}
            <div className="lg:col-span-2 space-y-6">
              {BLOG_POSTS.map((post) => (
                <article key={post.slug} className="card overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="relative h-60 w-full md:h-auto md:w-80">
                      <Image src={post.image} alt={post.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 320px" />
                    </div>
                    <div className="flex-1 p-6">
                      <div className="mb-2 flex items-center gap-3">
                        <span className="rounded bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{post.category}</span>
                        <span className="text-xs text-amaken-gray">{post.readTime}</span>
                      </div>
                      <h2 className="mb-2 text-lg font-bold text-navy">
                        <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                          {post.title}
                        </Link>
                      </h2>
                      <p className="mb-3 text-sm text-amaken-gray line-clamp-2">{post.excerpt}</p>
                      <div className="flex items-center gap-3 text-xs text-amaken-gray">
                        <span>By {post.author}</span>
                        <span>•</span>
                        <span>{new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
                      </div>
                      <Link href={`/blog/${post.slug}`} className="mt-3 inline-block text-sm font-semibold text-primary hover:underline">
                        Read More →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="card p-6">
                <h3 className="mb-3 text-lg font-bold text-navy">About Amaken</h3>
                <p className="text-sm text-amaken-gray">Amaken Real Estate is a trusted name in Dubai&apos;s property market, offering expert guidance and comprehensive real estate services.</p>
              </div>

              <div className="card p-6">
                <h3 className="mb-3 text-lg font-bold text-navy">Popular Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {["Investment", "Dubai", "Property", "Rental", "Off-Plan", "Market Trends", "Buying Guide"].map((tag) => (
                    <span key={tag} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-amaken-gray hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="card p-6">
                <h3 className="mb-3 text-lg font-bold text-navy">Newsletter</h3>
                <p className="mb-3 text-sm text-amaken-gray">Get the latest updates delivered to your inbox.</p>
                <div className="flex gap-2">
                  <input type="email" placeholder="Your email" className="input-field flex-1" />
                  <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
