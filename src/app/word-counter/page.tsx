"use client";

import { useState, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Type,
  Hash,
  MessageSquare,
  AlignLeft,
  Clock,
  Mic,
  Trash2,
  ArrowUp,
} from "lucide-react";

interface WordCount {
  word: string;
  count: number;
}

function getStats(text: string) {
  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/).filter(Boolean) : [];
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, "").length;
  const sentences = trimmed ? trimmed.split(/[.!?]+/).filter((s) => s.trim().length > 0).length : 0;
  const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length : 0;
  const wordCount = words.length;

  // Reading time: ~200 words per minute
  const readingMinutes = wordCount / 200;
  const readingTime = readingMinutes < 1
    ? "< 1 min"
    : `${Math.ceil(readingMinutes)} min`;

  // Speaking time: ~150 words per minute
  const speakingMinutes = wordCount / 150;
  const speakingTime = speakingMinutes < 1
    ? "< 1 min"
    : `${Math.ceil(speakingMinutes)} min`;

  // Keyword density - top 5
  const freq: Record<string, number> = {};
  words.forEach((w) => {
    const lower = w.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (lower) freq[lower] = (freq[lower] || 0) + 1;
  });
  const top5: WordCount[] = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word, count]) => ({ word, count }));

  return {
    words: wordCount,
    chars,
    charsNoSpaces,
    sentences,
    paragraphs,
    readingTime,
    speakingTime,
    top5,
  };
}

export default function WordCounterPage() {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const stats = useMemo(() => getStats(text), [text]);

  const clearText = () => {
    setText("");
    textareaRef.current?.focus();
  };

  const statsCards = [
    { icon: Hash, label: "Words", value: stats.words },
    { icon: Type, label: "Characters", value: stats.chars },
    { icon: Type, label: "Characters (no spaces)", value: stats.charsNoSpaces },
    { icon: MessageSquare, label: "Sentences", value: stats.sentences },
    { icon: AlignLeft, label: "Paragraphs", value: stats.paragraphs },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="w-8 h-8" />
          Word Counter
        </h1>
        <p className="text-muted-foreground mt-1">
          Count words, characters, sentences, and more in real-time.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Text</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearText}
              disabled={!text}
              className="gap-1 text-muted-foreground"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            ref={textareaRef}
            placeholder="Type or paste your text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[200px] resize-y"
          />

          <Separator />

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {statsCards.map(({ icon: Icon, label, value }) => (
              <div key={label} className="p-3 border rounded-lg text-center">
                <Icon className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>

          <Separator />

          {/* Reading & Speaking time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Clock className="w-5 h-5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-sm font-medium">Reading Time</p>
                <p className="text-xs text-muted-foreground">{stats.readingTime}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Mic className="w-5 h-5 text-muted-foreground shrink-0" />
              <div>
                <p className="text-sm font-medium">Speaking Time</p>
                <p className="text-xs text-muted-foreground">{stats.speakingTime}</p>
              </div>
            </div>
          </div>

          {/* Keyword density */}
          {stats.top5.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <ArrowUp className="w-4 h-4" />
                  Top Keywords
                </div>
                <div className="space-y-2">
                  {stats.top5.map((item, i) => {
                    const pct = ((item.count / stats.words) * 100).toFixed(1);
                    return (
                      <div key={item.word} className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground font-mono w-5">
                          {i + 1}.
                        </span>
                        <span className="text-sm font-medium flex-1">{item.word}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${Math.min(100, parseFloat(pct) * 5)}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground w-10 text-right">
                            {item.count}x
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
