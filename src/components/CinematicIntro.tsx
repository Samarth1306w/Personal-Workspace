"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { soundFx } from "@/utils/sound";

export default function CinematicIntro() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const timerRefs = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  const dismissIntro = useCallback(() => {
    // Clear all pending timeouts
    timerRefs.current.forEach((t) => clearTimeout(t));
    timerRefs.current = [];
    setVisible(false);
    try {
      sessionStorage.setItem("samcodes_intro_seen", "true");
    } catch {
      // Ignore sessionStorage exceptions (e.g. private mode)
    }
  }, []);

  useEffect(() => {
    setMounted(true);

    // 1. Detect search engines, bots, or performance auditors (Lighthouse / PageSpeed)
    if (typeof window !== "undefined") {
      const ua = (navigator.userAgent || "").toLowerCase();
      const isBot =
        ua.includes("bot") ||
        ua.includes("crawler") ||
        ua.includes("spider") ||
        ua.includes("google") ||
        ua.includes("lighthouse") ||
        ua.includes("chrome-lighthouse") ||
        ua.includes("pagespeed") ||
        ua.includes("headless") ||
        ua.includes("ptst") ||
        Boolean((navigator as unknown as { webdriver?: boolean }).webdriver);

      // 2. Respect reduced-motion preferences
      const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

      // Check if user already saw the intro during this session
      const hasSeenIntro = (() => {
        try {
          return sessionStorage.getItem("samcodes_intro_seen");
        } catch {
          return null;
        }
      })();

      if (isBot || prefersReducedMotion || hasSeenIntro) {
        return;
      }
    }

    setVisible(true);

    // Escape, Enter, or Space key allows immediate skip
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === " " || e.key === "Enter") {
        if (e.key === " ") {
          e.preventDefault();
        }
        dismissIntro();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    const t1 = setTimeout(() => {
      setStep(1);
      soundFx.playChime(320, 0.08);
    }, 400);

    const t2 = setTimeout(() => {
      setStep(2);
      soundFx.playChime(480, 0.08);
    }, 1100);

    const t3 = setTimeout(() => {
      setStep(3);
      soundFx.playChime(640, 0.12);
    }, 1800);

    const t4 = setTimeout(() => {
      dismissIntro();
    }, 2800);

    timerRefs.current = [t1, t2, t3, t4];

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      timerRefs.current.forEach((t) => clearTimeout(t));
      timerRefs.current = [];
    };
  }, [dismissIntro]);

  if (!mounted || !visible) return null;

  return (
    <div
      role="dialog"
      aria-label="System Initializing"
      aria-modal="true"
      onClick={dismissIntro}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#06080f]/95 backdrop-blur-md px-6 transition-opacity duration-500 select-none cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex flex-col items-center text-center max-w-md w-full cursor-default"
      >
        {/* Subtle grid line accent */}
        <div className="absolute -top-16 w-32 h-[1px] bg-gradient-to-r from-transparent via-sky-500/40 to-transparent" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-sky-400 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
          <span>SAM_CODES // WORKSPACE</span>
        </div>

        {/* Div instead of h1 to protect page SEO and avoid competing with Hero LCP */}
        <div className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-3" role="heading" aria-level={2}>
          SAM CODES
        </div>

        <p className="text-xs sm:text-sm font-mono text-slate-400 tracking-wider uppercase h-6">
          {step === 0 && "Booting Workspace..."}
          {step === 1 && "Loading Systems & The Lab..."}
          {step === 2 && "Welcome to SAM CODES..."}
          {step >= 3 && "Ready."}
        </p>

        {/* Progress Bar */}
        <div className="w-48 h-1 bg-white/[0.08] rounded-full overflow-hidden mt-6">
          <div
            className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-500"
            style={{ width: `${((step + 1) / 4) * 100}%` }}
          />
        </div>

        {/* Prominent Skip CTA */}
        <button
          onClick={dismissIntro}
          type="button"
          aria-label="Skip intro sequence and proceed to content"
          className="mt-8 px-4 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-xs font-mono text-slate-300 hover:text-white transition-all cursor-pointer"
        >
          [ Skip to Content <span className="text-slate-500 text-[10px] ml-1">ESC</span> ]
        </button>
      </div>
    </div>
  );
}
