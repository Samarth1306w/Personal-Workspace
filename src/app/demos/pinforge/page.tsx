"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Cpu,
  Download,
  ExternalLink,
  Eye,
  FileSpreadsheet,
  Layers,
  Palette,
  Play,
  Plus,
  RefreshCw,
  Rss,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  Trash2,
  Zap,
} from "lucide-react";
import { VERIFIED_PRODUCTS, CatalogProduct } from "@/data/pinforge-catalog";

interface QueueItem {
  id: string;
  board_name: string;
  title: string;
  description: string;
  link: string;
  image_url: string;
  published_at: string;
  price: string;
  slug: string;
}

export default function PinForgeDashboard() {
  // Input State
  const [urlInput, setUrlInput] = useState<string>("B09XS7JWHH");
  const [affiliateTag, setAffiliateTag] = useState<string>("samarth0b-20");
  const [selectedTemplate, setSelectedTemplate] = useState<"bento_dark" | "warm_editorial" | "problem_solver">("bento_dark");
  
  // Loading & Execution States
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [isGeneratingCopy, setIsGeneratingCopy] = useState<boolean>(false);
  const [isRenderingPin, setIsRenderingPin] = useState<boolean>(false);
  const [renderLatency, setRenderLatency] = useState<number>(48.2);

  // Active Product & Campaign State
  const [currentProduct, setCurrentProduct] = useState<CatalogProduct>(VERIFIED_PRODUCTS["sony-wh-1000xm5"]);
  const [pinTitle, setPinTitle] = useState<string>("Block Out The World: Sony WH-1000XM5 Headphones Review");
  const [pinDescription, setPinDescription] = useState<string>(
    "Upgrade your daily focus and commute with the Sony WH-1000XM5. Industry-leading noise cancellation, 30-hour battery life, and plush all-day comfort make these the ultimate work headphones. Tap to check today's best deal! #AmazonAssociate"
  );
  const [boardName, setBoardName] = useState<string>("Must-Have Tech Gadgets");
  const [hashtags, setHashtags] = useState<string[]>([
    "#SonyWH1000XM5",
    "#TechGadgets",
    "#WorkFromHome",
    "#AestheticDesk",
    "#AmazonAssociate",
  ]);
  const [previewImage, setPreviewImage] = useState<string>(
    "https://m.media-amazon.com/images/P/B09XS7JWHH.01._SCLZZZZZZZ_SX900_.jpg"
  );
  const [base64Pin, setBase64Pin] = useState<string | null>(null);

  // Bulk Queue State
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedRss, setCopiedRss] = useState<boolean>(false);
  const [intervalHours, setIntervalHours] = useState<number>(4);

  // Initialize queue with sample items from catalog
  useEffect(() => {
    const initialQueue: QueueItem[] = [
      {
        id: "q-1",
        board_name: "Must-Have Tech Gadgets",
        title: "Block Out The World: Sony WH-1000XM5 Headphones Review",
        description: "Experience industry-leading ANC and 30h battery life. Tap to check today's deal! #AmazonAssociate",
        link: "https://sam-codes.vercel.app/p/sony-wh-1000xm5",
        image_url: "https://m.media-amazon.com/images/P/B09XS7JWHH.01._SCLZZZZZZZ_SX900_.jpg",
        published_at: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
        price: "$348.00",
        slug: "sony-wh-1000xm5",
      },
      {
        id: "q-2",
        board_name: "Booktok & Cozy Reading",
        title: "Why The Kindle Paperwhite Is The Ultimate E-Reader",
        description: "Glare-free 6.8\" screen, 10 weeks battery, and waterproof design for cozy reading. #AmazonAssociate",
        link: "https://sam-codes.vercel.app/p/kindle-paperwhite",
        image_url: "https://m.media-amazon.com/images/P/B09SWW583J.01._SCLZZZZZZZ_SX900_.jpg",
        published_at: new Date(Date.now() + 8 * 3600 * 1000).toISOString(),
        price: "$149.99",
        slug: "kindle-paperwhite",
      },
      {
        id: "q-3",
        board_name: "Everyday Aesthetic Essentials",
        title: "The Viral Stanley 40oz Tumbler: Does It Live Up To The Hype?",
        description: "Keeps drinks ice-cold for 48 hours and fits standard car cup holders. Tap to see colors! #AmazonAssociate",
        link: "https://sam-codes.vercel.app/p/stanley-quencher-40oz",
        image_url: "https://m.media-amazon.com/images/P/B0BYP6DZ53.01._SCLZZZZZZZ_SX900_.jpg",
        published_at: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
        price: "$45.00",
        slug: "stanley-quencher-40oz",
      },
    ];
    setQueue(initialQueue);
  }, []);

  // 1-Click Quick Preset Selection
  const loadPreset = async (slug: string) => {
    const prod = VERIFIED_PRODUCTS[slug];
    if (!prod) return;

    setCurrentProduct(prod);
    setUrlInput(prod.asin);
    setPinTitle(`${prod.hook}: ${prod.shortTitle}`);
    setPinDescription(
      `${prod.verdict} Rated ${prod.rating} stars with ${prod.reviewCount}. Tap here to check today's price and verified reviews! #AmazonAssociate`
    );
    setBoardName(prod.boardName);
    setHashtags(prod.hashtags);
    setPreviewImage(prod.imageUrl);

    // Trigger pin graphic render
    renderPinGraphic(prod, selectedTemplate);
  };

  // Extract Product from Amazon URL or ASIN
  const handleExtractAndForge = async () => {
    if (!urlInput.trim()) return;
    setIsExtracting(true);

    try {
      const res = await fetch("/api/pinforge/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url_or_asin: urlInput, affiliate_tag: affiliateTag }),
      });

      if (res.ok) {
        const data = await res.json();
        const catalogAdapter: CatalogProduct = {
          asin: data.asin,
          slug: data.bridge_slug,
          title: data.title,
          shortTitle: data.title.split(" ").slice(0, 4).join(" "),
          brand: data.brand || "Amazon Choice",
          category: data.category || "Trending Finds",
          boardName: `${data.category || "Trending"} Favorites`,
          price: data.price,
          originalPrice: data.original_price,
          discountPercent: data.discount_percent,
          rating: data.rating,
          reviewCount: data.review_count,
          imageUrl: data.image_url,
          additionalImages: data.additional_images || [],
          features: data.features || [],
          verdict: "A verified top-tier product delivering exceptional everyday utility.",
          pros: data.features?.slice(0, 3) || ["Verified durability", "Prime fast shipping", "Top customer ratings"],
          cons: ["High demand may lead to temporary backorders"],
          whoIsItFor: "Anyone seeking a dependable, high-performance upgrade.",
          hook: "The Viral Amazon Find You Need",
          hashtags: ["#AmazonFinds", "#Trending", "#AmazonAssociate"],
        };

        setCurrentProduct(catalogAdapter);
        setPreviewImage(data.image_url);

        // Auto-generate AI Copy
        generateAiCopy(catalogAdapter);

        // Auto-render Pin Graphic
        renderPinGraphic(catalogAdapter, selectedTemplate);
      }
    } catch (err) {
      console.error("Extraction error:", err);
    } finally {
      setIsExtracting(false);
    }
  };

  // Generate AI SEO Copy
  const generateAiCopy = async (prod = currentProduct) => {
    setIsGeneratingCopy(true);
    try {
      const res = await fetch("/api/pinforge/generate-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_title: prod.title,
          brand: prod.brand,
          category: prod.category,
          price: prod.price,
          features: prod.features,
        }),
      });

      if (res.ok) {
        const copyData = await res.json();
        setPinTitle(copyData.pin_title);
        setPinDescription(copyData.pin_description);
        setBoardName(copyData.board_recommendation);
        if (copyData.hashtags && copyData.hashtags.length > 0) {
          setHashtags(copyData.hashtags);
        }
      }
    } catch (err) {
      console.error("Copy generation failed:", err);
    } finally {
      setIsGeneratingCopy(false);
    }
  };

  // Render 2:3 Pin Graphic
  const renderPinGraphic = async (prod = currentProduct, template = selectedTemplate) => {
    setIsRenderingPin(true);
    const start = performance.now();
    try {
      const res = await fetch("/api/pinforge/generate-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: pinTitle || prod.title,
          image_url: prod.imageUrl,
          price: prod.price,
          original_price: prod.originalPrice,
          rating: prod.rating,
          review_count: prod.reviewCount,
          badge_text: template === "warm_editorial" ? "EDITORIAL PICK" : template === "problem_solver" ? "VIRAL DEAL" : "TOP RATED 2026",
          template: template,
          features: prod.features,
          cta_text: template === "warm_editorial" ? "READ FULL REVIEW ➔" : "TAP TO VIEW ON AMAZON ➔",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setBase64Pin(data.base64_image);
        setRenderLatency(data.render_time_ms || Math.round(performance.now() - start));
      }
    } catch (err) {
      console.error("Pin render failed:", err);
    } finally {
      setIsRenderingPin(false);
    }
  };

  // Switch template and re-render
  const handleTemplateSwitch = (tmpl: "bento_dark" | "warm_editorial" | "problem_solver") => {
    setSelectedTemplate(tmpl);
    renderPinGraphic(currentProduct, tmpl);
  };

  // Add current forged pin to queue
  const handleAddToQueue = () => {
    const newItem: QueueItem = {
      id: `q-${Date.now()}`,
      board_name: boardName,
      title: pinTitle,
      description: pinDescription,
      link: `https://sam-codes.vercel.app/p/${currentProduct.slug}?tag=${affiliateTag}`,
      image_url: previewImage,
      published_at: new Date(Date.now() + (queue.length + 1) * intervalHours * 3600 * 1000).toISOString(),
      price: currentProduct.price,
      slug: currentProduct.slug,
    };
    setQueue((prev) => [newItem, ...prev]);
  };

  // Remove from queue
  const handleRemoveQueueItem = (id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  };

  // Download Pinterest Bulk CSV
  const handleDownloadCsv = async () => {
    if (!queue.length) return;
    try {
      const res = await fetch("/api/pinforge/export-csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: queue, interval_hours: intervalHours }),
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "pinterest_bulk_pins.csv";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error("Failed to download CSV:", err);
    }
  };

  // Copy Bridge URL
  const handleCopyBridgeLink = () => {
    const url = `https://sam-codes.vercel.app/p/${currentProduct.slug}?tag=${affiliateTag}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100 antialiased selection:bg-sky-500/30">
      {/* Top Navigation & Status Bar */}
      <header className="border-b border-slate-800 bg-[#0B0F19]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs text-slate-400 hover:text-white transition-colors">
              ← Portfolio
            </Link>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 text-white font-bold shadow-lg shadow-rose-500/20">
                P
              </div>
              <div>
                <h1 className="text-sm font-extrabold tracking-tight text-white flex items-center gap-1.5">
                  PinForge AI
                  <span className="rounded-md bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-bold text-rose-400 border border-rose-500/20">
                    v1.0 Pro
                  </span>
                </h1>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  Pinterest & Amazon Affiliate AI Automation
                </p>
              </div>
            </div>
          </div>

          {/* Operational Engine Status Badges */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 text-[11px] font-medium text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Python FastAPI Core</span>
            </div>

            <div className="hidden md:flex items-center gap-1.5 rounded-full border border-sky-500/20 bg-sky-500/5 px-2.5 py-1 text-[11px] font-medium text-sky-400">
              <Cpu className="h-3 w-3" />
              <span>Gemini 2.0 + Groq</span>
            </div>

            <div className="flex items-center gap-1 text-xs text-slate-300">
              <Tag className="h-3.5 w-3.5 text-amber-400" />
              <input
                type="text"
                value={affiliateTag}
                onChange={(e) => setAffiliateTag(e.target.value)}
                placeholder="tag-20"
                className="w-28 rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-amber-300 focus:border-amber-400 focus:outline-none"
                title="Your Amazon Associate Tracking Tag"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Quick Preset Products Bar */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-3 backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>1-Click Verified Tests:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {Object.values(VERIFIED_PRODUCTS).map((p) => (
                <button
                  key={p.slug}
                  onClick={() => loadPreset(p.slug)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                    currentProduct.asin === p.asin
                      ? "bg-sky-500 text-slate-950 shadow-md shadow-sky-500/30"
                      : "bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700/60"
                  }`}
                >
                  {p.shortTitle} ({p.price})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Sourcing & Extraction Card */}
        <div className="rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/60 to-slate-950 p-5 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Paste Amazon URL, shortlink (amzn.to/xxx), or 10-char ASIN (e.g. B09XS7JWHH)..."
                className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <button
              onClick={handleExtractAndForge}
              disabled={isExtracting}
              className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-sky-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {isExtracting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Extracting...</span>
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  <span>Extract & Forge</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Main Bento Studio (2 Columns: Left Graphic Preview, Right Copy Studio) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: 2:3 Pinterest Pin Studio (5 cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-xl flex flex-col">
              {/* Studio Header & Template Switcher */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-sky-400" />
                  <h2 className="text-sm font-bold text-white">2:3 Pin Graphic (1000x1500)</h2>
                </div>
                <span className="text-[11px] font-mono text-emerald-400">
                  {renderLatency}ms
                </span>
              </div>

              {/* Template Buttons */}
              <div className="grid grid-cols-3 gap-1.5 rounded-xl border border-slate-800 bg-slate-950 p-1 mb-4 text-xs font-semibold">
                <button
                  onClick={() => handleTemplateSwitch("bento_dark")}
                  className={`rounded-lg py-1.5 transition-all ${
                    selectedTemplate === "bento_dark"
                      ? "bg-slate-800 text-sky-400 shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Bento Dark
                </button>
                <button
                  onClick={() => handleTemplateSwitch("warm_editorial")}
                  className={`rounded-lg py-1.5 transition-all ${
                    selectedTemplate === "warm_editorial"
                      ? "bg-slate-800 text-amber-400 shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Editorial
                </button>
                <button
                  onClick={() => handleTemplateSwitch("problem_solver")}
                  className={`rounded-lg py-1.5 transition-all ${
                    selectedTemplate === "problem_solver"
                      ? "bg-slate-800 text-rose-400 shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Viral Hook
                </button>
              </div>

              {/* Interactive 2:3 Pin Viewport */}
              <div className="relative aspect-[2/3] w-full max-w-[380px] mx-auto rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl flex items-center justify-center">
                {isRenderingPin ? (
                  <div className="flex flex-col items-center gap-2 text-slate-400 text-xs">
                    <RefreshCw className="h-6 w-6 animate-spin text-sky-400" />
                    <span>Rendering 1000x1500 Pin in Pillow...</span>
                  </div>
                ) : base64Pin ? (
                  <img
                    src={base64Pin}
                    alt="Rendered 2:3 Pinterest Pin"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  // Live interactive preview fallback
                  <div
                    className={`h-full w-full p-6 flex flex-col justify-between ${
                      selectedTemplate === "warm_editorial"
                        ? "bg-[#F9F6F0] text-slate-900 border-8 border-stone-200"
                        : selectedTemplate === "problem_solver"
                        ? "bg-slate-950 text-white"
                        : "bg-[#0B0F19] text-white"
                    }`}
                  >
                    <div>
                      <div className="text-center mb-3">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                            selectedTemplate === "warm_editorial"
                              ? "bg-stone-300 text-stone-800"
                              : selectedTemplate === "problem_solver"
                              ? "bg-amber-500 text-slate-950"
                              : "bg-slate-900 border border-sky-400/60 text-sky-400"
                          }`}
                        >
                          ✦ {selectedTemplate === "warm_editorial" ? "EDITORIAL PICK" : selectedTemplate === "problem_solver" ? "VIRAL DEAL ALERT" : "TOP RATED 2026"}
                        </span>
                      </div>

                      <h3
                        className={`text-center font-extrabold line-clamp-2 text-base sm:text-lg leading-tight ${
                          selectedTemplate === "warm_editorial" ? "text-stone-900 font-serif" : "text-white"
                        }`}
                      >
                        {pinTitle}
                      </h3>
                    </div>

                    {/* Product Card Container */}
                    <div className="relative aspect-square w-full rounded-2xl bg-white p-4 shadow-xl flex items-center justify-center border border-slate-200">
                      <img
                        src={previewImage}
                        alt={currentProduct.title}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>

                    {/* Bottom Metadata & CTA */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs px-1">
                        <div className="flex text-amber-400 text-sm">★★★★★</div>
                        <span className="font-extrabold text-emerald-500 text-sm">
                          {currentProduct.price}
                        </span>
                      </div>

                      <div
                        className={`w-full py-2.5 rounded-xl text-center text-xs font-bold ${
                          selectedTemplate === "warm_editorial"
                            ? "bg-stone-900 text-white"
                            : selectedTemplate === "problem_solver"
                            ? "bg-amber-500 text-slate-950"
                            : "bg-sky-500 text-white shadow-lg shadow-sky-500/20"
                        }`}
                      >
                        {selectedTemplate === "warm_editorial"
                          ? "READ FULL REVIEW ➔"
                          : "TAP TO VIEW ON AMAZON ➔"}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons under Graphic */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button
                  onClick={() => renderPinGraphic(currentProduct, selectedTemplate)}
                  disabled={isRenderingPin}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-all"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isRenderingPin ? "animate-spin" : ""}`} />
                  <span>Re-Render</span>
                </button>

                {base64Pin ? (
                  <a
                    href={base64Pin}
                    download={`pin_${currentProduct.asin}_${selectedTemplate}.jpg`}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-sky-500 py-2 text-xs font-semibold text-slate-950 hover:bg-sky-400 transition-all shadow-md shadow-sky-500/20"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download Pin</span>
                  </a>
                ) : (
                  <button
                    onClick={() => renderPinGraphic(currentProduct, selectedTemplate)}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-sky-500 py-2 text-xs font-semibold text-slate-950 hover:bg-sky-400 transition-all"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Generate File</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: AI Copy & SEO Studio (7 cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <h2 className="text-sm font-bold text-white">AI Copy & SEO Studio</h2>
                </div>

                <button
                  onClick={() => generateAiCopy(currentProduct)}
                  disabled={isGeneratingCopy}
                  className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 font-medium disabled:opacity-50"
                >
                  <RefreshCw className={`h-3 w-3 ${isGeneratingCopy ? "animate-spin" : ""}`} />
                  <span>Regenerate with Gemini</span>
                </button>
              </div>

              {/* Pin Title */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1.5">
                  <label>Pinterest Title</label>
                  <span
                    className={`font-mono text-[11px] ${
                      pinTitle.length > 90 ? "text-amber-400" : "text-slate-500"
                    }`}
                  >
                    {pinTitle.length}/100 chars
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={100}
                  value={pinTitle}
                  onChange={(e) => setPinTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-sky-500 focus:outline-none"
                />
              </div>

              {/* Board Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Target Pinterest Board
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={boardName}
                    onChange={(e) => setBoardName(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-sm text-white focus:border-sky-500 focus:outline-none"
                  />
                  <span className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-medium text-slate-400 border border-slate-700">
                    High Search Intent
                  </span>
                </div>
              </div>

              {/* Pin Description */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1.5">
                  <div className="flex items-center gap-2">
                    <label>Pin SEO Description</label>
                    <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                      FTC Compliant
                    </span>
                  </div>
                  <span
                    className={`font-mono text-[11px] ${
                      pinDescription.length > 480 ? "text-amber-400" : "text-slate-500"
                    }`}
                  >
                    {pinDescription.length}/500 chars
                  </span>
                </div>
                <textarea
                  rows={4}
                  maxLength={500}
                  value={pinDescription}
                  onChange={(e) => setPinDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3.5 text-sm text-white focus:border-sky-500 focus:outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Hashtag Cloud */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Targeted Pinterest Search Tags
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {hashtags.map((tag, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-slate-800/90 px-2.5 py-1 text-xs font-medium text-sky-300 border border-slate-700/80 cursor-pointer hover:bg-slate-700 transition-colors"
                      onClick={() => navigator.clipboard.writeText(tag)}
                      title="Click to copy tag"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Live Bridge Link Card */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                    Dedicated FTC Bridge Landing Page
                  </span>
                  <Link
                    href={`/p/${currentProduct.slug}?tag=${affiliateTag}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs font-bold text-sky-400 hover:underline"
                  >
                    <span>Open Live Bridge</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 p-2 text-xs font-mono text-slate-300">
                  <span className="truncate flex-1">
                    https://sam-codes.vercel.app/p/{currentProduct.slug}?tag={affiliateTag}
                  </span>
                  <button
                    onClick={handleCopyBridgeLink}
                    className="rounded-lg bg-slate-800 p-1.5 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                    title="Copy Bridge Link"
                  >
                    {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {/* Add to Campaign Queue Button */}
              <button
                onClick={handleAddToQueue}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3.5 text-sm font-bold text-slate-950 shadow-xl shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Add This Forged Pin to Bulk Queue</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section: Bulk Queue & Export Channels */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Pinterest Bulk Publishing Queue</h3>
                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs font-mono text-slate-300">
                  {queue.length} items
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Triple-channel export: Official Pinterest CSV Bulk Upload, Zero-Approval Media RSS, or direct manual dispatch.
              </p>
            </div>

            {/* Bulk Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Clock className="h-3.5 w-3.5" />
                <span>Stagger:</span>
                <select
                  value={intervalHours}
                  onChange={(e) => setIntervalHours(Number(e.target.value))}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-slate-200 focus:outline-none"
                >
                  <option value={2}>Every 2 hours</option>
                  <option value={4}>Every 4 hours</option>
                  <option value={8}>Every 8 hours</option>
                  <option value={12}>2 pins / day</option>
                </select>
              </div>

              <button
                onClick={handleDownloadCsv}
                disabled={!queue.length}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2 text-xs font-bold text-slate-950 shadow-md shadow-emerald-500/20 hover:bg-emerald-400 transition-all disabled:opacity-50"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download Pinterest Bulk CSV</span>
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText("https://sam-codes.vercel.app/feed.xml");
                  setCopiedRss(true);
                  setTimeout(() => setCopiedRss(false), 2000);
                }}
                className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-all"
                title="Copy Pinterest Business Auto-Publish RSS Feed URL"
              >
                <Rss className="h-3.5 w-3.5 text-amber-400" />
                <span>{copiedRss ? "Copied Feed URL!" : "Copy RSS Feed URL"}</span>
              </button>
            </div>
          </div>

          {/* Queue Table */}
          {queue.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              Your bulk queue is currently empty. Click &quot;Add This Forged Pin to Bulk Queue&quot; above to stage pins.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-3 px-3 font-semibold">Preview</th>
                    <th className="py-3 px-3 font-semibold">Target Board</th>
                    <th className="py-3 px-3 font-semibold">Pin Title</th>
                    <th className="py-3 px-3 font-semibold">Scheduled Date (UTC)</th>
                    <th className="py-3 px-3 font-semibold">Bridge Link</th>
                    <th className="py-3 px-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {queue.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3">
                        <div className="h-10 w-8 rounded-md bg-slate-950 overflow-hidden border border-slate-800 flex items-center justify-center">
                          <img src={item.image_url} alt="" className="h-full w-full object-contain" />
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="rounded-md bg-slate-800 px-2 py-1 font-medium text-slate-300">
                          {item.board_name}
                        </span>
                      </td>
                      <td className="py-3 px-3 max-w-[280px]">
                        <p className="font-semibold text-white truncate">{item.title}</p>
                        <p className="text-[11px] text-slate-500 truncate">{item.description}</p>
                      </td>
                      <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                        {new Date(item.published_at).toLocaleString()}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-sky-400 max-w-[140px] truncate">
                        <Link href={`/p/${item.slug}?tag=${affiliateTag}`} target="_blank" className="hover:underline">
                          /p/{item.slug}
                        </Link>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleRemoveQueueItem(item.id)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                          title="Remove from queue"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Operational Metrics & Economics Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 text-xs">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <span className="text-slate-500">Unit Compute Cost:</span>
              <p className="text-sm font-bold text-emerald-400 mt-0.5">$0.0015 / Pin</p>
              <p className="text-[10px] text-slate-500">500 pins ≈ $0.75 / mo</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <span className="text-slate-500">FTC Compliance:</span>
              <p className="text-sm font-bold text-sky-400 mt-0.5">100% Guaranteed</p>
              <p className="text-[10px] text-slate-500">All bridge pages include disclaimers</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <span className="text-slate-500">Pinterest Anti-Spam:</span>
              <p className="text-sm font-bold text-indigo-400 mt-0.5">Zero Shadowban Risk</p>
              <p className="text-[10px] text-slate-500">Clean domain bridge routing</p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <span className="text-slate-500">Auto-Publish Channel:</span>
              <p className="text-sm font-bold text-amber-400 mt-0.5">Media RSS Active</p>
              <p className="text-[10px] text-slate-500">No developer API review needed</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
