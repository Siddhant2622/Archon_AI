"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "@/components/ui/Logo";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login, oauthLogin, isDemo } = useAuth();

  useEffect(() => setMounted(true), []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: "google" | "github") => {
    setError(null);
    try {
      await oauthLogin(provider);
      router.push("/dashboard");
    } catch (err: any) {
      if (
        err.code === "auth/account-exists-with-different-credential" ||
        (err.message &&
          err.message.includes("auth/account-exists-with-different-credential"))
      ) {
        setError(
          "An account already exists with the same email address. Please sign in using the provider you originally used."
        );
      } else {
        setError(err.message || `Failed to sign in with ${provider}`);
      }
    }
  };

  return (
    <div className="min-h-screen flex bg-bg-primary">
      {/* Left Decorative Panel */}
      <div
        className={`hidden lg:flex lg:w-[45%] relative overflow-hidden flex-col justify-between p-12 transition-all duration-1000 ${
          mounted ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-bg-surface via-bg-secondary to-bg-primary" />
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-accent-cyan/[0.06] rounded-full blur-[100px]" />
        <div className="absolute bottom-1/3 left-1/6 w-56 h-56 bg-accent-violet/[0.06] rounded-full blur-[80px]" />

        {/* Floating code snippets */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-32 left-16 opacity-[0.07] font-mono text-xs text-accent-cyan animate-float" style={{ animationDelay: "0.5s" }}>
            <pre>{`const analyze = async (repo) => {\n  const graph = await buildDependencyGraph(repo);\n  return ai.findIssues(graph);\n}`}</pre>
          </div>
          <div className="absolute bottom-24 right-12 opacity-[0.05] font-mono text-xs text-accent-violet animate-float" style={{ animationDelay: "2s" }}>
            <pre>{`interface Finding {\n  severity: "critical" | "high";\n  file: string;\n  suggestion: string;\n}`}</pre>
          </div>
        </div>

        <div className="relative z-10">
          <Link href="/" className="inline-block">
            <Logo size="md" />
          </Link>
        </div>

        <div className="relative z-10 space-y-6">
          <h2 className="text-4xl font-bold text-text-primary leading-tight">
            Welcome back,
            <br />
            <span className="gradient-text">developer.</span>
          </h2>
          <p className="text-text-muted text-lg leading-relaxed max-w-sm">
            Your AI-powered workspace is waiting. Sign in to continue analyzing,
            debugging, and shipping better code.
          </p>
          <div className="flex items-center gap-4 pt-4">
            <div className="flex -space-x-2">
              {["KM", "LS", "PJ", "YH"].map((initials, i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-full border-2 border-bg-surface flex items-center justify-center text-xs font-bold text-text-primary"
                  style={{
                    background: [
                      "linear-gradient(135deg, #0891b2, #06b6d4)",
                      "linear-gradient(135deg, #7c3aed, #8b5cf6)",
                      "linear-gradient(135deg, #059669, #34d399)",
                      "linear-gradient(135deg, #d97706, #fbbf24)",
                    ][i],
                  }}
                >
                  {initials}
                </div>
              ))}
            </div>
            <span className="text-text-muted text-sm">
              Join 10,000+ developers
            </span>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-text-muted/50 text-sm">
            &copy; {new Date().getFullYear()} Archon AI
          </p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div
          className={`w-full max-w-md transition-all duration-700 ${
            mounted
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-6"
          }`}
        >
          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <Link href="/">
              <Logo size="md" />
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Sign in to your account
          </h1>
          <p className="text-text-muted mb-6">
            Welcome back! Enter your credentials to continue.
          </p>

          {isDemo && (
            <div className="mb-6 p-4 bg-accent-cyan/10 border border-accent-cyan/20 rounded-xl text-sm text-accent-cyan">
              <strong>Demo Mode:</strong> Sign in with any email and password,
              or use GitHub/Google for instant access.
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-accent-rose/10 border border-accent-rose/20 text-accent-rose rounded-xl text-sm animate-fade-in">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-1.5">
                Email
              </label>
              <input
                type="email"
                className="base-input"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-semibold text-text-secondary">
                  Password
                </label>
                <a
                  href="#"
                  className="text-sm text-accent-cyan hover:text-accent-cyan/80 font-medium transition-colors"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="base-input !pr-12"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.5 6.5m3.378 3.378l4.242 4.242M6.5 6.5L3 3m3.5 3.5l4.378 4.378m0 0L17.5 17.5m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                  rememberMe
                    ? "bg-accent-cyan border-accent-cyan"
                    : "border-white/20 hover:border-white/40"
                }`}
              >
                {rememberMe && (
                  <svg className="w-3 h-3 text-bg-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <span className="text-sm text-text-muted">
                Remember me for 30 days
              </span>
            </div>

            <Button
              type="submit"
              loading={loading}
              fullWidth
              size="lg"
            >
              Sign In
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 decorative-divider" />
            <span className="text-sm text-text-muted font-medium">
              Or continue with
            </span>
            <div className="flex-1 decorative-divider" />
          </div>

          {/* OAuth */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleOAuth("github")}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20 transition-all text-sm font-semibold text-text-primary"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
                  fill="currentColor"
                />
              </svg>
              GitHub
            </button>
            <button
              onClick={() => handleOAuth("google")}
              className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20 transition-all text-sm font-semibold text-text-primary"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </button>
          </div>

          <p className="text-center text-sm text-text-muted mt-8">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-accent-cyan font-semibold hover:text-accent-cyan/80 transition-colors"
            >
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
