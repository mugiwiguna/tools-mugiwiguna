"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Sparkles, Copy, Check, Hash, WandSparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AICaptionPage() {
  const [keyword, setKeyword] = useState("");
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);

  const generateCaption = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "caption", prompt: keyword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCaption(data.result);
    } catch (err: any) {
      toast.error(err.message || "Gagal generate caption");
    } finally {
      setLoading(false);
    }
  };

  const copyText = async () => {
    await navigator.clipboard.writeText(caption);
    toast.success("Tersalin!");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Sparkles className="w-8 h-8" />
          AI Caption Generator
        </h1>
        <p className="text-muted-foreground mt-1">
          Generate caption Instagram/TikTok dari keyword atau deskripsi.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Generate Caption</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="keyword">Keyword / Deskripsi</Label>
            <Input
              id="keyword"
              placeholder="misal: sunset pantai liburan"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>

          <Button onClick={generateCaption} disabled={!keyword || loading} className="w-full gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <WandSparkles className="w-4 h-4" />}
            {loading ? "Generate..." : "Generate Caption"}
          </Button>

          {caption && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label>Caption</Label>
                <div className="relative">
                  <Textarea value={caption} readOnly className="min-h-[150px] pr-10" />
                  <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={copyText}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
