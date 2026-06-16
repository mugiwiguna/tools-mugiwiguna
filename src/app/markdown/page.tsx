"use client";

import { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { FileText, Copy, Check, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function MarkdownPage() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  const copyMarkdown = useCallback(async () => {
    if (!input) return;
    await navigator.clipboard.writeText(input);
    setCopied(true);
    toast.success("Markdown tersalin!");
    setTimeout(() => setCopied(false), 2000);
  }, [input]);

  const downloadMarkdown = useCallback(() => {
    if (!input) return;
    const blob = new Blob([input], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `markdown-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("File .md di-download!");
  }, [input]);

  const clearInput = useCallback(() => {
    setInput("");
    toast.success("Konten dibersihkan!");
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="w-8 h-8" />
          Markdown Editor
        </h1>
        <p className="text-muted-foreground mt-1">
          Tulis Markdown dan lihat preview HTML secara real-time.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Input */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Markdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="md-input">Tulis Markdown</Label>
              <textarea
                id="md-input"
                className="flex min-h-[400px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm font-mono shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="# Hello World&#10;&#10;Tulis **Markdown** di sini..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={copyMarkdown}
                variant="outline"
                className="flex-1 gap-2"
                disabled={!input}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Tersalin!" : "Copy"}
              </Button>
              <Button
                onClick={downloadMarkdown}
                variant="outline"
                className="flex-1 gap-2"
                disabled={!input}
              >
                <Download className="w-4 h-4" />
                Download .md
              </Button>
              <Button
                onClick={clearInput}
                variant="outline"
                className="flex-1 gap-2"
                disabled={!input}
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="min-h-[400px] rounded-md border border-input bg-transparent px-3 py-2 text-sm overflow-auto [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-2 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3 [&_h2]:mt-2 [&_h3]:text-lg [&_h3]:font-medium [&_h3]:mb-2 [&_h3]:mt-2 [&_p]:mb-3 [&_a]:text-blue-500 [&_a]:underline [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono [&_pre]:bg-muted [&_pre]:p-3 [&_pre]:rounded-md [&_pre]:overflow-x-auto [&_pre]:mb-3 [&_blockquote]:border-l-4 [&_blockquote]:border-muted-foreground/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-3 [&_li]:mb-1 [&_table]:border-collapse [&_table]:w-full [&_table]:mb-3 [&_th]:border [&_th]:px-2 [&_th]:py-1 [&_th]:text-left [&_th]:font-medium [&_td]:border [&_td]:px-2 [&_td]:py-1 [&_hr]:my-4 [&_strong]:font-semibold [&_em]:italic [&_img]:max-w-full [&_img]:rounded-md">
              {input ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {input}
                </ReactMarkdown>
              ) : (
                <p className="text-muted-foreground italic">
                  Preview akan muncul di sini...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
