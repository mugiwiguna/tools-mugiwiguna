"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

const navLinks = [
  { label: "QR Code", href: "/qrcode" },
  { label: "URL Shortener", href: "/shorten" },
  { label: "Text to PDF", href: "/text-to-pdf" },
  { label: "Image Resize", href: "/image-resize" },
  { label: "Image to PDF", href: "/image-to-pdf" },
  { label: "JSON Formatter", href: "/json-formatter" },
  { label: "Password Gen", href: "/password-generator" },
  { label: "Markdown", href: "/markdown" },
  { label: "Palette", href: "/palette" },
  { label: "PDF Merge", href: "/pdf-merge" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Tools
          </span>
          <span className="text-muted-foreground font-normal text-sm hidden sm:inline">
            mugijates.my.id
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {/* Desktop: burger menu */}
          <div className="relative hidden md:block">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setOpen(!open)}
            >
              {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              Menu
            </Button>
            {open && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-xl border bg-popover p-2 shadow-lg">
                  <div className="flex flex-col gap-1">
                    {navLinks.map((l) => (
                      <Link
                        key={l.href}
                        href={l.href}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted hover:text-foreground transition-colors"
                        onClick={() => setOpen(false)}
                      >
                        {l.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Mobile: burger menu */}
          <Button
            variant="outline"
            size="sm"
            className="md:hidden gap-2"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            Menu
          </Button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t p-4 bg-background">
          <div className="flex flex-col gap-2">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="inline-flex items-center justify-start rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
