"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import {
  User,
  Shield,
  Monitor,
  Bell,
  Palette,
  CreditCard,
  Users,
  Key,
  AlertTriangle,
  Check,
  X,
  ChevronDown,
  Copy,
  Trash2,
  LogOut,
  Smartphone,
  Globe,
  Clock,
  Moon,
  Sun,
  Type,
  Zap,
  Download,
  ArrowRightLeft,
  Plus,
  Pencil,
} from "lucide-react";

/* ── Sidebar nav items ── */
const navGroups = [
  {
    label: "Account",
    items: [
      { id: "profile", label: "Profile", icon: User },
      { id: "security", label: "Security", icon: Shield },
      { id: "sessions", label: "Sessions", icon: Monitor },
    ],
  },
  {
    label: "Product",
    items: [
      { id: "notifications", label: "Notifications", icon: Bell },
      { id: "appearance", label: "Appearance", icon: Palette },
    ],
  },
  {
    label: "Workspace",
    items: [
      { id: "billing", label: "Billing", icon: CreditCard },
      { id: "team", label: "Team", icon: Users },
      { id: "api", label: "API & Webhooks", icon: Key },
    ],
  },
  {
    label: "Other",
    items: [
      { id: "danger", label: "Danger Zone", icon: AlertTriangle, danger: true },
    ],
  },
];

/* ── Toggle component ── */
function Toggle({ defaultChecked = false }: { defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={() => setChecked(!checked)}
      />
      <div className="w-[38px] h-[22px] bg-white/10 rounded-full border border-white/10 peer-checked:bg-[#03e65b]/20 peer-checked:border-[#03e65b]/30 transition-all duration-200 relative">
        <div
          className={`absolute top-[2px] left-[2px] w-4 h-4 rounded-full bg-[#555555] transition-all duration-200 ${
            checked ? "translate-x-4 bg-[#03e65b]" : ""
          }`}
        />
      </div>
    </label>
  );
}

/* ── Badge component ── */
function Badge({
  children,
  variant = "green",
}: {
  children: React.ReactNode;
  variant?: "green" | "amber" | "red" | "blue" | "purple";
}) {
  const map: Record<string, string> = {
    green: "bg-[#03e65b]/10 text-[#03e65b] border-[#03e65b]/20",
    amber: "bg-[#ffc533]/10 text-[#ffc533] border-[#ffc533]/20",
    red: "bg-[#ff5d4b]/10 text-[#ff5d4b] border-[#ff5d4b]/20",
    blue: "bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/20",
    purple: "bg-[#6e60ee]/10 text-[#6e60ee] border-[#6e60ee]/20",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${map[variant]}`}
    >
      {children}
    </span>
  );
}

/* ── Card row component ── */
function CardRow({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-between px-5 py-4 border-b border-white/[0.06] gap-4 transition-colors hover:bg-[#1a1a1a] last:border-b-0 ${className}`}
    >
      {children}
    </div>
  );
}

/* ── Section wrapper ── */
function Section({
  id,
  title,
  children,
  titleColor,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
  titleColor?: string;
}) {
  return (
    <section id={id} className="mb-8 scroll-mt-24">
      <h2
        className={`text-[13px] font-semibold uppercase tracking-[0.08em] mb-3 ${
          titleColor || "text-[#555555]"
        }`}
      >
        {title}
      </h2>
      <div className="bg-[#111111] border border-white/[0.07] rounded-[16px] overflow-hidden">
        {children}
      </div>
    </section>
  );
}

/* ── Main page ── */
export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile");
  const contentRef = useRef<HTMLDivElement>(null);

  /* Scroll spy */
  useEffect(() => {
    const handleScroll = () => {
      const sections = navGroups.flatMap((g) => g.items.map((i) => i.id));
      for (const id of sections.reverse()) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120) {
            setActiveSection(id);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(id);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-black pt-20 pb-20">
        <div className="max-w-[1000px] mx-auto px-6 md:px-8 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-10 items-start">
          {/* ── Sidebar ── */}
          <aside className="hidden md:block sticky top-24">
            {navGroups.map((group) => (
              <div key={group.label} className="mb-6">
                <div className="text-[10px] uppercase tracking-[0.1em] text-[#555555] font-medium px-2.5 mb-1.5">
                  {group.label}
                </div>
                <div className="flex flex-col gap-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => scrollTo(item.id)}
                        className={`flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13.5px] transition-all ${
                          item.danger
                            ? isActive
                              ? "text-[#ff5d4b] bg-[#1a1a1a] border border-white/[0.07]"
                              : "text-[#ff5d4b]/70 hover:text-[#ff5d4b] hover:bg-[#151515]"
                            : isActive
                            ? "text-white bg-[#1a1a1a] border border-white/[0.07]"
                            : "text-[#888888] hover:text-white hover:bg-[#151515]"
                        }`}
                      >
                        <span
                          className={`w-[6px] h-[6px] rounded-full flex-shrink-0 transition-colors ${
                            item.danger
                              ? isActive
                                ? "bg-[#ff5d4b]"
                                : "bg-[#ff5d4b]/40"
                              : isActive
                              ? "bg-[#03e65b]"
                              : "bg-[#555555]"
                          }`}
                        />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </aside>

          {/* ── Content ── */}
          <div ref={contentRef} className="min-w-0">
            {/* Header */}
            <motion.div
              className="mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-[28px] font-bold text-white mb-1.5">
                Settings
              </h1>
              <p className="text-[#888888] text-sm">
                Manage your account, workspace, and developer preferences.
              </p>
            </motion.div>

            {/* ── Profile ── */}
            <Section id="profile" title="Profile">
              {/* Avatar row */}
              <div className="flex items-center gap-4 px-5 py-5 border-b border-white/[0.06]">
                <div className="relative w-[54px] h-[54px] rounded-full bg-gradient-to-br from-[#6e60ee] to-[#ff5d4b] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  AK
                  <span className="absolute bottom-0 right-0 w-4 h-4 bg-[#03e65b] border-2 border-[#111111] rounded-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[15px] font-medium text-white mb-0.5">
                    Hakan Şükür{" "}
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#6e60ee]/10 text-[#6e60ee] border border-[#6e60ee]/20">
                      Pro
                    </span>
                  </div>
                  <div className="text-[12.5px] text-[#888888]">
                    hakan@example.com
                  </div>
                </div>
                <button className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-white/20 text-[12.5px] text-[#888888] hover:text-white hover:bg-[#1a1a1a] transition-all flex-shrink-0">
                  Change photo
                </button>
              </div>

              {/* Name inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 px-5 py-4 border-b border-white/[0.06]">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] text-[#888888]">
                    First name
                  </label>
                  <input
                    type="text"
                    defaultValue="Ahmet"
                    className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[13.5px] text-white outline-none focus:border-white/20 transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] text-[#888888]">
                    Last name
                  </label>
                  <input
                    type="text"
                    defaultValue="Kaya"
                    className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[13.5px] text-white outline-none focus:border-white/20 transition-colors"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="px-5 py-4 border-b border-white/[0.06]">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] text-[#888888]">
                    Email address
                  </label>
                  <input
                    type="email"
                    defaultValue="ahmet@example.com"
                    className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[13.5px] text-white outline-none focus:border-white/20 transition-colors"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="px-5 py-4 border-b border-white/[0.06]">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] text-[#888888]">Bio</label>
                  <textarea
                    rows={2}
                    defaultValue="Product builder & UI enthusiast."
                    className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[13.5px] text-white outline-none focus:border-white/20 transition-colors resize-y"
                  />
                </div>
              </div>

              {/* Language */}
              <CardRow>
                <div>
                  <div className="text-[14px] font-medium text-white mb-0.5">
                    Language
                  </div>
                  <div className="text-[12.5px] text-[#888888]">
                    Interface display language
                  </div>
                </div>
                <select className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-[13px] text-white outline-none cursor-pointer min-w-[130px]">
                  <option>Turkish</option>
                  <option>English</option>
                  <option>German</option>
                </select>
              </CardRow>

              {/* Timezone */}
              <CardRow>
                <div>
                  <div className="text-[14px] font-medium text-white mb-0.5">
                    Timezone
                  </div>
                  <div className="text-[12.5px] text-[#888888]">
                    Used for reports and scheduling
                  </div>
                </div>
                <select className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-[13px] text-white outline-none cursor-pointer min-w-[180px]">
                  <option>Europe/Istanbul (UTC+3)</option>
                  <option>UTC</option>
                  <option>US/Eastern</option>
                </select>
              </CardRow>

              {/* Save button */}
              <div className="flex justify-end px-5 py-3.5 border-t border-white/[0.06] bg-white/[0.02]">
                <button className="inline-flex items-center px-4 py-2 rounded-lg bg-white text-black text-[13px] font-medium hover:bg-[#e5e5e5] transition-colors">
                  Save changes
                </button>
              </div>
            </Section>

            {/* ── Security ── */}
            <Section id="security" title="Security">
              <CardRow>
                <div>
                  <div className="text-[14px] font-medium text-white mb-0.5">
                    Password
                  </div>
                  <div className="text-[12.5px] text-[#888888]">
                    Last changed 3 months ago
                  </div>
                </div>
                <button className="inline-flex items-center px-3 py-1.5 rounded-lg border border-white/20 text-[12.5px] text-[#888888] hover:text-white hover:bg-[#1a1a1a] transition-all flex-shrink-0">
                  Change password
                </button>
              </CardRow>

              <CardRow>
                <div>
                  <div className="text-[14px] font-medium text-white mb-0.5">
                    Two-factor authentication
                  </div>
                  <div className="text-[12.5px] text-[#888888]">
                    Add an extra layer of security to your account
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <Badge variant="red">Disabled</Badge>
                  <button className="inline-flex items-center px-3 py-1.5 rounded-lg bg-[#03e65b]/10 text-[#03e65b] border border-[#03e65b]/30 text-[12.5px] hover:bg-[#03e65b]/20 transition-all">
                    Enable 2FA
                  </button>
                </div>
              </CardRow>

              <CardRow>
                <div>
                  <div className="text-[14px] font-medium text-white mb-0.5">
                    Passkey
                  </div>
                  <div className="text-[12.5px] text-[#888888]">
                    Sign in with Face ID, Touch ID, or device PIN
                  </div>
                </div>
                <button className="inline-flex items-center px-3 py-1.5 rounded-lg border border-white/20 text-[12.5px] text-[#888888] hover:text-white hover:bg-[#1a1a1a] transition-all flex-shrink-0">
                  Add passkey
                </button>
              </CardRow>

              <CardRow>
                <div>
                  <div className="text-[14px] font-medium text-white mb-0.5">
                    Login history
                  </div>
                  <div className="text-[12.5px] text-[#888888]">
                    Review recent sign-in activity
                  </div>
                </div>
                <button className="inline-flex items-center px-3 py-1.5 rounded-lg border border-white/20 text-[12.5px] text-[#888888] hover:text-white hover:bg-[#1a1a1a] transition-all flex-shrink-0">
                  View history
                </button>
              </CardRow>
            </Section>

            {/* ── Sessions ── */}
            <Section id="sessions" title="Active Sessions">
              <div className="flex items-center gap-3.5 px-5 py-4 border-b border-white/[0.06]">
                <div className="w-9 h-9 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-lg flex-shrink-0">
                  <Monitor className="w-4 h-4 text-[#888888]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-medium text-white mb-0.5">
                    MacBook Pro — Chrome 124
                  </div>
                  <div className="text-[11.5px] text-[#888888]">
                    Istanbul, TR · Active now
                  </div>
                </div>
                <Badge variant="green">Current</Badge>
              </div>

              <div className="flex items-center gap-3.5 px-5 py-4 border-b border-white/[0.06]">
                <div className="w-9 h-9 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-lg flex-shrink-0">
                  <Smartphone className="w-4 h-4 text-[#888888]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-medium text-white mb-0.5">
                    iPhone 15 — Safari
                  </div>
                  <div className="text-[11.5px] text-[#888888]">
                    Istanbul, TR · 2 hours ago
                  </div>
                </div>
                <button className="inline-flex items-center px-3 py-1.5 rounded-lg border border-[#ff5d4b]/20 text-[12.5px] text-[#ff5d4b] hover:bg-[#ff5d4b]/10 transition-all flex-shrink-0">
                  Revoke
                </button>
              </div>

              <div className="flex items-center gap-3.5 px-5 py-4 border-b border-white/[0.06]">
                <div className="w-9 h-9 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-lg flex-shrink-0">
                  <Globe className="w-4 h-4 text-[#888888]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-medium text-white mb-0.5">
                    Windows PC — Firefox 125
                  </div>
                  <div className="text-[11.5px] text-[#888888]">
                    Ankara, TR · 3 days ago
                  </div>
                </div>
                <button className="inline-flex items-center px-3 py-1.5 rounded-lg border border-[#ff5d4b]/20 text-[12.5px] text-[#ff5d4b] hover:bg-[#ff5d4b]/10 transition-all flex-shrink-0">
                  Revoke
                </button>
              </div>

              <div className="flex justify-end px-5 py-3.5">
                <button className="inline-flex items-center px-3 py-1.5 rounded-lg border border-[#ff5d4b]/20 text-[12.5px] text-[#ff5d4b] hover:bg-[#ff5d4b]/10 transition-all">
                  Revoke all other sessions
                </button>
              </div>
            </Section>

            {/* ── Notifications ── */}
            <Section id="notifications" title="Notifications">
              <CardRow>
                <div>
                  <div className="text-[14px] font-medium text-white mb-0.5">
                    Email notifications
                  </div>
                  <div className="text-[12.5px] text-[#888888]">
                    Receive updates and alerts via email
                  </div>
                </div>
                <Toggle defaultChecked />
              </CardRow>
              <CardRow>
                <div>
                  <div className="text-[14px] font-medium text-white mb-0.5">
                    Build completed
                  </div>
                  <div className="text-[12.5px] text-[#888888]">
                    Notify when a project build finishes
                  </div>
                </div>
                <Toggle defaultChecked />
              </CardRow>
              <CardRow>
                <div>
                  <div className="text-[14px] font-medium text-white mb-0.5">
                    Build failed
                  </div>
                  <div className="text-[12.5px] text-[#888888]">
                    Alert when a deployment fails
                  </div>
                </div>
                <Toggle defaultChecked />
              </CardRow>
              <CardRow>
                <div>
                  <div className="text-[14px] font-medium text-white mb-0.5">
                    New team member
                  </div>
                  <div className="text-[12.5px] text-[#888888]">
                    Notify when someone joins your workspace
                  </div>
                </div>
                <Toggle />
              </CardRow>
              <CardRow>
                <div>
                  <div className="text-[14px] font-medium text-white mb-0.5">
                    Usage threshold alerts
                  </div>
                  <div className="text-[12.5px] text-[#888888]">
                    Warn when approaching plan limits
                  </div>
                </div>
                <Toggle defaultChecked />
              </CardRow>
              <CardRow>
                <div>
                  <div className="text-[14px] font-medium text-white mb-0.5">
                    Product updates & changelog
                  </div>
                  <div className="text-[12.5px] text-[#888888]">
                    Monthly digest of new features
                  </div>
                </div>
                <Toggle />
              </CardRow>
              <CardRow>
                <div>
                  <div className="text-[14px] font-medium text-white mb-0.5">
                    Security alerts
                  </div>
                  <div className="text-[12.5px] text-[#888888]">
                    Suspicious login or account changes
                  </div>
                </div>
                <Toggle defaultChecked />
              </CardRow>
            </Section>

            {/* ── Appearance ── */}
            <Section id="appearance" title="Appearance">
              <CardRow>
                <div>
                  <div className="text-[14px] font-medium text-white mb-0.5">
                    Theme
                  </div>
                  <div className="text-[12.5px] text-[#888888]">
                    Choose your preferred color scheme
                  </div>
                </div>
                <select className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-[13px] text-white outline-none cursor-pointer min-w-[100px]">
                  <option>Dark</option>
                  <option>Light</option>
                  <option>System</option>
                </select>
              </CardRow>

              <CardRow>
                <div>
                  <div className="text-[14px] font-medium text-white mb-0.5">
                    Accent color
                  </div>
                  <div className="text-[12.5px] text-[#888888]">
                    Highlight color used across the UI
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {["#03e65b", "#6e60ee", "#3b82f6", "#ffc533", "#ff5d4b"].map(
                    (c, i) => (
                      <button
                        key={c}
                        className={`w-5 h-5 rounded-full transition-all ${
                          i === 0
                            ? "ring-2 ring-offset-1 ring-offset-black ring-white/40"
                            : "ring-1 ring-white/10"
                        }`}
                        style={{ background: c }}
                      />
                    )
                  )}
                </div>
              </CardRow>

              <CardRow>
                <div>
                  <div className="text-[14px] font-medium text-white mb-0.5">
                    Interface density
                  </div>
                  <div className="text-[12.5px] text-[#888888]">
                    Control spacing and component sizing
                  </div>
                </div>
                <select className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-2.5 py-1.5 text-[13px] text-white outline-none cursor-pointer min-w-[120px]">
                  <option>Comfortable</option>
                  <option>Compact</option>
                  <option>Spacious</option>
                </select>
              </CardRow>

              <CardRow>
                <div>
                  <div className="text-[14px] font-medium text-white mb-0.5">
                    Reduce motion
                  </div>
                  <div className="text-[12.5px] text-[#888888]">
                    Minimize animations and transitions
                  </div>
                </div>
                <Toggle />
              </CardRow>
            </Section>

            {/* ── Billing ── */}
            <Section id="billing" title="Billing">
              {/* Plan card */}
              <div className="bg-[#111111] border border-white/[0.07] rounded-[16px] p-5 mb-3">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-[16px] font-semibold text-white mb-1">
                      Pro Plan{" "}
                      <span className="ml-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#6e60ee]/10 text-[#6e60ee] border border-[#6e60ee]/20">
                        Active
                      </span>
                    </div>
                    <div className="text-[12.5px] text-[#888888] mt-1">
                      Renews June 4, 2026 · Billed monthly
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[24px] font-bold text-white leading-none">
                      $49
                    </div>
                    <div className="text-[12px] text-[#888888] mt-0.5">/ month</div>
                  </div>
                </div>

                {/* Usage bars */}
                <div className="mb-3">
                  <div className="flex justify-between text-[12px] text-[#888888] mb-1">
                    <span>API calls</span>
                    <span>68,450 / 100,000</span>
                  </div>
                  <div className="h-1 bg-white/[0.08] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#3b82f6] rounded-full"
                      style={{ width: "68%" }}
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <div className="flex justify-between text-[12px] text-[#888888] mb-1">
                    <span>Build minutes</span>
                    <span>410 / 500</span>
                  </div>
                  <div className="h-1 bg-white/[0.08] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#ffc533] rounded-full"
                      style={{ width: "82%" }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[12px] text-[#888888] mb-1">
                    <span>Storage</span>
                    <span>3.5 GB / 10 GB</span>
                  </div>
                  <div className="h-1 bg-white/[0.08] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#03e65b] rounded-full"
                      style={{ width: "35%" }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-[#111111] border border-white/[0.07] rounded-[16px] overflow-hidden">
                <CardRow>
                  <div>
                    <div className="text-[14px] font-medium text-white mb-0.5">
                      Payment method
                    </div>
                    <div className="text-[12.5px] text-[#888888]">
                      Visa ending in 4242 · Exp. 09/27
                    </div>
                  </div>
                  <button className="inline-flex items-center px-3 py-1.5 rounded-lg border border-white/20 text-[12.5px] text-[#888888] hover:text-white hover:bg-[#1a1a1a] transition-all flex-shrink-0">
                    Update card
                  </button>
                </CardRow>
                <CardRow>
                  <div>
                    <div className="text-[14px] font-medium text-white mb-0.5">
                      Billing email
                    </div>
                    <div className="text-[12.5px] text-[#888888]">
                      billing@example.com
                    </div>
                  </div>
                  <button className="inline-flex items-center px-3 py-1.5 rounded-lg border border-white/20 text-[12.5px] text-[#888888] hover:text-white hover:bg-[#1a1a1a] transition-all flex-shrink-0">
                    Change
                  </button>
                </CardRow>
                <CardRow>
                  <div>
                    <div className="text-[14px] font-medium text-white mb-0.5">
                      Invoices
                    </div>
                    <div className="text-[12.5px] text-[#888888]">
                      Download past receipts and invoices
                    </div>
                  </div>
                  <button className="inline-flex items-center px-3 py-1.5 rounded-lg border border-white/20 text-[12.5px] text-[#888888] hover:text-white hover:bg-[#1a1a1a] transition-all flex-shrink-0">
                    View invoices
                  </button>
                </CardRow>
                <CardRow>
                  <div>
                    <div className="text-[14px] font-medium text-white mb-0.5">
                      Upgrade plan
                    </div>
                    <div className="text-[12.5px] text-[#888888]">
                      Get more API calls, seats, and storage
                    </div>
                  </div>
                  <button className="inline-flex items-center px-3 py-1.5 rounded-lg bg-[#03e65b]/10 text-[#03e65b] border border-[#03e65b]/30 text-[12.5px] hover:bg-[#03e65b]/20 transition-all flex-shrink-0">
                    Upgrade to Team
                  </button>
                </CardRow>
              </div>
            </Section>

            {/* ── Team ── */}
            <Section id="team" title="Team Members">
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.06]">
                <div className="w-[34px] h-[34px] rounded-full bg-gradient-to-br from-[#6e60ee] to-[#ff5d4b] flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0">
                  AK
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-medium text-white mb-0.5">
                    Ahmet Kaya{" "}
                    <span className="text-[11px] text-[#555555]">(you)</span>
                  </div>
                  <div className="text-[12px] text-[#888888]">
                    ahmet@example.com
                  </div>
                </div>
                <Badge variant="purple">Owner</Badge>
              </div>

              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.06]">
                <div className="w-[34px] h-[34px] rounded-full bg-[#3b82f6]/15 flex items-center justify-center text-[#3b82f6] text-[12px] font-bold flex-shrink-0">
                  ZD
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-medium text-white mb-0.5">
                    Zeynep Demir
                  </div>
                  <div className="text-[12px] text-[#888888]">
                    zeynep@example.com
                  </div>
                </div>
                <select className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-2 py-1 text-[12px] text-white outline-none cursor-pointer min-w-[80px]">
                  <option>Admin</option>
                  <option>Editor</option>
                  <option>Viewer</option>
                </select>
              </div>

              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.06]">
                <div className="w-[34px] h-[34px] rounded-full bg-[#03e65b]/12 flex items-center justify-center text-[#03e65b] text-[12px] font-bold flex-shrink-0">
                  MA
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-medium text-white mb-0.5">
                    Mehmet Arslan
                  </div>
                  <div className="text-[12px] text-[#888888]">
                    mehmet@example.com
                  </div>
                </div>
                <select className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-2 py-1 text-[12px] text-white outline-none cursor-pointer min-w-[80px]">
                  <option>Editor</option>
                  <option>Admin</option>
                  <option>Viewer</option>
                </select>
              </div>

              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.06]">
                <div className="w-[34px] h-[34px] rounded-full bg-[#ffc533]/12 flex items-center justify-center text-[#ffc533] text-[12px] font-bold flex-shrink-0">
                  SY
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-medium text-white mb-0.5">
                    Selin Yıldız
                  </div>
                  <div className="text-[12px] text-[#888888]">
                    selin@example.com
                  </div>
                </div>
                <select className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-2 py-1 text-[12px] text-white outline-none cursor-pointer min-w-[80px]">
                  <option>Viewer</option>
                  <option>Editor</option>
                  <option>Admin</option>
                </select>
              </div>

              <CardRow className="border-t border-white/[0.06]">
                <div>
                  <div className="text-[14px] font-medium text-white mb-0.5">
                    Invite member
                  </div>
                  <div className="text-[12.5px] text-[#888888]">
                    Add people to your workspace
                  </div>
                </div>
                <button className="inline-flex items-center gap-1 px-3.5 py-2 rounded-lg bg-white text-black text-[12.5px] font-medium hover:bg-[#e5e5e5] transition-all flex-shrink-0">
                  <Plus className="w-3.5 h-3.5" />
                  Invite
                </button>
              </CardRow>
            </Section>

            {/* ── API Keys ── */}
            <Section id="api" title="API Keys">
              <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-white/[0.06]">
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-medium text-white mb-0.5">
                    Production
                  </div>
                  <div className="font-mono text-[12px] text-[#888888] bg-white/[0.04] px-2.5 py-1 rounded-md inline-block tracking-wide">
                    sk_live_••••••••••••••••••••••xK9m
                  </div>
                </div>
                <Badge variant="green">Active</Badge>
                <span className="text-[11.5px] text-[#555555] min-w-[80px] text-right">
                  Created Mar 12
                </span>
                <button className="inline-flex items-center px-2.5 py-1 rounded-lg border border-[#ff5d4b]/20 text-[12px] text-[#ff5d4b] hover:bg-[#ff5d4b]/10 transition-all flex-shrink-0">
                  Revoke
                </button>
              </div>

              <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-white/[0.06]">
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-medium text-white mb-0.5">
                    Development
                  </div>
                  <div className="font-mono text-[12px] text-[#888888] bg-white/[0.04] px-2.5 py-1 rounded-md inline-block tracking-wide">
                    sk_test_••••••••••••••••••••••aP3z
                  </div>
                </div>
                <Badge variant="blue">Test</Badge>
                <span className="text-[11.5px] text-[#555555] min-w-[80px] text-right">
                  Created Apr 1
                </span>
                <button className="inline-flex items-center px-2.5 py-1 rounded-lg border border-[#ff5d4b]/20 text-[12px] text-[#ff5d4b] hover:bg-[#ff5d4b]/10 transition-all flex-shrink-0">
                  Revoke
                </button>
              </div>

              <div className="flex justify-end px-5 py-3.5">
                <button className="inline-flex items-center gap-1 px-3.5 py-2 rounded-lg bg-white text-black text-[12.5px] font-medium hover:bg-[#e5e5e5] transition-all">
                  <Plus className="w-3.5 h-3.5" />
                  Generate new key
                </button>
              </div>

              {/* Webhooks */}
              <div className="mt-4">
                <h2 className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#555555] mb-3">
                  Webhooks
                </h2>
                <div className="bg-[#111111] border border-white/[0.07] rounded-[16px] overflow-hidden">
                  <CardRow>
                    <div>
                      <div className="text-[14px] font-medium text-white mb-0.5">
                        Build events
                      </div>
                      <code className="font-mono text-[11.5px] text-[#888888] bg-white/[0.04] px-2 py-0.5 rounded mt-1 block truncate max-w-[260px]">
                        https://hooks.example.com/build/a3f9
                      </code>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant="green">Active</Badge>
                      <button className="inline-flex items-center px-3 py-1.5 rounded-lg border border-white/20 text-[12.5px] text-[#888888] hover:text-white hover:bg-[#1a1a1a] transition-all">
                        Edit
                      </button>
                    </div>
                  </CardRow>
                  <CardRow>
                    <div>
                      <div className="text-[14px] font-medium text-white mb-0.5">
                        Billing events
                      </div>
                      <code className="font-mono text-[11.5px] text-[#888888] bg-white/[0.04] px-2 py-0.5 rounded mt-1 block truncate max-w-[260px]">
                        https://hooks.example.com/billing/c7d1
                      </code>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant="amber">Paused</Badge>
                      <button className="inline-flex items-center px-3 py-1.5 rounded-lg border border-white/20 text-[12.5px] text-[#888888] hover:text-white hover:bg-[#1a1a1a] transition-all">
                        Edit
                      </button>
                    </div>
                  </CardRow>
                  <div className="flex justify-end px-5 py-3.5">
                    <button className="inline-flex items-center gap-1 px-3.5 py-2 rounded-lg bg-white text-black text-[12.5px] font-medium hover:bg-[#e5e5e5] transition-all">
                      <Plus className="w-3.5 h-3.5" />
                      Add webhook
                    </button>
                  </div>
                </div>
              </div>
            </Section>

            {/* ── Danger Zone ── */}
            <Section id="danger" title="Danger Zone" titleColor="text-[#ff5d4b]">
              <div className="bg-[#111111] border border-[#ff5d4b]/18 rounded-[16px] overflow-hidden">
                <CardRow>
                  <div>
                    <div className="text-[14px] font-medium text-white mb-0.5">
                      Export account data
                    </div>
                    <div className="text-[12.5px] text-[#888888]">
                      Download a full archive of your projects and data
                    </div>
                  </div>
                  <button className="inline-flex items-center px-3 py-1.5 rounded-lg border border-white/20 text-[12.5px] text-[#888888] hover:text-white hover:bg-[#1a1a1a] transition-all flex-shrink-0">
                    Export data
                  </button>
                </CardRow>
                <CardRow>
                  <div>
                    <div className="text-[14px] font-medium text-white mb-0.5">
                      Transfer workspace
                    </div>
                    <div className="text-[12.5px] text-[#888888]">
                      Assign ownership to another team member
                    </div>
                  </div>
                  <button className="inline-flex items-center px-3 py-1.5 rounded-lg border border-[#ff5d4b]/20 text-[12.5px] text-[#ff5d4b] hover:bg-[#ff5d4b]/10 transition-all flex-shrink-0">
                    Transfer
                  </button>
                </CardRow>
                <CardRow>
                  <div>
                    <div className="text-[14px] font-medium text-white mb-0.5">
                      Delete workspace
                    </div>
                    <div className="text-[12.5px] text-[#888888]">
                      Permanently remove this workspace and all its data
                    </div>
                  </div>
                  <button className="inline-flex items-center px-3 py-1.5 rounded-lg border border-[#ff5d4b]/20 text-[12.5px] text-[#ff5d4b] hover:bg-[#ff5d4b]/10 transition-all flex-shrink-0">
                    Delete workspace
                  </button>
                </CardRow>
                <CardRow>
                  <div>
                    <div className="text-[14px] font-medium text-white mb-0.5">
                      Delete account
                    </div>
                    <div className="text-[12.5px] text-[#888888]">
                      Permanently delete your account. This cannot be undone.
                    </div>
                  </div>
                  <button className="inline-flex items-center px-3 py-1.5 rounded-lg border border-[#ff5d4b]/20 text-[12.5px] text-[#ff5d4b] hover:bg-[#ff5d4b]/10 transition-all font-semibold flex-shrink-0">
                    Delete account
                  </button>
                </CardRow>
              </div>
            </Section>
          </div>
        </div>
      </main>
    </>
  );
}
