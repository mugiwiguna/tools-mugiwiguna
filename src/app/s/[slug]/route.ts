import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!slug) {
    return NextResponse.redirect(new URL("/shorten", _req.url));
  }

  const db = getDb();
  const row = db.prepare("SELECT original_url FROM urls WHERE slug = ?").get(slug) as
    | { original_url: string }
    | undefined;

  if (!row) {
    return NextResponse.redirect(new URL("/shorten", _req.url));
  }

  // Increment click
  db.prepare("UPDATE urls SET clicks = clicks + 1 WHERE slug = ?").run(slug);

  return NextResponse.redirect(row.original_url);
}
