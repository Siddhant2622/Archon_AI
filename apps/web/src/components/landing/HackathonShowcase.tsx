"use client";

import { useState, useRef, Suspense } from "react";
import Link from "next/link";
import { Canvas, useFrame } from "@react-three/fiber";
import { TorusKnot, Box, Sphere, Dodecahedron } from "@react-three/drei";
import * as THREE from "three";

const AbstractModel = ({ type }: { type: "sih" | "aws" | "microsoft" }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.5;
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
    }
  });

  return (
    <group>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} color={type === "sih" ? "#f97316" : type === "aws" ? "#fbbf24" : "#3b82f6"} />
      <directionalLight position={[-5, -5, -5]} intensity={0.5} color={type === "sih" ? "#22c55e" : type === "aws" ? "#f97316" : "#06b6d4"} />
      
      {type === "sih" && (
        <TorusKnot ref={meshRef} args={[1, 0.3, 100, 16]}>
          <meshStandardMaterial color="#f97316" roughness={0.1} metalness={0.8} />
        </TorusKnot>
      )}
      
      {type === "aws" && (
        <Dodecahedron ref={meshRef} args={[1.5, 0]}>
          <meshStandardMaterial color="#fbbf24" roughness={0.2} metalness={0.8} wireframe />
        </Dodecahedron>
      )}
      
      {type === "microsoft" && (
        <Box ref={meshRef} args={[1.8, 1.8, 1.8]}>
          <meshStandardMaterial color="#3b82f6" roughness={0.1} metalness={0.8} />
        </Box>
      )}
    </group>
  );
};

export default function HackathonShowcase() {
  const [activeTab, setActiveTab] = useState<"sih" | "aws" | "microsoft">("sih");

  return (
    <section className="py-24 relative overflow-hidden bg-bg-surface border-y border-white/[0.04]">
      <div className="absolute inset-0 bg-grid-dense opacity-20" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-sm font-bold text-accent-cyan uppercase tracking-widest mb-3">Enterprise Ready</p>
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Built for scale, tailored for <span className="gradient-text">impact</span>
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto">
            See how Archon integrates into specific ecosystems to provide maximum value for developers and enterprises.
          </p>
        </div>

        {/* Custom Tab Bar */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex p-1 bg-white/[0.02] border border-white/[0.06] rounded-xl backdrop-blur-md">
            <button
              onClick={() => setActiveTab("sih")}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "sih"
                  ? "bg-gradient-to-r from-orange-500/20 to-green-500/20 text-white shadow-lg border border-white/10"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              Smart India 🇮🇳
            </button>
            <button
              onClick={() => setActiveTab("aws")}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "aws"
                  ? "bg-gradient-to-r from-orange-500/20 to-yellow-500/20 text-white shadow-lg border border-white/10"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              AWS Ecosystem
            </button>
            <button
              onClick={() => setActiveTab("microsoft")}
              className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === "microsoft"
                  ? "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-white shadow-lg border border-white/10"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              Microsoft / GitHub
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="relative bg-bg-secondary border border-white/[0.06] rounded-2xl p-8 lg:p-12 overflow-hidden shadow-2xl">
          
          {/* SIH Content */}
          {activeTab === "sih" && (
            <div className="animate-fade-in grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6">
                  <span className="text-orange-500 font-bold">Bharat</span>
                  <span className="text-white font-bold">Tech</span>
                  <span className="text-green-500 font-bold">Initiative</span>
                </div>
                <h3 className="text-3xl font-bold mb-4">Built for India's Developer Ecosystem</h3>
                <p className="text-text-secondary mb-6 leading-relaxed">
                  Empowering over 127,000+ Indian developers and startups to ship globally competitive software. Archon AI helps MSMEs cut debugging time by 60%, saving an average of ₹50,000/month per engineering team.
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center text-sm">✓</span>
                    <span className="text-text-primary font-medium">Cost Savings Calculator built-in (INR tracking)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center text-sm">✓</span>
                    <span className="text-text-primary font-medium">Offline-capable Service Worker for low-bandwidth</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center text-sm">✓</span>
                    <span className="text-text-primary font-medium">Supports Indian Open Source Initiatives</span>
                  </li>
                </ul>
                <button className="btn-primary">Calculate Startup Savings</button>
              </div>
              <div className="relative h-[400px] rounded-xl border border-white/10 bg-gradient-to-br from-[#1a1a2e] to-[#16213e] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/e4/India_location_map.svg')] bg-no-repeat bg-center bg-contain opacity-10 filter invert" />
                
                {/* 3D Scene */}
                <div className="absolute inset-0 z-0">
                  <Canvas camera={{ position: [0, 0, 4], fov: 50 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
                    <Suspense fallback={null}><AbstractModel type="sih" /></Suspense>
                  </Canvas>
                </div>

                <div className="relative z-10 text-center space-y-4 backdrop-blur-sm bg-black/20 p-6 rounded-2xl border border-white/5">
                  <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-white to-green-400">127K+</div>
                  <div className="text-sm font-medium tracking-widest text-text-muted uppercase">Active Indian Developers</div>
                </div>
              </div>
            </div>
          )}

          {/* AWS Content */}
          {activeTab === "aws" && (
            <div className="animate-fade-in grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1 relative h-[400px] rounded-xl border border-white/10 bg-[#232f3e]/40 flex flex-col overflow-hidden">
                <div className="absolute inset-0 z-0">
                  <Canvas camera={{ position: [0, 0, 4], fov: 50 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
                    <Suspense fallback={null}><AbstractModel type="aws" /></Suspense>
                  </Canvas>
                </div>
                
                <div className="relative z-10 flex flex-col h-full p-6">
                  <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4 backdrop-blur-md bg-black/20 rounded p-2">
                    <div className="flex items-center gap-2 text-orange-400 font-bold">
                      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current"><path d="M11.996 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0zm-1.893 18.066c-1.397.666-2.52 1.054-3.528 1.054-1.125 0-1.745-.443-1.745-1.465 0-1.571 1.077-3.642 2.766-5.405l.397-.406-.35-.45c-1.34-1.724-1.874-3.04-1.874-4.24 0-1.025.568-1.782 1.545-1.782.905 0 2.052.482 3.504 1.408l.388.248.163-.429c.732-1.928 1.488-2.905 2.193-2.905.772 0 1.258.468 1.258 1.267 0 1.433-.944 3.498-2.563 5.305l-.367.412.316.47c1.373 2.046 2.05 3.518 2.05 4.673 0 1.055-.6 1.83-1.583 1.83-.872 0-2.03-.497-3.486-1.523l-.38-.268-.158.42c-.754 2.003-1.464 2.92-2.148 2.92-.375 0-.715-.152-.962-.432l.564-.46c.1.12.247.185.422.185.342 0 .83-1.022 1.47-3.036l.206-.647-.63-.385c-1.405-.858-2.39-1.36-3.064-1.36-.596 0-.962.333-.962.887 0 .61.43 1.542 1.437 3.018l.307.45-.472.247c-.684.358-1.503.738-2.42.738.56-.23 1.222-.518 1.954-1.023l.53-.365-.24-.582c-.85-2.062-1.22-3.412-1.22-4.417 0-1.475.666-2.58 1.93-3.15.54-.244 1.134-.374 1.765-.374 1.34 0 2.57.545 3.507 1.255l.407.307.195-.465c.81-1.942 1.545-2.943 2.215-2.943.432 0 .762.203.963.593l-.612.385c-.11-.186-.27-.282-.455-.282-.363 0-.897 1.055-1.637 3.23l-.19.56.55.35c1.46.93 2.54 1.516 3.292 1.516.666 0 1.05-.386 1.05-1.033 0-.616-.412-1.638-1.533-3.4l-.35-.55.56-.27c.69-.333 1.46-.74 2.37-1.008l.582-.172-.37.478c-1.362 1.76-2.046 3.4-2.046 4.966 0 1.62.673 2.827 2.054 3.56.51.272 1.077.412 1.676.412 1.393 0 2.65-.572 3.65-1.332l.444-.338-.22.51c-.81 1.88-1.606 2.883-2.316 2.883-.544 0-.962-.257-1.18-.73l.666-.33c.12.247.33.376.58.376.4 0 .97-1.096 1.745-3.327l.185-.53-.55-.386c-1.464-1.026-2.502-1.627-3.176-1.627-.694 0-1.094.4-1.094 1.1 0 .615.35 1.583 1.35 3.328l.33.578-.58.232c-.894.356-1.722.585-2.58.585z"/></svg>
                      AWS Cloud Intelligence
                    </div>
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded">Active Scan</span>
                  </div>
                  <div className="mt-auto space-y-3 font-mono text-sm backdrop-blur-md bg-black/40 p-4 rounded-xl border border-white/10">
                    <div className="p-2 bg-black/40 rounded border border-white/5">
                      <div className="text-orange-300 mb-1">➜ Analyzing cdk-stack.ts...</div>
                      <div className="text-text-muted">Found 12 Lambda functions, 3 RDS instances.</div>
                    </div>
                    <div className="p-2 bg-red-500/10 border border-red-500/20 rounded">
                      <div className="text-red-400 font-bold mb-1">⚠ Over-provisioned Resource Detected</div>
                      <div className="text-text-secondary text-xs">Function 'ImageProcessor' allocated 2048MB. Max usage: 320MB.</div>
                      <div className="text-green-400 mt-2 text-xs">↳ Potential Savings: $847.00 / month</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <h3 className="text-3xl font-bold mb-4">Cloud Cost & Security Intelligence</h3>
                <p className="text-text-secondary mb-6 leading-relaxed">
                  Deep integration with AWS Infrastructure as Code (CloudFormation, CDK, Terraform). Archon AI detects over-provisioned resources, open security groups, and anti-patterns before they get deployed.
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-sm">✓</span>
                    <span className="text-text-primary font-medium">Detect over-provisioned Lambda & ECS resources</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-sm">✓</span>
                    <span className="text-text-primary font-medium">Auto-generate IAM least-privilege policies</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-sm">✓</span>
                    <span className="text-text-primary font-medium">AWS Bedrock integration compatibility</span>
                  </li>
                </ul>
                <button className="btn-primary !bg-gradient-to-r !from-orange-500 !to-yellow-500">Connect AWS Account</button>
              </div>
            </div>
          )}

          {/* Microsoft Content */}
          {activeTab === "microsoft" && (
            <div className="animate-fade-in grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold mb-4">Deep GitHub & Azure Ecosystem Integration</h3>
                <p className="text-text-secondary mb-6 leading-relaxed">
                  Archon AI seamlessly plugs into your existing Microsoft workflows. Get automated PR reviews in GitHub, CI/CD gates in Azure DevOps, and a powerful VS Code extension that works alongside GitHub Copilot.
                </p>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm">✓</span>
                    <span className="text-text-primary font-medium">Automated GitHub Pull Request Reviews</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm">✓</span>
                    <span className="text-text-primary font-medium">VS Code Extension (Copilot Companion)</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm">✓</span>
                    <span className="text-text-primary font-medium">Azure DevOps Pipeline Integration</span>
                  </li>
                </ul>
                <div className="flex gap-4">
                  <button className="btn-outline !border-white/20 !text-white hover:!bg-white/5 flex items-center gap-2">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z"/></svg>
                    Sign in with Microsoft
                  </button>
                </div>
              </div>
              <div className="relative h-[400px] rounded-xl border border-white/10 bg-[#0d1117] overflow-hidden shadow-2xl flex flex-col">
                <div className="absolute inset-0 z-0 opacity-40">
                  <Canvas camera={{ position: [0, 0, 4], fov: 50 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
                    <Suspense fallback={null}><AbstractModel type="microsoft" /></Suspense>
                  </Canvas>
                </div>
                <div className="relative z-10 h-10 bg-[#161b22]/80 backdrop-blur-md border-b border-[#30363d] flex items-center px-4 gap-2">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-text-primary fill-current"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
                  <span className="text-sm font-semibold text-text-primary">Pull Request #420</span>
                </div>
                <div className="relative z-10 flex-1 p-4 flex flex-col gap-4">
                  <div className="p-4 rounded-lg border border-[#30363d] bg-[#161b22]/90 backdrop-blur-md">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-6 h-6 rounded bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-[10px] font-bold text-white">AI</div>
                      <span className="text-sm font-bold text-text-primary">Archon Bot</span>
                    </div>
                    <p className="text-sm text-text-secondary">
                      I've analyzed this pull request. The new <code className="bg-[#0d1117] px-1 rounded">authMiddleware()</code> introduces a potential timing attack vulnerability on line 45. Here is the suggested fix:
                    </p>
                    <div className="mt-3 p-3 rounded bg-[#0d1117] border border-[#30363d] font-mono text-xs">
                      <div className="text-red-400">- if (token === storedToken)</div>
                      <div className="text-green-400">+ if (crypto.timingSafeEqual(Buffer.from(token), Buffer.from(storedToken)))</div>
                    </div>
                    <button className="mt-3 px-3 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-semibold rounded transition-colors">
                      Commit Suggestion
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
