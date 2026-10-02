"use client";

import React from "react";
import { servicesData, ServiceOffering } from "@/data/services";
import { soundFx } from "@/utils/sound";
import SpotlightCard from "@/components/SpotlightCard";
import MotionReveal from "@/components/MotionReveal";
import { Wrench, ArrowUpRight, Check, Calculator, ArrowDown } from "lucide-react";

export default function ServicesSection({
  services = servicesData,
}: {
  services?: ServiceOffering[];
}) {
  return (
    <section
      id="services"
      aria-label="Services & Systems"
      className="relative py-24 sm:py-32 px-4 sm:px-6 max-w-6xl mx-auto border-t border-white/[0.06]"
    >
      <MotionReveal className="flex flex-col items-center text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-indigo-400 mb-4 uppercase tracking-wider">
          <Wrench size={13} className="text-indigo-400" />
          What I Can Build For You
        </div>

        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
          Services &amp; Systems
        </h2>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl font-normal leading-relaxed">
          I build focused digital systems for people who have something worth automating, improving, or launching.
        </p>
      </MotionReveal>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((svc: ServiceOffering, idx: number) => (
          <MotionReveal key={svc.id} delay={idx * 0.08}>
            <SpotlightCard
              onMouseEnter={() => soundFx.playHover()}
              spotlightColor="rgba(129, 140, 248, 0.15)"
              borderColor="rgba(129, 140, 248, 0.35)"
              className="p-8 h-full flex flex-col justify-between group cursor-default"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider">
                    SYSTEM // 0{idx + 1}
                  </span>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-slate-300">
                    Direct With Sam
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                  {svc.title}
                </h3>

                <p className="text-xs font-mono text-slate-400 mb-3">
                  {svc.tagline}
                </p>

                {svc.pricing && (
                  <div className="flex flex-wrap items-center gap-2 mb-4 text-xs font-mono">
                    <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
                      {svc.pricing.inr}
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.08] text-slate-300 text-[11px]">
                      ⏱ {svc.pricing.turnaround}
                    </span>
                  </div>
                )}

                <p className="text-sm text-slate-300 leading-relaxed mb-6">
                  {svc.description}
                </p>

                <div className="space-y-2 mb-6">
                  <span className="text-[11px] font-mono text-slate-400 block uppercase tracking-wider">
                    Includes:
                  </span>
                  <ul className="space-y-2 text-xs text-slate-300 font-mono">
                    {svc.deliverables.map((item, dIdx) => (
                      <li key={dIdx} className="flex items-start gap-2">
                        <Check size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-6 border-t border-white/[0.04] flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">
                  Agreed scope &amp; direct collaboration
                </span>
                <a
                  href={`#contact?service=${encodeURIComponent(svc.title)}`}
                  onClick={() => soundFx.playChime(500, 0.06)}
                  className="px-4 py-2.5 rounded-full bg-white/[0.05] hover:bg-white text-slate-200 hover:text-slate-950 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer min-h-[44px]"
                >
                  <span>Start a conversation</span>
                  <ArrowUpRight size={13} />
                </a>
              </div>
            </SpotlightCard>
          </MotionReveal>
        ))}
      </div>

      {/* Interactive Calculator Callout Banner */}
      <MotionReveal delay={0.2} className="mt-12">
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-sky-500/10 to-indigo-500/10 border border-white/[0.08] backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <h4 className="text-sm sm:text-base font-bold text-white mb-1 flex items-center gap-2">
              <Calculator size={16} className="text-emerald-400" />
              Need a Custom Multi-Module Architecture?
            </h4>
            <p className="text-xs text-slate-300">
              Calculate exact delivery turnaround, investment in ₹/$, and projected monthly team hours saved.
            </p>
          </div>
          <a
            href="#calculator"
            onClick={() => soundFx.playChime(600, 0.08)}
            className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer shrink-0 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#090d1a]"
          >
            <span>Launch Scope &amp; ROI Calculator</span>
            <ArrowDown size={13} />
          </a>
        </div>
      </MotionReveal>
    </section>
  );
}
