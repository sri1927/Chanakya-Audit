import React, { useState } from 'react';
import { DPDP_REQUIREMENTS, CERT_IN_DIRECTIVES, OWASP_TOP_10 } from '../data/complianceDatabase';
import { ShieldCheck, AlertOctagon, Clock, BookOpen, Scale, FileText, CheckCircle2 } from 'lucide-react';

export const ComplianceMatrix: React.FC = () => {
  const [activeFramework, setActiveFramework] = useState<'dpdp' | 'cert-in' | 'owasp'>('dpdp');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Regulatory & Compliance Baselines</h2>
          <p className="text-xs text-neutral-400 mt-1">
            Automated verification against Digital Personal Data Protection Act (DPDP) 2023, CERT-In Directives, and OWASP Top 10.
          </p>
        </div>

        {/* Segmented filter control (Allowed as functional button element per Section 1.A) */}
        <div className="flex items-center gap-1 p-1 bg-neutral-900 border border-neutral-800 rounded-lg shrink-0">
          <button
            onClick={() => setActiveFramework('dpdp')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeFramework === 'dpdp'
                ? 'bg-emerald-500 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            DPDP Act 2023
          </button>
          <button
            onClick={() => setActiveFramework('cert-in')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeFramework === 'cert-in'
                ? 'bg-emerald-500 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            CERT-In Directives
          </button>
          <button
            onClick={() => setActiveFramework('owasp')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeFramework === 'owasp'
                ? 'bg-emerald-500 text-neutral-950 shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            OWASP Top 10
          </button>
        </div>
      </div>

      {activeFramework === 'dpdp' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-emerald-900/40 bg-emerald-950/20 text-emerald-300 text-xs flex items-start gap-3">
            <Scale className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
            <div>
              <span className="font-bold text-emerald-200">DPDP Act 2023 Compliance Framework:</span>
              <p className="mt-1 text-emerald-300/80">
                Enacted by Parliament of India. Establishes legal accountability for Data Fiduciaries processing digital personal data. Section 33 mandates statutory penalties ranging up to ₹250 Crores for significant breaches, failure to take reasonable security safeguards, or non-reporting.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            {DPDP_REQUIREMENTS.map((req) => (
              <div key={req.section} className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/60 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-400 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
                        {req.section}
                      </span>
                      <h3 className="text-sm font-bold text-white">{req.title}</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-neutral-400">
                      Max Statutory Penalty: <strong className="text-rose-400">{req.maxPenalty}</strong>
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded font-semibold border ${
                        req.complianceStatus === 'Compliant'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : req.complianceStatus === 'Partial'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}
                    >
                      {req.complianceStatus}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-neutral-300 leading-relaxed">{req.description}</p>

                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
                    Statutory Obligations:
                  </span>
                  <ul className="grid sm:grid-cols-2 gap-2 text-xs text-neutral-300">
                    {req.obligations.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-neutral-950/60 p-2 rounded border border-neutral-850">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-2.5 rounded bg-rose-950/20 border border-rose-900/40 text-xs text-rose-300 flex items-start gap-2">
                  <AlertOctagon className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                  <div>
                    <strong className="text-rose-200">Current Audit Gap:</strong> {req.gapAnalysis}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeFramework === 'cert-in' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-sky-900/40 bg-sky-950/20 text-sky-300 text-xs flex items-start gap-3">
            <Clock className="w-5 h-5 shrink-0 text-sky-400 mt-0.5" />
            <div>
              <span className="font-bold text-sky-200">CERT-In Directives (No. 20(3)/2022-CERT-In):</span>
              <p className="mt-1 text-sky-300/80">
                Government of India directive requiring mandatory cybersecurity incident reporting to incident@cert-in.org.in within 6 hours, rolling 180-day log maintenance inside Indian jurisdiction, and system clock synchronization to National Physical Laboratory (NPL) or NIC NTP servers.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            {CERT_IN_DIRECTIVES.map((dir) => (
              <div key={dir.directiveId} className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/60 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-sky-400 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
                      {dir.directiveId}
                    </span>
                    <h3 className="text-sm font-bold text-white">{dir.title}</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-neutral-400 font-mono">
                      Window: <strong className="text-neutral-200">{dir.timeframe}</strong>
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded font-semibold border ${
                        dir.status === 'Ready'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : dir.status === 'Warning'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}
                    >
                      {dir.status === 'Ready' ? 'Audit Pass' : dir.status === 'Warning' ? 'Attention Needed' : 'Compliance Deficit'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-neutral-300 leading-relaxed">{dir.details}</p>

                <div className="p-2.5 rounded bg-neutral-950 border border-neutral-800 text-xs text-neutral-400 flex items-center justify-between">
                  <span>Verification Method: <code className="text-neutral-200 font-mono">{dir.verificationMethod}</code></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeFramework === 'owasp' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/60 text-xs text-neutral-300">
            <span className="font-bold text-white">OWASP Top 10 Web Application Security Risks:</span>
            <p className="mt-1 text-neutral-400">
              Standard awareness document for developers and web application security. Mapped directly to Chanakya-Audit diagnostic findings.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {OWASP_TOP_10.map((item) => (
              <div key={item.code} className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/60 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-emerald-400">{item.code}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-semibold border ${
                        item.status === 'Secure'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : item.status === 'Warning'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}
                    >
                      {item.status === 'Secure' ? 'No Flaws' : `${item.findingsCount} Deficits`}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-white">{item.name}</h4>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
