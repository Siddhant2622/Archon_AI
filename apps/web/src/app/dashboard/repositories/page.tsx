"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { Canvas, useFrame } from "@react-three/fiber";
import { Box, Wireframe } from "@react-three/drei";
import * as THREE from "three";
import { useRef, Suspense } from "react";

const EmptyStateModel = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.4;
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
    }
  });
  return (
    <group>
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 5, 2]} intensity={1} color="#06b6d4" />
      <directionalLight position={[-2, -5, -2]} intensity={0.5} color="#3b82f6" />
      <Box ref={meshRef} args={[2, 2, 2]}>
        <meshStandardMaterial color="#0ea5e9" roughness={0.3} metalness={0.7} transparent opacity={0.8} />
      </Box>
    </group>
  );
};

import { useRepoStore, Repository } from "@/stores/useRepoStore";

const languageColors: Record<string, string> = {
  TypeScript: "bg-blue-500", JavaScript: "bg-yellow-400", Python: "bg-green-500",
  Go: "bg-cyan-400", Rust: "bg-orange-500", Java: "bg-red-500", Ruby: "bg-red-400",
  "C#": "bg-purple-500", C: "bg-gray-400", "C++": "bg-pink-500", Swift: "bg-orange-400",
  Kotlin: "bg-violet-500", PHP: "bg-indigo-400", Dart: "bg-sky-400",
};

export default function RepositoriesPage() {
  const { user } = useAuth();
  const { repos, addRepos, removeRepo, _hasHydrated } = useRepoStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [repoUrl, setRepoUrl] = useState("");
  const [importingRepo, setImportingRepo] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => setMounted(true), []);

  const handleImportRepo = async () => {
    if (!repoUrl.trim()) return;
    setImportingRepo(true);
    setError(null);
    try {
      const input = repoUrl.trim();
      const isUrl = input.includes("github.com") || input.includes("/");
      
      const queryParam = isUrl ? `url=${encodeURIComponent(input)}` : `username=${encodeURIComponent(input)}`;
      const res = await fetch(`/api/github?${queryParam}`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to fetch repository data");

      const importedRepos = [];
      const newReposData = data.data?.repos || (data.name ? [data] : []);

      if (newReposData.length === 0) {
         throw new Error("No repositories found.");
      }

      for (const repoData of newReposData) {
        const newRepo: Repository = {
          id: repoData.id?.toString() || repoData.full_name || Math.random().toString(),
          name: repoData.name,
          fullName: repoData.full_name,
          description: repoData.description || "",
          language: repoData.language || "Unknown",
          stars: repoData.stargazers_count || repoData.stars || 0,
          forks: repoData.forks_count || repoData.forks || 0,
          updatedAt: repoData.updated_at || new Date().toISOString(),
          url: repoData.html_url || input,
          isPrivate: repoData.private || false,
        };
        importedRepos.push(newRepo);
      }

      addRepos(importedRepos);

      // Start background indexing for each imported repo
      importedRepos.forEach(repo => {
        useRepoStore.getState().updateRepoStatus(repo.fullName, 'indexing');
        // Kick off the analysis in the background
        fetch(`/api/github/tree?repo=${encodeURIComponent(repo.fullName)}`)
          .then(res => res.json())
          .then(treeData => {
             if (treeData.error) throw new Error(treeData.error);
             useRepoStore.getState().updateRepoStatus(repo.fullName, 'analyzing');
             return fetch(`/api/analyze/repository`, {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({
                 repoFullName: repo.fullName,
                 defaultBranch: treeData.defaultBranch,
                 files: treeData.files,
               })
             });
          })
          .then(res => res.json())
          .then(analysisData => {
            if (analysisData.error) throw new Error(analysisData.error);
            useRepoStore.getState().updateRepoStatus(repo.fullName, 'completed', analysisData);
          })
          .catch(err => {
            console.error("Background indexing failed for", repo.fullName, err);
            useRepoStore.getState().updateRepoStatus(repo.fullName, 'error', undefined, err.message || 'Failed to analyze repository');
          });
      });

      setRepoUrl("");
      setShowModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import repository");
    } finally {
      setImportingRepo(false);
    }
  };

  const handleRemoveRepo = (fullName: string) => {
    removeRepo(fullName);
  };

  const filteredRepos = repos.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.language?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return "Unknown";
    }
  };

  return (
    <div className={`space-y-6 transition-all duration-500 ${mounted ? "opacity-100" : "opacity-0"}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Repositories</h1>
          <p className="text-sm text-text-secondary mt-1">
            Connect GitHub repositories for deep AI analysis
          </p>
        </div>
        <Button
          onClick={() => setShowModal(true)}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
        >
          Import Repository
        </Button>
      </div>

      {/* Search */}
      {repos.length > 0 && (
        <div className="relative max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            className="base-input !pl-10"
            placeholder="Search repositories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      {/* Empty State */}
      {repos.length === 0 && !loading && _hasHydrated && (
        <div className="card p-16 text-center animate-fade-in relative overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
              <Suspense fallback={null}>
                <EmptyStateModel />
              </Suspense>
            </Canvas>
          </div>
          <div className="relative z-10 w-20 h-20 rounded-2xl bg-accent-cyan/10 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-text-primary mb-2">No repositories connected</h3>
          <p className="text-sm text-text-muted max-w-md mx-auto mb-6">
            Import repositories from GitHub to start analyzing code, detecting bugs, reviewing architecture, and generating documentation.
          </p>
          <Button onClick={() => setShowModal(true)} size="lg">
            Import from GitHub
          </Button>
        </div>
      )}

      {/* Repository Grid */}
      {filteredRepos.length > 0 && _hasHydrated && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRepos.map((repo, i) => (
            <div
              key={repo.id}
              className="card-glass p-5 group animate-fade-in-up"
              style={{ animationDelay: `${i * 60}ms`, animationFillMode: "both" }}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-text-primary truncate group-hover:text-accent-cyan transition-colors">
                    {repo.name}
                  </h3>
                </div>
                {repo.isPrivate && <Badge variant="neutral" size="sm">Private</Badge>}
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveRepo(repo.fullName);
                  }}
                  className="text-text-muted hover:text-accent-rose transition-colors"
                  title="Remove Repository"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Description */}
              <p className="text-xs text-text-muted line-clamp-2 mb-4 min-h-[2rem]">
                {repo.description || "No description"}
              </p>

              {/* Meta */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-text-muted">
                  {repo.language && repo.language !== "Unknown" && (
                    <span className="flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${languageColors[repo.language] || "bg-gray-500"}`} />
                      {repo.language}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    {repo.stars.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {repo.status === 'indexing' || repo.status === 'analyzing' ? (
                    <span className="text-xs font-medium text-accent-amber animate-pulse">
                      {repo.status === 'indexing' ? 'Indexing...' : 'Analyzing...'}
                    </span>
                  ) : repo.status === 'completed' ? (
                    <span className="text-xs font-medium text-accent-emerald flex items-center gap-1">
                       <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                       Analyzed
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-text-muted">
                      Pending Analysis
                    </span>
                  )}
                  
                  <Link
                    href="/dashboard/analysis"
                    onClick={() => useRepoStore.getState().setActiveRepo(repo.fullName)}
                    className="text-xs font-medium text-accent-cyan hover:text-accent-cyan/80 transition-colors"
                  >
                    View Analysis
                  </Link>
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text-muted hover:text-accent-cyan transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Updated */}
              <p className="text-[10px] text-text-muted/50 mt-3">Updated {formatDate(repo.updatedAt)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Import Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setRepoUrl(""); setError(null); }}
        title="Import Repository or User"
        description="Enter a GitHub repository URL or a GitHub Username to import all public repositories."
        size="md"
      >
        <div className="space-y-5">
          {/* Repository URL Input */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Repository URL or Username</label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                <input
                  type="text"
                  className="base-input !pl-10"
                  placeholder="https://github.com/owner/repo OR username"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleImportRepo()}
                />
              </div>
              <Button onClick={handleImportRepo} loading={importingRepo} disabled={!repoUrl.trim()}>
                Import
              </Button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-accent-rose/10 border border-accent-rose/20 text-accent-rose rounded-xl text-sm">
              {error}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
