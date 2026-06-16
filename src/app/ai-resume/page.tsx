"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { FileText, Upload, WandSparkles, Loader2, Star, ThumbsUp, AlertTriangle, Lightbulb } from "lucide-react";
import { toast } from "sonner";

interface ResumeAnalysis {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

export default function AIResumePage() {
  const [file, setFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [rawResult, setRawResult] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setResumeText(""); // clear text input when file selected
  };

  const clearFile = () => {
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const parseResult = (text: string): ResumeAnalysis => {
    const scoreMatch = text.match(/SCORE:\s*(\d+)/);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;

    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const suggestions: string[] = [];

    const sections = text.split(/\n(?=STRENGTHS:|WEAKNESSES:|SUGGESTIONS:)/);
    for (const section of sections) {
      if (section.startsWith("STRENGTHS:")) {
        for (const line of section.split("\n")) {
          const m = line.match(/^-\s*(.+)/);
          if (m) strengths.push(m[1]);
        }
      }
      if (section.startsWith("WEAKNESSES:")) {
        for (const line of section.split("\n")) {
          const m = line.match(/^-\s*(.+)/);
          if (m) weaknesses.push(m[1]);
        }
      }
      if (section.startsWith("SUGGESTIONS:")) {
        for (const line of section.split("\n")) {
          const m = line.match(/^-\s*(.+)/);
          if (m) suggestions.push(m[1]);
        }
      }
    }

    return { score, strengths, weaknesses, suggestions };
  };

  const analyze = async () => {
    if (!resumeText.trim() && !file) return;
    setLoading(true);
    try {
      let promptText = resumeText;
      if (file) {
        // Read file content as text
        const text = await file.text();
        promptText = text;
      }

      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "resume", prompt: promptText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRawResult(data.result);
      setAnalysis(parseResult(data.result));
    } catch (err: any) {
      toast.error(err.message || "Gagal menganalisis resume");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (s: number) => {
    if (s >= 80) return "text-green-500";
    if (s >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBarColor = (s: number) => {
    if (s >= 80) return "bg-green-500";
    if (s >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="w-8 h-8" />
          AI Resume Analyzer
        </h1>
        <p className="text-muted-foreground mt-1">Analisis CV/resume kamu dan dapatkan feedback.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Resume Input</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Upload File (PDF / Gambar)</Label>
            <input
              ref={fileRef}
              id="file"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.txt"
              onChange={handleFile}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
            {file && (
              <div className="flex items-center justify-between mt-2 p-2 border rounded-md">
                <span className="text-sm truncate">{file.name}</span>
                <Button variant="ghost" size="xs" onClick={clearFile}>Ganti</Button>
              </div>
            )}
          </div>
          {!file && (
            <>
              <div className="relative">
                <Separator className="my-2" />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">ATAU</span>
              </div>
              <div className="space-y-2">
                <Label htmlFor="text">Paste Resume Text</Label>
                <Textarea id="text" placeholder="Tempel teks resume/CV kamu di sini..." value={resumeText} onChange={(e) => setResumeText(e.target.value)} className="min-h-[200px]" />
              </div>
            </>
          )}
          <Button onClick={analyze} disabled={(!resumeText.trim() && !file) || loading} className="w-full">
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</> : <><WandSparkles className="w-4 h-4 mr-2" /> Analyze Resume</>}
          </Button>
        </CardContent>
      </Card>

      {analysis && (
        <div className="mt-6 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Star className="w-5 h-5 text-yellow-500" /> Resume Score</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <span className={`text-5xl font-bold ${getScoreColor(analysis.score)}`}>{analysis.score}</span>
                <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full ${getScoreBarColor(analysis.score)} rounded-full transition-all`} style={{ width: `${analysis.score}%` }} />
                </div>
              </div>
            </CardContent>
          </Card>

          {analysis.strengths.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><ThumbsUp className="w-5 h-5 text-green-500" /> Strengths</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1 w-2 h-2 rounded-full bg-green-500 shrink-0" />
                      <span className="text-sm">{s}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {analysis.weaknesses.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-red-500" /> Weaknesses</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.weaknesses.map((w, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1 w-2 h-2 rounded-full bg-red-500 shrink-0" />
                      <span className="text-sm">{w}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {analysis.suggestions.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Lightbulb className="w-5 h-5 text-blue-500" /> Suggestions</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.suggestions.map((s, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1 w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                      <span className="text-sm">{s}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
