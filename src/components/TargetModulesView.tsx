import React from 'react';
import { INTERNAL_MODULES } from '../data/moduleChecklists';
import { ShieldCheck } from 'lucide-react';

interface TargetModulesViewProps {
  onModuleClick?: (moduleId: string) => void;
}

export const TargetModulesView: React.FC<TargetModulesViewProps> = () => {
  return (
    <div className="space-y-6">
      <div className="border-b border-neutral-800 pb-4">
        <h2 className="text-xl font-bold text-white tracking-tight">Internal Application Architecture & Audit Scope</h2>
        <p className="text-xs text-neutral-400 mt-1">
          7 structural internal modules systematically crawled, mapped, and audited by the Chanakya-Audit autonomous engine.
        </p>
      </div>

      <div className="grid gap-4">
        {INTERNAL_MODULES.map((mod) => (
          <div
            key={mod.id}
            className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/60 space-y-4 hover:border-neutral-700 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                {mod.name}
              </h3>
              <div className="flex flex-wrap items-center gap-1.5">
                {mod.routes.map((route) => (
                  <span
                    key={route}
                    className="font-mono text-[11px] text-neutral-300 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800"
                  >
                    {route}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
                  Analysis Requisites & Security Invariants
                </span>
                <ul className="space-y-1.5 text-xs text-neutral-300">
                  {mod.focusAreas.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-neutral-950/40 p-2 rounded border border-neutral-850">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
                    Safe Canary Strategy (Non-Destructive)
                  </span>
                  <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 leading-relaxed">
                    {mod.safeCanaryStrategy}
                  </div>
                </div>

                <div className="p-2.5 rounded bg-neutral-950/80 border border-neutral-800 flex items-center justify-between text-xs">
                  <span className="text-neutral-400 font-medium">Compliance Mapping:</span>
                  <span className="font-mono text-emerald-400 font-semibold">{mod.complianceRelevance}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
