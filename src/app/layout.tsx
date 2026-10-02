import type { Metadata, Viewport } from "next";
import "./globals.css";
import NeuralField from "@/components/NeuralField";
import AnalyticsTracker from "@/components/AnalyticsTracker";

export const metadata: Metadata = {
  title: {
    default: "SAM CODES — Intelligent Digital Systems & Autonomous Workflows",
    template: "%s | SAM CODES",
  },
  description:
    "Samarth Nimangre — AI Developer & Automation Engineer. Building autonomous agent workflows, edge webhook integrations, and production web applications with zero fabrication.",
  keywords: [
    "Sam Codes",
    "Samarth Nimangre",
    "Samarth Nimangre Karnataka",
    "AI Developer",
    "Automation Builder",
    "Automation Engineer",
    "AI Agents",
    "Agentic Workflows",
    "Next.js Developer India",
    "Fullstack AI Engineer",
    "Supabase Developer",
    "WhatsApp Webhook Automation",
  ],
  authors: [{ name: "Samarth Nimangre (Sam)", url: "https://sam-codes.vercel.app" }],
  creator: "Samarth Nimangre",
  metadataBase: new URL("https://sam-codes.vercel.app"),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://sam-codes.vercel.app",
    title: "SAM CODES — Intelligent Digital Systems & Autonomous Workflows",
    description:
      "Samarth Nimangre — AI Developer & Automation Engineer. Building autonomous agent workflows, edge webhook integrations, and production web applications.",
    siteName: "SAM CODES",
  },
  twitter: {
    card: "summary_large_image",
    title: "SAM CODES — Intelligent Digital Systems & Autonomous Workflows",
    description:
      "Samarth Nimangre — AI Developer & Automation Engineer. Building autonomous agent workflows, edge webhook integrations, and production web applications.",
    creator: "@Sam_CodeAI",
  },
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
};

export const viewport: Viewport = {
  themeColor: "#06080f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": "https://sam-codes.vercel.app/#samarth",
      "name": "Samarth Nimangre",
      "alternateName": "Sam",
      "url": "https://sam-codes.vercel.app",
      "jobTitle": "AI Developer & Workflow Automation Engineer",
      "worksFor": {
        "@type": "Organization",
        "name": "SAM CODES",
      },
      "sameAs": [
        "https://t.me/samarth_master_bot",
        "https://www.instagram.com/samarth.buildss/",
        "https://www.linkedin.com/in/samarth-nimangre-0a3b02421/",
        "https://x.com/Sam_CodeAI",
        "https://github.com/Sam-CodesAI",
        "https://www.reddit.com/user/SamarthBuilds_/",
      ],
      "knowsAbout": [
        "Artificial Intelligence",
        "AI Agents",
        "Workflow Automation",
        "Next.js",
        "React",
        "TypeScript",
        "Supabase",
        "PostgreSQL",
      ],
    },
    {
      "@type": "ProfessionalService",
      "@id": "https://sam-codes.vercel.app/#service",
      "name": "SAM CODES",
      "url": "https://sam-codes.vercel.app",
      "description": "High-velocity AI chatbots, workflow automations, and modern web applications engineered with zero fabrication.",
      "provider": {
        "@id": "https://sam-codes.vercel.app/#samarth",
      },
      "areaServed": "Global",
      "availableChannel": {
        "@type": "ServiceChannel",
        "serviceUrl": "https://sam-codes.vercel.app/#contact",
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://sam-codes.vercel.app/#website",
      "url": "https://sam-codes.vercel.app",
      "name": "SAM CODES",
      "publisher": {
        "@id": "https://sam-codes.vercel.app/#samarth",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="relative bg-[#06080f] text-slate-100 antialiased selection:bg-sky-500/20 selection:text-white min-h-screen">
        {/* Background Neural Canvas */}
        <NeuralField />

        {/* Global Privacy Telemetry */}
        <AnalyticsTracker />

        {/* Ambient Top Glow Orbs */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed top-[-15vw] left-[15vw] w-[50vw] h-[40vw] rounded-full glow-orb-cyan blur-[120px] opacity-40 z-0"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none fixed top-[30vh] right-[-10vw] w-[45vw] h-[45vw] rounded-full glow-orb-purple blur-[140px] opacity-35 z-0"
        />

        {/* Main Content Hierarchy */}
        <div className="relative z-10 flex min-h-screen flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
