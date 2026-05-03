"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import AnimatedLogo from "./AnimatedLogo";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/builder", label: "Builder" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/templates", label: "Templates" },
  { href: "/settings", label: "Settings" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-md border-b border-white/5">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center" aria-label="Home">
          <AnimatedLogo />
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition-all duration-300 ${
                  isActive
                    ? "text-[#8a7df0] drop-shadow-[0_0_8px_rgba(138,125,240,0.4)] font-medium"
                    : "text-[#999999] hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:block">
          <Link
            href="/builder"
            className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-white text-black text-sm font-semibold hover:bg-[#e5e5e5] transition-colors"
          >
            Start Building
          </Link>
        </div>

        <button
          className="md:hidden text-white"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-black/90 backdrop-blur-md border-b border-white/5 px-6 pb-6 pt-2">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm transition-all duration-300 ${
                    isActive
                      ? "text-[#8a7df0] drop-shadow-[0_0_8px_rgba(138,125,240,0.4)] font-medium"
                      : "text-[#999999] hover:text-white"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/builder"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-white text-black text-sm font-semibold hover:bg-[#e5e5e5] transition-colors mt-2"
              onClick={() => setOpen(false)}
            >
              Start Building
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
