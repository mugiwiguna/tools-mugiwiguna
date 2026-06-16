"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Briefcase, Copy, Check, WandSparkles, Loader2, Download } from "lucide-react";
import { toast } from "sonner";

export default function AICoverLetterPage() {
  const [position, setPosition] = useState("");
  const [company, setCompany] = useState("");
  const [experience, setExperience] = useState("");
  const [skills, setSkills] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!position.trim() || !company.trim()) return;
    setLoading(true);
    try {
      const prompt = `Posisi: ${position}\nPerusahaan: ${company}\nPengalaman: ${experience}\nSkill: ${skills}`;
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "cover-letter", prompt, options: { position, company, skills } }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCoverLetter(data.result);
    } catch (err: any) {
      toast.error(err.message || "Gagal generate cover letter");
    } finally {
      setLoading(false);
    }
  };

  const copyText = async () => {
    await navigator.clipboard.writeText(coverLetter);
    toast.success("Tersalin!");
  };

  const downloadTxt = () => {
    if (!coverLetter) return;
    const blob = new Blob([coverLetter], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cover-letter-${position.replace(/\s+/g, "-").toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Download file .txt!");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Briefcase className="w-8 h-8" />
          AI Cover Letter
        </h1>
        <p className="text-muted-foreground mt-1">Buat surat lamaran kerja profesional dengan AI.</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Job Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position">Posisi</Label>
              <Input id="position" placeholder="Frontend Developer" value={position} onChange={(e) => setPosition(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Perusahaan</Label>
              <Input id="company" placeholder="PT Teknologi Maju" value={company} onChange={(e) => setCompany(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="experience">Pengalaman</Label>
            <Textarea id="experience" placeholder="3 tahun pengalaman React, pernah mengerjakan proyek e-commerce skala besar..." value={experience} onChange={(e) => setExperience(e.target.value)} className="min-h-[100px]" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="skills">Skill</Label>
            <Textarea id="skills" placeholder="React, TypeScript, Tailwind CSS, Node.js" value={skills} onChange={(e) => setSkills(e.target.value)} className="min-h-[60px]" />
          </div>
          <Button onClick={generate} disabled={!position.trim() || !company.trim() || loading} className="w-full">
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</> : <><WandSparkles className="w-4 h-4 mr-2" /> Generate Cover Letter</>}
          </Button>
        </CardContent>
      </Card>

      {coverLetter && (
        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Cover Letter</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyText}>
                <Copy className="w-4 h-4 mr-1" /> Copy
              </Button>
              <Button variant="outline" size="sm" onClick={downloadTxt}>
                <Download className="w-4 h-4 mr-1" /> .txt
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap text-sm">
              {coverLetter}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
