"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette, RefreshCw, Lock, Unlock, Copy, Check, Download } from "lucide-react";
import { toast } from "sonner";

function randomHex(): string {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return `#${arr[0].toString(16).padStart(6, "0").slice(0, 6)}`;
}

interface Color {
  hex: string;
  locked: boolean;
}

export default function PalettePage() {
  const [colors, setColors] = useState<Color[]>([]);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const generatePalette = useCallback(() => {
    setColors((prev) => {
      if (prev.length === 0) {
        return Array.from({ length: 5 }, () => ({ hex: randomHex(), locked: false }));
      }
      return prev.map((c) => (c.locked ? c : { ...c, hex: randomHex() }));
    });
  }, []);

  useEffect(() => {
    generatePalette();
  }, []);

  const toggleLock = (idx: number) => {
    setColors((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, locked: !c.locked } : c))
    );
  };

  const copyHex = async (hex: string, idx: number) => {
    await navigator.clipboard.writeText(hex);
    setCopiedIdx(idx);
    toast.success(`${hex} tersalin!`);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const exportCss = () => {
    const css = `:root {\n${colors
      .map((c, i) => `  --color-${i + 1}: ${c.hex};`)
      .join("\n")}\n}`;
    const blob = new Blob([css], { type: "text/css" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `palette-${Date.now()}.css`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSS variables di-download!");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Palette className="w-8 h-8" />
          Color Palette Generator
        </h1>
        <p className="text-muted-foreground mt-1">
          Generate palet warna random. Klik warna untuk copy hex code.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Palette</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Color swatches */}
          <div className="grid grid-cols-5 gap-3">
            {colors.map((c, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <button
                  className="w-full aspect-square rounded-xl border-2 border-border shadow-sm cursor-pointer transition-transform hover:scale-105 relative group"
                  style={{ backgroundColor: c.hex }}
                  onClick={() => copyHex(c.hex, i)}
                >
                  <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {copiedIdx === i ? (
                      <Check className="w-6 h-6 text-white drop-shadow" />
                    ) : (
                      <Copy className="w-6 h-6 text-white drop-shadow" />
                    )}
                  </span>
                </button>
                <span className="text-xs font-mono">{c.hex}</span>
                <button
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => toggleLock(i)}
                  title={c.locked ? "Unlock" : "Lock"}
                >
                  {c.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={generatePalette} className="flex-1 gap-2">
              <RefreshCw className="w-4 h-4" />
              Regenerate
            </Button>
            <Button variant="outline" onClick={exportCss} className="gap-2">
              <Download className="w-4 h-4" />
              Export CSS
            </Button>
          </div>

          {/* CSS preview */}
          {colors.length > 0 && (
            <div className="rounded-md border bg-muted/30 p-3">
              <pre className="text-xs font-mono text-muted-foreground">{`:root {\n${colors
                .map((c, i) => `  --color-${i + 1}: ${c.hex};`)
                .join("\n")}\n}`}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
