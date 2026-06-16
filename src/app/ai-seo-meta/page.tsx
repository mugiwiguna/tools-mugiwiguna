"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Search, Copy, Check, WandSparkles, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AISeoMetaPage() {
  const [url, setUrl] = useState("");
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!url && !content) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "seo-meta", prompt: url || content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      // Parse response
      const lines = data.result.split("\n");
      const t = lines.find((l: string) => l.startsWith("TITLE:"))?.replace("TITLE:", "").trim() || "";
      const m = lines.find((l: string) => l.startsWith("META:"))?.replace("META:", "").trim() || "";
      setTitle(t);
      setDesc(m);
    } catch (err: any) {
      toast.error(err.message || "Gagal generate SEO meta");
    } finally {
      setLoading(false);
    }
  };

  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success("Tersalin!");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Search className="w-8 h-8" />
          AI SEO Meta Generator
        </h1>
        <p className="text-muted-foreground mt-1">
          Generate title tag & meta description SEO-friendly.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Input</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">URL Halaman</Label>
            <Input id="url" placeholder="https://contoh.com/artikel" value={url} onChange={(e) => setUrl(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Teks Konten</Label>
            <Textarea id="content" placeholder="Paste konten halaman..." value={content} onChange={(e) => setContent(e.target.value)} className="min-h-[100px]" />
          </div>

          <Button onClick={generate} disabled={(!url && !content) || loading} className="w-full gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <WandSparkles className="w-4 h-4" />}
            {loading ? "Generate..." : "Generate SEO Meta"}
          </Button>

          {title && (
            <>
              <Separator />
              {/* SERP Preview */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Eye className="w-4 h-4" /> Preview SERP</Label>
                <div className="p-4 border rounded-lg bg-muted/30 space-y-1">
                  <p className="text-sm text-green-700 truncate">{url || "tools.mugijates.my.id"}</p>
                  <p className="text-lg text-blue-800 font-medium truncate">{title}</p>
                  <p className="text-sm text-gray-600">{desc}</p>
                </div>
              </div>

              <div className="space-y-1">
                <Label>Title Tag</Label>
                <div className="flex gap-2">
                  <Input value={title} readOnly />
                  <Button variant="outline" size="icon" onClick={() => copyText(title)}><Copy className="w-4 h-4" /></Button>
                </div>
              </div>
              <div className="space-y-1">
                <Label>Meta Description</Label>
                <div className="flex gap-2">
                  <Textarea value={desc} readOnly className="min-h-[60px]" />
                  <Button variant="outline" size="icon" className="shrink-0 self-start mt-1" onClick={() => copyText(desc)}><Copy className="w-4 h-4" /></Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
