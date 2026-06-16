import { NextRequest, NextResponse } from "next/server";

type ToolType =
  | "caption"
  | "seo-meta"
  | "story"
  | "yt-title"
  | "paraphraser"
  | "hashtag"
  | "blog"
  | "product"
  | "cover-letter"
  | "resume"
  | "sentiment"
  | "summarizer";

const systemPrompts: Record<string, string> = {
  caption:
    "Kamu adalah AI caption generator untuk social media. Buat 3 opsi caption menarik dalam bahasa Indonesia untuk konten berdasarkan keyword/deskripsi yang diberikan. Sertakan hashtag relevan di akhir setiap caption. Format: setiap caption dipisah dengan '---'.",
  "seo-meta":
    "Kamu adalah AI SEO specialist. Berdasarkan konten atau URL yang diberikan, buat 1 title tag (max 60 karakter) dan 1 meta description (max 160 karakter) yang SEO-friendly dalam bahasa Indonesia. Format: TITLE: ... \n META: ...",
  story:
    "Kamu adalah AI story writer. Buat cerita pendek berdasarkan prompt yang diberikan. Sesuaikan genre dan panjang cerita. Gunakan bahasa Indonesia.",
  "yt-title":
    "Kamu adalah AI YouTube title strategist. Berdasarkan keyword/topik yang diberikan, buat 10 judul video YouTube yang menarik dan SEO-friendly dalam bahasa Indonesia. Beri nomor 1-10. Judul maks 70 karakter.",
  paraphraser:
    "Kamu adalah AI paraphrasing tool. Parafrase ulang teks dengan gaya sesuai permintaan (formal/casual/professional) dalam bahasa Indonesia. Berikan 2 versi parafrase.",
  hashtag:
    "Kamu adalah AI hashtag generator. Berdasarkan keyword, generate 15 hashtag relevan. Format: setiap hashtag di baris baru.",
  blog:
    "Kamu adalah AI blog writer profesional. Berdasarkan topik yang diberikan, buat artikel blog lengkap dalam bahasa Indonesia. Format:\n\nTITLE: [judul artikel]\nINTRO: [paragraf pembuka]\nBODY: [3-5 paragraf isi dengan subheading]\nFAQ:\nQ: [pertanyaan]\nA: [jawaban]\n\nCONCLUSION: [kesimpulan]",
  product:
    "Kamu adalah AI copywriter untuk e-commerce. Berdasarkan nama produk, kategori, dan fitur yang diberikan, buat 3 versi deskripsi produk dalam bahasa Indonesia. Setiap versi maks 150 kata. Pisahkan dengan '---VERSI X---'.",
  "cover-letter":
    "Kamu adalah AI career advisor. Buat surat lamaran kerja profesional dalam bahasa Indonesia berdasarkan posisi, perusahaan, pengalaman, dan skill yang diberikan. Format surat formal. Maks 400 kata.",
  resume:
    "Kamu adalah AI HR analyst. Analisis CV/resume yang diberikan dan berikan feedback dalam bahasa Indonesia. Format:\n\nSCORE: [0-100]\nSTRENGTHS:\n- [poin 1]\n- [poin 2]\n\nWEAKNESSES:\n- [poin 1]\n\nSUGGESTIONS:\n- [poin 1]",
  sentiment:
    "Kamu adalah AI sentiment analyzer. Analisis teks yang diberikan dan tentukan sentimennya (Positif/Negatif/Netral). Berikan persentase keyakinan untuk masing-masing. Format:\n\nSENTIMENT: [Positif/Negatif/Netral]\nCONFIDENCE:\nPositif: [0-100]%\nNegatif: [0-100]%\nNetral: [0-100]%\nREASON: [alasan singkat]",
  summarizer:
    "Kamu adalah AI text summarizer. Summarize teks atau konten URL yang diberikan dalam 3-5 poin penting dalam bahasa Indonesia. Format:\n\nSUMMARY:\n- [poin 1]\n- [poin 2]\n\nORIGINAL_WORDS: [angka]\nSUMMARY_WORDS: [angka]",
};

export async function POST(req: NextRequest) {
  try {
    const { type, prompt, options } = await req.json();

    if (!type || !prompt) {
      return NextResponse.json(
        { error: "Type dan prompt wajib diisi" },
        { status: 400 }
      );
    }

    const systemPrompt = systemPrompts[type];
    if (!systemPrompt) {
      return NextResponse.json({ error: "Tipe AI tidak valid" }, { status: 400 });
    }

    let userPrompt = prompt;
    if (options?.tone) userPrompt += `\nGaya: ${options.tone}`;
    if (options?.genre) userPrompt += `\nGenre: ${options.genre}`;
    if (options?.length) userPrompt += `\nPanjang: ${options.length}`;
    if (options?.category) userPrompt += `\nKategori: ${options.category}`;
    if (options?.features) userPrompt += `\nFitur: ${options.features}`;
    if (options?.position) userPrompt += `\nPosisi: ${options.position}`;
    if (options?.company) userPrompt += `\nPerusahaan: ${options.company}`;
    if (options?.skills) userPrompt += `\nSkill: ${options.skills}`;

    const response = await fetch(
      `${process.env.AI_BASE_URL}/chat/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.AI_API_KEY}`,
        },
        body: JSON.stringify({
          model: process.env.AI_MODEL || "databyte-m1",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          max_tokens: 2048,
          temperature: 0.8,
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI API error:", response.status, errText);
      return NextResponse.json(
        { error: "Gagal memproses permintaan AI. Coba lagi nanti." },
        { status: 502 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    return NextResponse.json({ result: content });
  } catch (err: any) {
    console.error("AI route error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
