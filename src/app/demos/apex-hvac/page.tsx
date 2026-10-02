"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  PhoneCall,
  ShieldCheck,
  Clock,
  MapPin,
  Flame,
  Snowflake,
  Wrench,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Send,
  ArrowRight,
  ExternalLink,
  Lock,
} from "lucide-react";
import { APEX_CLIENT_PROFILE, queryApprovedKnowledge } from "@/lib/telephony/apex-knowledge";

export default function ApexHvacLandingPage() {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: "ai" | "user"; text: string; emergency?: boolean }>>([
    {
      sender: "ai",
      text: "Hello! I am the automated virtual assistant for Apex Air & Plumbing. How can we help you today? (Ask about our $89 diagnostic fee, emergency service, or areas served).",
    },
  ]);
  const [inputVal, setInputVal] = useState("");

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userText = inputVal.trim();
    const evaluation = queryApprovedKnowledge(userText);

    setMessages((prev) => [
      ...prev,
      { sender: "user", text: userText },
      { sender: "ai", text: evaluation.answer, emergency: evaluation.isEmergency },
    ]);
    setInputVal("");
  };

  return (
    <div className="min-h-screen bg-[#080d16] text-slate-100 font-sans antialiased selection:bg-amber-500/30">
      {/* Top Banner: Bridge Builders Implementation Demo Switcher */}
      <div className="bg-slate-900/90 border-b border-slate-800 text-xs py-2 px-4 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-white">Live Client Demonstration:</span>
            <span>Apex Air & Plumbing (Client ID: apex-hvac)</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/demos/apex-hvac/portal"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 rounded font-medium border border-amber-500/30 transition-colors"
            >
              <Lock className="w-3 h-3" />
              <span>Open Mike&apos;s BridgeView Portal</span>
              <ExternalLink className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-black text-slate-950 text-xl shadow-lg shadow-orange-500/20">
              ▲
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white block">APEX AIR &amp; PLUMBING</span>
              <span className="text-xs text-amber-400 font-medium tracking-wide">SPRING HILL &amp; TAMPA BAY, FL</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs text-slate-400">24/7 Emergency Dispatch</span>
              <span className="text-sm font-bold text-white tracking-wide">(813) 555-0199</span>
            </div>
            <a
              href="tel:+18149613703"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold px-4 py-2.5 rounded-lg text-sm shadow-md shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <PhoneCall className="w-4 h-4 animate-bounce" />
              <span>Call 24/7 Receptionist</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <section className="relative pt-12 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-amber-500/10 blur-[130px] rounded-full" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-6">
            <Clock className="w-3.5 h-3.5" />
            <span>Average Emergency Van Arrival: 45 Minutes Across Pasco &amp; Hernando</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6">
            When Your AC Fails in Florida Heat, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200">
              Every Minute Counts.
            </span>
          </h1>

          <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
            Same-day residential air conditioning repair, heat pump replacement, and emergency plumbing. Upfront pricing,
            zero sales pressure, and an $89 diagnostic fee that is waived when you approve the repair.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="tel:+18149613703"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-base shadow-xl shadow-amber-500/25 transition-all"
            >
              <PhoneCall className="w-5 h-5" />
              <span>Call Live AI Receptionist Now</span>
            </a>
            <button
              onClick={() => setChatOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-semibold text-base transition-all"
            >
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Check Approved Pricing &amp; FAQs</span>
            </button>
          </div>
        </div>
      </section>

      {/* Bento Grid: 3 Pillars of Client Offering */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Transparent Pricing */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">$89 Flat Diagnostic Fee</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              We arrive in a fully stocked van, isolate your breakdown, and provide a binding written price before touching a
              tool. If you approve the repair, the $89 fee is credited to your bill.
            </p>
          </div>

          {/* Card 2: 24/7 AI Receptionist & Handoff */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4">
              <PhoneCall className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">24/7 Zero-Wait Phone Line</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              No endless voicemail loops. Our AI phone assistant picks up on ring 1, verifies Florida caller consent, captures
              your emergency details, and alerts Mike&apos;s phone immediately.
            </p>
          </div>

          {/* Card 3: Comfort Club Plan */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center mb-4">
              <Wrench className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Apex Comfort Club ($159/yr)</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Two comprehensive 21-point system inspections per year, priority booking when hurricane season hits, and 15% off
              all parts and emergency labor.
            </p>
          </div>
        </div>
      </section>

      {/* Floating AI Customer Assistant Widget */}
      <div className="fixed bottom-6 right-6 z-40">
        {!chatOpen ? (
          <button
            onClick={() => setChatOpen(true)}
            className="flex items-center gap-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold px-4 py-3 rounded-full shadow-2xl hover:scale-105 transition-all"
          >
            <Sparkles className="w-5 h-5" />
            <span>Ask Virtual Assistant</span>
          </button>
        ) : (
          <div className="w-[360px] sm:w-[400px] h-[520px] rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
            {/* Chat Header */}
            <div className="bg-slate-900 p-3.5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="font-bold text-sm text-white">Apex Virtual Assistant</span>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded bg-slate-800"
              >
                Close
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 text-sm">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl max-w-[85%] ${
                    m.sender === "user"
                      ? "bg-amber-500 text-slate-950 font-medium ml-auto"
                      : "bg-slate-900 border border-slate-800 text-slate-200"
                  }`}
                >
                  {m.text}
                </div>
              ))}
            </div>

            {/* Quick Prompts */}
            <div className="p-2 border-t border-slate-800 bg-slate-900/50 flex gap-1.5 overflow-x-auto text-[11px]">
              <button
                onClick={() => setInputVal("How much for a diagnostic visit?")}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded whitespace-nowrap"
              >
                Diagnostic Fee?
              </button>
              <button
                onClick={() => setInputVal("My AC stopped cooling today")}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded whitespace-nowrap"
              >
                AC Emergency?
              </button>
              <button
                onClick={() => setInputVal("What areas do you serve?")}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded whitespace-nowrap"
              >
                Areas Served?
              </button>
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-2.5 border-t border-slate-800 bg-slate-900 flex gap-2">
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Ask about pricing or emergency dispatch..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-2 rounded-lg font-bold text-xs"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
