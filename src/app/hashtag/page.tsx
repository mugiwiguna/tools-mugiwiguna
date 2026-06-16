"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Hash, Copy, Check, TrendingUp, Sparkles, Tag } from "lucide-react";
import { toast } from "sonner";

const relatedTerms: Record<string, string[]> = {
  tech: ["technology", "digital", "innovation", "future", "coding", "startup", "AI", "software"],
  travel: ["adventure", "explore", "wanderlust", "journey", "destination", "vacation", "trip", "discover"],
  food: ["delicious", "recipe", "cooking", "yummy", "foodie", "tasty", "homemade", "instafood"],
  fashion: ["style", "outfit", "trendy", "vogue", "dress", "fashionista", "wardrobe", "look"],
  fitness: ["workout", "health", "gym", "fit", "exercise", "training", "wellness", "muscle"],
  default: ["trending", "viral", "instagood", "explore", "love", "photooftheday", "beautiful", "happy"],
};

const categories = [
  { value: "trending", label: "Trending", icon: TrendingUp },
  { value: "niche", label: "Niche", icon: Sparkles },
  { value: "branded", label: "Branded", icon: Tag },
];

function getPopularity(tag: string): number {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = ((hash << 5) - hash) + tag.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 100;
}

export default function HashtagPage() {
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("trending");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const tagsWithPopularity = useMemo(() => {
    return hashtags.map((tag) => ({
      tag,
      popularity: getPopularity(tag),
    }));
  }, [hashtags]);

  const generateHashtags = () => {
    if (!keyword) return;
    const terms = relatedTerms[keyword.toLowerCase()] || relatedTerms.default;
    const combined = [
      keyword,
      ...terms.slice(0, 5),
      `${keyword}Life`,
      `${keyword}Daily`,
      `${keyword}Tips`,
      `${keyword}Community`,
      `Best${keyword.charAt(0).toUpperCase() + keyword.slice(1)}`,
      `Top${keyword.charAt(0).toUpperCase() + keyword.slice(1)}`,
    ];

    if (category === "niche") {
      setHashtags(combined.slice(2, 8));
    } else if (category === "branded") {
      setHashtags(combined.map((t) => `Brand${t.charAt(0).toUpperCase() + t.slice(1)}`));
    } else {
      setHashtags(combined.slice(0, 8));
    }
    setCopied(false);
  };

  const copyAll = async () => {
    if (hashtags.length === 0) return;
    const text = hashtags.map((t) => `#${t}`).join(" ");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("All hashtags copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const getPopularityColor = (pct: number) => {
    if (pct >= 70) return "bg-green-500";
    if (pct >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Hash className="w-8 h-8" />
          Hashtag Generator
        </h1>
        <p className="text-muted-foreground mt-1">
          Generate relevant hashtags to boost your social media reach.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Generate Hashtags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="keyword">Keyword</Label>
            <Input
              id="keyword"
              placeholder="e.g. tech, travel, food"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => v && setCategory(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => {
                  const Icon = c.icon;
                  return (
                    <SelectItem key={c.value} value={c.value}>
                      <span className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {c.label}
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={generateHashtags}
            disabled={!keyword}
            className="w-full gap-2"
          >
            <Hash className="w-4 h-4" />
            Generate Hashtags
          </Button>

          {hashtags.length > 0 && (
            <>
              <Separator />
              <div className="flex items-center justify-between">
                <Label>Generated Hashtags</Label>
                <Button variant="outline" size="sm" onClick={copyAll} className="gap-1">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied" : "Copy All"}
                </Button>
              </div>
              <div className="space-y-2">
                {tagsWithPopularity.map(({ tag, popularity }, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-2 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => {
                      navigator.clipboard.writeText(`#${tag}`);
                      toast.success(`Copied #${tag}`);
                    }}
                  >
                    <span className="text-sm font-medium flex-1">#{tag}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full ${getPopularityColor(popularity)}`}
                          style={{ width: `${popularity}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-8 text-right">
                        {popularity}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
