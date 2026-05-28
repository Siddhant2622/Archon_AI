"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "@/components/ui/Logo";
import CommandPalette from "@/components/ui/CommandPalette";
import ErrorBoundary from "@/components/ErrorBoundary";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  section?: string;
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    section: "Workspace",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: "Repositories",
    href: "/dashboard/repositories",
    section: "Workspace",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    ),
  },
  {
    label: "Analysis",
    href: "/dashboard/analysis",
    section: "Analysis",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    label: "Architecture",
    href: "/dashboard/architecture",
    section: "Analysis",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    label: "Documentation",
    href: "/dashboard/docs",
    section: "Analysis",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    label: "API Keys",
    href: "/dashboard/api-keys",
    section: "Settings",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    ),
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    section: "Settings",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    // Redirect to login if not loading and no user
    if (mounted && !user) {
      window.location.href = "/login";
    }
  }, [user, mounted]);

  // Group nav items by section
  const sections = navItems.reduce<Record<string, NavItem[]>>((acc, item) => {
    const section = item.section || "Other";
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {});

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const initials = user?.displayName
    ? user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <div className="min-h-screen bg-bg-primary flex">
      {/* ===== Command Palette ===== */}
      <CommandPalette />

      {/* ===== Mobile Overlay ===== */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 backdrop-blur-overlay lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ===== Sidebar ===== */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen flex flex-col
          bg-bg-surface border-r border-white/[0.06]
          transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? "w-[72px]" : "w-64"}
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:sticky
        `}
      >
        {/* Logo */}
        <div className={`flex items-center h-16 shrink-0 border-b border-white/[0.06] ${sidebarCollapsed ? "justify-center px-2" : "px-5"}`}>
          <Link href="/" className="flex items-center gap-2 group">
            <Logo size="sm" showText={!sidebarCollapsed} />
          </Link>
          {!sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(true)}
              className="ml-auto p-1.5 text-text-muted hover:text-text-primary hover:bg-white/5 rounded-lg transition-all hidden lg:block"
              aria-label="Collapse sidebar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          )}
          {sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="absolute -right-3 top-5 w-6 h-6 rounded-full bg-bg-tertiary border border-white/10 flex items-center justify-center text-text-muted hover:text-text-primary transition-all hidden lg:flex"
              aria-label="Expand sidebar"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>

        {/* Command palette trigger */}
        {!sidebarCollapsed && (
          <div className="px-3 pt-4 pb-2">
            <button
              onClick={() => {
                const event = new KeyboardEvent("keydown", { key: "k", ctrlKey: true });
                document.dispatchEvent(event);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-text-muted hover:text-text-secondary hover:border-white/10 transition-all text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="flex-1 text-left text-xs">Search...</span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] font-mono border border-white/10">
                ⌘K
              </kbd>
            </button>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-5">
          {Object.entries(sections).map(([section, items]) => (
            <div key={section}>
              {!sidebarCollapsed && (
                <div className="px-3 mb-2 text-[10px] font-bold text-text-muted uppercase tracking-[0.15em]">
                  {section}
                </div>
              )}
              <div className="space-y-1">
                {items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`
                        flex items-center gap-3 rounded-xl transition-all duration-200 group relative
                        ${sidebarCollapsed ? "justify-center p-2.5" : "px-3 py-2.5"}
                        ${
                          active
                            ? "bg-accent-cyan/10 text-accent-cyan"
                            : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                        }
                      `}
                      data-tooltip={sidebarCollapsed ? item.label : undefined}
                    >
                      {/* Active indicator */}
                      {active && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-accent-cyan" />
                      )}
                      <span className={`shrink-0 transition-colors ${active ? "text-accent-cyan" : "text-text-muted group-hover:text-text-secondary"}`}>
                        {item.icon}
                      </span>
                      {!sidebarCollapsed && (
                        <span className="text-sm font-medium">{item.label}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Status & User */}
        <div className="shrink-0 border-t border-white/[0.06]">
          {/* AI Status */}
          {!sidebarCollapsed && (
            <div className="px-4 py-3 flex items-center gap-2">
              <span className="status-online animate-pulse" />
              <span className="text-[11px] text-text-muted">AI Engine Online</span>
            </div>
          )}

          {/* User Profile */}
          <div className={`border-t border-white/[0.06] ${sidebarCollapsed ? "px-2 py-3 flex justify-center" : "px-4 py-3"}`}>
            <div className={`flex items-center ${sidebarCollapsed ? "" : "gap-3"}`}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-cyan/30 to-accent-violet/30 flex items-center justify-center text-xs font-bold text-text-primary border border-white/10 shrink-0">
                {initials}
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {user?.displayName || "User"}
                  </p>
                  <p className="text-[11px] text-text-muted truncate">
                    {user?.email || "user@archon.dev"}
                  </p>
                </div>
              )}
              {!sidebarCollapsed && (
                <button
                  onClick={async () => {
                    await logout();
                    window.location.href = "/login";
                  }}
                  className="p-2 text-text-muted hover:text-accent-rose hover:bg-accent-rose/10 rounded-lg transition-all"
                  aria-label="Sign out"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* ===== Main Content ===== */}
      <main className="flex-1 min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 glass-heavy border-b border-white/[0.06] flex items-center gap-4 px-6">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-text-muted hover:text-text-primary hover:bg-white/5 rounded-lg transition-all lg:hidden"
            aria-label="Open menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-text-muted">Dashboard</span>
            {pathname !== "/dashboard" && (
              <>
                <span className="text-text-muted">/</span>
                <span className="text-text-primary font-medium capitalize">
                  {pathname.split("/").pop()?.replace(/-/g, " ")}
                </span>
              </>
            )}
          </div>

          <div className="flex-1" />

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Keyboard shortcut hint */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-text-muted">
              <kbd className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] font-mono border border-white/10">⌘K</kbd>
              <span>Search</span>
            </div>

            {/* Notifications (placeholder) */}
            <button className="p-2 text-text-muted hover:text-text-primary hover:bg-white/5 rounded-lg transition-all relative">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-rose" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div
          className={`p-6 lg:p-8 transition-opacity duration-500 ${
            mounted ? "opacity-100" : "opacity-0"
          }`}
        >
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}
