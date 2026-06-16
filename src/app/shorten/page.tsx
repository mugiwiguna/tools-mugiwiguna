"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Link2, Copy, ExternalLink, Loader2 } from "lucide-react";

export default function ShortenPage() {
  const [url, setUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const shorten = useCallback(async () => {
    if (!url.trim()) {
      toast.error("Masukkan URL dulu!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), slug: customSlug.trim() || undefined }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Gagal shorten");

      setShortUrl(data.shortUrl);
      toast.success("Link berhasil dipendekin!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [url, customSlug]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      toast.success("Tersalin!");
    } catch {
      toast.error("Gagal copy");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Link2 className="w-8 h-8" />
          URL Shortener
        </h1>
        <p className="text-muted-foreground mt-1">
          Pendekin link panjang jadi pendek & mudah diingat.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Buat Link Pendek</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="url">URL Panjang</Label>
            <Input
              id="url"
              placeholder="https://contoh.com/link-panjang-banget/12345"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="slug">
              Custom Slug <span className="text-muted-foreground text-xs">(opsional)</span>
            </Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                tools.mugijates.my.id/s/
              </span>
              <Input
                id="slug"
                placeholder="link-ku"
                value={customSlug}
                onChange={(e) => setCustomSlug(e.target.value)}
              />
            </div>
          </div>

          <Button onClick={shorten} disabled={loading} className="w-full gap-2">
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Link2 className="w-4 h-4" />
            )}
            {loading ? "Memendekin..." : "Shorten URL"}
          </Button>

          {shortUrl && (
            <div className="p-4 rounded-lg border bg-muted space-y-2">
              <Label>Link Pendek</Label>
              <div className="flex items-center gap-2">
                <Input value={shortUrl} readOnly className="font-mono text-sm" />
                <Button variant="outline" size="icon" onClick={copyLink}>
                  <Copy className="w-4 h-4" />
                </Button>
                <a href={shortUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-lg border border-input bg-background size-8 hover:bg-muted hover:text-foreground transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
