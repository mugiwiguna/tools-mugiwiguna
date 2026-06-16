"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Merge, Download, FileText, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PDFDocument } from "pdf-lib";

interface PdfFile {
  id: string;
  file: File;
  name: string;
  pages: number;
}

export default function PdfMergePage() {
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [merging, setMerging] = useState(false);

  const addFiles = async (fileList: FileList | null) => {
    if (!fileList) return;
    const newFiles: PdfFile[] = [];
    for (const file of Array.from(fileList)) {
      if (file.type !== "application/pdf") continue;
      try {
        const buffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(buffer);
        newFiles.push({
          id: crypto.randomUUID(),
          file,
          name: file.name,
          pages: pdf.getPageCount(),
        });
      } catch {
        toast.error(`Gagal membaca ${file.name}`);
      }
    }
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const mergePdfs = async () => {
    if (files.length < 2) {
      toast.error("Tambahkan minimal 2 file PDF!");
      return;
    }

    setMerging(true);
    try {
      const merged = await PDFDocument.create();

      for (const pdfFile of files) {
        const buffer = await pdfFile.file.arrayBuffer();
        const pdf = await PDFDocument.load(buffer);
        const pages = await merged.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((page) => merged.addPage(page));
      }

      const pdfBytes = await merged.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `merged-${Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF berhasil di-merge!");
    } catch (err) {
      console.error(err);
      toast.error("Gagal merge PDF.");
    } finally {
      setMerging(false);
    }
  };

  const totalPages = files.reduce((sum, f) => sum + f.pages, 0);

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Merge className="w-8 h-8" />
          PDF Merge
        </h1>
        <p className="text-muted-foreground mt-1">
          Gabungkan beberapa file PDF menjadi satu. Client-side, tanpa upload ke server.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upload PDF</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="pdf-upload">Pilih File PDF</Label>
            <Input
              id="pdf-upload"
              type="file"
              accept=".pdf"
              multiple
              onChange={(e) => addFiles(e.target.files)}
            />
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center justify-between rounded-lg border px-3 py-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-sm truncate">{f.name}</span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      ({f.pages} halaman)
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={() => removeFile(f.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}

              <div className="text-sm text-muted-foreground text-right">
                Total: {files.length} file, {totalPages} halaman
              </div>
            </div>
          )}

          {files.length >= 2 && (
            <Button
              onClick={mergePdfs}
              disabled={merging}
              className="w-full gap-2"
            >
              {merging ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {merging ? "Merging..." : `Merge ${files.length} PDFs`}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
