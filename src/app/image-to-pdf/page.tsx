"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageIcon, Download, Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { jsPDF } from "jspdf";

interface ImageItem {
  id: string;
  file: File;
  url: string;
}

export default function ImageToPdfPage() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [converting, setConverting] = useState(false);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const addImages = (files: FileList | null) => {
    if (!files) return;
    const newImages: ImageItem[] = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .map((file) => ({
        id: crypto.randomUUID(),
        file,
        url: URL.createObjectURL(file),
      }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.url);
      return prev.filter((i) => i.id !== id);
    });
  };

  const handleDragStart = (idx: number) => {
    dragItem.current = idx;
  };

  const handleDragEnter = (idx: number) => {
    dragOverItem.current = idx;
  };

  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const items = [...images];
    const [dragged] = items.splice(dragItem.current, 1);
    items.splice(dragOverItem.current, 0, dragged);
    setImages(items);
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const convertToPdf = async () => {
    if (images.length === 0) {
      toast.error("Tambahkan gambar dulu!");
      return;
    }

    setConverting(true);
    try {
      const doc = new jsPDF();
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const imgData = await readFileAsDataURL(img.file);
        const dims = await getImageDimensions(imgData);

        const pageW = 210; // A4 width in mm
        const pageH = 297; // A4 height in mm
        const margin = 10;
        const maxW = pageW - margin * 2;
        const maxH = pageH - margin * 2;

        const ratio = Math.min(maxW / dims.width, maxH / dims.height, 1);
        const w = dims.width * ratio;
        const h = dims.height * ratio;
        const x = (pageW - w) / 2;
        const y = (pageH - h) / 2;

        if (i > 0) doc.addPage();
        doc.addImage(imgData, "JPEG", x, y, w, h);
      }

      const blob = doc.output("blob");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `images-${Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF berhasil dibuat!");
    } catch (err) {
      console.error(err);
      toast.error("Gagal membuat PDF.");
    } finally {
      setConverting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ImageIcon className="w-8 h-8" />
          Image to PDF
        </h1>
        <p className="text-muted-foreground mt-1">
          Konversi beberapa gambar menjadi satu PDF. Drag untuk mengurutkan.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upload Gambar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="image-upload">Pilih Gambar</Label>
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => addImages(e.target.files)}
            />
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {images.map((img, idx) => (
                <div
                  key={img.id}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragEnter={() => handleDragEnter(idx)}
                  onDragEnd={handleDragEnd}
                  className="relative group rounded-lg border overflow-hidden cursor-grab active:cursor-grabbing"
                >
                  <div className="absolute top-1 left-1 z-10 bg-background/80 rounded p-0.5">
                    <GripVertical className="w-3 h-3 text-muted-foreground" />
                  </div>
                  <button
                    onClick={() => removeImage(img.id)}
                    className="absolute top-1 right-1 z-10 bg-background/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </button>
                  <img
                    src={img.url}
                    alt={`Image ${idx + 1}`}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="text-xs text-center py-1 text-muted-foreground truncate px-1">
                    {img.file.name}
                  </div>
                </div>
              ))}
            </div>
          )}

          {images.length > 0 && (
            <Button
              onClick={convertToPdf}
              disabled={converting}
              className="w-full gap-2"
            >
              <Download className="w-4 h-4" />
              {converting ? "Mengkonversi..." : `Convert ${images.length} Gambar ke PDF`}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function getImageDimensions(
  src: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.src = src;
  });
}
