"use client";

import { useState, useEffect, type ReactNode, useRef, Suspense } from "react";
import { useDocsStore } from "@/stores/useDocsStore";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere } from "@react-three/drei";
import * as THREE from "three";

const DocsModel = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.1;
    }
  });
  return (
    <group>
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 5, 2]} intensity={1} color="#a855f7" />
      <directionalLight position={[-2, -5, -2]} intensity={0.5} color="#06b6d4" />
      <Sphere ref={meshRef} args={[2.5, 32, 32]}>
        <meshStandardMaterial color="#8b5cf6" roughness={0.1} metalness={0.8} wireframe opacity={0.2} transparent />
      </Sphere>
    </group>
  );
};

export default function DocsPage() {
  const {
    code, setCode,
    mode, setMode,
    repoUrl, setRepoUrl,
    language, setLanguage,
    docs, setDocs,
    repoInfo, setRepoInfo
  } = useDocsStore();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleGenerate = async () => {
    if (mode === "snippet" && !code.trim()) return;
    if (mode === "repo" && !repoUrl.trim()) return;

    setLoading(true);
    setError(null);
    setDocs(null);
    setRepoInfo(null);

    try {
      const payload = mode === "snippet" ? { code, language, mode } : { repoUrl, mode };
      const res = await fetch("/api/docs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setDocs(data.data.documentation);
      if (data.data.repoInfo) {
        setRepoInfo(data.data.repoInfo);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const renderMarkdown = (text: string) => {
    const lines = text.split("\n");
    const elements: ReactNode[] = [];
    let inCodeBlock = false;
    let codeLines: string[] = [];
    let codeLanguage = "";

    lines.forEach((line, i) => {
      if (line.startsWith("```")) {
        if (inCodeBlock) {
          elements.push(
            <pre key={`code-${i}`} className="code-block p-4 overflow-x-auto text-sm my-4">
              <code>{codeLines.join("\n")}</code>
            </pre>
          );
          codeLines = [];
          inCodeBlock = false;
        } else {
          codeLanguage = line.replace("```", "").trim();
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeLines.push(line);
        return;
      }

      if (line.startsWith("#### ")) {
        elements.push(<h4 key={i} className="text-base font-bold text-text-primary mt-4 mb-1">{line.replace("#### ", "")}</h4>);
      } else if (line.startsWith("### ")) {
        elements.push(<h3 key={i} className="text-base font-bold text-accent-cyan mt-6 mb-2">{line.replace("### ", "")}</h3>);
      } else if (line.startsWith("## ")) {
        elements.push(<h2 key={i} className="text-xl font-bold text-text-primary mt-8 mb-3 pb-2 border-b border-white/[0.06]">{line.replace("## ", "")}</h2>);
      } else if (line.startsWith("# ")) {
        elements.push(<h1 key={i} className="text-2xl font-bold text-text-primary mt-6 mb-4">{line.replace("# ", "")}</h1>);
      } else if (line.startsWith("- ") || line.startsWith("* ")) {
        elements.push(<li key={i} className="text-sm text-text-secondary ml-4 mb-1 list-disc">{line.replace(/^[-*] /, "")}</li>);
      } else if (line.startsWith("| ")) {
        // Simple table row rendering
        const cells = line.split("|").filter(c => c.trim()).map(c => c.trim());
        if (!line.includes("---")) {
          elements.push(
            <div key={i} className="flex border-b border-white/[0.06]">
              {cells.map((cell, ci) => (
                <div key={ci} className="flex-1 px-3 py-2 text-sm text-text-secondary font-mono text-xs">{cell}</div>
              ))}
            </div>
          );
        }
      } else if (line.trim()) {
        elements.push(<p key={i} className="text-sm text-text-secondary leading-relaxed mb-2">{line}</p>);
      }
    });

    return elements;
  };

  const copyDocs = () => {
    if (docs) {
      navigator.clipboard.writeText(docs);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadDocs = () => {
    if (docs) {
      const blob = new Blob([docs], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${repoInfo?.name?.replace("/", "_") || "documentation"}.md`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className={`space-y-6 transition-all duration-500 ${mounted ? "opacity-100" : "opacity-0"}`}>
      <div className="relative overflow-hidden rounded-xl bg-[#0d1117] p-8 border border-white/5">
        <div className="absolute inset-0 z-0 opacity-40">
          <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
            <Suspense fallback={null}>
              <DocsModel />
            </Suspense>
          </Canvas>
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-text-primary">Documentation Generator</h1>
          <p className="text-sm text-text-secondary mt-2">
            Enter a GitHub repository URL for comprehensive analysis, or paste a code snippet for documentation
          </p>
        </div>
      </div>

      {/* Input Mode Toggle */}
      <div className="flex gap-1 p-1 rounded-xl bg-bg-secondary border border-white/[0.06] w-fit">
        <button
          onClick={() => { setMode("repo"); setDocs(null); setRepoInfo(null); }}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${mode === "repo" ? "bg-accent-cyan/10 text-accent-cyan" : "text-text-muted hover:text-text-primary"}`}
        >
          🔗 GitHub Repository
        </button>
        <button
          onClick={() => { setMode("snippet"); setDocs(null); setRepoInfo(null); }}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${mode === "snippet" ? "bg-accent-cyan/10 text-accent-cyan" : "text-text-muted hover:text-text-primary"}`}
        >
          📝 Code Snippet
        </button>
      </div>

      {/* Input */}
      <div className="card p-6">
        {mode === "snippet" ? (
          <>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1">
                <label className="text-sm font-semibold text-text-secondary mb-1 block">Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="base-input !w-auto sm:!w-48 !appearance-none"
                >
                  {["TypeScript", "JavaScript", "Python", "Go", "Rust", "Java", "C#", "Ruby"].map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-56 px-4 py-3 rounded-xl border border-white/[0.08] focus:border-accent-cyan/40 bg-[#0a0e14] text-accent-emerald/90 font-mono text-sm outline-none resize-none transition-all"
              placeholder="Paste your code here..."
              spellCheck={false}
            />
          </>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-text-secondary mb-1 block">Repository URL</label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  <input
                    type="text"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                    className="base-input !pl-11"
                    placeholder="https://github.com/facebook/react"
                  />
                </div>
              </div>
              <p className="text-xs text-text-muted mt-2">
                Enter any public GitHub repository URL for comprehensive analysis
              </p>
            </div>
            
            {/* What you'll get */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {[
                { icon: "📋", label: "Overview & Installation" },
                { icon: "🏗️", label: "Structure & Patterns" },
                { icon: "⚙️", label: "Tech Stack Analysis" },
                { icon: "🔄", label: "Comparative Analysis" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-xs font-medium text-text-secondary">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="flex justify-end mt-4">
          <button
            onClick={handleGenerate}
            disabled={loading || (mode === "snippet" ? !code.trim() : !repoUrl.trim())}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="loading-spinner-sm" />
                {mode === "repo" ? "Analyzing Repository..." : "Generating..."}
              </>
            ) : (
              <>{mode === "repo" ? "🔍 Analyze Repository" : "📄 Generate Documentation"}</>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="card p-4 border-l-4 border-accent-rose">
          <p className="text-sm text-accent-rose font-semibold">⚠️ {error}</p>
        </div>
      )}

      {loading && (
        <div className="card p-12 flex flex-col items-center gap-4">
          <div className="loading-spinner w-16 h-16" />
          <p className="text-sm text-text-secondary font-medium animate-pulse">
            {mode === "repo" 
              ? "Fetching repository data & generating comprehensive analysis..."
              : "System Engine is writing documentation..."}
          </p>
          {mode === "repo" && (
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {["Fetching metadata", "Reading README", "Analyzing structure", "Identifying patterns", "Comparing alternatives"].map((step, i) => (
                <span
                  key={i}
                  className="text-xs px-3 py-1 rounded-full bg-accent-cyan/10 text-accent-cyan font-mono animate-pulse"
                  style={{ animationDelay: `${i * 0.3}s` }}
                >
                  {step}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Repo Info Card */}
      {repoInfo && !loading && (
        <div className="card p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent-cyan/10 flex items-center justify-center text-2xl">
                📦
              </div>
              <div>
                <h3 className="font-bold text-accent-cyan text-lg">{repoInfo.name}</h3>
                <p className="text-sm text-text-muted">{repoInfo.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-4 text-sm text-text-secondary">
                {repoInfo.stars != null && (
                  <span className="flex items-center gap-1">⭐ {repoInfo.stars.toLocaleString()}</span>
                )}
                {repoInfo.forks != null && (
                  <span className="flex items-center gap-1">🍴 {repoInfo.forks.toLocaleString()}</span>
                )}
                {repoInfo.language && (
                  <span className="px-2 py-0.5 bg-accent-cyan/10 text-accent-cyan rounded-full text-xs font-bold">
                    {repoInfo.language}
                  </span>
                )}
              </div>
              {repoInfo.downloadUrl && (
                <a
                  href={repoInfo.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline !py-2 !px-4 !text-xs flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download ZIP
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {docs && !loading && (
        <div className="card p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-text-primary">
              {mode === "repo" ? "📊 Comprehensive Repository Analysis" : "Generated Documentation"}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={downloadDocs}
                className="btn-ghost !py-2 !px-4 !text-xs flex items-center gap-1"
              >
                ⬇️ Download .md
              </button>
              <button
                onClick={copyDocs}
                className="btn-ghost !py-2 !px-4 !text-xs"
              >
                {copied ? "✅ Copied!" : "📋 Copy Markdown"}
              </button>
            </div>
          </div>
          <div className="prose max-w-none">{renderMarkdown(docs)}</div>
        </div>
      )}
    </div>
  );
}
