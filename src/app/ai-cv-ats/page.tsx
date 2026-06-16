"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { FileText, Copy, WandSparkles, Loader2, Download, Plus, Trash2, FileDown } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { toast } from "sonner";

interface Experience {
  company: string;
  position: string;
  start: string;
  end: string;
  description: string;
}

interface Education {
  institution: string;
  degree: string;
  field: string;
  year: string;
}

interface Portfolio {
  name: string;
  url: string;
  description: string;
}

export default function AICvAtsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [summary, setSummary] = useState("");
  const [skills, setSkills] = useState("");
  const [certifications, setCertifications] = useState("");
  const [languages, setLanguages] = useState("");
  const [experiences, setExperiences] = useState<Experience[]>([
    { company: "", position: "", start: "", end: "", description: "" },
  ]);
  const [educations, setEducations] = useState<Education[]>([
    { institution: "", degree: "", field: "", year: "" },
  ]);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([
    { name: "", url: "", description: "" },
  ]);
  const [showSampleDlg, setShowSampleDlg] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cvData, setCvData] = useState<{
    profile: string;
    experiences: { company: string; position: string; start: string; end: string; bullets: string[] }[];
    skillList: string;
  } | null>(null);

  const previewRef = useRef<HTMLDivElement>(null);

  const addExperience = () => setExperiences([...experiences, { company: "", position: "", start: "", end: "", description: "" }]);
  const removeExperience = (i: number) => setExperiences(experiences.filter((_, idx) => idx !== i));
  const updateExp = (i: number, field: keyof Experience, val: string) => {
    const copy = [...experiences];
    copy[i] = { ...copy[i], [field]: val };
    setExperiences(copy);
  };

  const addEducation = () => setEducations([...educations, { institution: "", degree: "", field: "", year: "" }]);
  const removeEducation = (i: number) => setEducations(educations.filter((_, idx) => idx !== i));
  const updateEdu = (i: number, field: keyof Education, val: string) => {
    const copy = [...educations];
    copy[i] = { ...copy[i], [field]: val };
    setEducations(copy);
  };

  const addPortfolio = () => setPortfolios([...portfolios, { name: "", url: "", description: "" }]);
  const removePortfolio = (i: number) => setPortfolios(portfolios.filter((_, idx) => idx !== i));
  const updatePort = (i: number, field: keyof Portfolio, val: string) => {
    const copy = [...portfolios];
    copy[i] = { ...copy[i], [field]: val };
    setPortfolios(copy);
  };

  const loadSample = async () => {
    setLoading(true);
    try {
      const prompt = `Generate data sample random untuk CV dalam bahasa Indonesia. Format JSON PERSIS seperti ini tanpa teks lain:

{
  "name": "[nama random Indonesia]",
  "email": "[email random]",
  "phone": "[no telepon random]",
  "address": "[kota random Indonesia]",
  "linkedin": "linkedin.com/in/[username random]",
  "website": "[username random].dev",
  "summary": "[2-3 kalimat ringkasan profil random]",
  "skills": "[5-8 skill dipisah koma, random]",
  "certifications": "[1-2 sertifikasi random]",
  "languages": "Indonesia (Native), Inggris ([level random])",
  "experiences": [
    {
      "company": "[nama perusahaan random]",
      "position": "[posisi random]",
      "start": "[YYYY-MM]",
      "end": "[YYYY-MM]",
      "description": "[deskripsi 2-3 kalimat tentang tanggung jawab]"
    },
    {
      "company": "[nama perusahaan random]",
      "position": "[posisi random]",
      "start": "[YYYY-MM]",
      "end": "[YYYY-MM]",
      "description": "[deskripsi 2-3 kalimat]"
    }
  ],
  "educations": [
    {
      "institution": "[universitas random]",
      "degree": "[gelar random]",
      "field": "[jurusan random]",
      "year": "[tahun lulus]"
    }
  ],
  "portfolios": [
    {
      "name": "[nama proyek random]",
      "url": "github.com/[username]/[project]",
      "description": "[deskripsi proyek 1-2 kalimat]"
    }
  ]
}`;

      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "blog", prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Extract JSON from response
      const jsonMatch = data.result.match(/\{[\s\S]*\}/);
      const sample = JSON.parse(jsonMatch ? jsonMatch[0] : data.result);

      setName(sample.name || "");
      setEmail(sample.email || "");
      setPhone(sample.phone || "");
      setAddress(sample.address || "");
      setLinkedin(sample.linkedin || "");
      setWebsite(sample.website || "");
      setSummary(sample.summary || "");
      setSkills(sample.skills || "");
      setCertifications(sample.certifications || "");
      setLanguages(sample.languages || "");
      if (sample.experiences) setExperiences(sample.experiences);
      if (sample.educations) setEducations(sample.educations);
      if (sample.portfolios) setPortfolios(sample.portfolios);

      toast.success("Data sample berhasil diisi!");
    } catch (err) {
      console.error("Sample error:", err);
      toast.error("Gagal generate sample. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const generate = async () => {
    const prompt = `Buat CV ATS-friendly profesional dalam bahasa Indonesia.

Biodata:
Nama: ${name}
Email: ${email}
Telepon: ${phone}
Alamat: ${address}
LinkedIn: ${linkedin}
Website: ${website}

Ringkasan Profil: ${summary}

Skills: ${skills}

Sertifikasi: ${certifications}
Bahasa: ${languages}

Pengalaman Kerja:
${experiences.map((e, i) => `${i + 1}. ${e.position} - ${e.company} (${e.start} - ${e.end})
Deskripsi: ${e.description}`).join("\n")}

Pendidikan:
${educations.map((e, i) => `${i + 1}. ${e.degree} ${e.field} - ${e.institution} (${e.year})`).join("\n")}

Proyek/Portofolio:
${portfolios.filter(p => p.name).map((p, i) => `${i + 1}. ${p.name} - ${p.url}
Deskripsi: ${p.description}`).join("\n")}

Tugas kamu:
1. Buat ringkasan profil yang menarik (2-3 kalimat) dari data ringkasan yang diberikan
2. Untuk SETIAP pengalaman kerja, ubah deskripsi yang ada menjadi 3-5 bullet points yang lebih menjual, menggunakan kata kerja aktif, dan menunjukkan pencapaian terukur jika memungkinkan
3. Untuk SETIAP proyek/portofolio yang ada deskripsinya, tulis ulang deskripsi tersebut agar lebih profesional dan menarik, menggunakan kata kerja aktif serta menyebutkan teknologi yang digunakan
4. Optimasi daftar skill untuk ATS

Format output HARUS PERSIS seperti ini (gunakan garis pemisah yang jelas):

===PROFILE===
[ringkasan profil yang di-improve]

===EXPERIENCE===
-- [company] | [position] | [start] - [end]
• [bullet point 1]
• [bullet point 2]
• [bullet point 3]
-- [company] | [position] | [start] - [end]
• [bullet point 1]
...

===SKILLS===
[skills yang dioptimasi]

===EDUCATION===
-- [institution] | [degree] | [field] | [year]

===PORTFOLIO===
-- [name] | [url]
• [description]`;

    setLoading(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "blog", prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Parse structured output
      const text = data.result;
      const profileMatch = text.match(/===PROFILE===\n([\s\S]*?)(?=\n===EXPERIENCE===)/);
      const expMatch = text.match(/===EXPERIENCE===\n([\s\S]*?)(?=\n===SKILLS===)/);
      const skillMatch = text.match(/===SKILLS===\n([\s\S]*?)(?=\n===EDUCATION===|$)/);

      const profile = profileMatch?.[1]?.trim() || summary;
      const skillList = skillMatch?.[1]?.trim() || skills;

      const expSection = expMatch?.[1]?.trim() || "";
      const parsedExps: typeof cvData extends null ? never : { company: string; position: string; start: string; end: string; bullets: string[] }[] = [];

      const expBlocks = expSection.split("-- ").filter(Boolean);
      for (const block of expBlocks) {
        const lines = block.trim().split("\n");
        const header = lines[0];
        const [company, position, start, end] = header.split(" | ").map((s: string) => s?.trim() || "");
        const bullets = lines.slice(1).map((l: string) => l.replace(/^•\s*/, "").trim()).filter(Boolean);
        parsedExps.push({ company, position, start, end, bullets });
      }

      setCvData({ profile, experiences: parsedExps, skillList });
      toast.success("CV ATS berhasil digenerate!");
    } catch (err: any) {
      toast.error(err.message || "Gagal generate CV");
    } finally {
      setLoading(false);
    }
  };

  const [pdfLoading, setPdfLoading] = useState(false);

  const downloadPdf = async () => {
    setPdfLoading(true);
    try {
      const doc = new jsPDF("p", "mm", "a4");
      const pw = doc.internal.pageSize.getWidth();
      const ph = doc.internal.pageSize.getHeight();
      const ml = 20, mr = 20, mt = 25, mb = 20;
      const cw = pw - ml - mr;
      let y = mt;

      const addLine = (text: string, size: number, bold: boolean, align: "left" | "center" = "left") => {
        doc.setFontSize(size);
        doc.setFont("helvetica", bold ? "bold" : "normal");
        const lines = doc.splitTextToSize(text, cw);
        if (y + size * 0.352 * lines.length > ph - mb) {
          doc.addPage();
          y = mt;
        }
        doc.text(lines, align === "center" ? pw / 2 : ml, y, { align });
        y += size * 0.352 * lines.length + 2;
      };

      const addBullets = (bullets: string[], size: number) => {
        doc.setFontSize(size);
        doc.setFont("helvetica", "normal");
        for (const b of bullets) {
          const text = `• ${b}`;
          const lines = doc.splitTextToSize(text, cw - 5);
          if (y + size * 0.352 * lines.length > ph - mb) {
            doc.addPage();
            y = mt;
          }
          doc.text(lines, ml + 3, y);
          y += size * 0.352 * lines.length + 1.5;
        }
      };

      const addSeparator = () => {
        if (y > ph - mb) doc.addPage();
        doc.setDrawColor(200);
        doc.line(ml, y, pw - mr, y);
        y += 4;
      };

      // === HEADER ===
      addLine(name || "Nama Lengkap", 18, true, "center");
      const contact = [email, phone, address, linkedin, website].filter(Boolean).join(" | ");
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100);
      const contactLines = doc.splitTextToSize(contact, cw);
      doc.text(contactLines, pw / 2, y, { align: "center" });
      y += 9 * 0.352 * contactLines.length + 4;
      doc.setTextColor(0);
      addSeparator();

      // === PROFILE ===
      if (cvData?.profile) {
        addLine("RINGKASAN PROFIL", 11, true);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(cvData.profile, cw);
        if (y + 10 * 0.352 * lines.length > ph - mb) { doc.addPage(); y = mt; }
        doc.text(lines, ml, y);
        y += 10 * 0.352 * lines.length + 4;
        addSeparator();
      }

      // === EXPERIENCE ===
      if (cvData?.experiences?.length) {
        addLine("PENGALAMAN KERJA", 11, true);
        for (const exp of cvData.experiences) {
          if (y + 20 > ph - mb) { doc.addPage(); y = mt; }
          addLine(`${exp.position}  —  ${exp.start || ""} ${exp.end ? `— ${exp.end}` : ""}`, 10, true);
          doc.setFontSize(9);
          doc.setFont("helvetica", "italic");
          doc.setTextColor(100);
          doc.text(exp.company, ml, y);
          y += 9 * 0.352 + 2;
          doc.setTextColor(0);
          addBullets(exp.bullets, 9);
          y += 2;
        }
        addSeparator();
      }

      // === SKILLS ===
      if (cvData?.skillList) {
        addLine("SKILLS", 11, true);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const lines = doc.splitTextToSize(cvData.skillList, cw);
        if (y + 10 * 0.352 * lines.length > ph - mb) { doc.addPage(); y = mt; }
        doc.text(lines, ml, y);
        y += 10 * 0.352 * lines.length + 4;
        addSeparator();
      }

      // === EDUCATION ===
      const eduList = educations.filter((e) => e.institution);
      if (eduList.length) {
        addLine("PENDIDIKAN", 11, true);
        for (const edu of eduList) {
          const line = `${edu.degree || ""}${edu.field ? ` — ${edu.field}` : ""}`;
          addLine(line, 10, true);
          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(100);
          doc.text(`${edu.institution}${edu.year ? `  |  ${edu.year}` : ""}`, ml, y);
          y += 9 * 0.352 + 3;
          doc.setTextColor(0);
        }
        addSeparator();
      }

      // === PORTFOLIO ===
      const portList = portfolios.filter((p) => p.name);
      if (portList.length) {
        addLine("PROYEK / PORTOFOLIO", 11, true);
        for (const p of portList) {
          addLine(p.name, 10, true);
          if (p.url) {
            doc.setFontSize(8);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(50, 100, 200);
            doc.text(p.url, ml, y);
            y += 8 * 0.352 + 1;
            doc.setTextColor(0);
          }
          if (p.description) {
            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            const lines = doc.splitTextToSize(p.description, cw);
            if (y + 9 * 0.352 * lines.length > ph - mb) { doc.addPage(); y = mt; }
            doc.text(lines, ml, y);
            y += 9 * 0.352 * lines.length + 3;
          }
        }
      }

      doc.save(`CV_ATS_${name.replace(/\s+/g, "_")}.pdf`);
      toast.success("PDF berhasil di-download!");
    } catch (err) {
      console.error("PDF error:", err);
      toast.error("Gagal generate PDF. Coba lagi.");
    } finally {
      setPdfLoading(false);
    }
  };

  const copyOutput = async () => {
    if (!cvData) return;
    const text = `PROFILE\n${cvData.profile}\n\nEXPERIENCE\n${cvData.experiences.map((e) => `${e.position} - ${e.company} (${e.start}-${e.end})\n${e.bullets.map((b) => `• ${b}`).join("\n")}`).join("\n\n")}\n\nSKILLS\n${cvData.skillList}`;
    await navigator.clipboard.writeText(text);
    toast.success("CV tersalin!");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <FileText className="w-8 h-8" />
              AI CV ATS Generator
            </h1>
            <p className="text-muted-foreground mt-1">
              Isi data diri & pengalaman, AI akan bikin CV ATS-friendly dengan deskripsi yang lebih menjual.
            </p>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={() => setShowSampleDlg(true)} className="gap-2">
              <FileDown className="w-4 h-4" />
              Data Sample
            </Button>
          </div>
        </div>
      </div>

      {showSampleDlg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowSampleDlg(false)}>
          <div className="fixed inset-0 bg-black/50" />
          <div className="relative z-10 max-w-sm w-full rounded-xl border bg-popover p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-base mb-2">Data Sample</h3>
            <p className="text-sm text-muted-foreground mb-4">Fitur ini akan mereplace isi form dengan data sample random yang digenerate AI. Lanjutkan?</p>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setShowSampleDlg(false)}>Batal</Button>
              <Button size="sm" onClick={() => { loadSample(); setShowSampleDlg(false); }}>Ya, Isi Sample</Button>
            </div>
          </div>
        </div>
      )}

      {/* FORM */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Data Diri</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Nama Lengkap</Label>
              <Input placeholder="Mugi Wiguna" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input type="email" placeholder="mugi@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Telepon</Label>
              <Input placeholder="0812xxxx" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Alamat</Label>
              <Input placeholder="Jakarta, Indonesia" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>LinkedIn</Label>
              <Input placeholder="linkedin.com/in/..." value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Website / Portofolio</Label>
              <Input placeholder="mugijates.my.id" value={website} onChange={(e) => setWebsite(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Ringkasan Profil</Label>
            <Textarea placeholder="Tulis ringkasan singkat tentang diri kamu..." value={summary} onChange={(e) => setSummary(e.target.value)} className="min-h-[80px]" />
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Skills & Sertifikasi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>Skills (pisahkan dengan koma)</Label>
            <Input placeholder="React, Node.js, TypeScript, Python, PostgreSQL" value={skills} onChange={(e) => setSkills(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Sertifikasi</Label>
            <Input placeholder="AWS Certified, Google Analytics, dll" value={certifications} onChange={(e) => setCertifications(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Bahasa</Label>
            <Input placeholder="Indonesia (Native), Inggris (Fluent)" value={languages} onChange={(e) => setLanguages(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Pengalaman Kerja</CardTitle>
          <Button variant="outline" size="sm" onClick={addExperience} className="gap-1">
            <Plus className="w-3.5 h-3.5" /> Tambah
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {experiences.map((exp, i) => (
            <div key={i} className="p-4 border rounded-lg relative">
              <div className="absolute top-2 right-2 flex gap-1">
                {experiences.length > 1 && (
                  <Button variant="ghost" size="icon-xs" onClick={() => removeExperience(i)}>
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Perusahaan</Label>
                  <Input value={exp.company} onChange={(e) => updateExp(i, "company", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Posisi</Label>
                  <Input value={exp.position} onChange={(e) => updateExp(i, "position", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Mulai</Label>
                  <Input type="month" value={exp.start} onChange={(e) => updateExp(i, "start", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Selesai</Label>
                  <Input type="month" value={exp.end} onChange={(e) => updateExp(i, "end", e.target.value)} />
                </div>
              </div>
              <div className="space-y-1 mt-3">
                <Label>Deskripsi Pekerjaan</Label>
                <Textarea
                  placeholder="Jelaskan tanggung jawab & pencapaian kamu di sini..."
                  value={exp.description}
                  onChange={(e) => updateExp(i, "description", e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Pendidikan</CardTitle>
          <Button variant="outline" size="sm" onClick={addEducation} className="gap-1">
            <Plus className="w-3.5 h-3.5" /> Tambah
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {educations.map((edu, i) => (
            <div key={i} className="p-4 border rounded-lg relative">
              <div className="absolute top-2 right-2 flex gap-1">
                {educations.length > 1 && (
                  <Button variant="ghost" size="icon-xs" onClick={() => removeEducation(i)}>
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Institusi</Label>
                  <Input value={edu.institution} onChange={(e) => updateEdu(i, "institution", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Gelar</Label>
                  <Input value={edu.degree} onChange={(e) => updateEdu(i, "degree", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Jurusan</Label>
                  <Input value={edu.field} onChange={(e) => updateEdu(i, "field", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Tahun Lulus</Label>
                  <Input value={edu.year} onChange={(e) => updateEdu(i, "year", e.target.value)} />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Proyek / Portofolio</CardTitle>
          <Button variant="outline" size="sm" onClick={addPortfolio} className="gap-1">
            <Plus className="w-3.5 h-3.5" /> Tambah
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {portfolios.map((port, i) => (
            <div key={i} className="p-4 border rounded-lg relative">
              <div className="absolute top-2 right-2 flex gap-1">
                {portfolios.length > 1 && (
                  <Button variant="ghost" size="icon-xs" onClick={() => removePortfolio(i)}>
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Nama Proyek</Label>
                  <Input value={port.name} onChange={(e) => updatePort(i, "name", e.target.value)} placeholder="Website E-commerce" />
                </div>
                <div className="space-y-1">
                  <Label>URL / Link</Label>
                  <Input value={port.url} onChange={(e) => updatePort(i, "url", e.target.value)} placeholder="github.com/mugi/project" />
                </div>
              </div>
              <div className="space-y-1 mt-3">
                <Label>Deskripsi</Label>
                <Textarea
                  value={port.description}
                  onChange={(e) => updatePort(i, "description", e.target.value)}
                  placeholder="Jelaskan proyek, teknologi yang digunakan, dan pencapaian..."
                  className="min-h-[60px]"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="mt-6 flex gap-3">
        <Button onClick={generate} disabled={!name || loading} className="flex-1 gap-2 text-base py-6">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <WandSparkles className="w-5 h-5" />}
          {loading ? "AI Sedang Menulis CV..." : "Generate CV ATS"}
        </Button>

      </div>

      {/* RESULT */}
      {cvData && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Preview CV</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyOutput} className="gap-1">
                <Copy className="w-3.5 h-3.5" /> Salin
              </Button>
              <Button onClick={downloadPdf} disabled={pdfLoading} className="gap-1">
                {pdfLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                {pdfLoading ? "Memproses..." : "Download PDF"}
              </Button>
            </div>
          </div>

          {/* HTML Preview — seperti tampilan PDF */}
          <div
            ref={previewRef}
            className="bg-white text-black shadow-xl mx-auto w-full"
            style={{
              maxWidth: "210mm",
              minHeight: "297mm",
              padding: "16px",
              fontFamily: "'Calibri', 'Arial', 'Helvetica', sans-serif",
              fontSize: "clamp(8pt, 1.2vw, 10pt)",
              lineHeight: "1.5",
              color: "#1a1a1a",
              overflowX: "hidden",
              overflowWrap: "break-word",
              wordBreak: "break-word",
            }}
          >
            {/* Header */}
            <div className="text-center mb-6" style={{ borderBottom: "2px solid #222", paddingBottom: "12px" }}>
              <h1 style={{ fontSize: "18pt", fontWeight: 700, letterSpacing: "0.5px", margin: 0, textTransform: "uppercase" }}>
                {name || "Nama Lengkap"}
              </h1>
              <p style={{ fontSize: "9pt", color: "#555", marginTop: "4px", marginBottom: 0 }}>
                {[email, phone, address, linkedin, website].filter(Boolean).join(" | ")}
              </p>
            </div>

            {/* Profile */}
            <div className="mb-5">
              <h2 style={{ fontSize: "11pt", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", borderBottom: "1px solid #ccc", paddingBottom: "4px" }}>
                Ringkasan Profil
              </h2>
              <p style={{ marginTop: "6px", marginBottom: 0, textAlign: "justify" }}>{cvData.profile}</p>
            </div>

            {/* Experience */}
            <div className="mb-5">
              <h2 style={{ fontSize: "11pt", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", borderBottom: "1px solid #ccc", paddingBottom: "4px" }}>
                Pengalaman Kerja
              </h2>
              {cvData.experiences.map((exp, i) => (
                <div key={i} style={{ marginTop: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <strong style={{ fontSize: "10.5pt" }}>{exp.position}</strong>
                    <span style={{ fontSize: "9pt", color: "#555", whiteSpace: "nowrap" }}>
                      {exp.start} — {exp.end || "Present"}
                    </span>
                  </div>
                  <p style={{ fontSize: "9.5pt", color: "#555", margin: "2px 0 4px 0", fontStyle: "italic" }}>
                    {exp.company}
                  </p>
                  <ul style={{ margin: 0, paddingLeft: "16px", listStyle: "disc" }}>
                    {exp.bullets.map((b, j) => (
                      <li key={j} style={{ marginBottom: "2px", textAlign: "justify" }}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Skills */}
            <div className="mb-5">
              <h2 style={{ fontSize: "11pt", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", borderBottom: "1px solid #ccc", paddingBottom: "4px" }}>
                Skills
              </h2>
              <p style={{ marginTop: "6px", marginBottom: 0 }}>{cvData.skillList}</p>
            </div>

            {/* Education */}
            <div className="mb-5">
              <h2 style={{ fontSize: "11pt", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", borderBottom: "1px solid #ccc", paddingBottom: "4px" }}>
                Pendidikan
              </h2>
              {educations.filter((e) => e.institution).map((edu, i) => (
                <div key={i} style={{ marginTop: "6px", display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <strong>{edu.degree}</strong> {edu.field && `— ${edu.field}`}
                    <p style={{ margin: 0, fontSize: "9.5pt", color: "#555" }}>{edu.institution}</p>
                  </div>
                  <span style={{ fontSize: "9pt", color: "#555", whiteSpace: "nowrap" }}>{edu.year}</span>
                </div>
              ))}
            </div>

            {/* Portfolio */}
            {portfolios.filter((p) => p.name).length > 0 && (
              <div>
                <h2 style={{ fontSize: "11pt", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", borderBottom: "1px solid #ccc", paddingBottom: "4px" }}>
                  Proyek / Portofolio
                </h2>
                {portfolios.filter((p) => p.name).map((port, i) => (
                  <div key={i} style={{ marginTop: "6px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <strong style={{ fontSize: "10pt" }}>{port.name}</strong>
                      {port.url && <span style={{ fontSize: "9pt", color: "#555" }}>{port.url}</span>}
                    </div>
                    {port.description && <p style={{ margin: "2px 0 0 0", fontSize: "9.5pt", color: "#444", textAlign: "justify" }}>{port.description}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
