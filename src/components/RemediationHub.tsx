import React, { useState } from 'react';
import { Finding } from '../types/audit';
import { ShieldCheck, Copy, Check, Code, FileCode, ShieldAlert, AlertTriangle } from 'lucide-react';

interface RemediationHubProps {
  findings: Finding[];
  selectedFinding?: Finding | null;
}

export const RemediationHub: React.FC<RemediationHubProps> = ({ findings, selectedFinding: initialSelected }) => {
  const [activeFindingId, setActiveFindingId] = useState<string>(
    initialSelected?.id || findings[0]?.id || ''
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const activeFinding = findings.find((f) => f.id === activeFindingId) || findings[0];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-neutral-800 pb-4">
        <h2 className="text-xl font-bold text-white tracking-tight">Vulnerability Remediation & Defensive Code Hub</h2>
        <p className="text-xs text-neutral-400 mt-1">
          Architectural fixes, secure code implementations, and compliance alignments for discovered vulnerabilities.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Finding selector list */}
        <div className="lg:col-span-4 space-y-2">
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
            Vulnerability Queue ({findings.length})
          </span>
          <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
            {findings.map((f) => {
              const isSelected = f.id === activeFinding?.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setActiveFindingId(f.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    isSelected
                      ? 'border-emerald-500/50 bg-neutral-900 shadow-sm'
                      : 'border-neutral-800 bg-neutral-950/60 hover:bg-neutral-900/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-[11px] text-neutral-400 font-bold">{f.id}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        f.severity === 'Critical'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : f.severity === 'High'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                      }`}
                    >
                      {f.severity}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-white line-clamp-1">{f.name}</h4>
                  <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 mt-1">
                    <code className="text-neutral-500 font-mono truncate">{f.targetPath}</code>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Finding Detail & Remediation Code */}
        {activeFinding && (
          <div className="lg:col-span-8 space-y-5">
            <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/70 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-800 pb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-neutral-400 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
                      {activeFinding.id}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded font-bold border ${
                        activeFinding.severity === 'Critical'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : activeFinding.severity === 'High'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                      }`}
                    >
                      {activeFinding.severity}
                    </span>
                    <span className="text-xs text-neutral-400">{activeFinding.moduleCategory}</span>
                  </div>
                  <h3 className="text-base font-bold text-white">{activeFinding.name}</h3>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
                  Vulnerability Root Cause
                </span>
                <p className="text-xs text-neutral-300 leading-relaxed bg-neutral-950/80 p-3 rounded-lg border border-neutral-850">
                  {activeFinding.explanation}
                </p>
              </div>

              {/* Safe Canary Proof of Concept Step */}
              <div className="p-3.5 rounded-lg border border-amber-900/30 bg-amber-950/15 space-y-2">
                <div className="flex items-center justify-between text-xs text-amber-300 font-semibold">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Safe Canary Proof-of-Concept Reproduction</span>
                  </div>
                  <span className="font-mono text-[11px] text-amber-400/80">{activeFinding.pocStep.method} {activeFinding.pocStep.endpoint}</span>
                </div>
                <div className="bg-neutral-950 p-2.5 rounded border border-neutral-800 font-mono text-xs text-neutral-300 overflow-x-auto">
                  {activeFinding.pocStep.safeCanaryPayload}
                </div>
                <div className="text-[11px] text-neutral-400">
                  <span className="text-neutral-300 font-medium">Observed Response:</span> {activeFinding.pocStep.expectedResponse}
                </div>
              </div>

              {/* Compliance Impact */}
              <div className="grid sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
                  <span className="text-neutral-500 font-semibold block mb-1">OWASP Top 10 Mapping</span>
                  <span className="text-neutral-200">{activeFinding.complianceDeficit.owasp}</span>
                </div>
                {activeFinding.complianceDeficit.dpdp2023 && (
                  <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
                    <span className="text-emerald-400 font-semibold block mb-1">DPDP Act 2023 Deficit</span>
                    <span className="text-neutral-200">{activeFinding.complianceDeficit.dpdp2023}</span>
                  </div>
                )}
              </div>

              {/* Remediation Code Fixes */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
                      Defensive Implementation Fix
                    </span>
                    <p className="text-xs text-neutral-400 mt-0.5">{activeFinding.remediation.overview}</p>
                  </div>
                </div>

                {activeFinding.remediation.codeLanguages.map((codeItem, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-neutral-400">
                      <div className="flex items-center gap-2">
                        <Code className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="font-semibold text-white">{codeItem.language}</span>
                        <span className="text-neutral-500 font-mono text-[11px]">({codeItem.fileLocation})</span>
                      </div>
                      <button
                        onClick={() => handleCopy(codeItem.secureSnippet, `code-${idx}`)}
                        className="px-2 py-1 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded flex items-center gap-1 transition-colors"
                      >
                        {copiedKey === `code-${idx}` ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Patch</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/40">
                        <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider block mb-1">
                          Vulnerable Configuration / Endpoint Code
                        </span>
                        <pre className="text-xs font-mono text-rose-200/90 overflow-x-auto whitespace-pre">
                          {codeItem.vulnerableSnippet}
                        </pre>
                      </div>

                      <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/40">
                        <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block mb-1">
                          Patched Production Code (Defensive)
                        </span>
                        <pre className="text-xs font-mono text-emerald-200/90 overflow-x-auto whitespace-pre">
                          {codeItem.secureSnippet}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
