"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  PhoneCall,
  ShieldCheck,
  Clock,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle2,
  Users,
  Settings,
  Flame,
  ArrowLeft,
  ExternalLink,
  Sliders,
  Send,
  Radio,
  FileText,
  Volume2,
} from "lucide-react";
import { APEX_CLIENT_PROFILE } from "@/lib/telephony/apex-knowledge";

interface CallLogItem {
  id: string;
  caller: string;
  location: string;
  timestamp: string;
  duration: string;
  consent: "GRANTED (DTMF 1)" | "REVOKED (DTMF 9)" | "TIMED_OUT";
  category: "EMERGENCY_AC" | "WATER_HEATER" | "PRICING_INQUIRY" | "TUNE_UP";
  priority: "HIGH" | "NORMAL";
  summary: string;
  address: string;
  status: "DISPATCHED" | "NEEDS_CALL" | "COMPLETED";
}

export default function ApexBridgeViewPortal() {
  const [activeTab, setActiveTab] = useState<"calls" | "dispatch" | "knowledge">("calls");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [activeTech, setActiveTech] = useState("Mike Reynolds (Lead / Van 1)");
  const [calls, setCalls] = useState<CallLogItem[]>([
    {
      id: "call_94821",
      caller: "+1 (813) 492-8812",
      location: "Spring Hill, FL",
      timestamp: "Today at 2:14 PM",
      duration: "1m 42s",
      consent: "GRANTED (DTMF 1)",
      category: "EMERGENCY_AC",
      priority: "HIGH",
      summary: "AC condenser frozen over, house is 88°F inside. Caller accepted $89 diagnostic fee.",
      address: "14298 Mariner Blvd, Spring Hill, FL",
      status: "NEEDS_CALL",
    },
    {
      id: "call_94819",
      caller: "+1 (727) 831-2940",
      location: "Clearwater, FL",
      timestamp: "Today at 1:28 PM",
      duration: "2m 10s",
      consent: "GRANTED (DTMF 1)",
      category: "WATER_HEATER",
      priority: "HIGH",
      summary: "50-gallon tank leaking into garage. Inquired about same-day replacement.",
      address: "2910 Gulf to Bay Blvd, Clearwater, FL",
      status: "DISPATCHED",
    },
    {
      id: "call_94815",
      caller: "+1 (813) 902-1144",
      location: "Tampa, FL",
      timestamp: "Today at 11:05 AM",
      duration: "58s",
      consent: "GRANTED (DTMF 1)",
      category: "PRICING_INQUIRY",
      priority: "NORMAL",
      summary: "Asked about Apex Comfort Club annual maintenance tune-up plan pricing ($159/yr).",
      address: "Tampa Bay Palms, Apt 4B",
      status: "COMPLETED",
    },
  ]);

  const toggleDispatch = (id: string) => {
    setCalls((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: c.status === "NEEDS_CALL" ? "DISPATCHED" : "COMPLETED" } : c))
    );
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 font-sans antialiased">
      {/* Top Bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur sticky top-0 z-50 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/demos/apex-hvac"
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold text-sm">
              BV
            </div>
            <div>
              <span className="font-bold text-sm text-white">BridgeView™ Client Portal</span>
              <span className="text-xs text-slate-400 block">Apex Air &amp; Plumbing • Spring Hill, FL</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-xs text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>AI Receptionist Line: +1 (814) 961-3703 (Active)</span>
            </div>
            <Link
              href="/demos/apex-hvac"
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <span>View Public Website</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Today&apos;s Inbound Calls</span>
            <div className="text-2xl font-black text-white mt-1">18 Calls</div>
            <span className="text-[11px] text-emerald-400 mt-1 block">100% Picked Up on Ring 1</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Emergency Dispatches</span>
            <div className="text-2xl font-black text-amber-400 mt-1">4 Routed</div>
            <span className="text-[11px] text-slate-400 mt-1 block">Avg Van ETA: 38 mins</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Caller Consent Rate</span>
            <div className="text-2xl font-black text-cyan-400 mt-1">94.4%</div>
            <span className="text-[11px] text-slate-400 mt-1 block">FL 2-Party Compliance Active</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Estimated Revenue Saved</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">$2,450</div>
            <span className="text-[11px] text-slate-400 mt-1 block">5 calls captured while in attic</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 mb-6 gap-2">
          <button
            onClick={() => setActiveTab("calls")}
            className={`pb-3 px-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === "calls"
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <PhoneCall className="w-4 h-4" />
            <span>Live Call Feed &amp; Transcripts</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">3</span>
          </button>

          <button
            onClick={() => setActiveTab("dispatch")}
            className={`pb-3 px-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === "dispatch"
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>On-Call Van Dispatcher</span>
          </button>

          <button
            onClick={() => setActiveTab("knowledge")}
            className={`pb-3 px-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === "knowledge"
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Approved Knowledge Rules</span>
          </button>
        </div>

        {/* Tab 1: Live Call Feed */}
        {activeTab === "calls" && (
          <div className="space-y-4">
            {calls.map((call) => (
              <div
                key={call.id}
                className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row gap-4 justify-between"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-base text-white">{call.caller}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400">{call.location}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                      {call.consent}
                    </span>
                    {call.priority === "HIGH" && (
                      <span className="text-xs px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        EMERGENCY DISPATCH
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-slate-200">{call.summary}</p>

                  <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                    <span>Address: {call.address}</span>
                    <span>•</span>
                    <span>{call.timestamp}</span>
                    <span>•</span>
                    <span>Duration: {call.duration}</span>
                  </div>
                </div>

                <div className="flex flex-row md:flex-col items-end justify-between gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                  <button
                    onClick={() => setPlayingId(playingId === call.id ? null : call.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                  >
                    {playingId === call.id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{playingId === call.id ? "Playing Audio..." : "Listen Call"}</span>
                  </button>

                  <button
                    onClick={() => toggleDispatch(call.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      call.status === "NEEDS_CALL"
                        ? "bg-amber-500 hover:bg-amber-400 text-slate-950"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{call.status === "NEEDS_CALL" ? "Dispatch Van" : "Dispatched to Tech"}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Dispatch Routing */}
        {activeTab === "dispatch" && (
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 max-w-2xl">
            <h3 className="text-lg font-bold text-white mb-2">On-Call Van &amp; Human Fallback Routing</h3>
            <p className="text-sm text-slate-300 mb-6">
              When an urgent call arrives or if the AI watchdog experiences latency above 1,200ms, calls are automatically
              transferred to the active technician&apos;s mobile number.
            </p>

            <div className="space-y-3">
              {[
                { name: "Mike Reynolds (Lead / Van 1)", phone: "(813) 555-0199", status: "Primary Active" },
                { name: "Dave Miller (Emergency HVAC / Van 2)", phone: "(813) 555-0144", status: "Standby" },
                { name: "Carlos Ortiz (Master Plumber / Van 3)", phone: "(727) 555-0182", status: "Standby" },
              ].map((tech) => (
                <div
                  key={tech.name}
                  onClick={() => setActiveTech(tech.name)}
                  className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    activeTech === tech.name
                      ? "bg-amber-500/10 border-amber-500/40 text-white"
                      : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div>
                    <span className="font-bold text-sm block">{tech.name}</span>
                    <span className="text-xs text-slate-400">{tech.phone}</span>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                      activeTech === tech.name ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {activeTech === tech.name ? "Active Fallback" : "Standby"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Approved Knowledge Rules */}
        {activeTab === "knowledge" && (
          <div className="space-y-4 max-w-4xl">
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
              <span className="font-bold">Invariant: Approved Knowledge Only.</span> The AI is strictly bounded by these 5
              rules. Any customer question not covered here is automatically flagged for Mike to call back.
            </div>

            <div className="grid grid-cols-1 gap-4">
              {APEX_CLIENT_PROFILE.knowledgeBase.map((item) => (
                <div key={item.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-mono tracking-wider text-amber-400 font-bold">
                      {item.category}
                    </span>
                    {item.isEmergencyTrigger && (
                      <span className="text-[11px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded font-semibold">
                        Emergency Trigger
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-white">&quot;{item.question}&quot;</h4>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                    {item.approvedAnswer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
