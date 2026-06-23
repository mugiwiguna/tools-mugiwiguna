import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const siteUrl = "https://tools.mugijates.my.id";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "30+ Tools Online Gratis — AI Tools, QR Code, PDF, Image & Utility | tools.mugijates.my.id",
    template: "%s | Tools Mugi",
  },
  description:
    "Kumpulan 30+ tools online gratis: AI tools (caption, SEO, blog writer), QR code generator, URL shortener, PDF tools, image editor, background remover, dan utility tools. Gratis & cepat tanpa download.",
  keywords: [
    "tools online gratis",
    "free online tools",
    "AI tools gratis Indonesia",
    "AI caption generator",
    "AI blog writer",
    "QR code generator gratis",
    "URL shortener",
    "background remover gratis",
    "PDF merge online",
    "image resize online",
    "text to pdf",
    "json formatter",
    "password generator",
    "resume analyzer",
    "SEO meta generator",
    "unit converter",
    "color converter",
    "base64 encoder",
    "markdown editor",
    "alat online gratis",
    "mugijates",
    "tools indonesia",
  ],
  authors: [{ name: "Mugi Wiguna", url: "https://mugijates.my.id" }],
  creator: "Mugi Wiguna",
  publisher: "Mugi Wiguna",
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
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Tools Mugi",
    title: "30+ Tools Online Gratis — AI, QR, PDF, Image & Utility",
    description:
      "Kumpulan 30+ tools online gratis: AI tools, QR code, PDF, image editor, background remover, dan utility tools. Semua gratis.",
    url: siteUrl,
    images: [
      {
        url: `${siteUrl}/og-image.svg`,
        width: 1200,
        height: 630,
        alt: "Tools Online Gratis - tools.mugijates.my.id",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "30+ Tools Online Gratis",
    description:
      "AI tools, QR code, PDF, image editor & utility tools — gratis & cepat.",
    images: [`${siteUrl}/og-image.svg`],
    creator: "@mugiwiguna",
  },
  verification: {
    google: "wBClfmcwdzkxPRrGCCP_KNPajb8AhS2Rl7Wq4qUSnrk",
  },
  alternates: {
    canonical: siteUrl,
    languages: {
      "id-ID": siteUrl,
    },
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "CollectionPage",
              name: "Tools Mugi",
              description:
                "Kumpulan 30+ tools online gratis untuk kebutuhan sehari-hari.",
              url: siteUrl,
              provider: {
                "@type": "Person",
                name: "Mugi Wiguna",
                url: "https://mugijates.my.id",
              },
              about: {
                "@type": "Thing",
                name: "Online Tools",
              },
              mainEntity: [
                {
                  "@type": "WebApplication",
                  name: "AI Caption Generator",
                  url: `${siteUrl}/ai-caption`,
                  applicationCategory: "Multimedia",
                  operatingSystem: "All",
                },
                {
                  "@type": "WebApplication",
                  name: "AI Blog Writer",
                  url: `${siteUrl}/ai-blog`,
                  applicationCategory: "BusinessApplication",
                  operatingSystem: "All",
                },
                {
                  "@type": "WebApplication",
                  name: "QR Code Generator",
                  url: `${siteUrl}/qrcode`,
                  applicationCategory: "UtilitiesApplication",
                  operatingSystem: "All",
                },
                {
                  "@type": "WebApplication",
                  name: "Background Remover",
                  url: `${siteUrl}/bg-remover`,
                  applicationCategory: "Multimedia",
                  operatingSystem: "All",
                },
              ],
            }),
          }}
        />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased min-h-screen flex flex-col`}>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster richColors />
      </body>
    </html>
  );
}
