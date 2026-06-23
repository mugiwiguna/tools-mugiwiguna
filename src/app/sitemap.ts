import type { MetadataRoute } from "next";

const siteUrl = "https://tools.mugijates.my.id";

const pages = [
  "", "qrcode", "shorten", "text-to-pdf", "image-resize", "image-to-pdf",
  "pdf-merge", "json-formatter", "password-generator", "palette", "markdown",
  "base64", "color-converter", "unit-converter", "word-counter", "hashtag",
  "image-compressor", "bg-remover", "image-upscaler",
  "ai-caption", "ai-seo-meta", "ai-story", "ai-yt-title", "ai-paraphraser",
  "ai-blog", "ai-product", "ai-cover-letter", "ai-resume", "ai-sentiment",
  "ai-summarizer", "ai-cv-ats",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map((page) => ({
    url: `${siteUrl}/${page}`,
    lastModified: new Date(),
    changeFrequency: page ? "weekly" : "daily",
    priority: page ? 0.8 : 1.0,
  }));
}
