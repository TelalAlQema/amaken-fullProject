import Link from "next/link";
import Image from "next/image";
import BreadcrumbBanner from "@/components/shared/BreadcrumbBanner";

const BLOG_DATA: Record<string, {
  title: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
  content: string;
}> = {
  "off-plan-vs-secondary-market-dubai": {
    title: "Off-Plan vs Secondary Market in Dubai: A Comprehensive Guide",
    category: "Investment",
    author: "Amaken Team",
    date: "2024-12-15",
    readTime: "8 min read",
    image: "/images/banner/main.png",
    content: `
      <p>Dubai's real estate market offers two primary investment avenues: off-plan properties and secondary market (ready) properties. Each comes with its own set of advantages and considerations that every investor should understand.</p>

      <h2>What is Off-Plan?</h2>
      <p>Off-plan properties are purchased directly from developers before construction is completed. Buyers typically pay in installments tied to construction milestones, making it a more accessible entry point for many investors.</p>

      <h2>What is the Secondary Market?</h2>
      <p>The secondary market involves purchasing properties that have already been built and often occupied. These transactions are typically straightforward, with immediate transfer of ownership and the ability to physically inspect the property.</p>

      <h2>Key Differences</h2>
      <ul>
        <li><strong>Payment Plans:</strong> Off-plan offers flexible payment plans, while secondary market requires full payment or mortgage.</li>
        <li><strong>Capital Appreciation:</strong> Off-plan properties often appreciate during construction, but come with development risk.</li>
        <li><strong>Rental Yield:</strong> Ready properties generate immediate rental income.</li>
        <li><strong>Risk:</strong> Off-plan carries construction and market risk; secondary market is lower risk.</li>
      </ul>

      <h2>Which Should You Choose?</h2>
      <p>The choice depends on your investment goals, budget, and risk tolerance. First-time investors may prefer secondary market properties for their simplicity, while experienced investors can leverage off-plan for potentially higher returns.</p>

      <p>Contact Amaken Real Estate today to discuss your investment options and find the perfect property for your portfolio.</p>
    `,
  },
  "top-10-areas-to-invest-in-dubai-2025": {
    title: "Top 10 Areas to Invest in Dubai 2025",
    category: "Investment",
    author: "Amaken Team",
    date: "2024-12-10",
    readTime: "6 min read",
    image: "/images/about.png",
    content: `
      <p>Dubai continues to be one of the world's most attractive real estate markets. As we look toward 2025, several areas stand out for their investment potential.</p>

      <h2>1. Dubai Creek Harbour</h2>
      <p>This waterfront development offers stunning views and world-class amenities, with strong appreciation potential.</p>

      <h2>2. Downtown Dubai</h2>
      <p>The iconic downtown area remains a top choice for luxury living and premium investment returns.</p>

      <h2>3. Dubai Marina</h2>
      <p>A popular waterfront community with high rental yields and strong demand from both residents and tourists.</p>

      <h2>4. JVC (Jumeirah Village Circle)</h2>
      <p>Offering affordable entry prices with excellent growth potential and improving infrastructure.</p>

      <h2>5. Business Bay</h2>
      <p>The business hub of Dubai offers mixed-use properties with strong demand from professionals.</p>

      <p>Contact our expert agents to explore these areas and find your perfect investment opportunity.</p>
    `,
  },
  "dubai-rental-market-trends": {
    title: "Dubai Rental Market Trends: What Tenants Need to Know",
    category: "Market Trends",
    author: "Amaken Team",
    date: "2024-12-05",
    readTime: "5 min read",
    image: "/images/what.png",
    content: `
      <p>Dubai's rental market continues to evolve, with several trends shaping the landscape for tenants in 2025.</p>

      <h2>Market Overview</h2>
      <p>The Dubai rental market has shown remarkable resilience and growth, driven by population influx, tourism recovery, and economic diversification.</p>

      <h2>Key Trends</h2>
      <ul>
        <li><strong>Rising Demand:</strong> Increased population is driving rental demand across all segments.</li>
        <li><strong>Flexible Payment Plans:</strong> More landlords are offering quarterly or monthly payment options.</li>
        <li><strong>Smart Homes:</strong> Properties with smart home features command premium rents.</li>
        <li><strong>Sustainability:</strong> Eco-friendly buildings are gaining popularity among tenants.</li>
      </ul>

      <p>Whether you're looking to rent or invest, Amaken Real Estate can help you navigate the market and find the perfect property.</p>
    `,
  },
};

type PageParams = { slug: string };

export async function generateMetadata({ params }: { params: PageParams }) {
  const post = BLOG_DATA[params.slug];
  if (!post) return { title: "Blog Post Not Found" };
  return {
    title: post.title,
    description: post.content.substring(0, 160).replace(/<[^>]+>/g, ""),
  };
}

export default async function BlogDetailPage({ params }: { params: PageParams }) {
  const post = BLOG_DATA[params.slug];

  if (!post) {
    return (
      <div className="container-custom py-20 text-center">
        <h1 className="text-2xl font-bold text-navy">Blog Post Not Found</h1>
        <Link href="/blog" className="btn-primary mt-4 inline-flex">Back to Blog</Link>
      </div>
    );
  }

  return (
    <>
      <BreadcrumbBanner
        title={post.title}
        crumbs={[{ label: "Blog", href: "/blog" }, { label: post.title }]}
      />

      <section className="py-12">
        <div className="container-custom">
          <div className="grid gap-8 lg:grid-cols-3">
            <article className="lg:col-span-2">
              <div className="mb-4 flex items-center gap-3">
                <span className="rounded bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{post.category}</span>
                <span className="text-xs text-amaken-gray">{post.readTime}</span>
              </div>

              <div className="relative mb-6 h-80 overflow-hidden rounded-xl">
                <Image src={post.image} alt={post.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 66vw" priority />
              </div>

              <div className="mb-6 flex items-center gap-3 text-sm text-amaken-gray">
                <span>By {post.author}</span>
                <span>•</span>
                <span>{new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
              </div>

              <div className="prose prose-lg max-w-none text-amaken-gray prose-headings:text-navy prose-a:text-primary" dangerouslySetInnerHTML={{ __html: post.content }} />

              <div className="mt-8 border-t border-gray-200 pt-6">
                <Link href="/blog" className="text-sm font-semibold text-primary hover:underline">← Back to Blog</Link>
              </div>
            </article>

            <aside className="space-y-6">
              <div className="card p-6">
                <h3 className="mb-3 text-lg font-bold text-navy">Article Details</h3>
                <div className="space-y-2 text-sm text-amaken-gray">
                  <p><strong>Author:</strong> {post.author}</p>
                  <p><strong>Date:</strong> {new Date(post.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                  <p><strong>Category:</strong> {post.category}</p>
                  <p><strong>Read Time:</strong> {post.readTime}</p>
                </div>
              </div>

              <div className="card p-6">
                <h3 className="mb-3 text-lg font-bold text-navy">Popular Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {["Investment", "Dubai", "Property", "Rental", "Off-Plan"].map((tag) => (
                    <span key={tag} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-amaken-gray">{tag}</span>
                  ))}
                </div>
              </div>

              <div className="card p-6 bg-navy text-center">
                <h3 className="mb-2 text-lg font-bold text-white">Need Investment Advice?</h3>
                <p className="mb-4 text-sm text-gray-300">Our expert agents can guide you through the Dubai real estate market.</p>
                <Link href="/contact" className="inline-flex rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-600">
                  Get in Touch
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
