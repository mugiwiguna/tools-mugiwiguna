"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { FileText, Download } from "lucide-react";
import { toast } from "sonner";
import { jsPDF } from "jspdf";

export default function TextToPdfPage() {
  const [text, setText] = useState("");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const convertToPdf = () => {
    if (!text.trim()) {
      toast.error("Masukkan teks dulu!");
      return;
    }

    const doc = new jsPDF();
    const lines = doc.splitTextToSize(text, 180);
    doc.setFontSize(12);
    doc.text(lines, 15, 20);

    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    setPdfUrl(url);
    toast.success("PDF berhasil dibuat!");
  };

  const downloadPdf = () => {
    if (!pdfUrl) return;
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = `text-${Date.now()}.pdf`;
    a.click();
    toast.success("PDF di-download!");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileText className="w-8 h-8" />
          Text to PDF
        </h1>
        <p className="text-muted-foreground mt-1">
          Konversi teks menjadi file PDF secara langsung di browser.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Input Teks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="text-input">Teks</Label>
            <textarea
              id="text-input"
              className="flex min-h-[200px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Tulis atau paste teks di sini..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={convertToPdf} className="flex-1 gap-2">
              <FileText className="w-4 h-4" />
              Convert to PDF
            </Button>
            {pdfUrl && (
              <Button onClick={downloadPdf} variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
            )}
          </div>

          {pdfUrl && (
            <div className="rounded-md border p-4 text-sm text-muted-foreground">
              PDF siap di-download. Klik tombol Download untuk menyimpan.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
