"use client";

import React, { useState, useId } from "react";
import { soundFx } from "@/utils/sound";
import SpotlightCard from "@/components/SpotlightCard";
import MotionReveal from "@/components/MotionReveal";
import { CONTACT_CONFIG } from "@/data/socials";
import {
  Calculator,
  Sparkles,
  Terminal,
  Cpu,
  Bot,
  Layout,
  Database,
  CreditCard,
  Check,
  Clock,
  TrendingUp,
  Zap,
  Copy,
  ArrowRight,
  ShieldCheck,
  Send,
  MessageCircle,
} from "lucide-react";

export interface ProjectModule {
  id: string;
  name: string;
  category: string;
  description: string;
  inrPrice: number;
  usdPrice: number;
  turnaroundHours: number;
  monthlyHoursSaved: number;
  badge?: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  deliverables: string[];
}

export const CALCULATOR_MODULES: ProjectModule[] = [
  {
    id: "quick-script",
    name: "Quick Bug Fix / Script",
    category: "Rapid Patch",
    description: "Surgical bug fixes, data scrapers, webhook repairs, and urgent script patches.",
    inrPrice: 2000,
    usdPrice: 25,
    turnaroundHours: 8,
    monthlyHoursSaved: 10,
    badge: "Same-Day",
    icon: Terminal,
    deliverables: [
      "Same-day bug diagnosis & patch",
      "Custom Python/Node scraping script",
      "Video walkthrough & test verification",
    ],
  },
  {
    id: "automation",
    name: "Workflow & Business Automation",
    category: "Process Pipelines",
    description: "Multi-app pipelines connecting Google Sheets, Notion, Stripe, Slack, and webhooks.",
    inrPrice: 8000,
    usdPrice: 100,
    turnaroundHours: 36,
    monthlyHoursSaved: 35,
    badge: "Popular",
    icon: Cpu,
    deliverables: [
      "Automated lead triage & notifications",
      "Scheduled background batch jobs",
      "Error recovery & alert routing",
    ],
  },
  {
    id: "ai-agent",
    name: "24/7 WhatsApp & Telegram AI Agent",
    category: "Autonomous AI",
    description: "Gemini-powered chatbot grounded in your company docs, intake forms, and real-time CRM sync.",
    inrPrice: 12000,
    usdPrice: 150,
    turnaroundHours: 72,
    monthlyHoursSaved: 50,
    badge: "High ROI",
    icon: Bot,
    deliverables: [
      "Custom brand voice system prompt",
      "RAG document knowledge retrieval",
      "Instant push alerts to your phone",
    ],
  },
  {
    id: "webapp",
    name: "Full-Stack Web App / Storefront",
    category: "Production Web",
    description: "High-performance web apps built with Next.js 16, Tailwind CSS v4, and Bento Grid design.",
    inrPrice: 18000,
    usdPrice: 225,
    turnaroundHours: 96,
    monthlyHoursSaved: 40,
    badge: "Flagship",
    icon: Layout,
    deliverables: [
      "95+ Google PageSpeed & zero CLS",
      "Mobile-native responsive layouts",
      "Global Vercel deployment & custom domain",
    ],
  },
  {
    id: "database-auth",
    name: "Database & Secure Auth Setup",
    category: "Cloud Backend",
    description: "Supabase PostgreSQL architecture, strict Row-Level Security, audit logs, and session auth.",
    inrPrice: 6000,
    usdPrice: 75,
    turnaroundHours: 24,
    monthlyHoursSaved: 15,
    badge: "Core Security",
    icon: Database,
    deliverables: [
      "Normalized relational schema design",
      "Supabase RLS policies & JWT cookies",
      "Automated audit logging & backups",
    ],
  },
  {
    id: "payments",
    name: "Payment & UPI Integration",
    category: "Monetization",
    description: "Instant UPI dynamic QR code flows, Stripe checkout webhooks, and automated receipts.",
    inrPrice: 5000,
    usdPrice: 65,
    turnaroundHours: 24,
    monthlyHoursSaved: 20,
    badge: "Instant Pay",
    icon: CreditCard,
    deliverables: [
      "Direct UPI zero-fee payment bridge",
      "Stripe checkout & webhook listener",
      "Real-time payment confirmation alerts",
    ],
  },
];

type TimelineMode = "rush" | "standard" | "staged";

interface TimelineOption {
  id: TimelineMode;
  name: string;
  subtitle: string;
  multiplier: number;
  timeFactor: number;
  badge?: string;
}

const TIMELINE_OPTIONS: TimelineOption[] = [
  {
    id: "rush",
    name: "⚡ Rush Sprint",
    subtitle: "24–48h Priority Queue",
    multiplier: 1.25,
    timeFactor: 0.65,
    badge: "+25% Acceleration",
  },
  {
    id: "standard",
    name: "🚀 Standard Agile",
    subtitle: "3–5 Days Delivery",
    multiplier: 1.0,
    timeFactor: 1.0,
    badge: "Recommended",
  },
  {
    id: "staged",
    name: "🛠 Staged Phased",
    subtitle: "1–2 Weeks Milestones",
    multiplier: 0.95,
    timeFactor: 1.4,
    badge: "5% Multi-Stage Discount",
  },
];

export default function ProjectCalculator() {
  const weeklyHoursSliderId = useId();

  // State: Selected module IDs (defaulting to Automation + AI Agent for a compelling starter quote)
  const [selectedIds, setSelectedIds] = useState<string[]>([
    "automation",
    "ai-agent",
  ]);

  // State: Weekly repetitive hours (slider)
  const [weeklyRepetitiveHours, setWeeklyRepetitiveHours] = useState<number>(14);

  // State: Target timeline sprint mode
  const [timeline, setTimeline] = useState<TimelineMode>("standard");

  // State: Currency view toggle ("INR" | "USD")
  const [currency, setCurrency] = useState<"INR" | "USD">("INR");

  // State: Copy feedback states
  const [copiedBlueprint, setCopiedBlueprint] = useState<boolean>(false);
  const [lockedInNotification, setLockedInNotification] = useState<string | null>(null);

  // Toggle module selection
  const toggleModule = (id: string) => {
    soundFx.playHover();
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        // Prevent deselecting everything to maintain a meaningful live quote
        if (prev.length === 1) return prev;
        return prev.filter((item) => item !== id);
      }
      return [...prev, id];
    });
  };

  // Calculations
  const selectedModules = CALCULATOR_MODULES.filter((m) => selectedIds.includes(m.id));
  const activeTimeline = TIMELINE_OPTIONS.find((t) => t.id === timeline) || TIMELINE_OPTIONS[1];

  // Base costs
  const rawInr = selectedModules.reduce((sum, m) => sum + m.inrPrice, 0);
  const rawUsd = selectedModules.reduce((sum, m) => sum + m.usdPrice, 0);

  // Multi-module bundle discount: 2 items = 5%, 3-4 = 10%, 5+ = 15%
  let bundleDiscountPercent = 0;
  if (selectedModules.length >= 5) bundleDiscountPercent = 15;
  else if (selectedModules.length >= 3) bundleDiscountPercent = 10;
  else if (selectedModules.length === 2) bundleDiscountPercent = 5;

  const discountMultiplier = 1 - bundleDiscountPercent / 100;
  const effectiveInr = Math.round(
    (rawInr * discountMultiplier * activeTimeline.multiplier) / 500
  ) * 500;
  const effectiveUsd = Math.round(
    (rawUsd * discountMultiplier * activeTimeline.multiplier) / 5
  ) * 5;

  // Turnaround estimation
  const maxBaseHours = Math.max(...selectedModules.map((m) => m.turnaroundHours), 8);
  // Add 25% integration buffer for multiple interconnected modules
  const totalAdjustedHours = Math.round(
    (maxBaseHours + (selectedModules.length - 1) * 8) * activeTimeline.timeFactor
  );

  let formattedTurnaround = "";
  if (totalAdjustedHours <= 16) {
    formattedTurnaround = `Same-Day (${totalAdjustedHours} Hours)`;
  } else if (totalAdjustedHours <= 48) {
    formattedTurnaround = `24–48 Hours`;
  } else {
    const days = Math.ceil(totalAdjustedHours / 24);
    formattedTurnaround = `${days}–${days + 2} Days`;
  }

  // Monthly Hours Saved & ROI Calculations
  const baseModuleHoursSaved = selectedModules.reduce((sum, m) => sum + m.monthlyHoursSaved, 0);
  const teamMonthlyManualHours = Math.round(weeklyRepetitiveHours * 4.2);
  // Automation efficiency factor: AI + Automation yields ~75% reclaimed time
  const hasAiOrAuto = selectedIds.includes("ai-agent") || selectedIds.includes("automation");
  const efficiencyRate = hasAiOrAuto ? 0.75 : 0.45;
  const teamHoursReclaimed = Math.round(teamMonthlyManualHours * efficiencyRate);
  const totalMonthlyHoursSaved = baseModuleHoursSaved + teamHoursReclaimed;

  // Financial Value Reclaimed
  const inrSavingsPerMonth = totalMonthlyHoursSaved * 800; // conservative ₹800/hr blended cost
  const usdSavingsPerMonth = totalMonthlyHoursSaved * 15; // conservative $15/hr blended cost

  // Payback period (Days to break-even)
  const currentCost = currency === "INR" ? effectiveInr : effectiveUsd;
  const currentMonthlySavings = currency === "INR" ? inrSavingsPerMonth : usdSavingsPerMonth;
  const paybackDays = Math.max(
    3,
    Math.min(90, Math.round((currentCost / Math.max(1, currentMonthlySavings)) * 30))
  );

  // Generate structured blueprint text for clipboard / WhatsApp / Form prefill
  const generateBlueprintText = () => {
    return [
      "╔═══════════════════════════════════════════════════════════╗",
      "  SAM CODES — PROJECT SCOPE & ROI BLUEPRINT                ",
      "╚═══════════════════════════════════════════════════════════╝",
      `• Selected Modules (${selectedModules.length}):`,
      ...selectedModules.map((m) => `   - [x] ${m.name} (${m.category})`),
      `• Weekly Team Repetitive Work: ${weeklyRepetitiveHours} hrs/week (~${teamMonthlyManualHours} hrs/month)`,
      `• Delivery Sprint Velocity: ${activeTimeline.name} (${formattedTurnaround})`,
      `• Estimated Investment: ₹${effectiveInr.toLocaleString("en-IN")} INR (~$${effectiveUsd.toLocaleString("en-US")} USD)`,
      bundleDiscountPercent > 0 ? `• Multi-Module Bundle Discount: ${bundleDiscountPercent}% OFF Applied` : "",
      `• Projected Time Saved: ~${totalMonthlyHoursSaved} hours / month`,
      `• Estimated Payback Period: ~${paybackDays} Days to Break-Even`,
      "-------------------------------------------------------------",
      "Ready to review and lock in scope with Samarth (@Sam_CodeAI).",
    ]
      .filter(Boolean)
      .join("\n");
  };

// Compact short codes for 64-character Telegram deep-link constraint
const MODULE_SHORT_CODES: Record<string, string> = {
  "quick-script": "patch",
  "automation": "auto",
  "ai-agent": "agent",
  "webapp": "web",
  "database-auth": "db",
  "payments": "pay",
};

/**
 * Resilient cross-browser clipboard copy with execCommand fallback
 */
async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback below
    }
  }

  if (typeof document !== "undefined") {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      textarea.style.top = "-9999px";
      textarea.setAttribute("readonly", "");
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const success = document.execCommand("copy");
      document.body.removeChild(textarea);
      return success;
    } catch {
      return false;
    }
  }

  return false;
}

  // Lock In CTA: copies brief, pre-fills inquiry form, and smoothly navigates
  const handleLockInQuote = async () => {
    soundFx.playChime(640, 0.12);
    const blueprint = generateBlueprintText();

    // 1. Copy to clipboard with resilient fallback
    await copyToClipboard(blueprint);

    // 2. Dispatch custom event for ContactSection form auto-fill
    if (typeof window !== "undefined") {
      const primaryService = selectedModules.some((m) => m.id === "ai-agent")
        ? "AI Chatbots & Assistants"
        : selectedModules.some((m) => m.id === "automation")
        ? "Workflow & Business Automation"
        : selectedModules.some((m) => m.id === "webapp")
        ? "Websites & Web Applications"
        : "Custom Project Scope";

      const event = new CustomEvent("samcodes:apply-scope", {
        detail: {
          service: primaryService,
          message: blueprint,
        },
      });
      window.dispatchEvent(event);
    }

    setLockedInNotification("Scope locked in! Pre-filling your inquiry brief below...");
    setTimeout(() => setLockedInNotification(null), 4000);

    // 3. Smooth scroll down to #contact
    const contactElem = document.getElementById("contact");
    if (contactElem) {
      contactElem.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Copy blueprint to clipboard only
  const handleCopyBlueprint = async () => {
    soundFx.playChime(560, 0.08);
    const blueprint = generateBlueprintText();
    const copied = await copyToClipboard(blueprint);
    if (copied) {
      setCopiedBlueprint(true);
      setTimeout(() => setCopiedBlueprint(false), 2500);
    }
  };

  // WhatsApp pre-filled direct inquiry link
  const whatsappUrl = `https://wa.me/916361209256?text=${encodeURIComponent(
    `Hello Sam, I configured this project blueprint on your site:\n\n${generateBlueprintText()}`
  )}`;

  // Telegram pre-filled direct inquiry link (under 64-char limit for Telegram deep-linking)
  const telegramPayload = selectedIds.map((id) => MODULE_SHORT_CODES[id] || id).join("_");
  const telegramUrl = `${CONTACT_CONFIG.TELEGRAM_BOT_URL}?start=calc_${telegramPayload}`;

  return (
    <section
      id="calculator"
      aria-label="Interactive Project Scope and ROI Estimator"
      className="relative py-24 sm:py-32 px-4 sm:px-6 max-w-6xl mx-auto border-t border-white/[0.06]"
    >
      {/* Section Header */}
      <MotionReveal className="flex flex-col items-center text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-emerald-400 mb-4 uppercase tracking-wider">
          <Calculator size={13} className="text-emerald-400" />
          Interactive Scope &amp; ROI Estimator
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
          Calculate Your Project &amp; Return
        </h2>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed mb-6">
          Pick the exact capabilities you need. Get transparent pricing in ₹ INR and $ USD, realistic delivery turnaround, and projected monthly time reclaimed.
        </p>

        {/* Currency Switcher Toggle */}
        <div
          role="group"
          aria-label="Currency Selector"
          className="inline-flex items-center p-1 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-md"
        >
          <button
            type="button"
            onClick={() => {
              soundFx.playHover();
              setCurrency("INR");
            }}
            aria-pressed={currency === "INR"}
            className={`px-4 py-2 rounded-full text-xs font-mono font-medium transition-all cursor-pointer min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#090d1a] ${
              currency === "INR"
                ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            ₹ INR (Indian Rupee)
          </button>
          <button
            type="button"
            onClick={() => {
              soundFx.playHover();
              setCurrency("USD");
            }}
            aria-pressed={currency === "USD"}
            className={`px-4 py-2 rounded-full text-xs font-mono font-medium transition-all cursor-pointer min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#090d1a] ${
              currency === "USD"
                ? "bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            $ USD (Global)
          </button>
        </div>
      </MotionReveal>

      {/* Toast Notification Banner */}
      {lockedInNotification && (
        <div
          role="status"
          aria-live="polite"
          className="mb-8 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-mono flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <div className="flex items-center gap-2.5">
            <Check size={16} className="text-emerald-400 shrink-0" />
            <span>{lockedInNotification}</span>
          </div>
          <span className="text-[11px] opacity-75 font-mono">Scrolling to brief...</span>
        </div>
      )}

      {/* Main 2026 Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Module Selectors & Business Metrics (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Bento Subcard 1: Modular System Selector */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider block mb-1">
                  STEP 01 // ARCHITECTURE BLOCKS
                </span>
                <h3 className="text-lg font-bold text-white">Select Required Modules</h3>
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-slate-300">
                {selectedModules.length} of {CALCULATOR_MODULES.length} Selected
              </span>
            </div>

            {/* Modules Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {CALCULATOR_MODULES.map((mod) => {
                const isSelected = selectedIds.includes(mod.id);
                const Icon = mod.icon;

                return (
                  <div
                    key={mod.id}
                    role="checkbox"
                    tabIndex={0}
                    aria-checked={isSelected}
                    aria-label={`${mod.name}, ${mod.category}`}
                    onClick={() => toggleModule(mod.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleModule(mod.id);
                      }
                    }}
                    className={`relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between group select-none min-h-[140px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#090d1a] ${
                      isSelected
                        ? "bg-indigo-950/20 border-indigo-500/40 shadow-sm shadow-indigo-500/10 ring-1 ring-indigo-500/30"
                        : "bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                            isSelected
                              ? "bg-indigo-500/20 text-indigo-400"
                              : "bg-white/[0.04] text-slate-400 group-hover:text-slate-200"
                          }`}
                        >
                          <Icon size={16} />
                        </div>

                        <div className="flex items-center gap-1.5">
                          {mod.badge && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-slate-300">
                              {mod.badge}
                            </span>
                          )}
                          <div
                            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                              isSelected
                                ? "bg-emerald-500 border-emerald-400 text-slate-950"
                                : "border-white/[0.15] bg-white/[0.02]"
                            }`}
                          >
                            {isSelected && <Check size={12} strokeWidth={3} />}
                          </div>
                        </div>
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-white mb-1 leading-snug group-hover:text-indigo-300 transition-colors">
                        {mod.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2 mb-3">
                        {mod.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] font-mono">
                      <span className="text-emerald-400 font-semibold">
                        {currency === "INR"
                          ? `₹${mod.inrPrice.toLocaleString("en-IN")}`
                          : `$${mod.usdPrice.toLocaleString("en-US")}`}
                      </span>
                      <span className="text-slate-400 text-[10px]">
                        +{mod.monthlyHoursSaved}h/mo saved
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {bundleDiscountPercent > 0 && (
              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono flex items-center gap-2">
                <Sparkles size={14} className="shrink-0 text-indigo-400" />
                <span>
                  Bundle Applied: <strong>{bundleDiscountPercent}% Multi-Module Discount</strong> on combined engineering scope.
                </span>
              </div>
            )}
          </div>

          {/* Bento Subcard 2: Business Metrics & Sprint Velocity */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm space-y-6">
            <div>
              <span className="text-xs font-mono text-sky-400 uppercase tracking-wider block mb-1">
                STEP 02 // BUSINESS CONTEXT &amp; VELOCITY
              </span>
              <h3 className="text-lg font-bold text-white">Workload &amp; Delivery Target</h3>
            </div>

            {/* Slider: Weekly Repetitive Hours */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <label
                  htmlFor={weeklyHoursSliderId}
                  className="text-slate-300 font-medium cursor-pointer"
                >
                  Hours your team spends weekly on repetitive manual tasks:
                </label>
                <span className="px-3 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-sky-400 font-bold">
                  {weeklyRepetitiveHours} hrs / week
                </span>
              </div>

              <input
                id={weeklyHoursSliderId}
                type="range"
                min={2}
                max={50}
                step={1}
                value={weeklyRepetitiveHours}
                onChange={(e) => {
                  setWeeklyRepetitiveHours(parseInt(e.target.value, 10));
                }}
                className="w-full h-2 bg-white/[0.08] rounded-lg appearance-none cursor-pointer accent-sky-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#090d1a]"
                aria-label="Hours spent weekly on repetitive tasks"
                aria-valuemin={2}
                aria-valuemax={50}
                aria-valuenow={weeklyRepetitiveHours}
              />

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>2 hrs (Minimal)</span>
                <span>~{teamMonthlyManualHours} hours/month team overhead</span>
                <span>50 hrs (Heavy bottleneck)</span>
              </div>
            </div>

            {/* Delivery Timeline Mode Toggles */}
            <div className="space-y-2.5">
              <span className="text-xs font-mono text-slate-300 block uppercase tracking-wider">
                Target Delivery Velocity:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {TIMELINE_OPTIONS.map((opt) => {
                  const isTimelineActive = timeline === opt.id;

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        soundFx.playHover();
                        setTimeline(opt.id);
                      }}
                      aria-pressed={isTimelineActive}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer min-h-[44px] flex flex-col justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#090d1a] ${
                        isTimelineActive
                          ? "bg-sky-500/10 border-sky-400/40 text-white ring-1 ring-sky-400/30"
                          : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-white hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="text-xs font-bold text-white mb-0.5">{opt.name}</div>
                      <div className="text-[11px] font-mono text-slate-400 mb-2">
                        {opt.subtitle}
                      </div>
                      {opt.badge && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.08] text-sky-300 w-fit">
                          {opt.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Real-Time Dynamic Quote & ROI HUD (5 cols) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          <SpotlightCard
            spotlightColor="rgba(56, 189, 248, 0.15)"
            borderColor="rgba(56, 189, 248, 0.35)"
            className="p-6 sm:p-8 rounded-3xl bg-[#090d1a]/80 border border-white/[0.08] backdrop-blur-xl space-y-6 shadow-2xl"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap size={13} className="text-emerald-400" />
                  REAL-TIME ESTIMATED SCOPE
                </span>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Fixed Milestone Price
                </span>
              </div>

              {/* Price Highlight */}
              <div className="mb-2">
                <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-indigo-200 to-emerald-300 tracking-tight">
                  {currency === "INR"
                    ? `₹${effectiveInr.toLocaleString("en-IN")} INR`
                    : `$${effectiveUsd.toLocaleString("en-US")} USD`}
                </div>
                <div className="text-xs font-mono text-slate-400 mt-1">
                  {currency === "INR"
                    ? `Equivalent to ~$${effectiveUsd.toLocaleString("en-US")} USD`
                    : `Equivalent to ~₹${effectiveInr.toLocaleString("en-IN")} INR`}
                </div>
              </div>
            </div>

            {/* Key Metric Bento Tiles */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 mb-1">
                  <Clock size={12} className="text-sky-400" />
                  <span>TURNAROUND</span>
                </div>
                <div className="text-sm font-bold text-white">{formattedTurnaround}</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 mb-1">
                  <TrendingUp size={12} className="text-emerald-400" />
                  <span>TIME RECLAIMED</span>
                </div>
                <div className="text-sm font-bold text-emerald-400">
                  ~{totalMonthlyHoursSaved} hrs / mo
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 mb-1">
                  <Sparkles size={12} className="text-indigo-400" />
                  <span>MONTHLY VALUE</span>
                </div>
                <div className="text-sm font-bold text-white font-mono">
                  {currency === "INR"
                    ? `~₹${inrSavingsPerMonth.toLocaleString("en-IN")}`
                    : `~$${usdSavingsPerMonth.toLocaleString("en-US")}`}
                  <span className="text-[10px] text-slate-400 block font-normal">reclaimed / month</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400 mb-1">
                  <ShieldCheck size={12} className="text-amber-400" />
                  <span>PAYBACK SPEED</span>
                </div>
                <div className="text-sm font-bold text-amber-300">
                  ~{paybackDays} Days
                  <span className="text-[10px] text-slate-400 block font-normal">to full break-even</span>
                </div>
              </div>
            </div>

            {/* Selected Modules Summary Pills */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-mono text-slate-400 block uppercase tracking-wider">
                Included in This Blueprint:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedModules.map((m) => (
                  <span
                    key={m.id}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-slate-300"
                  >
                    ✓ {m.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Primary Action Button */}
            <div className="space-y-2.5 pt-3 border-t border-white/[0.06]">
              <button
                type="button"
                onClick={handleLockInQuote}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-sky-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-sky-500/20 cursor-pointer min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#090d1a]"
              >
                <span>Lock In This Scope &amp; Quote</span>
                <ArrowRight size={15} />
              </button>

              {/* Secondary Utilities */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleCopyBlueprint}
                  className="py-2.5 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white text-[11px] font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                >
                  {copiedBlueprint ? (
                    <>
                      <Check size={13} className="text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Copy Brief</span>
                    </>
                  )}
                </button>

                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => soundFx.playHover()}
                  className="py-2.5 px-3 rounded-xl bg-white/[0.04] hover:bg-[#229ED9]/20 border border-white/[0.08] hover:border-[#229ED9]/40 text-slate-300 hover:text-[#229ED9] text-[11px] font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                >
                  <Send size={13} />
                  <span>Telegram</span>
                </a>
              </div>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => soundFx.playHover()}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-300 text-[11px] font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                <MessageCircle size={14} className="text-emerald-400" />
                <span>Discuss Scope Directly on WhatsApp</span>
              </a>

              <p className="text-[10px] font-mono text-slate-400 text-center leading-relaxed">
                Direct builder transparency · 100% test verification · No agency markup
              </p>
            </div>
          </SpotlightCard>
        </div>
      </div>
    </section>
  );
}
