"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  ImagePlus,
  Download,
  RotateCcw,
  Lock,
  Unlock,
  ArrowRight,
} from "lucide-react";

interface PresetSize {
  label: string;
  width: number;
  height: number;
}

const PRESETS: PresetSize[] = [
  { label: "Instagram Post (1080×1080)", width: 1080, height: 1080 },
  { label: "Instagram Story (1080×1920)", width: 1080, height: 1920 },
  { label: "Twitter Post (1200×675)", width: 1200, height: 675 },
  { label: "Facebook Cover (820×312)", width: 820, height: 312 },
  { label: "LinkedIn Post (1200×627)", width: 1200, height: 627 },
  { label: "Custom", width: 0, height: 0 },
];

type OutputFormat = "image/png" | "image/jpeg" | "image/webp";
type FormatKey = "png" | "jpeg" | "webp";

const FORMAT_MAP: Record<FormatKey, OutputFormat> = {
  png: "image/png",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

const FORMAT_EXT: Record<FormatKey, string> = {
  png: "png",
  jpeg: "jpg",
  webp: "webp",
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

export default function ImageResizePage() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string>("");
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [lockAspect, setLockAspect] = useState(true);
  const [quality, setQuality] = useState(80);
  const [format, setFormat] = useState<FormatKey>("png");
  const [preset, setPreset] = useState("Custom");
  const [resizedUrl, setResizedUrl] = useState<string>("");
  const [resizedSize, setResizedSize] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspectRatio = originalWidth > 0 && originalHeight > 0
    ? originalWidth / originalHeight
    : 1;

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      if (resizedUrl) URL.revokeObjectURL(resizedUrl);
    };
  }, [originalUrl, resizedUrl]);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("File bukan gambar!");
      return;
    }
    const url = URL.createObjectURL(file);
    setOriginalFile(file);
    setOriginalUrl(url);

    const img = new Image();
    img.onload = () => {
      setOriginalWidth(img.naturalWidth);
      setOriginalHeight(img.naturalHeight);
      setWidth(img.naturalWidth);
      setHeight(img.naturalHeight);
      setPreset("Custom");
      setResizedUrl("");
      setResizedSize(0);
    };
    img.src = url;
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (lockAspect && aspectRatio > 0) {
      setHeight(Math.round(val / aspectRatio));
    }
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (lockAspect && aspectRatio > 0) {
      setWidth(Math.round(val * aspectRatio));
    }
  };

  const handlePresetChange = (value: string | null) => {
    if (!value) return;
    setPreset(value);
    const p = PRESETS.find((pr) => pr.label === value);
    if (p && p.width > 0) {
      setWidth(p.width);
      setHeight(p.height);
      setLockAspect(false);
    }
  };

  const resize = useCallback(() => {
    if (!originalUrl || width <= 0 || height <= 0) {
      toast.error("Upload gambar dulu dan set ukuran!");
      return;
    }

    setIsProcessing(true);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setIsProcessing(false);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      const mimeType = FORMAT_MAP[format];
      const q = format === "png" ? undefined : quality / 100;

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            toast.error("Gagal resize gambar!");
            setIsProcessing(false);
            return;
          }
          if (resizedUrl) URL.revokeObjectURL(resizedUrl);
          const newUrl = URL.createObjectURL(blob);
          setResizedUrl(newUrl);
          setResizedSize(blob.size);
          setIsProcessing(false);
          toast.success("Gambar berhasil di-resize!");
        },
        mimeType,
        q
      );
    };
    img.src = originalUrl;
  }, [originalUrl, width, height, format, quality, resizedUrl]);

  const download = () => {
    if (!resizedUrl) return;
    const ext = FORMAT_EXT[format];
    const a = document.createElement("a");
    a.href = resizedUrl;
    a.download = `resized-${width}x${height}.${ext}`;
    a.click();
    toast.success("Download started!");
  };

  const reset = () => {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (resizedUrl) URL.revokeObjectURL(resizedUrl);
    setOriginalFile(null);
    setOriginalUrl("");
    setOriginalWidth(0);
    setOriginalHeight(0);
    setWidth(0);
    setHeight(0);
    setLockAspect(true);
    setQuality(80);
    setFormat("png");
    setPreset("Custom");
    setResizedUrl("");
    setResizedSize(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ImagePlus className="w-8 h-8" />
          Image Resize
        </h1>
        <p className="text-muted-foreground mt-1">
          Resize gambar langsung di browser. Cepat, gratis, tanpa upload ke server.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left: Upload & Settings */}
        <div className="space-y-6">
          {/* Upload Zone */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upload Gambar</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-primary/50"
                }`}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                  }}
                />
                <ImagePlus className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm font-medium">
                  {isDragging
                    ? "Drop gambar di sini..."
                    : "Klik atau drag & drop gambar di sini"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG, WebP, GIF
                </p>
              </div>
              {originalFile && (
                <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="truncate flex-1">{originalFile.name}</span>
                  <span>{formatFileSize(originalFile.size)}</span>
                  <Button variant="ghost" size="icon-sm" onClick={(e) => { e.stopPropagation(); reset(); }}>
                    <RotateCcw className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Settings */}
          {originalUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pengaturan Resize</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Preset */}
                <div className="space-y-1">
                  <Label>Preset Ukuran</Label>
                  <Select value={preset} onValueChange={handlePresetChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRESETS.map((p) => (
                        <SelectItem key={p.label} value={p.label}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Width / Height */}
                <div className="flex items-end gap-2">
                  <div className="flex-1 space-y-1">
                    <Label htmlFor="width">Lebar (px)</Label>
                    <Input
                      id="width"
                      type="number"
                      min={1}
                      value={width || ""}
                      onChange={(e) => handleWidthChange(Number(e.target.value))}
                    />
                  </div>
                  <Button
                    variant={lockAspect ? "default" : "outline"}
                    size="icon"
                    onClick={() => setLockAspect(!lockAspect)}
                    title={lockAspect ? "Unlock aspect ratio" : "Lock aspect ratio"}
                  >
                    {lockAspect ? (
                      <Lock className="w-4 h-4" />
                    ) : (
                      <Unlock className="w-4 h-4" />
                    )}
                  </Button>
                  <div className="flex-1 space-y-1">
                    <Label htmlFor="height">Tinggi (px)</Label>
                    <Input
                      id="height"
                      type="number"
                      min={1}
                      value={height || ""}
                      onChange={(e) => handleHeightChange(Number(e.target.value))}
                    />
                  </div>
                </div>

                <Separator />

                {/* Output Format */}
                <div className="space-y-1">
                  <Label>Format Output</Label>
                  <Select value={format} onValueChange={(v) => v && setFormat(v as FormatKey)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="png">PNG</SelectItem>
                      <SelectItem value="jpeg">JPEG</SelectItem>
                      <SelectItem value="webp">WebP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Quality (for JPEG/WebP) */}
                {format !== "png" && (
                  <div className="space-y-1">
                    <Label htmlFor="quality">
                      Kualitas: {quality}%
                    </Label>
                    <input
                      id="quality"
                      type="range"
                      min={1}
                      max={100}
                      value={quality}
                      onChange={(e) => setQuality(Number(e.target.value))}
                      className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Kecil</span>
                      <span>Bagus</span>
                    </div>
                  </div>
                )}

                {/* Resize Button */}
                <Button onClick={resize} className="w-full gap-2" disabled={isProcessing}>
                  <ArrowRight className="w-4 h-4" />
                  {isProcessing ? "Processing..." : "Resize Gambar"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Info Comparison */}
          {originalUrl && resizedUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Perbandingan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Original</p>
                    <p className="text-sm font-medium">
                      {originalWidth} × {originalHeight}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(originalFile?.size ?? 0)}
                    </p>
                  </div>
                  <div className="flex items-center justify-center">
                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Resized</p>
                    <p className="text-sm font-medium">
                      {width} × {height}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(resizedSize)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Preview */}
        <div className="space-y-6">
          {/* Original Preview */}
          {originalUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Preview Original</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border overflow-hidden bg-muted/30 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={originalUrl}
                    alt="Original"
                    className="max-h-[400px] w-auto object-contain"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Resized Preview */}
          {resizedUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Preview Resized</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border overflow-hidden bg-muted/30 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resizedUrl}
                    alt="Resized"
                    className="max-h-[400px] w-auto object-contain"
                  />
                </div>
                <Button onClick={download} className="w-full gap-2">
                  <Download className="w-4 h-4" />
                  Download ({formatFileSize(resizedSize)})
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Empty state */}
          {!originalUrl && (
            <Card>
              <CardContent className="py-16 text-center">
                <ImagePlus className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  Upload gambar untuk mulai resize
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
