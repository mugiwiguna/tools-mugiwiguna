"use client";

import { useState, useMemo, useCallback } from "react";
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
import { Ruler, ArrowRight, RotateCcw, Zap } from "lucide-react";
import { toast } from "sonner";

interface Unit {
  id: string;
  label: string;
  toBase: (v: number) => number;
  fromBase: (v: number) => number;
}

interface Category {
  id: string;
  label: string;
  icon: string;
  units: Unit[];
}

const categories: Category[] = [
  {
    id: "length", label: "Length", icon: "📏",
    units: [
      { id: "mm", label: "Millimeter (mm)", toBase: v => v / 1000, fromBase: v => v * 1000 },
      { id: "cm", label: "Centimeter (cm)", toBase: v => v / 100, fromBase: v => v * 100 },
      { id: "m", label: "Meter (m)", toBase: v => v, fromBase: v => v },
      { id: "km", label: "Kilometer (km)", toBase: v => v * 1000, fromBase: v => v / 1000 },
      { id: "in", label: "Inch (in)", toBase: v => v * 0.0254, fromBase: v => v / 0.0254 },
      { id: "ft", label: "Foot (ft)", toBase: v => v * 0.3048, fromBase: v => v / 0.3048 },
      { id: "yd", label: "Yard (yd)", toBase: v => v * 0.9144, fromBase: v => v / 0.9144 },
      { id: "mi", label: "Mile (mi)", toBase: v => v * 1609.344, fromBase: v => v / 1609.344 },
    ],
  },
  {
    id: "weight", label: "Weight", icon: "⚖️",
    units: [
      { id: "mg", label: "Milligram (mg)", toBase: v => v / 1_000_000, fromBase: v => v * 1_000_000 },
      { id: "g", label: "Gram (g)", toBase: v => v / 1000, fromBase: v => v * 1000 },
      { id: "kg", label: "Kilogram (kg)", toBase: v => v, fromBase: v => v },
      { id: "t", label: "Ton (t)", toBase: v => v * 1000, fromBase: v => v / 1000 },
      { id: "oz", label: "Ounce (oz)", toBase: v => v * 0.0283495, fromBase: v => v / 0.0283495 },
      { id: "lb", label: "Pound (lb)", toBase: v => v * 0.453592, fromBase: v => v / 0.453592 },
    ],
  },
  {
    id: "temperature", label: "Temperature", icon: "🌡️",
    units: [
      { id: "c", label: "Celsius (°C)", toBase: v => v, fromBase: v => v },
      { id: "f", label: "Fahrenheit (°F)", toBase: v => (v - 32) * 5 / 9, fromBase: v => v * 9 / 5 + 32 },
      { id: "k", label: "Kelvin (K)", toBase: v => v - 273.15, fromBase: v => v + 273.15 },
    ],
  },
  {
    id: "volume", label: "Volume", icon: "🧪",
    units: [
      { id: "ml", label: "Milliliter (mL)", toBase: v => v / 1000, fromBase: v => v * 1000 },
      { id: "l", label: "Liter (L)", toBase: v => v, fromBase: v => v },
      { id: "gal", label: "Gallon (gal)", toBase: v => v * 3.78541, fromBase: v => v / 3.78541 },
      { id: "qt", label: "Quart (qt)", toBase: v => v * 0.946353, fromBase: v => v / 0.946353 },
      { id: "cups", label: "Cup", toBase: v => v * 0.236588, fromBase: v => v / 0.236588 },
      { id: "floz", label: "Fluid Ounce (fl oz)", toBase: v => v * 0.0295735, fromBase: v => v / 0.0295735 },
    ],
  },
  {
    id: "area", label: "Area", icon: "📐",
    units: [
      { id: "mm2", label: "mm²", toBase: v => v / 1_000_000, fromBase: v => v * 1_000_000 },
      { id: "cm2", label: "cm²", toBase: v => v / 10_000, fromBase: v => v * 10_000 },
      { id: "m2", label: "m²", toBase: v => v, fromBase: v => v },
      { id: "km2", label: "km²", toBase: v => v * 1_000_000, fromBase: v => v / 1_000_000 },
      { id: "ha", label: "Hectare (ha)", toBase: v => v * 10_000, fromBase: v => v / 10_000 },
      { id: "ac", label: "Acre (ac)", toBase: v => v * 4046.86, fromBase: v => v / 4046.86 },
      { id: "sqft", label: "ft²", toBase: v => v * 0.092903, fromBase: v => v / 0.092903 },
    ],
  },
  {
    id: "speed", label: "Speed", icon: "🏎️",
    units: [
      { id: "ms", label: "m/s", toBase: v => v, fromBase: v => v },
      { id: "kmh", label: "km/h", toBase: v => v / 3.6, fromBase: v => v * 3.6 },
      { id: "mph", label: "mph", toBase: v => v * 0.44704, fromBase: v => v / 0.44704 },
      { id: "knot", label: "Knot", toBase: v => v * 0.514444, fromBase: v => v / 0.514444 },
    ],
  },
  {
    id: "time", label: "Time", icon: "⏱️",
    units: [
      { id: "ms", label: "Millisecond (ms)", toBase: v => v / 1000, fromBase: v => v * 1000 },
      { id: "s", label: "Second (s)", toBase: v => v, fromBase: v => v },
      { id: "min", label: "Minute (min)", toBase: v => v * 60, fromBase: v => v / 60 },
      { id: "hr", label: "Hour (hr)", toBase: v => v * 3600, fromBase: v => v / 3600 },
      { id: "day", label: "Day (d)", toBase: v => v * 86400, fromBase: v => v / 86400 },
      { id: "wk", label: "Week (wk)", toBase: v => v * 604800, fromBase: v => v / 604800 },
      { id: "mo", label: "Month (mo)", toBase: v => v * 2592000, fromBase: v => v / 2592000 },
      { id: "yr", label: "Year (yr)", toBase: v => v * 31536000, fromBase: v => v / 31536000 },
    ],
  },
];

const presets = [
  { label: "cm → in", from: "cm", to: "in", cat: "length" },
  { label: "m → ft", from: "m", to: "ft", cat: "length" },
  { label: "kg → lb", from: "kg", to: "lb", cat: "weight" },
  { label: "°C → °F", from: "c", to: "f", cat: "temperature" },
  { label: "km → mi", from: "km", to: "mi", cat: "length" },
  { label: "L → gal", from: "l", to: "gal", cat: "volume" },
  { label: "km/h → mph", from: "kmh", to: "mph", cat: "speed" },
];

export default function UnitConverterPage() {
  const [category, setCategory] = useState("length");
  const [fromUnit, setFromUnit] = useState("cm");
  const [toUnit, setToUnit] = useState("in");
  const [fromValue, setFromValue] = useState("1");
  const [toValue, setToValue] = useState("");

  const currentCategory = useMemo(
    () => categories.find((c) => c.id === category) || categories[0],
    [category]
  );

  const convert = useCallback(
    (value: string, fromId: string, toId: string, catId: string) => {
      const cat = categories.find((c) => c.id === catId);
      if (!cat) return "";
      const from = cat.units.find((u) => u.id === fromId);
      const to = cat.units.find((u) => u.id === toId);
      if (!from || !to) return "";
      const num = parseFloat(value);
      if (isNaN(num)) return "";

      if (catId === "temperature") {
        // Convert to Celsius first, then to target
        const celsius = from.toBase(num);
        return to.fromBase(celsius).toFixed(2);
      }
      const base = from.toBase(num);
      return to.fromBase(base).toFixed(6);
    },
    []
  );

  const handleFromChange = (val: string) => {
    setFromValue(val);
    const result = convert(val, fromUnit, toUnit, category);
    setToValue(result);
  };

  const handleFromUnitChange = (unit: string) => {
    setFromUnit(unit);
    if (fromValue) {
      const result = convert(fromValue, unit, toUnit, category);
      setToValue(result);
    }
  };

  const handleToUnitChange = (unit: string) => {
    setToUnit(unit);
    if (fromValue) {
      const result = convert(fromValue, fromUnit, unit, category);
      setToValue(result);
    }
  };

  const handleCategoryChange = (catId: string) => {
    setCategory(catId);
    const cat = categories.find((c) => c.id === catId);
    if (cat) {
      const newFrom = cat.units[0].id;
      const newTo = cat.units.length > 1 ? cat.units[1].id : cat.units[0].id;
      setFromUnit(newFrom);
      setToUnit(newTo);
      if (fromValue) {
        const result = convert(fromValue, newFrom, newTo, catId);
        setToValue(result);
      }
    }
  };

  const applyPreset = (preset: typeof presets[0]) => {
    setCategory(preset.cat);
    // Need to wait for state update, but we can set directly
    const cat = categories.find((c) => c.id === preset.cat);
    if (!cat) return;
    setFromUnit(preset.from);
    setToUnit(preset.to);
    setFromValue("1");
    const result = convert("1", preset.from, preset.to, preset.cat);
    setToValue(result);
  };

  const swapUnits = () => {
    const tempUnit = fromUnit;
    setFromUnit(toUnit);
    setToUnit(tempUnit);
    if (fromValue) {
      const result = convert(fromValue, toUnit, tempUnit, category);
      setToValue(result);
    }
  };

  const roundVal = (v: string) => {
    const n = parseFloat(v);
    if (isNaN(n)) return v;
    return n.toFixed(n > 1000 ? 0 : n > 1 ? 2 : 4);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Ruler className="w-8 h-8" />
          Unit Converter
        </h1>
        <p className="text-muted-foreground mt-1">
          Convert between different units of measurement.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Converter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => v && handleCategoryChange(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.icon} {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* From */}
          <div className="space-y-2">
            <Label>From</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={fromValue}
                onChange={(e) => handleFromChange(e.target.value)}
                className="flex-1"
                placeholder="Value"
              />
              <Select value={fromUnit} onValueChange={(v) => v && handleFromUnitChange(v)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currentCategory.units.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Swap */}
          <div className="flex justify-center">
            <Button variant="ghost" size="icon" onClick={swapUnits}>
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>

          {/* To */}
          <div className="space-y-2">
            <Label>To</Label>
            <div className="flex gap-2">
              <Input
                value={toValue ? roundVal(toValue) : ""}
                readOnly
                className="flex-1 font-mono"
                placeholder="Result"
              />
              <Select value={toUnit} onValueChange={(v) => v && handleToUnitChange(v)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currentCategory.units.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Presets */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Zap className="w-4 h-4" />
              Common Presets
            </div>
            <div className="flex flex-wrap gap-2">
              {presets.map((p) => (
                <Button
                  key={p.label}
                  variant="outline"
                  size="sm"
                  onClick={() => applyPreset(p)}
                  className={category === p.cat && fromUnit === p.from && toUnit === p.to ? "bg-primary/10" : ""}
                >
                  {p.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
