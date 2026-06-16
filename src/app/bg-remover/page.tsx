"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Upload, Download, Loader2, ImageIcon, Check } from "lucide-react";
import { toast } from "sonner";

export default function BackgroundRemoverPage() {
  const [original, setOriginal] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (ev) => setOriginal(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const removeBg = async () => {
    if (!original) return;
    setLoading(true);
    try {
      const { removeBackground } = await import("@imgly/background-removal");
      const blob = await removeBackground(original);
      const url = URL.createObjectURL(blob);
      setResult(url);
      toast.success("Background berhasil dihapus!");
    } catch (err: any) {
      toast.error("Gagal menghapus background: " + (err.message || "Error"));
    } finally {
      setLoading(false);
    }
  };

  const downloadResult = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result;
    a.download = fileName.replace(/\.[^.]+$/, "") + "-no-bg.png";
    a.click();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ImageIcon className="w-8 h-8" />
          Background Remover
        </h1>
        <p className="text-muted-foreground mt-1">Hapus latar belakang gambar secara otomatis pakai AI.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Upload Image</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image">Pilih Gambar (JPEG, PNG, WebP)</Label>
            <input
              ref={fileRef}
              id="image"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFile}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
          </div>

          {original && (
            <div className="pt-2">
              <Label>Original Image</Label>
              <div className="mt-1 max-h-[300px] overflow-hidden rounded-lg border">
                <img src={original} alt="Original" className="w-full h-auto object-contain max-h-[300px]" />
              </div>
            </div>
          )}

          <Button onClick={removeBg} disabled={!original || loading} className="w-full">
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</> : <><Upload className="w-4 h-4 mr-2" /> Remove Background</>}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className="mt-6">
          <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Check className="w-5 h-5 text-green-500" /> Hasil</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Before</Label>
                <div className="mt-1 max-h-[300px] overflow-hidden rounded-lg border">
                  {original && <img src={original} alt="Before" className="w-full h-auto object-contain max-h-[300px]" />}
                </div>
              </div>
              <div>
                <Label>After</Label>
                <div className="mt-1 max-h-[300px] overflow-hidden rounded-lg border bg-gray-100 dark:bg-gray-800">
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
