"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import Badge from "@/components/ui/Badge";

const statCards = [
  {
    label: "Repositories",
    value: "12",
    change: "+3 this week",
    trend: "up",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    ),
    color: "cyan",
  },
  {
    label: "Issues Found",
    value: "47",
    change: "-8 resolved",
    trend: "down",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    color: "amber",
  },
  {
    label: "AI Analyses",
    value: "156",
    change: "+24 today",
    trend: "up",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    color: "violet",
  },
  {
    label: "Health Score",
    value: "87",
    change: "+5 improved",
    trend: "up",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    color: "emerald",
  },
];

const colorMap: Record<string, { bg: string; text: string; glow: string }> = {
  cyan: { bg: "bg-accent-cyan/10", text: "text-accent-cyan", glow: "shadow-[0_0_15px_rgba(34,211,238,0.1)]" },
  amber: { bg: "bg-accent-amber/10", text: "text-accent-amber", glow: "shadow-[0_0_15px_rgba(251,191,36,0.1)]" },
  violet: { bg: "bg-accent-violet/10", text: "text-accent-violet", glow: "shadow-[0_0_15px_rgba(139,92,246,0.1)]" },
  emerald: { bg: "bg-accent-emerald/10", text: "text-accent-emerald", glow: "shadow-[0_0_15px_rgba(52,211,153,0.1)]" },
};

const recentActivity = [
  {
    action: "Code Analysis",
    target: "api/auth/route.ts",
    result: "3 issues found",
    time: "2 min ago",
    severity: "warning" as const,
  },
  {
    action: "Architecture Review",
    target: "payment-service",
    result: "Generated blueprint",
    time: "15 min ago",
    severity: "info" as const,
  },
  {
    action: "Security Scan",
    target: "utils/crypto.ts",
    result: "1 critical vulnerability",
    time: "1 hour ago",
    severity: "danger" as const,
  },
  {
    action: "Documentation",
    target: "facebook/react",
    result: "Docs generated",
    time: "3 hours ago",
    severity: "success" as const,
  },
  {
    action: "Dependency Audit",
    target: "package.json",
    result: "All dependencies safe",
    time: "5 hours ago",
    severity: "success" as const,
  },
];

const quickActions = [
  {
    label: "Import Repository",
    description: "Connect a GitHub repository",
    href: "/dashboard/repositories",
    icon: "📁",
    color: "from-accent-violet/20 to-accent-violet/5",
  },
  {
    label: "Generate Docs",
    description: "AI-powered documentation",
    href: "/dashboard/docs",
    icon: "📄",
    color: "from-accent-emerald/20 to-accent-emerald/5",
  },
  {
    label: "Architecture",
    description: "Design system architecture",
    href: "/dashboard/architecture",
    icon: "🏗️",
    color: "from-accent-amber/20 to-accent-amber/5",
  },
];

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [greeting, setGreeting] = useState("Hello");
  const { user } = useAuth();

  useEffect(() => {
    setMounted(true);
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  return (
    <div className={`space-y-8 transition-all duration-500 ${mounted ? "opacity-100" : "opacity-0"}`}>
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-bg-secondary via-bg-elevated to-bg-tertiary border border-white/[0.06] p-8">
        {/* Decorative background */}
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-cyan/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-violet/5 rounded-full blur-[80px]" />

        <div className="relative z-10">
          <h1 className="text-2xl lg:text-3xl font-bold text-text-primary mb-2">
            {greeting}, {user?.displayName?.split(" ")[0] || "Developer"} 👋
          </h1>
          <p className="text-text-secondary max-w-xl">
            Your AI assistant is ready. Analyze code, trace bugs, review architecture, and generate documentation — all powered by deep repository intelligence.
          </p>
          <div className="flex items-center gap-4 mt-5">
            <Link
              href="/dashboard/analysis"
              className="btn-primary !py-2.5 !px-6 !text-sm"
            >
              Start Analysis
            </Link>
            <Link
              href="/dashboard/repositories"
              className="btn-ghost !py-2.5 !px-6 !text-sm"
            >
              Import Repository
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => {
          const colors = colorMap[stat.color];
          return (
            <div
              key={stat.label}
              className={`card p-5 animate-fade-in-up ${colors.glow}`}
              style={{ animationDelay: `${i * 100}ms`, animationFillMode: "both" }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-11 h-11 rounded-xl ${colors.bg} flex items-center justify-center ${colors.text}`}>
                  {stat.icon}
                </div>
                <Badge
                  variant={stat.trend === "up" ? "success" : "info"}
                  size="sm"
                >
                  {stat.change}
                </Badge>
              </div>
              <div className="text-3xl font-bold text-text-primary">
                {stat.value}
              </div>
              <div className="text-sm text-text-muted mt-1">
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Quick Actions + Activity */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-bold text-text-primary mb-4">
            Quick Actions
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {quickActions.map((action, i) => (
              <Link
                key={action.label}
                href={action.href}
                className="card-glass p-5 group animate-fade-in-up"
                style={{ animationDelay: `${(i + 4) * 100}ms`, animationFillMode: "both" }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  {action.icon}
                </div>
                <h3 className="text-sm font-bold text-text-primary group-hover:text-accent-cyan transition-colors">
                  {action.label}
                </h3>
                <p className="text-xs text-text-muted mt-1">
                  {action.description}
                </p>
                <div className="flex items-center gap-1 mt-3 text-xs font-medium text-accent-cyan opacity-0 group-hover:opacity-100 transition-all translate-x-0 group-hover:translate-x-1 duration-300">
                  Open
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-lg font-bold text-text-primary mb-4">
            Recent Activity
          </h2>
          <div className="card p-0 divide-y divide-white/[0.06]">
            {recentActivity.map((activity, i) => (
              <div
                key={i}
                className="px-5 py-4 hover:bg-white/[0.02] transition-colors animate-fade-in-up"
                style={{ animationDelay: `${(i + 8) * 80}ms`, animationFillMode: "both" }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {activity.action}
                    </p>
                    <p className="text-xs text-text-muted truncate mt-0.5">
                      {activity.target}
                    </p>
                  </div>
                  <Badge variant={activity.severity} size="sm">
                    {activity.result}
                  </Badge>
                </div>
                <p className="text-[11px] text-text-muted mt-1.5">{activity.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insights Banner */}
      <div className="card-glass p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-accent-violet/5 rounded-full blur-[60px]" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent-violet/10 flex items-center justify-center text-accent-violet shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-text-primary">AI Insight</h3>
            <p className="text-xs text-text-secondary mt-1">
              Based on recent analyses, your most common issue is <span className="text-accent-amber font-medium">unhandled async errors</span> (found in 4 repositories). Consider implementing a centralized error handling pattern.
            </p>
          </div>
          <Link
            href="/dashboard/analysis"
            className="btn-outline !py-2 !px-4 !text-xs shrink-0"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
