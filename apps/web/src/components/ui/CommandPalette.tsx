"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  category: string;
  action: () => void;
  shortcut?: string;
}

const defaultItems: CommandItem[] = [
  {
    id: "dashboard",
    label: "Go to Dashboard",
    description: "View your overview",
    icon: <span className="text-base">📊</span>,
    category: "Navigation",
    action: () => {},
    shortcut: "G D",
  },
  {
    id: "repositories",
    label: "Repositories",
    description: "Manage connected repos",
    icon: <span className="text-base">📁</span>,
    category: "Navigation",
    action: () => {},
  },
  {
    id: "analysis",
    label: "New Analysis",
    description: "Analyze code with AI",
    icon: <span className="text-base">🔍</span>,
    category: "Actions",
    action: () => {},
  },
  {
    id: "docs",
    label: "Generate Docs",
    description: "AI documentation generator",
    icon: <span className="text-base">📄</span>,
    category: "Actions",
    action: () => {},
  },
  {
    id: "architecture",
    label: "Architecture Visualizer",
    description: "AI architecture analysis",
    icon: <span className="text-base">🏗️</span>,
    category: "Actions",
    action: () => {},
  },
  {
    id: "api-keys",
    label: "API Keys",
    description: "Manage your API keys",
    icon: <span className="text-base">🔑</span>,
    category: "Settings",
    action: () => {},
  },
  {
    id: "settings",
    label: "Settings",
    description: "Account & preferences",
    icon: <span className="text-base">⚙️</span>,
    category: "Settings",
    action: () => {},
  },
];

interface CommandPaletteProps {
  extraItems?: CommandItem[];
}

export default function CommandPalette({ extraItems = [] }: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Build items with navigation actions
  const items: CommandItem[] = [
    ...defaultItems.map((item) => ({
      ...item,
      action: () => {
        const routes: Record<string, string> = {
          dashboard: "/dashboard",
          repositories: "/dashboard/repositories",
          analysis: "/dashboard/analysis",
          docs: "/dashboard/docs",
          architecture: "/dashboard/architecture",
          "api-keys": "/dashboard/api-keys",
          settings: "/dashboard/settings",
        };
        const route = routes[item.id];
        if (route) router.push(route);
        setIsOpen(false);
      },
    })),
    ...extraItems,
  ];

  // Filter items
  const filtered = query
    ? items.filter(
        (item) =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          (item.description || "").toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase())
      )
    : items;

  // Group by category
  const grouped = filtered.reduce<Record<string, CommandItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  // Keyboard shortcut to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter" && filtered[selectedIndex]) {
        e.preventDefault();
        filtered[selectedIndex].action();
      } else if (e.key === "Escape") {
        setIsOpen(false);
      }
    },
    [filtered, selectedIndex]
  );

  // Scroll selected item into view
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const selected = list.querySelector('[data-selected="true"]');
    if (selected) {
      selected.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  let flatIndex = -1;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center pt-[20vh] p-4 animate-fade-in"
      onClick={() => setIsOpen(false)}
    >
      <div className="absolute inset-0 backdrop-blur-overlay" />

      <div
        className="relative w-full max-w-xl card-glass p-0 overflow-hidden animate-fade-in-up shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
          <svg
            className="w-5 h-5 text-text-muted shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search commands..."
            className="flex-1 bg-transparent text-text-primary placeholder:text-text-muted outline-none text-sm"
          />
          <kbd className="px-2 py-0.5 rounded bg-white/5 text-text-muted text-xs font-mono border border-white/10">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[340px] overflow-y-auto p-2">
          {Object.entries(grouped).length === 0 ? (
            <div className="py-8 text-center text-text-muted text-sm">
              No results found for &quot;{query}&quot;
            </div>
          ) : (
            Object.entries(grouped).map(([category, categoryItems]) => (
              <div key={category}>
                <div className="px-3 py-2 text-[10px] font-bold text-text-muted uppercase tracking-widest">
                  {category}
                </div>
                {categoryItems.map((item) => {
                  flatIndex++;
                  const currentIndex = flatIndex;
                  const isSelected = currentIndex === selectedIndex;

                  return (
                    <button
                      key={item.id}
                      data-selected={isSelected}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all text-sm
                        ${
                          isSelected
                            ? "bg-accent-cyan/10 text-text-primary"
                            : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
                        }
                      `}
                      onClick={() => item.action()}
                      onMouseEnter={() => setSelectedIndex(currentIndex)}
                    >
                      <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                        {item.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.label}</p>
                        {item.description && (
                          <p className="text-xs text-text-muted truncate">
                            {item.description}
                          </p>
                        )}
                      </div>
                      {item.shortcut && (
                        <kbd className="px-2 py-0.5 rounded bg-white/5 text-text-muted text-[10px] font-mono border border-white/10 shrink-0">
                          {item.shortcut}
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-4 py-2.5 border-t border-white/5 text-[11px] text-text-muted">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] font-mono border border-white/10">↑↓</kbd>
            Navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] font-mono border border-white/10">↵</kbd>
            Select
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] font-mono border border-white/10">ESC</kbd>
            Close
          </span>
        </div>
      </div>
    </div>
  );
}
