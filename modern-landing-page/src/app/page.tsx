"use client";

import React, { useState } from "react";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Zap,
  Shield,
  TrendingUp,
  Star,
  Layers,
  Terminal,
  Calendar,
  Globe,
  Code2,
  BarChart3,
  Bot,
  Flame,
  Check
} from "lucide-react";

export default function Home() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [formSubmitted, setFormSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-500 selection:text-white font-sans antialiased overflow-x-hidden">
      
      {/* Background Radial Glow Mesh */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/15 blur-[140px] rounded-full" />
        <div className="absolute top-[40%] right-[-10%] w-[500px] h-[400px] bg-indigo-600/10 blur-[130px] rounded-full" />
        <div className="absolute bottom-[10%] left-[-5%] w-[600px] h-[500px] bg-cyan-600/10 blur-[150px] rounded-full" />
      </div>

      {/* Sticky Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/75 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/25">
              <Zap className="w-5 h-5 fill-white text-white" />
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              HyperScale<span className="text-blue-500">.ai</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#bento" className="hover:text-white transition">Bento Architecture</a>
            <a href="#metrics" className="hover:text-white transition">Performance</a>
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
          </nav>

          <div className="flex items-center space-x-3">
            <a
              href="#book"
              className="relative inline-flex items-center justify-center p-0.5 overflow-hidden rounded-xl font-medium group"
            >
              <span className="w-full h-full bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 group-hover:from-blue-600 group-hover:to-cyan-400 absolute"></span>
              <span className="relative px-4 py-2 text-xs font-bold text-white transition-all ease-out bg-slate-950 rounded-[10px] group-hover:bg-opacity-0">
                Launch App &rarr;
              </span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section (2026 Kinetic Style) */}
      <section className="relative z-10 pt-20 pb-16 md:pt-28 md:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Animated Badge Pill */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-semibold text-blue-400 shadow-inner shadow-blue-500/10 mb-8 backdrop-blur-md">
          <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          <span>Next-Gen Agentic Architecture 2026</span>
          <span className="text-slate-600">&bull;</span>
          <span className="text-slate-400">v3.8 Live</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
          Engineered for <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
            Extreme Velocity.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Deploy production-grade agentic pipelines, real-time database workflows, and sub-second web applications with zero infrastructure friction.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#book"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-sm font-bold text-white bg-blue-600 rounded-xl shadow-lg shadow-blue-600/30 hover:bg-blue-500 hover:shadow-blue-500/50 transition duration-200 transform hover:-translate-y-0.5"
          >
            Deploy in 60 Seconds
            <ArrowRight className="w-4 h-4 ml-2" />
          </a>
          <a
            href="#bento"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-sm font-bold text-slate-300 bg-slate-900/80 border border-slate-800 rounded-xl hover:bg-slate-800 hover:text-white transition"
          >
            Explore System Architecture
          </a>
        </div>

        {/* Social Proof Numbers */}
        <div className="mt-16 pt-8 border-t border-slate-900 grid grid-cols-2 md:grid-cols-4 gap-6 text-center max-w-4xl mx-auto">
          <div>
            <div className="text-3xl font-black text-white">99.99%</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Uptime SLA</div>
          </div>
          <div>
            <div className="text-3xl font-black text-blue-400">&lt; 45ms</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Edge Latency</div>
          </div>
          <div>
            <div className="text-3xl font-black text-white">100k+</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Events / Sec</div>
          </div>
          <div>
            <div className="text-3xl font-black text-cyan-400">0 ms</div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Cold Starts</div>
          </div>
        </div>
      </section>

      {/* Infinite Marquee Ticker */}
      <section className="relative z-10 py-6 border-y border-slate-800/60 bg-slate-950/50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 text-xs font-mono uppercase tracking-widest text-slate-500 flex items-center justify-center space-x-8 sm:space-x-16 whitespace-nowrap overflow-x-auto">
          <span>&bull; NEXT.JS 16 APPS</span>
          <span>&bull; CLOUDFLARE EDGE WORKERS</span>
          <span>&bull; SUPABASE DATABASE ENGINE</span>
          <span>&bull; MODEL CONTEXT PROTOCOL (MCP)</span>
          <span>&bull; VERCEL ZERO-CONFIG</span>
          <span>&bull; TAILWIND CSS v4</span>
        </div>
      </section>

      {/* 2026 Bento Grid Section */}
      <section id="bento" className="relative z-10 py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-2">Modular System</h2>
          <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            The 2026 Bento Grid
          </h3>
          <p className="mt-4 text-slate-400 text-sm sm:text-base">
            Asymmetric, focused modules engineered for high visual comprehension and extreme conversion.
          </p>
        </div>

        {/* Bento Cards Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Bento 1: Large Span 2 Columns */}
          <div className="md:col-span-2 relative group overflow-hidden rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 p-8 transition duration-300">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[80px] group-hover:bg-blue-600/20 transition rounded-full" />
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Bot className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono text-slate-500 bg-slate-800/60 px-3 py-1 rounded-full">
                ACTIVE PIPELINE
              </span>
            </div>
            <h4 className="text-2xl font-bold text-white mb-3">Autonomous Multi-Agent Swarms</h4>
            <p className="text-sm text-slate-400 max-w-lg mb-6">
              Orchestrate parallel subagents for background research, code compilation, and automated test suites without blocking main thread operations.
            </p>
            <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800/80 font-mono text-xs text-slate-300 space-y-2">
              <div className="flex items-center text-emerald-400"><Check className="w-3.5 h-3.5 mr-2" /> Subagent &quot;Researcher&quot; initialized: 12 sources verified</div>
              <div className="flex items-center text-blue-400"><Check className="w-3.5 h-3.5 mr-2" /> Code generation subagent: 4 files atomically patched</div>
              <div className="flex items-center text-cyan-400"><Check className="w-3.5 h-3.5 mr-2" /> Continuous verification: 0 syntax regressions</div>
            </div>
          </div>

          {/* Bento 2: 1 Column Tall */}
          <div className="relative group overflow-hidden rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 p-8 transition duration-300 flex flex-col justify-between">
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-indigo-600/10 blur-[60px] rounded-full" />
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6">
                <Shield className="w-6 h-6" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">Zero Data Leaks</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Client credentials and API secrets remain strictly sandboxed inside private runtime memory.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-400">
              <span>SOC2 Type II Ready</span>
              <span className="text-emerald-400 font-bold">100% Secure</span>
            </div>
          </div>

          {/* Bento 3: 1 Column Standard */}
          <div className="relative group overflow-hidden rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 p-8 transition duration-300">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6">
              <Terminal className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-white mb-2">Native MCP Hub</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Connect external databases (PostgreSQL, Supabase) and tools with unified schema injection.
            </p>
            <div className="text-xs font-mono text-cyan-400 bg-cyan-950/30 p-2.5 rounded-xl border border-cyan-800/30">
              mcp_config.json: 32 active servers
            </div>
          </div>

          {/* Bento 4: Large Span 2 Columns */}
          <div className="md:col-span-2 relative group overflow-hidden rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 p-8 transition duration-300">
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Flame className="w-6 h-6" />
              </div>
              <span className="text-xs font-mono text-amber-400 bg-amber-950/30 px-3 py-1 rounded-full border border-amber-800/30">
                SUB-SECOND LOAD
              </span>
            </div>
            <h4 className="text-2xl font-bold text-white mb-3">Core Web Vitals Perfection</h4>
            <p className="text-sm text-slate-400 max-w-lg mb-6">
              Pre-rendered static HTML with progressive hydration ensures 100/100 Lighthouse performance and zero Cumulative Layout Shift (CLS).
            </p>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <div className="text-xl font-black text-emerald-400">100</div>
                <div className="text-[10px] text-slate-500 uppercase">Performance</div>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <div className="text-xl font-black text-emerald-400">100</div>
                <div className="text-[10px] text-slate-500 uppercase">Accessibility</div>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <div className="text-xl font-black text-emerald-400">100</div>
                <div className="text-[10px] text-slate-500 uppercase">SEO Rank</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Pricing Section (Interactive Toggle) */}
      <section id="pricing" className="relative z-10 py-20 border-t border-slate-900 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-2">Transparent Pricing</h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white">Simple, Predictable Plans</h3>
            <p className="mt-3 text-slate-400 text-sm">Deploy on demand with zero long-term lock-in.</p>
            
            {/* Toggle */}
            <div className="mt-6 inline-flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${billingPeriod === "monthly" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod("yearly")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${billingPeriod === "yearly" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"}`}
              >
                Yearly (20% OFF)
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Plan 1 */}
            <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-white text-lg">Starter</h4>
                <p className="text-xs text-slate-400 mt-1">For single project prototypes.</p>
                <div className="my-6">
                  <span className="text-4xl font-black text-white">{billingPeriod === "monthly" ? "$29" : "$24"}</span>
                  <span className="text-slate-500 text-xs"> / month</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-300 font-medium">
                  <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-blue-400" /> 1 Full-Stack Deployment</li>
                  <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-blue-400" /> Basic MCP Toolset</li>
                  <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-blue-400" /> Community Support</li>
                </ul>
              </div>
              <a href="#book" className="mt-8 block py-3 text-center text-xs font-bold text-slate-200 bg-slate-800 rounded-xl hover:bg-slate-700 transition">
                Start Free
              </a>
            </div>

            {/* Plan 2 (Highlighted) */}
            <div className="p-8 rounded-3xl bg-gradient-to-b from-blue-950/40 to-slate-900/80 border-2 border-blue-500/80 shadow-2xl shadow-blue-500/10 relative flex flex-col justify-between">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase rounded-full tracking-wider">
                Most Popular
              </div>
              <div>
                <h4 className="font-bold text-white text-lg">Scale Agency</h4>
                <p className="text-xs text-slate-400 mt-1">For client client acquisition & SaaS.</p>
                <div className="my-6">
                  <span className="text-4xl font-black text-white">{billingPeriod === "monthly" ? "$99" : "$79"}</span>
                  <span className="text-slate-500 text-xs"> / month</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-300 font-medium">
                  <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-emerald-400" /> Unlimited Landing Pages</li>
                  <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-emerald-400" /> Multi-Agent Swarm Orchestration</li>
                  <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-emerald-400" /> 32 Native MCP Integrations</li>
                  <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-emerald-400" /> Priority 24/7 Deployment Support</li>
                </ul>
              </div>
              <a href="#book" className="mt-8 block py-3.5 text-center text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition">
                Claim Agency Pass &rarr;
              </a>
            </div>

            {/* Plan 3 */}
            <div className="p-8 rounded-3xl bg-slate-900/40 border border-slate-800 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-white text-lg">Enterprise</h4>
                <p className="text-xs text-slate-400 mt-1">Dedicated cloud VM cluster.</p>
                <div className="my-6">
                  <span className="text-4xl font-black text-white">{billingPeriod === "monthly" ? "$299" : "$249"}</span>
                  <span className="text-slate-500 text-xs"> / month</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-300 font-medium">
                  <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-blue-400" /> Dedicated 16-Core Instances</li>
                  <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-blue-400" /> Custom In-House MCP Endpoints</li>
                  <li className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-blue-400" /> Dedicated Solutions Architect</li>
                </ul>
              </div>
              <a href="#book" className="mt-8 block py-3 text-center text-xs font-bold text-slate-200 bg-slate-800 rounded-xl hover:bg-slate-700 transition">
                Contact Enterprise
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Form Section */}
      <section id="book" className="relative z-10 py-24 bg-gradient-to-b from-slate-950 to-slate-900 border-t border-slate-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-slate-950 p-8 sm:p-12 border border-slate-800 shadow-2xl">
            <div className="text-center max-w-lg mx-auto mb-8">
              <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Request Instant Consultation</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-400">
                Leave your project specs and our automated agent will assemble your architecture roadmap in minutes.
              </p>
            </div>

            {formSubmitted ? (
              <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-800 text-center">
                <div className="text-emerald-400 font-bold text-lg mb-2">✓ Submission Received!</div>
                <p className="text-xs text-slate-300">We have logged your request. Our automated assistant is preparing your deployment credentials.</p>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setFormSubmitted(true); }} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Your Name</label>
                    <input type="text" required placeholder="Samarth" className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 text-xs focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Work Email</label>
                    <input type="email" required placeholder="samarth@example.com" className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 text-xs focus:border-blue-500 focus:outline-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Project Scope / Niche</label>
                  <input type="text" required placeholder="e.g. AI SaaS, Local Business Lead Gen, E-commerce Store" className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-600 text-xs focus:border-blue-500 focus:outline-none" />
                </div>

                <button type="submit" className="w-full py-3.5 text-center text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition">
                  Generate Roadmap & Book Call &rarr;
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 border-t border-slate-900 text-slate-500 text-xs text-center">
        <p>&copy; 2026 HyperScale.ai. Built with Next.js 16, Tailwind CSS v4, and Antigravity Agent Engine.</p>
      </footer>

    </div>
  );
}
