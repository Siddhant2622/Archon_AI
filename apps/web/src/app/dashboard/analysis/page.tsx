"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRepoStore, Repository } from "@/stores/useRepoStore";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Canvas, useFrame } from "@react-three/fiber";
import { Icosahedron } from "@react-three/drei";
import * as THREE from "three";

const HealthModel = ({ score }: { score: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
    }
  });
  
  const color = score >= 80 ? "#34d399" : score >= 60 ? "#fbbf24" : "#f43f5e";

  return (
    <group>
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 5, 2]} intensity={1} color={color} />
      <directionalLight position={[-2, -5, -2]} intensity={0.5} color={color} />
      <Icosahedron ref={meshRef} args={[2.5, 0]}>
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.8} wireframe opacity={0.3} transparent />
      </Icosahedron>
    </group>
  );
};

const getScoreColor = (score: number) => {
  if (score >= 80) return "text-accent-emerald";
  if (score >= 60) return "text-accent-amber";
  return "text-accent-rose";
};

const getScoreBg = (score: number) => {
  if (score >= 80) return "bg-accent-emerald/10";
  if (score >= 60) return "bg-accent-amber/10";
  return "bg-accent-rose/10";
};

const getScoreGlow = (score: number) => {
  if (score >= 80) return "rgba(52,211,153,0.3)";
  if (score >= 60) return "rgba(251,191,36,0.3)";
  return "rgba(244,63,94,0.3)";
};

export default function AnalysisPage() {
  const { repos, activeRepoFullName, setActiveRepo, updateRepoStatus, _hasHydrated } = useRepoStore();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "architecture" | "performance" | "security" | "quality" | "traces">("overview");

  useEffect(() => setMounted(true), []);

  const activeRepo = repos.find(r => r.fullName === activeRepoFullName);

  const handleRunAnalysis = async () => {
    if (!activeRepo) return;
    updateRepoStatus(activeRepo.fullName, 'indexing');

    try {
      // 1. Fetch file tree
      const treeRes = await fetch(`/api/github/tree?repo=${encodeURIComponent(activeRepo.fullName)}`);
      const treeData = await treeRes.json();
      
      if (!treeRes.ok) throw new Error(treeData.error || 'Failed to fetch repository tree');

      updateRepoStatus(activeRepo.fullName, 'analyzing');

      // 2. Run repository analysis
      const analyzeRes = await fetch(`/api/analyze/repository`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoFullName: activeRepo.fullName,
          defaultBranch: treeData.defaultBranch,
          files: treeData.files,
        })
      });
      const analysisData = await analyzeRes.json();

      if (!analyzeRes.ok) throw new Error(analysisData.error || 'Analysis failed');

      // 3. Save results
      updateRepoStatus(activeRepo.fullName, 'completed', analysisData);
    } catch (err: any) {
      console.error(err);
      updateRepoStatus(activeRepo.fullName, 'error', undefined, err.message || 'Failed to analyze repository');
      alert(err.message || 'Failed to analyze repository');
    }
  };

  const renderSection = (title: string, sectionKey: keyof NonNullable<Repository['analysisResult']>['sections']) => {
    if (!activeRepo?.analysisResult?.sections) return null;
    const section = activeRepo.analysisResult.sections[sectionKey];
    if (!section) return null;

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4 mb-4">
          <div 
            className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold border border-white/10 ${getScoreBg(section.score)} ${getScoreColor(section.score)}`}
            style={{ boxShadow: `0 0 20px ${getScoreGlow(section.score)}` }}
          >
            {section.score}
          </div>
          <div>
            <h2 className="text-xl font-bold text-text-primary">{title} Analysis</h2>
            <p className="text-sm text-text-secondary">Detailed breakdown and improvements</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="card-glass p-5">
            <h3 className="text-sm font-bold text-accent-rose mb-4 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              Reasons for Score
            </h3>
            <ul className="space-y-3">
              {section.reasons?.map((reason: string, i: number) => (
                <li key={i} className="text-sm text-text-muted flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-rose mt-1.5 shrink-0" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>

          <div className="card-glass p-5">
            <h3 className="text-sm font-bold text-accent-emerald mb-4 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              How to Improve
            </h3>
            <ul className="space-y-3">
              {section.improvements?.map((imp: string, i: number) => (
                <li key={i} className="text-sm text-text-muted flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald mt-1.5 shrink-0" />
                  {imp}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Repository Intelligence</h1>
          <p className="text-sm text-text-secondary mt-1">
            Deep context-aware analysis across your entire codebase.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            className="base-input max-w-xs"
            value={activeRepoFullName || ""}
            onChange={(e) => setActiveRepo(e.target.value)}
          >
            <option value="" disabled>Select Repository...</option>
            {repos.map(r => (
              <option key={r.fullName} value={r.fullName}>{r.name}</option>
            ))}
          </select>
          {activeRepo && (
            <Button 
              onClick={handleRunAnalysis}
              loading={activeRepo.status === 'indexing' || activeRepo.status === 'analyzing'}
            >
              {activeRepo.status === 'indexing' ? 'Indexing...' : activeRepo.status === 'analyzing' ? 'Analyzing...' : 'Run Analysis'}
            </Button>
          )}
        </div>
      </div>

      {!activeRepo && _hasHydrated && (
        <div className="card p-16 text-center">
          <h3 className="text-lg font-bold text-text-primary mb-2">No Repository Selected</h3>
          <p className="text-sm text-text-muted">Please select a repository from the dropdown to view its intelligence report.</p>
        </div>
      )}

      {activeRepo && (activeRepo.status === 'idle' || activeRepo.status === 'error') && !activeRepo.analysisResult && (
        <div className="card p-16 text-center border border-white/5">
          <div className="w-20 h-20 rounded-2xl bg-accent-cyan/10 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-text-primary mb-2">Ready to Analyze</h3>
          <p className="text-sm text-text-secondary mb-6 max-w-md mx-auto">
            Click on <strong>Run Analysis</strong> to get comprehensive information, architecture breakdown, and health metrics for this repository.
          </p>
          <Button onClick={handleRunAnalysis} className="mx-auto shadow-lg shadow-accent-cyan/20">
            Run Analysis
          </Button>
          
          {activeRepo.status === 'error' && activeRepo.errorMessage && (
            <p className="text-xs text-accent-rose mt-4 font-medium flex items-center justify-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              Previous background attempt failed: {activeRepo.errorMessage}
            </p>
          )}
        </div>
      )}

      {activeRepo && (activeRepo.status === 'indexing' || activeRepo.status === 'analyzing') && !activeRepo.analysisResult && (
        <div className="card p-16 flex flex-col items-center gap-4">
          <div className="loading-spinner w-16 h-16" />
          <div className="text-center space-y-2">
            <p className="text-sm text-text-secondary font-medium animate-pulse">
              {activeRepo.status === 'indexing' ? 'Indexing codebase files...' : 'AI Engine is analyzing repository context...'}
            </p>
          </div>
        </div>
      )}

      {activeRepo && activeRepo.status === 'completed' && activeRepo.analysisResult && (
        <div className="space-y-6">
          {/* Main Scorecard */}
          <div className="card-glass p-6 relative overflow-hidden">
            <div className="absolute inset-0 z-0 pointer-events-none right-0 opacity-40">
              <Canvas camera={{ position: [0, 0, 5], fov: 50 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
                <Suspense fallback={null}>
                  <HealthModel score={activeRepo.analysisResult.score} />
                </Suspense>
              </Canvas>
            </div>
            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
              <div className="flex-1 text-center lg:text-left backdrop-blur-sm bg-black/20 p-4 rounded-xl border border-white/5">
                <h2 className="text-lg font-bold text-text-primary mb-2">Overall Health</h2>
                <p className="text-sm text-text-secondary leading-relaxed">{activeRepo.analysisResult.summary}</p>
              </div>
              <div 
                className="w-32 h-32 rounded-full flex items-center justify-center text-4xl font-black bg-[#0d1117]/80 backdrop-blur-md border-4 shrink-0 relative"
                style={{ 
                  borderColor: getScoreColor(activeRepo.analysisResult.score).replace('text-', ''),
                  boxShadow: `0 0 30px ${getScoreGlow(activeRepo.analysisResult.score)}`
                }}
              >
                <span className={getScoreColor(activeRepo.analysisResult.score)}>{activeRepo.analysisResult.score}</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 p-1 bg-bg-secondary rounded-xl border border-white/[0.06]">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'architecture', label: 'Architecture' },
              { id: 'performance', label: 'Performance' },
              { id: 'security', label: 'Security' },
              { id: 'quality', label: 'Code Quality' },
              { id: 'traces', label: 'Root Cause Traces' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id ? 'bg-accent-cyan/10 text-accent-cyan' : 'text-text-muted hover:text-text-primary hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(activeRepo.analysisResult.metrics || {}).map(([key, score]: [string, any]) => (
                  <div key={key} className="card-glass p-4 flex flex-col items-center justify-center gap-2">
                    <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className={`text-3xl font-bold ${getScoreColor(score)}`}>{score}</span>
                  </div>
                ))}
              </div>
            )}
            
            {activeTab === 'architecture' && renderSection('Architecture', 'architecture')}
            {activeTab === 'performance' && renderSection('Performance', 'performance')}
            {activeTab === 'security' && renderSection('Security', 'security')}
            {activeTab === 'quality' && renderSection('Code Quality', 'codeQuality')}
            
            {activeTab === 'traces' && (
              <div className="space-y-4">
                {activeRepo.analysisResult.rootCauseTraces?.map((trace: any, i: number) => (
                  <div key={i} className="card-glass p-5 border-l-4 border-l-accent-rose">
                    <h3 className="text-lg font-bold text-text-primary mb-2">{trace.bug}</h3>
                    <p className="text-sm text-text-secondary mb-4">{trace.explanation}</p>
                    <div className="mb-4">
                      <span className="text-xs font-semibold text-text-muted uppercase mb-2 block">Impacted Files</span>
                      <div className="flex flex-wrap gap-2">
                        {trace.files?.map((f: string) => (
                          <Badge key={f} variant="neutral" size="sm">{f}</Badge>
                        ))}
                      </div>
                    </div>
                    {trace.fix && (
                      <div className="mt-4">
                        <span className="text-xs font-semibold text-text-muted uppercase mb-2 block">Suggested Fix</span>
                        <pre className="p-3 bg-[#0d1117] rounded-lg border border-white/[0.06] text-xs text-gray-300 overflow-x-auto">
                          <code>{trace.fix}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
                {(!activeRepo.analysisResult.rootCauseTraces || activeRepo.analysisResult.rootCauseTraces.length === 0) && (
                  <div className="text-center p-8 text-text-muted">No root causes detected in the current scan.</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
