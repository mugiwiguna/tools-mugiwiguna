"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ShoppingBag, Copy, Check, WandSparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AIProductPage() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [features, setFeatures] = useState("");
  const [descriptions, setDescriptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "product",
          prompt: name,
          options: { category, features },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const parts = data.result.split(/---VERSI \d+---/).filter(Boolean).map((s: string) => s.trim());
      setDescriptions(parts.length > 0 ? parts : [data.result]);
    } catch (err: any) {
      toast.error(err.message || "Gagal generate deskripsi");
    } finally {
      setLoading(false);
    }
  };

  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success("Tersalin!");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ShoppingBag className="w-8 h-8" />
          AI Product Description
        </h1>
        <p className="text-muted-foreground mt-1">Generate deskripsi produk untuk e-commerce.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Product Info</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Produk</Label>
            <Input id="name" placeholder="Sepatu Running Pro Max" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Kategori</Label>
            <Select value={category} onValueChange={(v) => v && setCategory(v)}>
              <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="fashion">Fashion</SelectItem>
                <SelectItem value="elektronik">Elektronik</SelectItem>
                <SelectItem value="makanan">Makanan & Minuman</SelectItem>
                <SelectItem value="kesehatan">Kesehatan</SelectItem>
                <SelectItem value="otomotif">Otomotif</SelectItem>
                <SelectItem value="rumah">Rumah Tangga</SelectItem>
                <SelectItem value="lainnya">Lainnya</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="features">Fitur Produk (pisahkan dengan koma)</Label>
            <Textarea id="features" placeholder="Ringan, anti air, sol empuk, desain ergonomis" value={features} onChange={(e) => setFeatures(e.target.value)} className="min-h-[80px]" />
          </div>
          <Button onClick={generate} disabled={!name.trim() || loading} className="w-full">
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</> : <><WandSparkles className="w-4 h-4 mr-2" /> Generate Description</>}
          </Button>
        </CardContent>
      </Card>

      {descriptions.length > 0 && (
        <div className="mt-6 space-y-4">
          {descriptions.map((desc, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Opsi {i + 1}</CardTitle>
                <Button variant="outline" size="sm" onClick={() => copyText(desc)}>
                  <Copy className="w-4 h-4 mr-1" /> Copy
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap text-muted-foreground">{desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
