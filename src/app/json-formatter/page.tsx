"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Braces, Copy, Download, Check, Wand2 } from "lucide-react";
import { toast } from "sonner";

export default function JsonFormatterPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const format = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
      toast.success("JSON diformat!");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      toast.error(`JSON tidak valid: ${msg}`);
    }
  };

  const minify = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      toast.success("JSON di-minify!");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      toast.error(`JSON tidak valid: ${msg}`);
    }
  };

  const validate = () => {
    try {
      JSON.parse(input);
      toast.success("JSON valid!");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      toast.error(`JSON tidak valid: ${msg}`);
    }
  };

  const copyOutput = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success("Tersalin!");
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadOutput = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `formatted-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("File di-download!");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Braces className="w-8 h-8" />
          JSON Formatter
        </h1>
        <p className="text-muted-foreground mt-1">
          Format, minify, dan validasi JSON di browser.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Input */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Input JSON</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="json-input">Raw JSON</Label>
              <textarea
                id="json-input"
                className="flex min-h-[300px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm font-mono shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder='{"key": "value"}'
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={format} className="flex-1 gap-2">
                <Wand2 className="w-4 h-4" />
                Format
              </Button>
              <Button onClick={minify} variant="outline" className="flex-1">
                Minify
              </Button>
              <Button onClick={validate} variant="outline" className="flex-1">
                Validate
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Output */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Output</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>Hasil</Label>
              <textarea
                className="flex min-h-[300px] w-full rounded-md border border-input bg-muted/30 px-3 py-2 text-sm font-mono shadow-sm placeholder:text-muted-foreground focus-visible:outline-none"
                placeholder="Hasil akan muncul di sini..."
                value={output}
                readOnly
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={copyOutput}
                variant="outline"
                className="flex-1 gap-2"
                disabled={!output}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Tersalin!" : "Copy"}
              </Button>
              <Button
                onClick={downloadOutput}
                variant="outline"
                className="flex-1 gap-2"
                disabled={!output}
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
