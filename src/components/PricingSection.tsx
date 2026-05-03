"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

// ── Plan data (placeholder — connect to Stripe later) ─────────
type BillingCycle = "monthly" | "yearly";

interface PlanFeature {
  id: string;
  text: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  popular?: boolean;
  price: { monthly: string; yearly: string };
  description: string;
  features: PlanFeature[];
  cta: string;
  ctaHref: string;
  ctaStyle: "outline" | "primary" | "outlineGreen";
}

const PLANS: Plan[] = [
  {
    id: "plan-free",
    name: "Free",
    price: { monthly: "$0", yearly: "$0" },
    description:
      "For testing the prompt builder and creating your first visuals.",
    features: [
      { id: "free-1", text: "10 prompt builds / month", included: true },
      { id: "free-2", text: "Basic categories", included: true },
      { id: "free-3", text: "Final prompt preview", included: true },
      { id: "free-4", text: "Limited templates", included: true },
      { id: "free-5", text: "Community-style usage", included: true },
      { id: "free-6", text: "No API key storage", included: false },
      { id: "free-7", text: "No private dashboard history", included: false },
    ],
    cta: "Start for free",
    ctaHref: "/builder",
    ctaStyle: "outline",
  },
  {
    id: "plan-pro",
    name: "Pro",
    popular: true,
    price: { monthly: "$19", yearly: "$15/mo billed yearly" },
    description:
      "For creators, marketers, and small brands generating visuals regularly.",
    features: [
      { id: "pro-1", text: "1,000 prompt builds / month", included: true },
      {
        id: "pro-2",
        text: "AI image generation with connected API key",
        included: true,
      },
      { id: "pro-3", text: "Full category library", included: true },
      { id: "pro-4", text: "Saved generation history", included: true },
      { id: "pro-5", text: "Dashboard previews", included: true },
      { id: "pro-6", text: "Brand campaign templates", included: true },
      {
        id: "pro-7",
        text: "Commercial-ready prompt structure",
        included: true,
      },
      { id: "pro-8", text: "Priority UI updates", included: true },
    ],
    cta: "Go Pro",
    ctaHref: "/builder",
    ctaStyle: "primary",
  },
  {
    id: "plan-agency",
    name: "Agency",
    price: { monthly: "$59", yearly: "$47/mo billed yearly" },
    description:
      "For agencies and teams producing campaign visuals for multiple clients.",
    features: [
      { id: "agency-1", text: "10,000 prompt builds / month", included: true },
      {
        id: "agency-2",
        text: "Multiple brand campaign presets",
        included: true,
      },
      {
        id: "agency-3",
        text: "Advanced e-commerce and ad templates",
        included: true,
      },
      {
        id: "agency-4",
        text: "Team-ready dashboard structure",
        included: true,
      },
      { id: "agency-5", text: "Export-ready prompt outputs", included: true },
      { id: "agency-6", text: "Client campaign organization", included: true },
      { id: "agency-7", text: "Higher generation limits", included: true },
      { id: "agency-8", text: "Priority support", included: true },
    ],
    cta: "Contact sales",
    ctaHref: "/builder",
    ctaStyle: "outlineGreen",
  },
];

// ── Styles map for CTA buttons ────────────────────────────────
const CTA_CLASSES: Record<Plan["ctaStyle"], string> = {
  outline:
    "border border-white/20 text-white hover:bg-white/10",
  primary:
    "bg-[#03e65b] text-black font-semibold hover:bg-[#02cc50]",
  outlineGreen:
    "border border-[#03e65b]/40 text-[#03e65b] hover:bg-[#03e65b]/10",
};

// ── Check / cross icons ───────────────────────────────────────
function CheckIcon() {
  return (
    <svg
      className="w-4 h-4 text-[#03e65b] shrink-0 mt-0.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg
      className="w-4 h-4 text-[#555] shrink-0 mt-0.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 6L6 18M6 6l12 12"
      />
    </svg>
  );
}

// ── Component ─────────────────────────────────────────────────
export default function PricingSection() {
  const [billing, setBilling] = useState<BillingCycle>("monthly");

  return (
    <section className="relative py-24 md:py-32 bg-black overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute w-[600px] h-[600px] rounded-full opacity-[0.06] blur-[140px]"
          style={{
            background:
              "radial-gradient(circle, #03e65b 0%, transparent 70%)",
            top: "30%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* ── Header ────────────────────────────────────────── */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Simple pricing for creators and teams
          </h2>
          <p className="text-[#999] text-base md:text-lg max-w-xl mx-auto mb-8">
            Start free, upgrade when you need more generations, templates, and
            campaign control.
          </p>

          {/* ── Billing toggle ──────────────────────────────── */}
          <div className="inline-flex items-center gap-1 p-1 rounded-full bg-white/[0.04] border border-white/[0.08]">
            <button
              onClick={() => setBilling("monthly")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                billing === "monthly"
                  ? "bg-white/10 text-white"
                  : "text-[#999] hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 inline-flex items-center gap-2 ${
                billing === "yearly"
                  ? "bg-white/10 text-white"
                  : "text-[#999] hover:text-white"
              }`}
            >
              Yearly
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#03e65b]/15 text-[#03e65b] px-2 py-0.5 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </motion.div>

        {/* ── Cards grid ────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {PLANS.map((plan, i) => {
            const isPopular = plan.popular === true;

            return (
              <motion.div
                key={plan.id}
                className={`relative flex flex-col rounded-2xl p-[1px] ${
                  isPopular ? "md:-mt-3 md:mb-[-12px]" : ""
                }`}
                style={{
                  background: isPopular
                    ? "linear-gradient(160deg, rgba(3,230,91,0.25) 0%, rgba(3,230,91,0.04) 50%, rgba(255,255,255,0.04) 100%)"
                    : "rgba(255,255,255,0.06)",
                  borderRadius: "18px",
                }}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div
                  className="flex flex-col flex-1 rounded-[17px] px-6 py-8 md:py-10"
                  style={{ background: isPopular ? "#0a0f0a" : "#0a0a0a" }}
                >
                  {/* Popular badge */}
                  {isPopular && (
                    <span className="self-start mb-4 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[#03e65b]">
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-[#03e65b]"
                        style={{
                          boxShadow: "0 0 6px 1px rgba(3,230,91,0.5)",
                        }}
                      />
                      Most popular
                    </span>
                  )}

                  {/* Plan name */}
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {plan.name}
                  </h3>

                  {/* Price */}
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-white tracking-tight">
                      {billing === "monthly"
                        ? plan.price.monthly
                        : plan.price.yearly.split("/")[0]}
                    </span>
                    {plan.price[billing] !== "$0" && (
                      <span className="text-sm text-[#999] ml-1.5">
                        {billing === "monthly"
                          ? "/mo"
                          : "/mo billed yearly"}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-[#888] mb-7 leading-relaxed">
                    {plan.description}
                  </p>

                  {/* Features */}
                  <ul className="flex-1 space-y-3 mb-8">
                    {plan.features.map((f) => (
                      <li
                        key={f.id}
                        className={`flex items-start gap-2.5 text-sm ${
                          f.included ? "text-[#ccc]" : "text-[#555]"
                        }`}
                      >
                        {f.included ? <CheckIcon /> : <CrossIcon />}
                        <span>{f.text}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA button */}
                  <Link
                    href={plan.ctaHref}
                    className={`inline-flex items-center justify-center w-full px-6 py-3 rounded-full text-sm font-medium transition-colors duration-200 ${CTA_CLASSES[plan.ctaStyle]}`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── Fine print ────────────────────────────────────── */}
        <p className="text-center text-xs text-[#555] mt-8">
          Prices are placeholder plans for the current prototype and can be
          connected to Stripe later.
        </p>
      </div>
    </section>
  );
}
