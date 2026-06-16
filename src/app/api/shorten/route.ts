import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { url, slug } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL wajib diisi" }, { status: 400 });
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "URL tidak valid" }, { status: 400 });
    }

    const db = getDb();

    // Generate slug
    let finalSlug: string;
    if (slug) {
      // Custom slug — check uniqueness
      if (!/^[a-zA-Z0-9_-]{3,32}$/.test(slug)) {
        return NextResponse.json(
          { error: "Slug hanya huruf, angka, -, _. Minimal 3, maks 32 karakter" },
          { status: 400 }
        );
      }
      const existing = db.prepare("SELECT slug FROM urls WHERE slug = ?").get(slug);
      if (existing) {
        return NextResponse.json({ error: "Slug sudah dipake" }, { status: 409 });
      }
      finalSlug = slug;
    } else {
      // Auto-generate
      const { nanoid } = await import("nanoid");
      finalSlug = nanoid(7);
    }

    const id = crypto.randomUUID();
    db.prepare(
      "INSERT INTO urls (id, slug, original_url) VALUES (?, ?, ?)"
    ).run(id, finalSlug, url);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://tools.mugijates.my.id";
    const shortUrl = `${baseUrl}/s/${finalSlug}`;

    return NextResponse.json({ shortUrl, slug: finalSlug });
  } catch (err: any) {
    console.error("Shorten error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
