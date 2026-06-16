"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Image as ImageIcon,
  Download,
  ImageDown,
  Upload,
  FileImage,
  Check,
} from "lucide-react";
import { toast } from "sonner";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ImageCompressorPage() {
  const [originalSrc, setOriginalSrc] = useState<string | null>(null);
  const [compressedSrc, setCompressedSrc] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [quality, setQuality] = useState(80);
  const [compressing, setCompressing] = useState(false);
  const [compressed, setCompressed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    setOriginalSize(file.size);
    setCompressedSrc(null);
    setCompressed(false);

    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalSrc(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const compress = useCallback(() => {
    if (!originalSrc) return;
    setCompressing(true);

    const img = new window.Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        setCompressing(false);
        return;
      }
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setCompressing(false);
        return;
      }
      ctx.drawImage(img, 0, 0);

      const dataUrl = canvas.toDataURL("image/jpeg", quality / 100);
      setCompressedSrc(dataUrl);

      // Calculate compressed size from base64
      const base64 = dataUrl.split(",")[1];
      const size = Math.round((base64.length * 3) / 4);
      setCompressedSize(size);
      setCompressed(true);
      setCompressing(false);
      toast.success("Image compressed!");
    };
    img.src = originalSrc;
  }, [originalSrc, quality]);

  const download = useCallback(() => {
    if (!compressedSrc) return;
    const a = document.createElement("a");
    a.href = compressedSrc;
    a.download = `compressed-${Date.now()}.jpg`;
    a.click();
    toast.success("Downloaded!");
  }, [compressedSrc]);

  const savings =
    originalSize && compressedSize
      ? Math.round((1 - compressedSize / originalSize) * 100)
      : 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ImageIcon className="w-8 h-8" />
          Image Compressor
        </h1>
        <p className="text-muted-foreground mt-1">
          Compress your images directly in the browser. No upload to server.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Compress Image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File input */}
          <div className="space-y-2">
            <Label>Select Image</Label>
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {originalSrc ? (
                <div className="flex flex-col items-center gap-2">
                  <FileImage className="w-8 h-8 text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Click to change image ({formatBytes(originalSize)})
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Drop an image or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports JPG, PNG, WebP
                  </p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
            />
          </div>

          {/* Preview original */}
          {originalSrc && (
            <div className="space-y-2">
              <Label>Original Preview</Label>
              <div className="border rounded-lg overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={originalSrc}
                  alt="Original"
                  className="w-full h-48 object-contain bg-muted/30"
                />
              </div>
            </div>
          )}

          {/* Quality slider */}
          {originalSrc && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Quality</Label>
                <span className="text-sm font-mono">{quality}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                value={quality}
                onChange={(e) => {
                  setQuality(Number(e.target.value));
                  setCompressed(false);
                }}
                className="w-full cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>10 (smaller)</span>
                <span>100 (best)</span>
              </div>
            </div>
          )}

          {/* Compress button */}
          {originalSrc && (
            <Button
              onClick={compress}
              disabled={compressing}
              className="w-full gap-2"
            >
              <ImageDown className="w-4 h-4" />
              {compressing ? "Compressing..." : "Compress Image"}
            </Button>
          )}

          <canvas ref={canvasRef} className="hidden" />

          {/* Results */}
          {compressed && compressedSrc && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label>Compressed Preview</Label>
                <div className="border rounded-lg overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={compressedSrc}
                    alt="Compressed"
                    className="w-full h-48 object-contain bg-muted/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 border rounded-lg">
                  <p className="text-muted-foreground">Original</p>
                  <p className="font-mono font-medium">{formatBytes(originalSize)}</p>
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="text-muted-foreground">Compressed</p>
                  <p className="font-mono font-medium">{formatBytes(compressedSize)}</p>
                </div>
              </div>

              <div className="text-center">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium">
                  <Check className="w-4 h-4" />
                  Saved {savings}%
                </span>
              </div>

              <Button onClick={download} className="w-full gap-2" variant="outline">
                <Download className="w-4 h-4" />
                Download Compressed Image
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
