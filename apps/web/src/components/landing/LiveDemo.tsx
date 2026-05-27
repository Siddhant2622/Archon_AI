"use client";

import { useState, useRef, useEffect } from "react";

export default function LiveDemo() {
  const [tab, setTab] = useState<"url" | "code">("url");
  const [repoUrl, setRepoUrl] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<any[]>([]);
  const [score, setScore] = useState(0);
  const outputEndRef = useRef<HTMLDivElement>(null);

  const [options, setOptions] = useState({
    security: true,
    bugs: true,
    performance: true,
    architecture: true,
  });

  const presetRepos = [
    { label: "facebook/react", url: "https://github.com/facebook/react" },
    { label: "vercel/next.js", url: "https://github.com/vercel/next.js" },
    { label: "microsoft/vscode", url: "https://github.com/microsoft/vscode" },
  ];

  const mockAnalysisData = [
    { type: "info", text: "Initializing analysis engine..." },
    { type: "info", text: "Cloning repository structure..." },
    { type: "success", text: "Repository indexed successfully (14,203 files)" },
    { type: "info", text: "Starting deep semantic analysis..." },
    { type: "warning", file: "packages/react-reconciler/src/ReactFiberWorkLoop.js", line: 421, text: "Potential memory leak in work loop closure", severity: "medium" },
    { type: "error", file: "packages/react-dom/src/client/ReactDOMComponent.js", line: 1045, text: "XSS vulnerability in attribute sanitization", severity: "high" },
    { type: "suggestion", file: "packages/react/src/ReactHooks.js", line: 89, text: "Could optimize array allocation to improve render performance", severity: "low" },
    { type: "architecture", file: "packages/scheduler/src/forks/Scheduler.js", line: 12, text: "Circular dependency detected with ReactFiberWorkLoop", severity: "medium" },
    { type: "success", text: "Analysis complete. Generated 4 findings." },
  ];

  const handleAnalyze = async () => {
    if (tab === "url" && !repoUrl.trim()) return;
    if (tab === "code" && !code.trim()) return;

    setLoading(true);
    setOutput([]);
    setScore(0);

    // Mock Streaming
    let delay = 0;
    mockAnalysisData.forEach((item, index) => {
      delay += Math.random() * 500 + 300; // Random delay between 300-800ms
      setTimeout(() => {
        setOutput((prev) => [...prev, item]);
        if (index === mockAnalysisData.length - 1) {
          setLoading(false);
          setScore(89);
        }
      }, delay);
    });
  };

  useEffect(() => {
    outputEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [output]);

  return (
    <section id="demo" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-bg-secondary opacity-50" />
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-sm font-bold text-accent-emerald uppercase tracking-widest mb-3">Live Demo</p>
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            See the AI Engine in action
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            Test our analysis engine in real-time without an account. Try a public repository or paste a snippet.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Left Panel: Input */}
          <div className="card-glass p-6 flex flex-col h-full">
            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-xl bg-bg-secondary border border-white/[0.06] mb-6">
              <button
                onClick={() => setTab("url")}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${tab === "url" ? "bg-accent-cyan/10 text-accent-cyan" : "text-text-muted hover:text-text-primary"}`}
              >
                🔗 GitHub URL
              </button>
              <button
                onClick={() => setTab("code")}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${tab === "code" ? "bg-accent-cyan/10 text-accent-cyan" : "text-text-muted hover:text-text-primary"}`}
              >
                📝 Paste Code
              </button>
            </div>

            {/* Input Area */}
            <div className="flex-1 flex flex-col min-h-[300px]">
              {tab === "url" ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-text-secondary mb-2 block">Repository URL</label>
                    <input
                      type="text"
                      value={repoUrl}
                      onChange={(e) => setRepoUrl(e.target.value)}
                      className="base-input"
                      placeholder="https://github.com/user/repo"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted mb-2 font-medium">Or try a preset:</p>
                    <div className="flex flex-wrap gap-2">
                      {presetRepos.map((preset) => (
                        <button
                          key={preset.label}
                          onClick={() => setRepoUrl(preset.url)}
                          className="px-3 py-1.5 rounded-lg border border-white/[0.08] text-xs font-medium text-text-secondary hover:text-accent-cyan hover:border-accent-cyan/30 transition-all bg-[#0f1724]"
                        >
                          Try: {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col">
                  <label className="text-sm font-semibold text-text-secondary mb-2 block">Code Snippet</label>
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="flex-1 w-full p-4 rounded-xl border border-white/[0.08] bg-[#0a0e14] text-accent-emerald/90 font-mono text-sm outline-none resize-none focus:border-accent-cyan/40 transition-all"
                    placeholder="def query_user(user_id):&#10;  # Potential SQL Injection here&#10;  cursor.execute(f'SELECT * FROM users WHERE id = {user_id}')&#10;  return cursor.fetchone()"
                    spellCheck={false}
                  />
                </div>
              )}
            </div>

            {/* Options */}
            <div className="mt-6 pt-6 border-t border-white/[0.06]">
              <div className="flex flex-wrap gap-4 mb-6">
                {Object.entries(options).map(([key, value]) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={() => setOptions((prev) => ({ ...prev, [key]: !value }))}
                      className="w-4 h-4 rounded border-white/[0.2] bg-bg-secondary text-accent-cyan focus:ring-accent-cyan focus:ring-offset-bg-primary"
                    />
                    <span className="text-xs font-medium text-text-secondary capitalize">{key}</span>
                  </label>
                ))}
              </div>
              
              <button
                onClick={handleAnalyze}
                disabled={loading || (tab === "url" ? !repoUrl : !code)}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="loading-spinner-sm" />
                    Analyzing...
                  </>
                ) : (
                  <>🚀 Run Analysis</>
                )}
              </button>
            </div>
          </div>

          {/* Right Panel: Output */}
          <div className="card-glass p-0 flex flex-col h-full bg-[#0a0e14]/90 border-white/[0.04]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-accent-rose/50" />
                  <div className="w-3 h-3 rounded-full bg-accent-amber/50" />
                  <div className="w-3 h-3 rounded-full bg-accent-emerald/50" />
                </div>
                <span className="text-xs font-mono text-text-muted">Analysis Terminal</span>
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded bg-accent-cyan/10 text-accent-cyan">
                Demo Mode
              </span>
            </div>

            {/* Terminal Body */}
            <div className="flex-1 p-6 overflow-y-auto font-mono text-sm space-y-3 max-h-[400px]">
              {output.length === 0 && !loading && (
                <div className="text-text-muted opacity-50">
                  ← Paste a URL or code to see AI analysis in real-time
                </div>
              )}
              
              {output.map((item, i) => (
                <div key={i} className="animate-slide-in-right opacity-0" style={{ animationDelay: '50ms', animationFillMode: 'forwards' }}>
                  {item.file && (
                    <div className="text-text-muted text-xs mb-1 break-all">
                      {item.file}:{item.line}
                    </div>
                  )}
                  <div className="flex items-start gap-2">
                    <span className="shrink-0 mt-0.5">
                      {item.type === "info" && <span className="text-text-muted">ℹ️</span>}
                      {item.type === "success" && <span className="text-accent-emerald">✅</span>}
                      {item.type === "error" && <span className="text-accent-rose">🔴</span>}
                      {item.type === "warning" && <span className="text-accent-amber">🟡</span>}
                      {item.type === "suggestion" && <span className="text-accent-emerald">🟢</span>}
                      {item.type === "architecture" && <span className="text-accent-cyan">🔵</span>}
                    </span>
                    <span className={`
                      ${item.type === "info" ? "text-text-secondary" : ""}
                      ${item.type === "success" ? "text-text-primary" : ""}
                      ${item.type === "error" ? "text-accent-rose" : ""}
                      ${item.type === "warning" ? "text-accent-amber" : ""}
                      ${item.type === "suggestion" ? "text-accent-emerald" : ""}
                      ${item.type === "architecture" ? "text-accent-cyan" : ""}
                    `}>
                      {item.text}
                    </span>
                    {item.severity && (
                      <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded ml-auto
                        ${item.severity === "high" ? "bg-accent-rose/10 text-accent-rose" : ""}
                        ${item.severity === "medium" ? "bg-accent-amber/10 text-accent-amber" : ""}
                        ${item.severity === "low" ? "bg-accent-emerald/10 text-accent-emerald" : ""}
                      `}>
                        {item.severity}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              <div ref={outputEndRef} />
            </div>

            {/* Footer Score */}
            {score > 0 && (
              <div className="px-6 py-4 border-t border-white/[0.06] flex items-center justify-between bg-white/[0.01] animate-fade-in">
                <div>
                  <div className="text-xs text-text-muted uppercase tracking-wider font-bold mb-1">Code Health Score</div>
                  <div className="text-sm text-text-secondary">Based on {mockAnalysisData.length - 4} findings</div>
                </div>
                <div className="w-12 h-12 rounded-full border-4 border-accent-emerald flex items-center justify-center text-accent-emerald font-bold bg-accent-emerald/10 shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                  {score}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
