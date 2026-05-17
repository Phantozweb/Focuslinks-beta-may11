import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://focuslinks.in";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "FocusLinks | World's First Global Platform for Optometrists",
    template: "%s | FocusLinks",
  },
  description: "FocusLinks is the premier global network for eye care professionals, students, and organizations to collaborate, learn, and grow.",
  keywords: ["FocusLinks", "Optometry", "Eye Care", "Optometrist", "Vision Science", "Clinical Tools", "Ophthalmology", "Contact Lens", "Myopia", "Global Network", "Optometry Community", "Eye Health", "Visual Acuity", "Low Vision", "Pediatric Optometry", "Binocular Vision"],
  authors: [{ name: "FocusLinks Team" }],
  creator: "FocusLinks",
  publisher: "FocusLinks",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "FocusLinks | Global Platform for Optometrists",
    description: "Connecting vision professionals, students, and organizations worldwide. Discover tools, resources, and community.",
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "FocusLinks",
    images: [{
      url: "/og-image.jpg",
      width: 1200,
      height: 630,
      alt: "FocusLinks - Global Platform for Optometrists",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "FocusLinks | Global Platform for Optometrists",
    description: "Connecting vision professionals, students, and organizations worldwide.",
    creator: "@focuslinks",
    images: ["/og-image.jpg"],
  },
  verification: {},
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
          <Toaster />
          {/* JSON-LD Structured Data */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebApplication",
                "name": "FocusLinks",
                "url": "https://focuslinks.in",
                "description": "World's First Global Platform for Optometrists — connecting vision professionals, students, and organizations worldwide.",
                "applicationCategory": "Professional Network",
                "operatingSystem": "Web",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "INR",
                  "description": "Free community membership"
                },
                "author": {
                  "@type": "Organization",
                  "name": "FocusLinks",
                  "logo": "https://focuslinks.in/logo.svg"
                },
                "sameAs": [],
                "featureList": [
                  "Global Optometrist Directory",
                  "Clinical Tools & AI Labs",
                  "Community Feed & Discussions",
                  "Academy & Webinars",
                  "Job Board & Career Center",
                  "OptoMap - Interactive World Map",
                  "Leaderboard & Gamification",
                  "Professional Networking"
                ]
              })
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "FocusLinks",
                "url": "https://focuslinks.in",
                "logo": "https://focuslinks.in/logo.svg",
                "description": "Global platform for optometrists, students, and eye care organizations.",
                "contactPoint": {
                  "@type": "ContactPoint",
                  "contactType": "customer support",
                  "url": "https://focuslinks.in/contactus"
                }
              })
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
