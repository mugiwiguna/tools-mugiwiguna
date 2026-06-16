"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Video, Copy, Check, WandSparkles, List, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AIYTTitlePage() {
  const [keyword, setKeyword] = useState("");
  const [titles, setTitles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "yt-title", prompt: keyword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      // Split into lines, filter numbered items
      const lines = data.result.split("\n").filter((l: string) => l.trim());
      setTitles(lines);
    } catch (err: any) {
      toast.error(err.message || "Gagal generate title");
    } finally {
      setLoading(false);
    }
  };

  const copyTitle = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success("Title tersalin!");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Video className="w-8 h-8" />
          AI YouTube Title Generator
        </h1>
        <p className="text-muted-foreground mt-1">Generate 10 judul video YouTube dari keyword.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Generate Titles</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="keyword">Keyword / Topik Video</Label>
            <Input id="keyword" placeholder="misal: tutorial react js" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
          </div>

          <Button onClick={generate} disabled={!keyword || loading} className="w-full gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <WandSparkles className="w-4 h-4" />}
            {loading ? "Generate..." : "Generate Titles"}
          </Button>

          {titles.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <List className="w-4 h-4" />
                  10 Judul Rekomendasi
                </div>
                <div className="space-y-2">
                  {titles.map((title, i) => (
                    <div key={i} className="flex items-center gap-2 p-3 border rounded-lg hover:bg-muted/50 group">
                      <span className="text-xs text-muted-foreground font-mono w-6 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                      <p className="flex-1 text-sm">{title.replace(/^\d+[\.\)]\s*/, "")}</p>
                      <Button variant="ghost" size="icon" className="shrink-0 opacity-0 group-hover:opacity-100" onClick={() => copyTitle(title)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
