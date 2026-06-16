"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Code,
  Copy,
  Check,
  Upload,
  ArrowRight,
  ArrowLeft,
  FileCode,
} from "lucide-react";
import { toast } from "sonner";

export default function Base64Page() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const encode = () => {
    if (!input) {
      toast.error("Please enter text to encode");
      return;
    }
    try {
      const encoded = btoa(
        encodeURIComponent(input).replace(/%([0-9A-F]{2})/g, (_m, p1) =>
          String.fromCharCode(parseInt(p1, 16))
        )
      );
      setOutput(encoded);
      toast.success("Encoded!");
    } catch {
      toast.error("Failed to encode. Check your input.");
    }
  };

  const decode = () => {
    if (!input) {
      toast.error("Please enter Base64 to decode");
      return;
    }
    try {
      const decoded = decodeURIComponent(
        Array.from(atob(input))
          .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, "0")}`)
          .join("")
      );
      setOutput(decoded);
      toast.success("Decoded!");
    } catch {
      toast.error("Invalid Base64 input");
    }
  };

  const handleFileUpload = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setInput(result);
      // Auto-encode
      try {
        const base64 = result.split(",")[1];
        setOutput(base64);
        toast.success(`File encoded: ${file.name}`);
      } catch {
        toast.error("Failed to encode file");
      }
    };
    reader.readAsDataURL(file);
  };

  const copyOutput = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success("Copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setInput("");
    setOutput("");
    setFileName("");
    setCopied(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Code className="w-8 h-8" />
          Base64 Encoder / Decoder
        </h1>
        <p className="text-muted-foreground mt-1">
          Encode text or files to Base64, or decode Base64 back to text.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Convert</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Input */}
          <div className="space-y-2">
            <Label htmlFor="base64-input">Input</Label>
            <Textarea
              id="base64-input"
              placeholder="Enter text or Base64 to encode/decode..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[120px]"
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button onClick={encode} className="flex-1 gap-2" disabled={!input}>
              <ArrowRight className="w-4 h-4" />
              Encode
            </Button>
            <Button onClick={decode} className="flex-1 gap-2" disabled={!input}>
              <ArrowLeft className="w-4 h-4" />
              Decode
            </Button>
          </div>

          {/* File upload */}
          <div className="space-y-2">
            <Label>Upload File to Encode</Label>
            <div
              className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center gap-1">
                <Upload className="w-6 h-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {fileName ? fileName : "Click to upload a file"}
                </p>
                <p className="text-xs text-muted-foreground">
                  File will be encoded to Base64
                </p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />
          </div>

          {fileName && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileCode className="w-4 h-4" />
              <span>Encoded: {fileName}</span>
            </div>
          )}

          <Separator />

          {/* Output */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Output</Label>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyOutput}
                  disabled={!output}
                  className="gap-1"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  disabled={!input && !output}
                >
                  Clear
                </Button>
              </div>
            </div>
            <Textarea
              value={output}
              readOnly
              placeholder="Output will appear here..."
              className="min-h-[120px] font-mono text-sm"
            />
          </div>

          {output && (
            <p className="text-xs text-muted-foreground">
              Output length: {output.length} characters
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
