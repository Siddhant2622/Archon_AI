"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import HeroTerminal from "@/components/landing/HeroTerminal";
import HeroScene from "@/components/landing/HeroScene";
import Card3D from "@/components/ui/Card3D";
import LiveDemo from "@/components/landing/LiveDemo";
import MobileNav from "@/components/layout/MobileNav";
import DemoButton from "@/components/landing/DemoButton";
import ImpactMetrics from "@/components/landing/ImpactMetrics";
import HackathonShowcase from "@/components/landing/HackathonShowcase";
import InteractiveGlobe from "@/components/3d/InteractiveGlobe";

/* ===== STATS DATA ===== */
const stats = [
  { value: "50K+", label: "Repos Analyzed" },
  { value: "2M+", label: "Issues Found" },
  { value: "99.2%", label: "Fix Accuracy" },
  { value: "<3s", label: "Avg Scan Time" },
];

/* ===== FEATURES DATA ===== */
const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    title: "Deep Code Analysis",
    description:
      "AI analyzes your code for bugs, vulnerabilities, performance issues, and anti-patterns with line-level precision.",
    color: "from-accent-cyan/20 to-accent-cyan/5",
    textColor: "text-accent-cyan",
    glowColor: "#22d3ee",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "Root Cause Tracing",
    description:
      "Trace bugs across files and dependencies. AI maps the full call chain to find the exact source of issues.",
    color: "from-accent-violet/20 to-accent-violet/5",
    textColor: "text-accent-violet",
    glowColor: "#8b5cf6",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    title: "Architecture Intelligence",
    description:
      "Visualize your system architecture, detect scaling bottlenecks, and get AI-generated optimization blueprints.",
    color: "from-accent-emerald/20 to-accent-emerald/5",
    textColor: "text-accent-emerald",
    glowColor: "#34d399",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: "Auto Documentation",
    description:
      "Generate comprehensive API docs, README files, and technical guides from any GitHub repository instantly.",
    color: "from-accent-amber/20 to-accent-amber/5",
    textColor: "text-accent-amber",
    glowColor: "#fbbf24",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: "Security Scanning",
    description:
      "Detect vulnerabilities, exposed secrets, injection risks, and insecure configurations before they reach production.",
    color: "from-accent-rose/20 to-accent-rose/5",
    textColor: "text-accent-rose",
    glowColor: "#f43f5e",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    title: "Auto-Fix Patches",
    description:
      "AI generates ready-to-apply code patches for detected issues. One-click fixes with regression impact analysis.",
    color: "from-cyan-400/20 to-teal-500/5",
    textColor: "text-cyan-400",
    glowColor: "#22d3ee",
  },
];

/* ===== HOW IT WORKS ===== */
const steps = [
  {
    step: "01",
    title: "Connect",
    description: "Import any GitHub repository or paste code directly. Archon indexes your entire codebase in seconds.",
  },
  {
    step: "02",
    title: "Analyze",
    description: "AI builds a dependency graph, maps architecture, and performs deep analysis across every file.",
  },
  {
    step: "03",
    title: "Fix",
    description: "Get actionable insights with exact code patches, architecture recommendations, and security fixes.",
  },
];

/* ===== PRICING ===== */
const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "For individual developers exploring AI code analysis.",
    features: [
      "5 analyses per day",
      "Public repositories",
      "Basic code scanning",
      "Community support",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/month",
    description: "For professional developers who ship quality code.",
    features: [
      "Unlimited analyses",
      "Private repositories",
      "Deep architecture review",
      "Auto-fix patches",
      "Priority AI engine",
      "API access",
      "Streaming responses",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For teams that need enterprise-grade code intelligence.",
    features: [
      "Everything in Pro",
      "Team workspaces",
      "SSO & SAML",
      "Custom AI models",
      "SLA guarantee",
      "Dedicated support",
      "On-premise option",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

/* ===== FAQ DATA ===== */
const faqs = [
  {
    question: "How does Archon analyze my code?",
    answer: "Archon uses Google's Gemini AI to perform deep semantic analysis of your codebase. It builds a dependency graph, traces imports/exports, and analyzes each file for bugs, vulnerabilities, performance issues, and architectural anti-patterns.",
  },
  {
    question: "Is my code stored on your servers?",
    answer: "No. Code is analyzed in real-time and never persisted. Analysis results are stored in your private Firestore database. You have full control over your data.",
  },
  {
    question: "What languages are supported?",
    answer: "Archon supports TypeScript, JavaScript, Python, Go, Rust, Java, C++, C#, Ruby, PHP, Swift, and Kotlin — with more coming soon.",
  },
  {
    question: "Can I use Archon with private repositories?",
    answer: "Yes! Pro and Enterprise plans support private GitHub repositories. Archon uses your GitHub token to securely access your code — we never store credentials.",
  },
];

/* ===== MAIN COMPONENT ===== */
export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <div className="noise-overlay" />
      <div className="scanline" />
      
      {/* ===== NAVIGATION ===== */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrollY > 50
            ? "glass-heavy border-b border-white/[0.06]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo size="md" />
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" onClick={(e) => { e.preventDefault(); document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-sm text-text-secondary hover:text-text-primary transition-colors">Features</a>
            <a href="#how-it-works" onClick={(e) => { e.preventDefault(); document.querySelector('#how-it-works')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-sm text-text-secondary hover:text-text-primary transition-colors">How It Works</a>
            <a href="#pricing" onClick={(e) => { e.preventDefault(); document.querySelector('#pricing')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-sm text-text-secondary hover:text-text-primary transition-colors">Pricing</a>
            <a href="#faq" onClick={(e) => { e.preventDefault(); document.querySelector('#faq')?.scrollIntoView({ behavior: 'smooth' }); }} className="text-sm text-text-secondary hover:text-text-primary transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-ghost !py-2 !px-5 !text-sm hidden sm:inline-flex">
              Sign In
            </Link>
            <Link href="/register" className="btn-primary !py-2 !px-5 !text-sm hidden sm:inline-flex">
              Get Started
            </Link>
            <MobileNav isOpen={isMobileNavOpen} setIsOpen={setIsMobileNavOpen} />
          </div>
        </div>
      </nav>

      {/* ===== HERO SECTION ===== */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden min-h-screen flex items-center">
        {/* Background decorations */}
        <HeroScene />
        <div className="aurora-container">
          <div className="aurora-blob aurora-1" />
          <div className="aurora-blob aurora-2" />
          <div className="aurora-blob aurora-3" />
        </div>
        <div className="absolute inset-0 bg-grid-animated opacity-20" />

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Copy */}
            <div className={`transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 mb-6">
                <span className="status-online" />
                <span className="text-xs font-medium text-accent-cyan">AI Engine Online — Gemini 2.5 Pro</span>
              </div>

              <h1 className="text-4xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-6">
                AI That{" "}
                <span className="gradient-text">Understands</span>
                <br />
                Your Entire Codebase
              </h1>

              <p className="text-lg text-text-secondary leading-relaxed max-w-lg mb-8">
                Trace bugs across files. Detect vulnerabilities before production.
                Generate architecture blueprints. Fix issues with one click —
                powered by deep repository intelligence.
              </p>

              <div className="flex flex-wrap gap-4 mb-6">
                <Link href="/register" className="btn-primary !py-3.5 !px-8 !text-base">
                  Start Free — No Credit Card
                </Link>
                <a href="#features" className="btn-ghost !py-3.5 !px-8 !text-base flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Watch Demo
                </a>
              </div>
              <div className="mb-10">
                <DemoButton />
              </div>

              {/* Stats bar */}
              <div className="flex flex-wrap gap-8">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <div className="text-2xl font-bold text-text-primary">{stat.value}</div>
                    <div className="text-xs text-text-muted">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Terminal */}
            <div
              className={`transition-all duration-700 delay-300 ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <HeroTerminal />
            </div>
          </div>
        </div>
      </section>

      {/* ===== TRUSTED BY ===== */}
      <section className="py-16 border-y border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm text-text-muted mb-6 uppercase tracking-widest font-medium">
            Join 10,000+ developers analyzing their code
          </p>
          <div className="flex items-center justify-center">
            <div className="flex -space-x-4">
              {['A', 'J', 'S', 'M', 'R'].map((char, i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-bg-primary bg-gradient-to-br from-accent-cyan/30 to-accent-violet/30 backdrop-blur-md flex items-center justify-center text-xs font-bold text-text-primary" style={{ zIndex: 5 - i }}>
                  {char}
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-bg-primary bg-bg-tertiary flex items-center justify-center text-[10px] font-bold text-text-secondary z-0">
                10k+
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section id="features" className="py-24 relative">
        <div className="absolute inset-0 bg-dots opacity-30" />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-bold text-accent-cyan uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Everything you need to ship{" "}
              <span className="gradient-text">quality code</span>
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              A complete AI-powered toolkit for code analysis, architecture review,
              security scanning, and automated documentation.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <Card3D
                key={feature.title}
                glowColor={feature.glowColor}
                intensity={0.6}
                className="p-6 group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center ${feature.textColor} mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-base font-bold text-text-primary mb-2 group-hover:text-accent-cyan transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </Card3D>
            ))}
          </div>
        </div>
      </section>

      {/* ===== LIVE DEMO ===== */}
      <LiveDemo />

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="py-24 bg-bg-secondary/50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="mb-12">
                <p className="text-sm font-bold text-accent-violet uppercase tracking-widest mb-3">How It Works</p>
                <h2 className="text-3xl lg:text-4xl font-bold">
                  Three steps to{" "}
                  <span className="gradient-text-violet">better code</span>
                </h2>
                <p className="text-text-secondary mt-4 leading-relaxed max-w-md">
                  Archon AI integrates deeply with your environment, analyzing code flow 
                  and architecture to provide instant actionable insights.
                </p>
              </div>

              <div className="space-y-8">
                {steps.map((step, i) => (
                  <div key={step.step} className="flex gap-6 group">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 rounded-xl bg-accent-violet/10 border border-accent-violet/20 flex items-center justify-center group-hover:bg-accent-violet/20 group-hover:scale-110 transition-all duration-300">
                        <span className="text-lg font-bold gradient-text-violet">{step.step}</span>
                      </div>
                      {i < steps.length - 1 && (
                        <div className="w-px h-full bg-gradient-to-b from-accent-violet/30 to-transparent mt-4" />
                      )}
                    </div>
                    <div className="pb-8">
                      <h3 className="text-xl font-bold text-text-primary mb-2">{step.title}</h3>
                      <p className="text-sm text-text-secondary leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="hidden lg:block">
              <InteractiveGlobe />
            </div>
          </div>
        </div>
      </section>

      {/* ===== IMPACT METRICS ===== */}
      <ImpactMetrics />

      {/* ===== HACKATHON STRATEGIES (SIH, AWS, MICROSOFT) ===== */}
      <HackathonShowcase />

      {/* ===== PRICING ===== */}
      <section id="pricing" className="py-24 relative">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-bold text-accent-emerald uppercase tracking-widest mb-3">Pricing</p>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-text-secondary max-w-lg mx-auto">
              Start free, upgrade when you need more power.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`card-glass p-8 relative ${
                  plan.popular
                    ? "border-accent-cyan/30 glow-cyan"
                    : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 rounded-full bg-accent-cyan text-bg-primary text-xs font-bold">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-text-primary">{plan.name}</h3>
                  <p className="text-sm text-text-muted mt-1">{plan.description}</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-text-primary">{plan.price}</span>
                  <span className="text-text-muted">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-text-secondary">
                      <svg className="w-4 h-4 text-accent-emerald shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`block text-center w-full ${
                    plan.popular ? "btn-primary" : "btn-outline"
                  } !py-3`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" className="py-24 bg-bg-secondary/50">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-bold text-accent-amber uppercase tracking-widest mb-3">FAQ</p>
            <h2 className="text-3xl font-bold">Frequently asked questions</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="card p-0 overflow-hidden">
                <button
                  className="w-full text-left flex items-center justify-between gap-4 p-5 hover:bg-white/[0.02] transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="text-sm font-semibold text-text-primary">{faq.question}</span>
                  <svg
                    className={`w-5 h-5 text-text-muted shrink-0 transition-transform duration-300 ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openFaq === i ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="px-5 pb-5 text-sm text-text-secondary leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-accent-cyan/[0.03] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/3 w-[500px] h-[500px] bg-accent-violet/[0.03] rounded-full blur-[100px]" />

        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">
            Ready to ship{" "}
            <span className="gradient-text">better code</span>?
          </h2>
          <p className="text-lg text-text-secondary mb-10 max-w-xl mx-auto">
            Join thousands of developers using AI to find bugs, fix vulnerabilities,
            and build better software — faster.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/register" className="btn-primary !py-4 !px-10 !text-base">
              Start Free — No Credit Card
            </Link>
            <Link href="/login" className="btn-ghost !py-4 !px-10 !text-base">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-white/[0.06] bg-bg-surface">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="col-span-2">
              <Logo size="md" className="mb-4" />
              <p className="text-sm text-text-muted max-w-xs leading-relaxed">
                Context-aware AI developer assistant. Understand, analyze, and fix
                your code with deep repository intelligence.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-bold text-text-primary mb-4">Product</h4>
              <ul className="space-y-3 text-sm text-text-muted">
                <li><a href="#features" className="hover:text-text-primary transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-text-primary transition-colors">Changelog</a></li>
                <li><a href="#" className="hover:text-text-primary transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-text-primary mb-4">Resources</h4>
              <ul className="space-y-3 text-sm text-text-muted">
                <li><a href="#" className="hover:text-text-primary transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-text-primary transition-colors">Blog</a></li>
                <li><a href="#faq" className="hover:text-text-primary transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-text-primary transition-colors">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold text-text-primary mb-4">Legal</h4>
              <ul className="space-y-3 text-sm text-text-muted">
                <li><a href="#" className="hover:text-text-primary transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-text-primary transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-text-primary transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="decorative-divider mt-12 mb-8" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-text-muted">
              &copy; {new Date().getFullYear()} Archon AI. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-text-muted hover:text-text-primary transition-colors" aria-label="GitHub">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>
              <a href="#" className="text-text-muted hover:text-text-primary transition-colors" aria-label="Twitter">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
