"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, Loader2, Sparkles, Smile, Frown, Meh } from "lucide-react";
import { toast } from "sonner";

interface SentimentResult {
  sentiment: string;
  confidence: {
    positif: number;
    negatif: number;
    netral: number;
  };
  reason: string;
}

interface HistoryItem {
  text: string;
  result: SentimentResult;
  timestamp: number;
}

export default function AISentimentPage() {
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState<SentimentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const parseResult = (text: string): SentimentResult => {
    const sentimentMatch = text.match(/SENTIMENT:\s*(Positif|Negatif|Netral)/);
    const sentiment = sentimentMatch ? sentimentMatch[1] : "Netral";

    const pos = text.match(/Positif:\s*(\d+)/);
    const neg = text.match(/Negatif:\s*(\d+)/);
    const net = text.match(/Netral:\s*(\d+)/);

    const reasonMatch = text.match(/REASON:\s*(.*?)(?:\n|$)/);
    const reason = reasonMatch ? reasonMatch[1].trim() : "";

    return {
      sentiment: sentiment === "Positif" ? "Positive" : sentiment === "Negatif" ? "Negative" : "Neutral",
      confidence: {
        positif: pos ? parseInt(pos[1]) : 0,
        negatif: neg ? parseInt(neg[1]) : 0,
        netral: net ? parseInt(net[1]) : 0,
      },
      reason,
    };
  };

  const analyze = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "sentiment", prompt: inputText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const parsed = parseResult(data.result);
      setResult(parsed);
      setHistory((prev) => [{ text: inputText, result: parsed, timestamp: Date.now() }, ...prev].slice(0, 5));
    } catch (err: any) {
      toast.error(err.message || "Gagal menganalisis sentimen");
    } finally {
      setLoading(false);
    }
  };

  const getSentimentIcon = (s: string) => {
    if (s === "Positive") return <Smile className="w-6 h-6 text-green-500" />;
    if (s === "Negative") return <Frown className="w-6 h-6 text-red-500" />;
    return <Meh className="w-6 h-6 text-yellow-500" />;
  };

  const getSentimentColor = (s: string) => {
    if (s === "Positive") return "text-green-500";
    if (s === "Negative") return "text-red-500";
    return "text-yellow-500";
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <MessageCircle className="w-8 h-8" />
          AI Sentiment Analysis
        </h1>
        <p className="text-muted-foreground mt-1">Analisis sentimen teks dengan AI.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Input Text</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="text">Teks</Label>
            <Textarea id="text" placeholder="Masukkan teks yang ingin dianalisis sentimennya..." value={inputText} onChange={(e) => setInputText(e.target.value)} className="min-h-[150px]" />
          </div>
          <Button onClick={analyze} disabled={!inputText.trim() || loading} className="w-full">
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</> : <><Sparkles className="w-4 h-4 mr-2" /> Analyze Sentiment</>}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className="mt-6">
          <CardHeader><CardTitle className="text-lg">Result</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 justify-center py-4">
              {getSentimentIcon(result.sentiment)}
              <span className={`text-2xl font-bold ${getSentimentColor(result.sentiment)}`}>
                {result.sentiment}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-green-500">Positive</span>
                  <span className="text-green-500">{result.confidence.positif}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${result.confidence.positif}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-red-500">Negative</span>
                  <span className="text-red-500">{result.confidence.negatif}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: `${result.confidence.negatif}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-yellow-500">Neutral</span>
                  <span className="text-yellow-500">{result.confidence.netral}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500 rounded-full transition-all" style={{ width: `${result.confidence.netral}%` }} />
                </div>
              </div>
            </div>

            {result.reason && (
              <div className="bg-muted p-3 rounded-lg text-sm text-muted-foreground">
                <strong className="block mb-1">Reason:</strong>
                {result.reason}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {history.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">History (5 Terakhir)</h3>
          <div className="space-y-3">
            {history.map((item, i) => (
              <Card key={i}>
                <CardContent className="py-3">
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{item.text}</p>
                  <div className="flex items-center gap-2">
                    {getSentimentIcon(item.result.sentiment)}
                    <span className={`text-sm font-medium ${getSentimentColor(item.result.sentiment)}`}>
                      {item.result.sentiment}
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {new Date(item.timestamp).toLocaleTimeString("id-ID")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
