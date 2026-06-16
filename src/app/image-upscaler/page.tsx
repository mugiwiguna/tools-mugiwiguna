"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Download, Loader2, ZoomIn } from "lucide-react";
import { toast } from "sonner";

export default function ImageUpscalerPage() {
  const [original, setOriginal] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [scale, setScale] = useState("2");
  const [loading, setLoading] = useState(false);
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResult(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      setOriginal(url);
      const img = new Image();
      img.onload = () => setDims({ w: img.naturalWidth, h: img.naturalHeight });
      img.src = url;
    };
    reader.readAsDataURL(file);
  };

  const upscale = async () => {
    if (!original) return;
    setLoading(true);
    try {
      const img = new Image();
      img.src = original;
      await new Promise((resolve) => { img.onload = resolve; });

      const factor = parseInt(scale);
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth * factor;
      canvas.height = img.naturalHeight * factor;
      const ctx = canvas.getContext("2d")!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (!blob) { toast.error("Gagal memproses gambar"); setLoading(false); return; }
        const url = URL.createObjectURL(blob);
        setResult(url);
        setLoading(false);
        toast.success(`Gambar diperbesar ${scale}x!`);
      }, "image/png");
    } catch {
      toast.error("Gagal memperbesar gambar");
      setLoading(false);
    }
  };

  const downloadResult = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result;
    a.download = `upscaled-${scale}x.png`;
    a.click();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ZoomIn className="w-8 h-8" />
          Image Upscaler
        </h1>
        <p className="text-muted-foreground mt-1">Perbesar resolusi gambar menggunakan canvas interpolation.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Upscale Image</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image">Pilih Gambar</Label>
            <input
              ref={fileRef}
              id="image"
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
          </div>

          {dims.w > 0 && (
            <p className="text-sm text-muted-foreground">
              Original: {dims.w} × {dims.h} px
            </p>
          )}

          <div className="space-y-2">
            <Label>Scale</Label>
            <Select value={scale} onValueChange={(v) => v && setScale(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih skala" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2x</SelectItem>
                <SelectItem value="3">3x</SelectItem>
                <SelectItem value="4">4x</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={upscale} disabled={!original || loading} className="w-full">
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</> : <><Upload className="w-4 h-4 mr-2" /> Upscale {scale}x</>}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className="mt-6">
          <CardHeader><CardTitle className="text-lg">Hasil Upscale</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Before</Label>
                <div className="mt-1 max-h-[300px] overflow-hidden rounded-lg border">
                  {original && <img src={original} alt="Before" className="w-full h-auto object-contain max-h-[300px]" />}
                </div>
              </div>
              <div>
                <Label>After ({scale}x)</Label>
                <div className="mt-1 max-h-[300px] overflow-hidden rounded-lg border">
                  <img src={result} alt="After" className="w-full h-auto object-contain max-h-[300px]" />
                </div>
              </div>
            </div>
            <Button onClick={downloadResult} className="w-full">
              <Download className="w-4 h-4 mr-2" /> Download PNG
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
