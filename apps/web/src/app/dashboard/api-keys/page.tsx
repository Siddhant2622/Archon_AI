"use client";

import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  createdAt: string;
  lastUsed: string | null;
  expiresAt: string | null;
  status: string;
  usage: number[];
  rawKey?: string;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyScopes, setNewKeyScopes] = useState<string[]>(["read"]);
  const [newKeyExpiry, setNewKeyExpiry] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [revokeConfirm, setRevokeConfirm] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const res = await fetch("/api/api-keys");
      const data = await res.json();
      if (data.success) setKeys(data.data);
    } catch (err) {
      console.error("Failed to fetch keys:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newKeyName.trim()) return;
    try {
      const res = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newKeyName,
          scopes: newKeyScopes,
          expiresIn: newKeyExpiry || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCreatedKey(data.data.rawKey);
        setNewKeyName("");
        setNewKeyScopes(["read"]);
        setNewKeyExpiry("");
        fetchKeys();
      }
    } catch (err) {
      console.error("Failed to create key:", err);
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      const res = await fetch(`/api/api-keys?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchKeys();
        setRevokeConfirm(null);
      }
    } catch (err) {
      console.error("Failed to revoke key:", err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const toggleScope = (scope: string) => {
    setNewKeyScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
  };

  return (
    <div className={`space-y-6 transition-all duration-500 ${mounted ? "opacity-100" : "opacity-0"}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">API Keys</h1>
          <p className="text-sm text-text-secondary mt-1">Manage your API keys for programmatic access</p>
        </div>
        <Button
          onClick={() => { setShowCreate(true); setCreatedKey(null); }}
          icon={<span className="text-lg">+</span>}
        >
          Create New Key
        </Button>
      </div>

      {/* Created Key Alert */}
      {createdKey && (
        <div className="card p-6 border border-accent-emerald bg-accent-emerald/5">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🔑</span>
            <div className="flex-1">
              <h3 className="font-bold text-accent-emerald mb-1">API Key Created Successfully!</h3>
              <p className="text-xs text-text-muted mb-3">
                ⚠️ Copy this key now. You won&apos;t be able to see it again.
              </p>
              <div className="flex items-center gap-2 bg-[#0a0e14] border border-white/[0.08] rounded-lg p-3">
                <code className="flex-1 text-accent-emerald font-mono text-sm break-all">{createdKey}</code>
                <Button
                  onClick={() => copyToClipboard(createdKey)}
                  size="sm"
                  variant={copied ? "primary" : "outline"}
                  className="flex-shrink-0"
                >
                  {copied ? "✓ Copied!" : "Copy"}
                </Button>
              </div>
            </div>
            <button onClick={() => setCreatedKey(null)} className="text-text-muted hover:text-text-primary">✕</button>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && !createdKey && (
        <div className="card p-6 border border-accent-cyan/20 bg-bg-surface/50">
          <h3 className="text-lg font-bold text-text-primary mb-4">Create New API Key</h3>
          <div className="space-y-4">
            <div>
              <Input
                label="Key Name"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g. Production API Key"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-text-secondary mb-1 block">Scopes</label>
              <div className="flex gap-3">
                {["read", "write", "admin"].map((scope) => (
                  <label key={scope} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newKeyScopes.includes(scope)}
                      onChange={() => toggleScope(scope)}
                      className="w-4 h-4 rounded border-white/20 bg-white/5 text-accent-cyan focus:ring-accent-cyan accent-cyan-500"
                    />
                    <span className="text-sm text-text-secondary capitalize">{scope}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-text-secondary mb-1 block">Expires In (days)</label>
              <select
                value={newKeyExpiry}
                onChange={(e) => setNewKeyExpiry(e.target.value)}
                className="base-input !appearance-none"
              >
                <option value="">Never</option>
                <option value="30">30 days</option>
                <option value="60">60 days</option>
                <option value="90">90 days</option>
                <option value="180">180 days</option>
                <option value="365">1 year</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleCreate}
                disabled={!newKeyName.trim()}
              >
                Generate Key
              </Button>
              <Button
                onClick={() => setShowCreate(false)}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Keys List */}
      {loading ? (
        <div className="card p-12 flex flex-col items-center gap-4">
          <div className="loading-spinner w-12 h-12" />
          <p className="text-sm text-text-muted">Loading API keys...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {keys.map((key) => (
            <div
              key={key.id}
              className={`card p-6 transition-all ${key.status === "revoked" ? "opacity-50" : ""}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent-cyan/10 flex items-center justify-center text-2xl flex-shrink-0">
                    🔑
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-text-primary">{key.name}</h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          key.status === "active"
                            ? "bg-accent-emerald/10 text-accent-emerald border border-accent-emerald/20"
                            : "bg-accent-rose/10 text-accent-rose border border-accent-rose/20"
                        }`}
                      >
                        {key.status}
                      </span>
                    </div>
                    <p className="text-sm font-mono text-text-muted">{key.keyPrefix}••••••••••••</p>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-text-muted">
                      <span>Created: {formatDate(key.createdAt)}</span>
                      {key.lastUsed && <span>Last used: {formatDate(key.lastUsed)}</span>}
                      {key.expiresAt && <span>Expires: {formatDate(key.expiresAt)}</span>}
                    </div>
                    <div className="flex gap-1.5 mt-2">
                      {key.scopes.map((scope) => (
                        <span
                          key={scope}
                          className="px-2 py-0.5 bg-white/[0.04] border border-white/[0.08] text-text-secondary text-xs font-semibold rounded capitalize"
                        >
                          {scope}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Usage sparkline */}
                  <div className="hidden sm:flex items-end gap-0.5 h-8">
                    {key.usage.map((val, i) => (
                      <div
                        key={i}
                        className="w-2 rounded-t-sm bg-accent-cyan/30 transition-all hover:bg-accent-cyan"
                        style={{ height: `${(val / Math.max(...key.usage, 1)) * 100}%` }}
                        title={`${val} requests`}
                      />
                    ))}
                  </div>

                  {key.status === "active" && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => copyToClipboard(key.keyPrefix + "...")}
                        variant="outline"
                        size="sm"
                      >
                        Copy
                      </Button>
                      {revokeConfirm === key.id ? (
                        <div className="flex gap-1">
                          <Button
                            onClick={() => handleRevoke(key.id)}
                            variant="danger"
                            size="sm"
                          >
                            Confirm
                          </Button>
                          <Button
                            onClick={() => setRevokeConfirm(null)}
                            variant="outline"
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => setRevokeConfirm(key.id)}
                          variant="ghost"
                          size="sm"
                          className="!text-accent-rose hover:!bg-accent-rose/10"
                        >
                          Revoke
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {keys.length === 0 && (
            <div className="card p-12 text-center">
              <p className="text-4xl mb-3">🔑</p>
              <p className="text-lg font-bold text-text-primary mb-1">No API Keys Yet</p>
              <p className="text-sm text-text-muted">Create your first API key to get started</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
