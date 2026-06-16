"use client";
import Link from "next/link";
import { useState } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  QrCode,
  Link2,
  FileText,
  Image,
  Braces,
  KeyRound,
  Palette,
  FileDown,
  Scissors,
  Type,
  Sparkles,
  Captions,
  Search,
  BookOpen,
  Video,
  MessageSquareMore,
  Ruler,
  Palette as ColorPalette,
  Hash,
  Text,
  Code,
  FileImage,
  LayoutDashboard,
  Images,
  ZoomIn,
  FileSpreadsheet,
  FileSearch,
  HeartHandshake,
  BarChart3,
  FileStack,
  ScrollText,
} from "lucide-react";

interface ToolDef {
  title: string;
  desc: string;
  href: string;
  icon: any;
  color: string;
  bg: string;
}

const categories: { title: string; icon: any; tools: ToolDef[] }[] = [
  {
    title: "AI Tools",
    icon: Sparkles,
    tools: [
      {
        title: "AI Caption Generator",
        desc: "Generate caption Instagram/TikTok dari foto atau keyword",
        href: "/ai-caption",
        icon: Captions,
        color: "text-violet-600",
        bg: "bg-violet-50 dark:bg-violet-950",
      },
      {
        title: "AI SEO Meta",
        desc: "Generate title & meta description otomatis dari URL/konten",
        href: "/ai-seo-meta",
        icon: Search,
        color: "text-blue-600",
        bg: "bg-blue-50 dark:bg-blue-950",
      },
      {
        title: "AI Story Generator",
        desc: "Tulis prompt, AI bikin cerita pendek atau thread Twitter",
        href: "/ai-story",
        icon: BookOpen,
        color: "text-amber-600",
        bg: "bg-amber-50 dark:bg-amber-950",
      },
      {
        title: "AI YouTube Title",
        desc: "Generate 10 judul video YouTube dari keyword",
        href: "/ai-yt-title",
        icon: Video,
        color: "text-red-600",
        bg: "bg-red-50 dark:bg-red-950",
      },
      {
        title: "AI Paraphraser",
        desc: "Parafrase teks dengan gaya berbeda, gratis 3x/hari",
        href: "/ai-paraphraser",
        icon: MessageSquareMore,
        color: "text-teal-600",
        bg: "bg-teal-50 dark:bg-teal-950",
      },
      {
        title: "AI Blog Writer",
        desc: "Generate artikel blog lengkap dari keyword",
        href: "/ai-blog",
        icon: FileText,
        color: "text-orange-600",
        bg: "bg-orange-50 dark:bg-orange-950",
      },
      {
        title: "AI Product Description",
        desc: "Generate deskripsi produk e-commerce",
        href: "/ai-product",
        icon: FileSpreadsheet,
        color: "text-green-600",
        bg: "bg-green-50 dark:bg-green-950",
      },
      {
        title: "AI Cover Letter",
        desc: "Generate surat lamaran kerja profesional",
        href: "/ai-cover-letter",
        icon: HeartHandshake,
        color: "text-rose-600",
        bg: "bg-rose-50 dark:bg-rose-950",
      },
      {
        title: "AI Resume Analyzer",
        desc: "Analisis CV & dapatkan skor + saran",
        href: "/ai-resume",
        icon: FileSearch,
        color: "text-cyan-600",
        bg: "bg-cyan-50 dark:bg-cyan-950",
      },
      {
        title: "AI Sentiment Analysis",
        desc: "Analisis sentimen teks dengan persentase",
        href: "/ai-sentiment",
        icon: BarChart3,
        color: "text-blue-600",
        bg: "bg-blue-50 dark:bg-blue-950",
      },
      {
        title: "AI Text Summarizer",
        desc: "Summarize teks atau URL jadi poin penting",
        href: "/ai-summarizer",
        icon: ScrollText,
        color: "text-slate-600",
        bg: "bg-slate-50 dark:bg-slate-950",
      },
      {
        title: "AI CV ATS Generator",
        desc: "Buat CV ATS-friendly dengan deskripsi pengalaman yang menjual",
        href: "/ai-cv-ats",
        icon: FileText,
        color: "text-indigo-600",
        bg: "bg-indigo-50 dark:bg-indigo-950",
      },
    ],
  },
  {
    title: "QR & Links",
    icon: QrCode,
    tools: [
      {
        title: "QR Code Generator",
        desc: "Buat QR code dari URL, teks, vCard, WiFi, dan lainnya",
        href: "/qrcode",
        icon: QrCode,
        color: "text-blue-600",
        bg: "bg-blue-50 dark:bg-blue-950",
      },
      {
        title: "URL Shortener",
        desc: "Pendekin link panjang jadi pendek & mudah diingat",
        href: "/shorten",
        icon: Link2,
        color: "text-emerald-600",
        bg: "bg-emerald-50 dark:bg-emerald-950",
      },
      {
        title: "Hashtag Generator",
        desc: "Generate hashtag populer dari keyword",
        href: "/hashtag",
        icon: Hash,
        color: "text-sky-600",
        bg: "bg-sky-50 dark:bg-sky-950",
      },
    ],
  },
  {
    title: "Image & Media",
    icon: Image,
    tools: [
      {
        title: "Image Resize",
        desc: "Ubah ukuran gambar online, crop & kompres",
        href: "/image-resize",
        icon: Image,
        color: "text-purple-600",
        bg: "bg-purple-50 dark:bg-purple-950",
      },
      {
        title: "Image to PDF",
        desc: "Gabungin gambar jadi satu file PDF",
        href: "/image-to-pdf",
        icon: FileDown,
        color: "text-orange-600",
        bg: "bg-orange-50 dark:bg-orange-950",
      },
      {
        title: "Image Compressor",
        desc: "Kompres JPEG/PNG/WebP tanpa kehilangan kualitas",
        href: "/image-compressor",
        icon: FileImage,
        color: "text-rose-600",
        bg: "bg-rose-50 dark:bg-rose-950",
      },
      {
        title: "Background Remover",
        desc: "Hapus background gambar otomatis (client-side)",
        href: "/bg-remover",
        icon: Images,
        color: "text-emerald-600",
        bg: "bg-emerald-50 dark:bg-emerald-950",
      },
      {
        title: "Image Upscaler",
        desc: "Perbesar resolusi gambar 2x, 3x, atau 4x",
        href: "/image-upscaler",
        icon: ZoomIn,
        color: "text-blue-600",
        bg: "bg-blue-50 dark:bg-blue-950",
      },
    ],
  },
  {
    title: "Document & PDF",
    icon: FileText,
    tools: [
      {
        title: "Text to PDF",
        desc: "Konversi teks jadi file PDF dengan cepat",
        href: "/text-to-pdf",
        icon: FileText,
        color: "text-red-600",
        bg: "bg-red-50 dark:bg-red-950",
      },
      {
        title: "PDF Merge/Split",
        desc: "Gabung atau pisah halaman PDF dengan mudah",
        href: "/pdf-merge",
        icon: Scissors,
        color: "text-rose-600",
        bg: "bg-rose-50 dark:bg-rose-950",
      },
    ],
  },
  {
    title: "Developer Tools",
    icon: Braces,
    tools: [
      {
        title: "JSON Formatter",
        desc: "Format, validasi, & prettify JSON dengan cepat",
        href: "/json-formatter",
        icon: Braces,
        color: "text-yellow-600",
        bg: "bg-yellow-50 dark:bg-yellow-950",
      },
      {
        title: "Base64 Encoder/Decoder",
        desc: "Encode & decode Base64 online",
        href: "/base64",
        icon: Code,
        color: "text-lime-600",
        bg: "bg-lime-50 dark:bg-lime-950",
      },
      {
        title: "Color Converter",
        desc: "Konversi HEX, RGB, HSL, dan format warna lainnya",
        href: "/color-converter",
        icon: ColorPalette,
        color: "text-pink-600",
        bg: "bg-pink-50 dark:bg-pink-950",
      },
    ],
  },
  {
    title: "Utility",
    icon: LayoutDashboard,
    tools: [
      {
        title: "Password Generator",
        desc: "Bikin password kuat & random dengan custom karakter",
        href: "/password-generator",
        icon: KeyRound,
        color: "text-indigo-600",
        bg: "bg-indigo-50 dark:bg-indigo-950",
      },
      {
        title: "Palette Generator",
        desc: "Generate palet warna keren untuk design kamu",
        href: "/palette",
        icon: Palette,
        color: "text-pink-600",
        bg: "bg-pink-50 dark:bg-pink-950",
      },
      {
        title: "Markdown Editor",
        desc: "Tulis & preview Markdown secara real-time",
        href: "/markdown",
        icon: Type,
        color: "text-teal-600",
        bg: "bg-teal-50 dark:bg-teal-950",
      },
      {
        title: "Unit Converter",
        desc: "Konversi satuan panjang, berat, suhu, dan lainnya",
        href: "/unit-converter",
        icon: Ruler,
        color: "text-cyan-600",
        bg: "bg-cyan-50 dark:bg-cyan-950",
      },
      {
        title: "Word Counter",
        desc: "Hitung kata, karakter, kalimat dengan detail",
        href: "/word-counter",
        icon: FileText,
        color: "text-gray-600",
        bg: "bg-gray-50 dark:bg-gray-900",
      },
    ],
  },
];

function DescPopup({
  title,
  desc,
  open,
  onClose,
}: {
  title: string;
  desc: string;
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="fixed inset-0 bg-black/50" />
      <div
        className="relative z-10 max-w-sm w-full rounded-xl border bg-popover p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-semibold text-base mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{desc}</p>
        <button
          onClick={onClose}
          className="mt-4 text-xs text-muted-foreground underline underline-offset-2"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [popup, setPopup] = useState<{ title: string; desc: string } | null>(null);

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero */}
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Tools Online
          <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Gratis & Cepat
          </span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Kumpulan tools gratis buat bantu kerjaan sehari-hari. AI tools, QR code,
          PDF, image, developer tools, dan utility — semua dalam satu tempat.
        </p>
      </section>

      {/* Categories */}
      {categories.map((cat) => {
        const CatIcon = cat.icon;
        return (
          <section key={cat.title} className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <CatIcon className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold">{cat.title}</h2>
            </div>
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
              {cat.tools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <div key={tool.href} className="relative">
                    <Link href={tool.href} className="block">
                      <Card className="transition-all hover:shadow-md hover:-translate-y-0.5 aspect-square sm:aspect-auto">
                        <CardHeader className="flex flex-col items-center justify-center text-center h-full p-3 sm:p-4">
                          <div className={`p-2 rounded-lg ${tool.bg}`}>
                            <Icon className={`w-6 h-6 ${tool.color}`} />
                          </div>
                          <CardTitle className="text-xs sm:text-base mt-2 leading-tight">
                            {tool.title}
                          </CardTitle>
                          <CardDescription className="hidden sm:line-clamp-2 text-xs">
                            {tool.desc}
                          </CardDescription>
                          <button
                            className="sm:hidden mt-1 inline-flex items-center gap-0.5 text-[10px] text-muted-foreground bg-muted hover:bg-border transition-colors px-1.5 py-0.5 rounded"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setPopup({ title: tool.title, desc: tool.desc });
                            }}
                          >
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                            info
                          </button>
                        </CardHeader>
                      </Card>
                    </Link>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      <DescPopup
        title={popup?.title || ""}
        desc={popup?.desc || ""}
        open={!!popup}
        onClose={() => setPopup(null)}
      />

      {/* CTA */}
      <section className="mt-16 text-center p-10 rounded-xl border bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
        <h2 className="text-2xl font-bold">Ingin tool custom?</h2>
        <p className="mt-2 text-muted-foreground">
          Ada request tool tertentu? Hubungi saya, siapa tau bisa dibikin.
        </p>
        <a
          href="https://mugijates.my.id"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-4 text-sm underline underline-offset-2 text-blue-600 hover:text-blue-800"
        >
          mugijates.my.id →
        </a>
      </section>
    </div>
  );
}
