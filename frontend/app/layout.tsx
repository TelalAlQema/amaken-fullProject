import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  metadataBase: new URL("https://amaken-realestate.com"),
  title: {
    default: "Amaken Real Estate - Dubai Property Listings",
    template: "%s | Amaken Real Estate",
  },
  description:
    "Find your dream property in Dubai. Browse villas, apartments, townhouses and more with Amaken Real Estate.",
  keywords: [
    "Dubai real estate",
    "property for sale",
    "property for rent",
    "villa Dubai",
    "apartment Dubai",
    "Amaken",
    "off plan Dubai",
  ],
  openGraph: {
    title: "Amaken Real Estate - Dubai Property Listings",
    description:
      "Find your dream property in Dubai. Browse villas, apartments, townhouses and more.",
    url: "https://amaken-realestate.com",
    siteName: "Amaken Real Estate",
    locale: "en_US",
    type: "website",
    images: [{ url: "/images/logo/amaken.png", width: 300, height: 80 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Amaken Real Estate - Dubai Property Listings",
    description: "Find your dream property in Dubai.",
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "https://amaken-realestate.com" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/images/logo/title.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Comfortaa:wght@300;400;500;600;700&family=Muli:ital,wght@0,200..900;1,200..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-white font-body text-amaken-gray antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
