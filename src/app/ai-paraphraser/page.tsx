"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Repeat, Copy, Check, WandSparkles, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AIParaphraserPage() {
  const [inputText, setInputText] = useState("");
  const [tone, setTone] = useState("formal");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const paraphrase = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "paraphraser", prompt: inputText, options: { tone } }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setOutput(data.result);
    } catch (err: any) {
      toast.error(err.message || "Gagal paraphrase");
    } finally {
      setLoading(false);
    }
  };

  const copyText = async () => {
    await navigator.clipboard.writeText(output);
    toast.success("Tersalin!");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Repeat className="w-8 h-8" />
          AI Paraphraser
        </h1>
        <p className="text-muted-foreground mt-1">Parafrase teks dengan gaya berbeda. Gratis 3x/hari.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Paraphrase Text</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="inputText">Teks Kamu</Label>
            <Textarea id="inputText" placeholder="Paste teks di sini..." value={inputText} onChange={(e) => setInputText(e.target.value)} className="min-h-[150px]" />
          </div>

          <div className="space-y-2">
            <Label>Gaya</Label>
            <Select value={tone} onValueChange={(v) => v && setTone(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={paraphrase} disabled={!inputText || loading} className="w-full gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <WandSparkles className="w-4 h-4" />}
            {loading ? "Paraphrase..." : "Paraphrase"}
          </Button>

          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> 3x gratis per hari. Berlangganan buat unlimited.
          </div>

          {output && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Hasil Parafrase</Label>
                  <Button variant="outline" size="sm" onClick={copyText}><Copy className="w-4 h-4" /></Button>
                </div>
                <div className="p-4 border rounded-lg bg-muted/30 min-h-[100px] text-sm leading-relaxed whitespace-pre-wrap">{output}</div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
