"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Copy, Check, WandSparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AIStoryPage() {
  const [prompt, setPrompt] = useState("");
  const [type, setType] = useState("horror");
  const [length, setLength] = useState("short");
  const [story, setStory] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "story", prompt, options: { genre: type, length } }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStory(data.result);
    } catch (err: any) {
      toast.error(err.message || "Gagal generate story");
    } finally {
      setLoading(false);
    }
  };

  const copyText = async () => {
    await navigator.clipboard.writeText(story);
    toast.success("Tersalin!");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BookOpen className="w-8 h-8" />
          AI Story Generator
        </h1>
        <p className="text-muted-foreground mt-1">Bikin cerita pendek dari ide kamu pake AI.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Story Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt">Ide Cerita</Label>
            <Textarea id="prompt" placeholder="Detektif menemukan surat misterius..." value={prompt} onChange={(e) => setPrompt(e.target.value)} className="min-h-[100px]" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Genre</Label>
              <Select value={type} onValueChange={(v) => v && setType(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["horror","romance","comedy","thriller","fantasy"].map(t => (
                    <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Panjang</Label>
              <Select value={length} onValueChange={(v) => v && setLength(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Pendek (~100 kata)</SelectItem>
                  <SelectItem value="medium">Sedang (~300 kata)</SelectItem>
                  <SelectItem value="long">Panjang (~500 kata)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={generate} disabled={!prompt || loading} className="w-full gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <WandSparkles className="w-4 h-4" />}
            {loading ? "Nulis..." : "Generate Story"}
          </Button>

          {story && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Cerita</Label>
                  <Button variant="outline" size="sm" onClick={copyText}><Copy className="w-4 h-4" /></Button>
                </div>
                <div className="p-4 border rounded-lg bg-muted/30 min-h-[150px] whitespace-pre-wrap text-sm leading-relaxed">{story}</div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
