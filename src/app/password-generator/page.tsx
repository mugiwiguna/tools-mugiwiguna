"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, Copy, RefreshCw, Check } from "lucide-react";
import { toast } from "sonner";

interface Options {
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
}

function generatePassword(length: number, opts: Options): string {
  const chars = [
    ...(opts.uppercase ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ" : ""),
    ...(opts.lowercase ? "abcdefghijklmnopqrstuvwxyz" : ""),
    ...(opts.numbers ? "0123456789" : ""),
    ...(opts.symbols ? "!@#$%^&*()_+-=[]{}|;:,.<>?" : ""),
  ];
  if (chars.length === 0) return "";
  let pw = "";
  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  for (let i = 0; i < length; i++) {
    pw += chars[arr[i] % chars.length];
  }
  return pw;
}

function getStrength(pw: string): { label: string; color: string; percent: number } {
  if (pw.length === 0) return { label: "-", color: "bg-muted", percent: 0 };
  let score = 0;
  if (pw.length >= 12) score++;
  if (pw.length >= 16) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;

  if (score <= 2) return { label: "Lemah", color: "bg-red-500", percent: 25 };
  if (score <= 3) return { label: "Sedang", color: "bg-yellow-500", percent: 50 };
  if (score <= 4) return { label: "Kuat", color: "bg-blue-500", percent: 75 };
  return { label: "Sangat Kuat", color: "bg-green-500", percent: 100 };
}

export default function PasswordGeneratorPage() {
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState<Options>({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: false,
  });
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = useCallback(() => {
    const pw = generatePassword(length, options);
    setPassword(pw);
    setCopied(false);
  }, [length, options]);

  useEffect(() => {
    generate();
  }, [generate]);

  const toggleOption = (key: keyof Options) => {
    const next = { ...options, [key]: !options[key] };
    // Ensure at least one option is selected
    if (!Object.values(next).some(Boolean)) return;
    setOptions(next);
  };

  const copyPassword = async () => {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    setCopied(true);
    toast.success("Password tersalin!");
    setTimeout(() => setCopied(false), 2000);
  };

  const strength = getStrength(password);

  return (
    <div className="container mx-auto px-4 py-8 max-w-xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <KeyRound className="w-8 h-8" />
          Password Generator
        </h1>
        <p className="text-muted-foreground mt-1">
          Generate password acak yang aman langsung di browser.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pengaturan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Generated password display */}
          <div className="space-y-2">
            <Label>Password</Label>
            <div className="flex gap-2">
              <Input
                value={password}
                readOnly
                className="font-mono text-base"
              />
              <Button variant="outline" size="icon" onClick={copyPassword}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
              <Button variant="outline" size="icon" onClick={generate}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Strength indicator */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Kekuatan:</span>
              <span className="font-medium">{strength.label}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${strength.color}`}
                style={{ width: `${strength.percent}%` }}
              />
            </div>
          </div>

          {/* Length slider */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Panjang</Label>
              <span className="text-sm font-mono">{length}</span>
            </div>
            <input
              type="range"
              min={8}
              max={64}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>8</span>
              <span>64</span>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <Label>Karakter</Label>
            {([
              { key: "uppercase", label: "Huruf Besar (A-Z)" },
              { key: "lowercase", label: "Huruf Kecil (a-z)" },
              { key: "numbers", label: "Angka (0-9)" },
              { key: "symbols", label: "Simbol (!@#$...)" },
            ] as const).map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={options[key]}
                  onChange={() => toggleOption(key)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm">{label}</span>
              </label>
            ))}
          </div>

          <Button onClick={generate} className="w-full gap-2">
            <RefreshCw className="w-4 h-4" />
            Generate Password
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
