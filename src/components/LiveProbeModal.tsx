import React, { useState } from 'react';
import { X, Globe, ShieldCheck, AlertTriangle, CheckCircle, Search, Server, Lock } from 'lucide-react';

interface LiveProbeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProbeResult {
  success: boolean;
  targetUrl?: string;
  status?: number;
  statusText?: string;
  latencyMs?: number;
  headers?: Record<string, string>;
  hasSecurityTxt?: boolean;
  analysis?: {
    hstsPresent: boolean;
    cspPresent: boolean;
    xfoPresent: boolean;
    xctoPresent: boolean;
    referrerPolicyPresent: boolean;
    serverLeakage: boolean;
    serverValue: string | null;
    isHttps: boolean;
  };
  error?: string;
}

export const LiveProbeModal: React.FC<LiveProbeModalProps> = ({ isOpen, onClose }) => {
  const [urlInput, setUrlInput] = useState('https://');
  const [isProbing, setIsProbing] = useState(false);
  const [result, setResult] = useState<ProbeResult | null>(null);

  if (!isOpen) return null;

  const handleRunProbe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput || !urlInput.startsWith('http')) return;

    setIsProbing(true);
    setResult(null);

    try {
      const res = await fetch(`/api/audit/probe?targetUrl=${encodeURIComponent(urlInput)}`);
      const data = await res.json();
      setResult(data);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to probe target URL';
      setResult({
        success: false,
        error: errorMsg,
      });
    } finally {
      setIsProbing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl rounded-xl border border-neutral-800 bg-neutral-900 p-6 text-neutral-100 shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Live Diagnostic Web Probe</h3>
              <p className="text-xs text-neutral-400">Safe, non-destructive HTTP headers, SSL/TLS, and security.txt baseline audit</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleRunProbe} className="mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://your-startup.in or https://staging.example.com"
                required
                className="w-full pl-10 pr-4 py-2 text-sm bg-neutral-950 border border-neutral-700/80 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <button
              type="submit"
              disabled={isProbing}
              className="px-5 py-2 text-xs font-semibold bg-emerald-500 text-neutral-950 rounded-lg hover:bg-emerald-400 transition-colors flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              {isProbing ? 'Probing...' : 'Audit Headers'}
            </button>
          </div>
          <p className="mt-2 text-xs text-neutral-500">
            *Safe read-only HTTP GET probe. Respects ethical boundaries; does not send destructive payloads.
          </p>
        </form>

        {isProbing && (
          <div className="py-12 text-center text-neutral-400 space-y-3">
            <div className="w-8 h-8 mx-auto border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-mono">Analyzing SSL/TLS handshake & security headers...</p>
          </div>
        )}

        {result && !isProbing && (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {result.success && result.analysis ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
                    <span className="text-neutral-500 block mb-1">HTTP Status</span>
                    <span className="font-mono text-emerald-400 font-semibold">{result.status} {result.statusText}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
                    <span className="text-neutral-500 block mb-1">Latency</span>
                    <span className="font-mono text-neutral-200">{result.latencyMs} ms</span>
                  </div>
                  <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
                    <span className="text-neutral-500 block mb-1">HTTPS Transport</span>
                    <span className={`font-semibold ${result.analysis.isHttps ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {result.analysis.isHttps ? 'Enforced' : 'Plaintext HTTP'}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
                    <span className="text-neutral-500 block mb-1">security.txt</span>
                    <span className={`font-semibold ${result.hasSecurityTxt ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {result.hasSecurityTxt ? 'Found' : 'Missing'}
                    </span>
                  </div>
                </div>

                <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4 space-y-2.5 text-xs">
                  <h4 className="font-semibold text-white mb-2">Essential Security Headers Posture</h4>
                  <div className="grid sm:grid-cols-2 gap-2">
                    <div className="flex items-center justify-between p-2 rounded bg-neutral-900 border border-neutral-800/80">
                      <span>Strict-Transport-Security (HSTS)</span>
                      {result.analysis.hstsPresent ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-medium"><CheckCircle className="w-3.5 h-3.5" /> Present</span>
                      ) : (
                        <span className="text-rose-400 flex items-center gap-1 font-medium"><AlertTriangle className="w-3.5 h-3.5" /> Missing</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-neutral-900 border border-neutral-800/80">
                      <span>Content-Security-Policy (CSP)</span>
                      {result.analysis.cspPresent ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-medium"><CheckCircle className="w-3.5 h-3.5" /> Configured</span>
                      ) : (
                        <span className="text-rose-400 flex items-center gap-1 font-medium"><AlertTriangle className="w-3.5 h-3.5" /> Missing</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-neutral-900 border border-neutral-800/80">
                      <span>X-Frame-Options (Clickjacking)</span>
                      {result.analysis.xfoPresent ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-medium"><CheckCircle className="w-3.5 h-3.5" /> Protected</span>
                      ) : (
                        <span className="text-amber-400 flex items-center gap-1 font-medium"><AlertTriangle className="w-3.5 h-3.5" /> Missing</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-neutral-900 border border-neutral-800/80">
                      <span>X-Content-Type-Options</span>
                      {result.analysis.xctoPresent ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-medium"><CheckCircle className="w-3.5 h-3.5" /> nosniff</span>
                      ) : (
                        <span className="text-amber-400 flex items-center gap-1 font-medium"><AlertTriangle className="w-3.5 h-3.5" /> Missing</span>
                      )}
                    </div>
                  </div>

                  {result.analysis.serverLeakage && (
                    <div className="p-2.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center gap-2">
                      <Server className="w-4 h-4 shrink-0" />
                      <span>Server header exposure detected: <code className="font-mono text-white">{result.analysis.serverValue}</code> (Disclose to CERT-In / Strip in reverse proxy)</span>
                    </div>
                  )}
                </div>

                <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-3">
                  <span className="text-neutral-400 text-xs font-semibold block mb-2">Raw HTTP Response Headers</span>
                  <pre className="text-[11px] font-mono text-neutral-300 overflow-x-auto max-h-40 p-2 bg-neutral-900 rounded">
                    {JSON.stringify(result.headers, null, 2)}
                  </pre>
                </div>
              </>
            ) : (
              <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs space-y-1">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Target Connection Diagnostic Failed</span>
                </div>
                <p className="text-neutral-400">{result.error || 'Target endpoint was unreachable or timed out.'}</p>
                <p className="text-neutral-500 pt-2">Note: For local development, select one of the built-in Indian startup staging targets (BharatPay, KiranaMart, SwasthyaPlus, VidyaSetu).</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
