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

export const metadata: Metadata = {
  title: {
    default: "Tools — mugijates.my.id",
    template: "%s — Tools Mugi",
  },
  description:
    "Kumpulan tools online gratis: QR code generator, URL shortener, text to PDF, image resize, dan banyak lagi.",
  keywords: [
    "tools online gratis",
    "qr code generator",
    "url shortener",
    "text to pdf",
    "image resize",
    "mugijates",
    "indonesia tools",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased min-h-screen flex flex-col`}>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster richColors />
      </body>
    </html>
  );
}
