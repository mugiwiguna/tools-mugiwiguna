"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { FileText, Copy, Check, WandSparkles, Loader2, Download } from "lucide-react";
import { toast } from "sonner";

export default function AIBlogPage() {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("formal");
  const [length, setLength] = useState("medium");
  const [article, setArticle] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "blog", prompt: topic, options: { tone, length } }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setArticle(data.result);
    } catch (err: any) {
      toast.error(err.message || "Gagal generate artikel");
    } finally {
      setLoading(false);
    }
  };

  const copyArticle = async () => {
    await navigator.clipboard.writeText(article);
    toast.success("Artikel tersalin!");
  };

  const downloadMarkdown = () => {
    if (!article) return;
    const md = `# ${topic}\n\n${article}`;
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${topic.replace(/\s+/g, "-").toLowerCase()}-artikel.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Download file .md!");
  };

  const parsedTitle = article.match(/TITLE:\s*(.*?)(?:\n|$)/)?.[1] || "";
  const parsedIntro = article.match(/INTRO:\s*([\s\S]*?)(?:\n\n|BODY:|$)/)?.[1]?.trim() || "";
  const parsedBody = article.match(/BODY:\s*([\s\S]*?)(?:FAQ:|CONCLUSION:|$)/)?.[1]?.trim() || "";
  const parsedFaq = article.match(/FAQ:\s*([\s\S]*?)(?:CONCLUSION:|$)/)?.[1]?.trim() || "";
  const parsedConclusion = article.match(/CONCLUSION:\s*(.*?)(?:\n|$)/)?.[1] || "";

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="w-8 h-8" />
          AI Blog Writer
        </h1>
        <p className="text-muted-foreground mt-1">Buat artikel blog lengkap dengan AI.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Article Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topic">Topik / Keyword</Label>
            <Input id="topic" placeholder="Contoh: Manfaat AI dalam Pendidikan" value={topic} onChange={(e) => setTopic(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={(v) => v && setTone(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="formal">Formal</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Length</Label>
              <Select value={length} onValueChange={(v) => v && setLength(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="long">Long</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={generate} disabled={!topic.trim() || loading} className="w-full">
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</> : <><WandSparkles className="w-4 h-4 mr-2" /> Generate Article</>}
          </Button>
        </CardContent>
      </Card>

      {article && (
        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Artikel</CardTitle>
              <CardDescription>Hasil generate untuk: {topic}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyArticle}>
                <Copy className="w-4 h-4 mr-1" /> Copy
              </Button>
              <Button variant="outline" size="sm" onClick={downloadMarkdown}>
                <Download className="w-4 h-4 mr-1" /> .md
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {parsedTitle && <h2 className="text-2xl font-bold">{parsedTitle}</h2>}
            {parsedIntro && <p className="text-muted-foreground">{parsedIntro}</p>}
            {parsedBody && (
              <div className="prose prose-sm max-w-none">
                {parsedBody.split("\n\n").map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            )}
            {parsedFaq && (
              <>
                <Separator />
                <h3 className="text-lg font-semibold">FAQ</h3>
                {parsedFaq.split("\n").filter(Boolean).map((line, i) => {
                  if (line.startsWith("Q:")) return <p key={i} className="font-medium mt-2"><strong>{line}</strong></p>;
                  if (line.startsWith("A:")) return <p key={i} className="text-muted-foreground ml-4">{line}</p>;
                  return <p key={i}>{line}</p>;
                })}
              </>
            )}
            {parsedConclusion && (
              <>
                <Separator />
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-semibold mb-1">Kesimpulan</h3>
                  <p className="text-muted-foreground">{parsedConclusion}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
