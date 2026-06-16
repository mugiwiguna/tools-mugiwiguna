"use client";

import { useState, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
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
import { Download, QrCode, Copy, RotateCcw } from "lucide-react";

type QrType = "url" | "text" | "vcard" | "wifi" | "email" | "phone" | "sms";

interface QrForm {
  type: QrType;
  url: string;
  text: string;
  vcardName: string;
  vcardTel: string;
  vcardEmail: string;
  wifiSsid: string;
  wifiPassword: string;
  wifiEncryption: "WPA" | "WEP" | "nopass";
  email: string;
  emailSubject: string;
  emailBody: string;
  phone: string;
  sms: string;
  smsBody: string;
  fgColor: string;
  bgColor: string;
  size: number;
  includeMargin: boolean;
}

const defaultForm: QrForm = {
  type: "url",
  url: "",
  text: "",
  vcardName: "",
  vcardTel: "",
  vcardEmail: "",
  wifiSsid: "",
  wifiPassword: "",
  wifiEncryption: "WPA",
  email: "",
  emailSubject: "",
  emailBody: "",
  phone: "",
  sms: "",
  smsBody: "",
  fgColor: "#000000",
  bgColor: "#ffffff",
  size: 256,
  includeMargin: true,
};

function buildQrValue(form: QrForm): string {
  switch (form.type) {
    case "url":
      return form.url || "https://";
    case "text":
      return form.text || "Hello!";
    case "vcard": {
      const parts = ["BEGIN:VCARD", "VERSION:3.0"];
      if (form.vcardName) parts.push(`FN:${form.vcardName}`);
      if (form.vcardTel) parts.push(`TEL:${form.vcardTel}`);
      if (form.vcardEmail) parts.push(`EMAIL:${form.vcardEmail}`);
      parts.push("END:VCARD");
      return parts.join("\n");
    }
    case "wifi": {
      const enc = form.wifiEncryption === "nopass" ? "" : `T:${form.wifiEncryption};`;
      return `WIFI:S:${form.wifiSsid};${enc}P:${form.wifiPassword};;`;
    }
    case "email":
      return `mailto:${form.email}?subject=${encodeURIComponent(form.emailSubject)}&body=${encodeURIComponent(form.emailBody)}`;
    case "phone":
      return `tel:${form.phone}`;
    case "sms":
      return `sms:${form.sms}?body=${encodeURIComponent(form.smsBody)}`;
    default:
      return "";
  }
}

const typeLabels: Record<QrType, string> = {
  url: "URL / Link",
  text: "Teks",
  vcard: "vCard (Kontak)",
  wifi: "WiFi",
  email: "Email",
  phone: "Telepon",
  sms: "SMS",
};

export default function QrCodePage() {
  const [form, setForm] = useState<QrForm>(defaultForm);
  const [qrValue, setQrValue] = useState("https://mugijates.my.id");

  const update = <K extends keyof QrForm>(key: K, val: QrForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: val }));
  };

  const generate = useCallback(() => {
    const val = buildQrValue(form);
    if (!val || val === "https://" || val === "Hello!") {
      toast.error("Isi data dulu sebelum generate!");
      return;
    }
    setQrValue(val);
    toast.success("QR code berhasil dibuat!");
  }, [form]);

  const reset = () => {
    setForm(defaultForm);
    setQrValue("https://mugijates.my.id");
  };

  const download = (format: "png" | "svg") => {
    const svgEl = document.getElementById("qr-code-svg") as unknown as SVGSVGElement;
    if (!svgEl) return;

    if (format === "svg") {
      const svgData = new XMLSerializer().serializeToString(svgEl);
      const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `qrcode-${Date.now()}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      const rect = svgEl.getBoundingClientRect();
      canvas.width = rect.width * 4;
      canvas.height = rect.height * 4;
      ctx.scale(4, 4);
      const img = new Image();
      const svgData = new XMLSerializer().serializeToString(svgEl);
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);
      img.onload = () => {
        ctx.fillStyle = form.bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        canvas.toBlob((blob) => {
          if (!blob) return;
          const a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = `qrcode-${Date.now()}.png`;
          a.click();
        });
      };
      img.src = url;
    }
    toast.success(`QR code di-download sebagai ${format.toUpperCase()}`);
  };

  const copyToClipboard = async () => {
    const svgEl = document.getElementById("qr-code-svg");
    if (!svgEl) return;
    try {
      const svgData = new XMLSerializer().serializeToString(svgEl);
      const blob = new Blob([svgData], { type: "image/svg+xml" });
      await navigator.clipboard.write([
        new ClipboardItem({ "image/svg+xml": blob }),
      ]);
      toast.success("QR code tersalin!");
    } catch {
      toast.error("Gagal copy. Coba download aja.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <QrCode className="w-8 h-8" />
          QR Code Generator
        </h1>
        <p className="text-muted-foreground mt-1">
          Generate QR code gratis. Pilih tipe, isi data, download.
        </p>
      </div>

      <div className="grid md:grid-cols-5 gap-8">
        {/* Form */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg">Data QR Code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Type */}
            <div className="space-y-1">
              <Label>Tipe QR</Label>
              <Select
                value={form.type}
                onValueChange={(v) => update("type", v as QrType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(typeLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dynamic fields */}
            {form.type === "url" && (
              <div className="space-y-1">
                <Label htmlFor="url">URL / Link</Label>
                <Input
                  id="url"
                  placeholder="https://mugijates.my.id"
                  value={form.url}
                  onChange={(e) => update("url", e.target.value)}
                />
              </div>
            )}

            {form.type === "text" && (
              <div className="space-y-1">
                <Label htmlFor="text">Teks</Label>
                <textarea
                  id="text"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="Tulis teks di sini..."
                  value={form.text}
                  onChange={(e) => update("text", e.target.value)}
                />
              </div>
            )}

            {form.type === "vcard" && (
              <>
                <div className="space-y-1">
                  <Label htmlFor="vname">Nama</Label>
                  <Input id="vname" value={form.vcardName} onChange={(e) => update("vcardName", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="vtel">Telepon</Label>
                  <Input id="vtel" value={form.vcardTel} onChange={(e) => update("vcardTel", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="vemail">Email</Label>
                  <Input id="vemail" type="email" value={form.vcardEmail} onChange={(e) => update("vcardEmail", e.target.value)} />
                </div>
              </>
            )}

            {form.type === "wifi" && (
              <>
                <div className="space-y-1">
                  <Label htmlFor="ssid">Nama WiFi (SSID)</Label>
                  <Input id="ssid" value={form.wifiSsid} onChange={(e) => update("wifiSsid", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="wifipass">Password</Label>
                  <Input id="wifipass" value={form.wifiPassword} onChange={(e) => update("wifiPassword", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Enkripsi</Label>
                  <Select value={form.wifiEncryption} onValueChange={(v) => update("wifiEncryption", v as "WPA" | "WEP" | "nopass")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WPA">WPA/WPA2</SelectItem>
                      <SelectItem value="WEP">WEP</SelectItem>
                      <SelectItem value="nopass">No Password</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {form.type === "email" && (
              <>
                <div className="space-y-1">
                  <Label htmlFor="emailto">Email Tujuan</Label>
                  <Input id="emailto" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="emailsub">Subject</Label>
                  <Input id="emailsub" value={form.emailSubject} onChange={(e) => update("emailSubject", e.target.value)} />
                </div>
              </>
            )}

            {form.type === "phone" && (
              <div className="space-y-1">
                <Label htmlFor="phone">Nomor Telepon</Label>
                <Input id="phone" type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
              </div>
            )}

            {form.type === "sms" && (
              <>
                <div className="space-y-1">
                  <Label htmlFor="smsnum">Nomor Telepon</Label>
                  <Input id="smsnum" type="tel" value={form.sms} onChange={(e) => update("sms", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="smsbody">Pesan</Label>
                  <textarea
                    id="smsbody"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={form.smsBody}
                    onChange={(e) => update("smsBody", e.target.value)}
                  />
                </div>
              </>
            )}

            <Separator />

            {/* Customization */}
            <div className="space-y-1">
              <Label>Ukuran (px)</Label>
              <Select
                value={String(form.size)}
                onValueChange={(v) => update("size", Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[128, 192, 256, 384, 512].map((s) => (
                    <SelectItem key={s} value={String(s)}>
                      {s} × {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4">
              <div className="space-y-1 flex-1">
                <Label htmlFor="fg">Warna QR</Label>
                <input
                  id="fg"
                  type="color"
                  className="w-full h-10 rounded cursor-pointer"
                  value={form.fgColor}
                  onChange={(e) => update("fgColor", e.target.value)}
                />
              </div>
              <div className="space-y-1 flex-1">
                <Label htmlFor="bg">Warna Background</Label>
                <input
                  id="bg"
                  type="color"
                  className="w-full h-10 rounded cursor-pointer"
                  value={form.bgColor}
                  onChange={(e) => update("bgColor", e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={generate} className="flex-1 gap-2">
                <QrCode className="w-4 h-4" />
                Generate QR Code
              </Button>
              <Button variant="ghost" size="icon" onClick={reset}>
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Preview</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div
              className="rounded-xl border p-4 flex items-center justify-center"
              style={{ background: form.bgColor }}
            >
              <QRCodeSVG
                id="qr-code-svg"
                value={qrValue}
                size={form.size}
                fgColor={form.fgColor}
                bgColor={form.bgColor}
                includeMargin={form.includeMargin}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 w-full">
              <Button
                variant="default"
                size="sm"
                className="gap-1"
                onClick={() => download("png")}
              >
                <Download className="w-3.5 h-3.5" />
                PNG
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => download("svg")}
              >
                <Download className="w-3.5 h-3.5" />
                SVG
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 w-full"
              onClick={copyToClipboard}
            >
              <Copy className="w-3.5 h-3.5" />
              Salin QR
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
