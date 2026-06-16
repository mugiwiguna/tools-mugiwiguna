"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Palette, Copy, Check, Pipette } from "lucide-react";
import { toast } from "sonner";

interface RGB { r: number; g: number; b: number; }
interface HSL { h: number; s: number; l: number; }
interface HSV { h: number; s: number; v: number; }
interface CMYK { c: number; m: number; y: number; k: number; }

function hexToRgb(hex: string): RGB | null {
  const clean = hex.replace("#", "");
  if (!/^[0-9A-Fa-f]{6}$/.test(clean)) return null;
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
}

function rgbToHsl(r: number, g: number, b: number): HSL {
  const rr = r / 255, gg = g / 255, bb = b / 255;
  const max = Math.max(rr, gg, bb), min = Math.min(rr, gg, bb);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rr) h = ((gg - bb) / d + (gg < bb ? 6 : 0)) * 60;
    else if (max === gg) h = ((bb - rr) / d + 2) * 60;
    else h = ((rr - gg) / d + 4) * 60;
  }
  const l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function rgbToHsv(r: number, g: number, b: number): HSV {
  const rr = r / 255, gg = g / 255, bb = b / 255;
  const max = Math.max(rr, gg, bb), min = Math.min(rr, gg, bb);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rr) h = ((gg - bb) / d + (gg < bb ? 6 : 0)) * 60;
    else if (max === gg) h = ((bb - rr) / d + 2) * 60;
    else h = ((rr - gg) / d + 4) * 60;
  }
  const s = max === 0 ? 0 : (d / max) * 100;
  const v = max * 100;
  return { h: Math.round(h), s: Math.round(s), v: Math.round(v) };
}

function rgbToCmyk(r: number, g: number, b: number): CMYK {
  const rr = r / 255, gg = g / 255, bb = b / 255;
  const k = 1 - Math.max(rr, gg, bb);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  return {
    c: Math.round(((1 - rr - k) / (1 - k)) * 100),
    m: Math.round(((1 - gg - k) / (1 - k)) * 100),
    y: Math.round(((1 - bb - k) / (1 - k)) * 100),
    k: Math.round(k * 100),
  };
}

function hslToRgb(h: number, s: number, l: number): RGB {
  const sl = s / 100, ll = l / 100;
  const a = sl * Math.min(ll, 1 - ll);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return ll - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  };
  return {
    r: Math.round(255 * f(0)),
    g: Math.round(255 * f(8)),
    b: Math.round(255 * f(4)),
  };
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

export default function ColorConverterPage() {
  const [hex, setHex] = useState("#6366f1");
  const [rgb, setRgb] = useState<RGB>({ r: 99, g: 102, b: 241 });
  const [hsl, setHsl] = useState<HSL>({ h: 239, s: 84, l: 67 });
  const [hsv, setHsv] = useState<HSV>({ h: 239, s: 59, v: 95 });
  const [cmyk, setCmyk] = useState<CMYK>({ c: 59, m: 58, y: 0, k: 5 });
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Separate input states
  const [rgbR, setRgbR] = useState("99");
  const [rgbG, setRgbG] = useState("102");
  const [rgbB, setRgbB] = useState("241");
  const [hslH, setHslH] = useState("239");
  const [hslS, setHslS] = useState("84");
  const [hslL, setHslL] = useState("67");

  const setAllFromRgb = useCallback((r: number, g: number, b: number) => {
    const rr = clamp(r, 0, 255);
    const gg = clamp(g, 0, 255);
    const bb = clamp(b, 0, 255);
    const newRgb: RGB = { r: rr, g: gg, b: bb };
    setRgb(newRgb);
    setRgbR(String(rr));
    setRgbG(String(gg));
    setRgbB(String(bb));
    setHex(rgbToHex(rr, gg, bb));
    setHsl(rgbToHsl(rr, gg, bb));
    setHsv(rgbToHsv(rr, gg, bb));
    setCmyk(rgbToCmyk(rr, gg, bb));
  }, []);

  const updateFromHex = useCallback((h: string) => {
    const clean = h.startsWith("#") ? h : "#" + h;
    const rgbVal = hexToRgb(clean);
    if (!rgbVal) return;
    setHex(clean);
    setAllFromRgb(rgbVal.r, rgbVal.g, rgbVal.b);
  }, [setAllFromRgb]);

  const updateFromRgb = useCallback(() => {
    const r = parseInt(rgbR) || 0;
    const g = parseInt(rgbG) || 0;
    const b = parseInt(rgbB) || 0;
    setAllFromRgb(r, g, b);
  }, [rgbR, rgbG, rgbB, setAllFromRgb]);

  const updateFromHsl = useCallback(() => {
    const h = parseInt(hslH) || 0;
    const s = parseInt(hslS) || 0;
    const l = parseInt(hslL) || 0;
    const hh = clamp(h, 0, 360);
    const ss = clamp(s, 0, 100);
    const ll = clamp(l, 0, 100);
    setHsl({ h: hh, s: ss, l: ll });
    setHslH(String(hh));
    setHslS(String(ss));
    setHslL(String(ll));
    const { r, g, b } = hslToRgb(hh, ss, ll);
    setAllFromRgb(r, g, b);
  }, [hslH, hslS, hslL, setAllFromRgb]);

  const copyField = async (label: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedField(label);
    toast.success(`Copied ${value}`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const fields = [
    { label: "HEX", value: hex },
    { label: "RGB", value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
    { label: "HSL", value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
    { label: "HSV", value: `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)` },
    { label: "CMYK", value: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)` },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Palette className="w-8 h-8" />
          Color Converter
        </h1>
        <p className="text-muted-foreground mt-1">
          Convert colors between HEX, RGB, HSL, HSV, and CMYK formats.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Convert Color</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Color preview swatch */}
          <div
            className="h-24 rounded-lg border shadow-inner"
            style={{ backgroundColor: hex }}
          />

          {/* HEX Input */}
          <div className="space-y-2">
            <Label htmlFor="hex">HEX</Label>
            <div className="flex gap-2">
              <Input
                id="hex"
                value={hex}
                onChange={(e) => setHex(e.target.value)}
                onBlur={() => updateFromHex(hex)}
                onKeyDown={(e) => e.key === "Enter" && updateFromHex(hex)}
                placeholder="#000000"
                className="font-mono"
              />
              <div className="relative">
                <input
                  type="color"
                  value={hex}
                  onChange={(e) => updateFromHex(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Button variant="outline" size="icon">
                  <Pipette className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Output fields */}
          {fields.map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between p-2 border rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono font-medium w-12 shrink-0">{label}</span>
                <span className="text-sm font-mono">{value}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyField(label, value)}
              >
                {copiedField === label ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          ))}

          <Separator />

          {/* RGB Input */}
          <div className="space-y-2">
            <Label>RGB</Label>
            <div className="grid grid-cols-3 gap-2">
              <Input
                placeholder="R (0-255)"
                value={rgbR}
                onChange={(e) => setRgbR(e.target.value)}
                onBlur={updateFromRgb}
                onKeyDown={(e) => e.key === "Enter" && updateFromRgb()}
              />
              <Input
                placeholder="G (0-255)"
                value={rgbG}
                onChange={(e) => setRgbG(e.target.value)}
                onBlur={updateFromRgb}
                onKeyDown={(e) => e.key === "Enter" && updateFromRgb()}
              />
              <Input
                placeholder="B (0-255)"
                value={rgbB}
                onChange={(e) => setRgbB(e.target.value)}
                onBlur={updateFromRgb}
                onKeyDown={(e) => e.key === "Enter" && updateFromRgb()}
              />
            </div>
          </div>

          {/* HSL Input */}
          <div className="space-y-2">
            <Label>HSL</Label>
            <div className="grid grid-cols-3 gap-2">
              <Input
                placeholder="H (0-360)"
                value={hslH}
                onChange={(e) => setHslH(e.target.value)}
                onBlur={updateFromHsl}
                onKeyDown={(e) => e.key === "Enter" && updateFromHsl()}
              />
              <Input
                placeholder="S (0-100)"
                value={hslS}
                onChange={(e) => setHslS(e.target.value)}
                onBlur={updateFromHsl}
                onKeyDown={(e) => e.key === "Enter" && updateFromHsl()}
              />
              <Input
                placeholder="L (0-100)"
                value={hslL}
                onChange={(e) => setHslL(e.target.value)}
                onBlur={updateFromHsl}
                onKeyDown={(e) => e.key === "Enter" && updateFromHsl()}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
