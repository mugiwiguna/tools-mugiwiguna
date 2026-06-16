"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { FileText, Copy, Check, Loader2, Link, Type, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface SummaryResult {
  points: string[];
  originalWords: number;
  summaryWords: number;
}

export default function AISummarizerPage() {
  const [inputText, setInputText] = useState("");
  const [url, setUrl] = useState("");
  const [mode, setMode] = useState<"text" | "url">("text");
  const [summary, setSummary] = useState<SummaryResult | null>(null);
  const [loading, setLoading] = useState(false);

  const parseResult = (text: string): SummaryResult => {
    const points: string[] = [];
    let originalWords = 0;
    let summaryWords = 0;

    const owMatch = text.match(/ORIGINAL_WORDS:\s*(\d+)/);
    if (owMatch) originalWords = parseInt(owMatch[1]);

    const swMatch = text.match(/SUMMARY_WORDS:\s*(\d+)/);
    if (swMatch) summaryWords = parseInt(swMatch[1]);

    const summarySection = text.split(/SUMMARY:/i)?.[1] || text;
    for (const line of summarySection.split("\n")) {
      const m = line.match(/^-\s*(.+)/);
      if (m) points.push(m[1]);
    }

    // If no bullet points found, try to extract from the whole text
    if (points.length === 0) {
      for (const line of text.split("\n")) {
        const m = line.match(/^[-*]\s*(.+)/);
        if (m) points.push(m[1]);
      }
    }

    return { points, originalWords, summaryWords };
  };

  const summarize = async () => {
    const prompt = mode === "text" ? inputText : url;
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "summarizer", prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const parsed = parseResult(data.result);
      setSummary(parsed);

      // Calculate word counts from input as fallback
      if (!parsed.originalWords && mode === "text") {
        parsed.originalWords = inputText.split(/\s+/).filter(Boolean).length;
      }
      if (!parsed.summaryWords) {
        parsed.summaryWords = parsed.points.join(" ").split(/\s+/).filter(Boolean).length;
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal merangkum teks");
    } finally {
      setLoading(false);
    }
  };

  const copySummary = async () => {
    const text = summary?.points.map((p) => `- ${p}`).join("\n") || "";
    await navigator.clipboard.writeText(text);
    toast.success("Ringkasan tersalin!");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="w-8 h-8" />
          AI Text Summarizer
        </h1>
        <p className="text-muted-foreground mt-1">Ringkas teks atau artikel jadi poin-poin penting.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Input</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button variant={mode === "text" ? "default" : "outline"} size="sm" onClick={() => setMode("text")}>
              <Type className="w-4 h-4 mr-1" /> Text
            </Button>
            <Button variant={mode === "url" ? "default" : "outline"} size="sm" onClick={() => setMode("url")}>
              <Link className="w-4 h-4 mr-1" /> URL
            </Button>
          </div>

          {mode === "text" ? (
            <div className="space-y-2">
              <Label htmlFor="text">Teks</Label>
              <Textarea id="text" placeholder="Paste teks yang ingin diringkas..." value={inputText} onChange={(e) => setInputText(e.target.value)} className="min-h-[200px]" />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="url">URL Artikel</Label>
              <Input id="url" placeholder="https://example.com/artikel" value={url} onChange={(e) => setUrl(e.target.value)} />
            </div>
          )}

          <Button onClick={summarize} disabled={loading || (mode === "text" ? !inputText.trim() : !url.trim())} className="w-full">
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Summarizing...</> : <><Sparkles className="w-4 h-4 mr-2" /> Summarize</>}
          </Button>
        </CardContent>
      </Card>

      {summary && (
        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Ringkasan</CardTitle>
            <Button variant="outline" size="sm" onClick={copySummary}>
              <Copy className="w-4 h-4 mr-1" /> Copy
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span className="bg-muted px-3 py-1 rounded-full">
                Original: {summary.originalWords} words
              </span>
              <span className="bg-muted px-3 py-1 rounded-full">
                Summary: {summary.summaryWords} words
              </span>
              {summary.originalWords > 0 && (
                <span className="bg-muted px-3 py-1 rounded-full">
                  ~{Math.round((summary.summaryWords / summary.originalWords) * 100)}% compression
                </span>
              )}
            </div>

            <ul className="space-y-3">
              {summary.points.map((point, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1 w-2 h-2 rounded-full bg-primary shrink-0" />
                  <span className="text-sm">{point}</span>
                </li>
              ))}
            </ul>

            {summary.points.length === 0 && (
              <p className="text-sm text-muted-foreground italic">
                Tidak ada poin yang dapat diekstrak. Coba teks yang lebih panjang.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
