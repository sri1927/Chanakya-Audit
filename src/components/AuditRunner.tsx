import React, { useState, useEffect, useRef } from 'react';
import { StagingTarget, Finding, AgentState, AgentCycleLog } from '../types/audit';
import {
  Play,
  RotateCcw,
  ShieldAlert,
  Terminal,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Cpu,
  Layers,
  Search,
  ExternalLink,
} from 'lucide-react';
import defenseGridImage from '../assets/images/cyber_defense_grid_1790826914352.jpg';

interface AuditRunnerProps {
  targets: StagingTarget[];
  selectedTarget: StagingTarget;
  onSelectTarget: (target: StagingTarget) => void;
  findings: Finding[];
  onSelectFinding: (finding: Finding) => void;
  isRunning: boolean;
  setIsRunning: (running: boolean) => void;
  onRunAudit: () => void;
}

export const AuditRunner: React.FC<AuditRunnerProps> = ({
  targets,
  selectedTarget,
  onSelectTarget,
  findings,
  onSelectFinding,
  isRunning,
  setIsRunning,
  onRunAudit,
}) => {
  const [currentState, setCurrentState] = useState<AgentState>('UNDERSTAND');
  const [currentCycle, setCurrentCycle] = useState(1);
  const [logs, setLogs] = useState<AgentCycleLog[]>([]);
  const [severityFilter, setSeverityFilter] = useState<'All' | 'Critical' | 'High' | 'Medium'>('All');
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Simulated 6-state execution loop when isRunning is triggered
  useEffect(() => {
    if (!isRunning) return;

    let cycle = 1;
    let step = 0;
    const states: AgentState[] = ['UNDERSTAND', 'REASON', 'PLAN', 'USE TOOLS', 'ACT', 'DELIVER'];

    const simulationSteps: {
      state: AgentState;
      thought: string;
      toolCall?: AgentCycleLog['toolCall'];
      observation?: string;
      status: AgentCycleLog['status'];
    }[] = [
      {
        state: 'UNDERSTAND',
        thought: `Parsing root HTTP response for ${selectedTarget.domain}. HTTP 200 OK. Identified 7 form endpoints, 4 JSON API routes, and 1 privacy policy link.`,
        observation: 'Initial crawl discovered endpoints: /login, /signup, /checkout, /upload, /api/v1/orders, /privacy-policy.',
        status: 'info',
      },
      {
        state: 'REASON',
        thought: 'Form inspection reveals checkout payment form transmits raw client-side amount parameter. High risk of parameter tampering under OWASP A04:2021.',
        observation: 'Heuristic pattern match: Client-side price binding detected without HMAC-SHA256 signature.',
        status: 'warning',
      },
      {
        state: 'PLAN',
        thought: 'Updating dynamic attack tree map. Targeting /checkout/payment with non-destructive canary payload (1.00 INR amount verification).',
        status: 'info',
      },
      {
        state: 'USE TOOLS',
        thought: 'Invoking InjectPayload with safe canary payload.',
        toolCall: {
          toolName: 'InjectPayload',
          args: {
            url: `${selectedTarget.domain}/api/v1/orders/create-session`,
            method: 'POST',
            parameter: 'amount',
            payload_type: 'Price Parameter Tampering Canary',
          },
        },
        status: 'info',
      },
      {
        state: 'ACT',
        thought: 'Transmitted safe canary payload {"amount": 1.00, "canary_probe": "CHANAKYA_AMT_VERIFY"}. Response HTTP 200 returned session token for 1.00 INR.',
        observation: 'CRITICAL VULNERABILITY CONFIRMED: Server verified sub-rupee session without verifying database catalog price.',
        status: 'alert',
      },
      {
        state: 'DELIVER',
        thought: 'Logging structured vulnerability record: FINDING-BP-01. Generating Node.js HMAC-SHA256 remediation patch.',
        observation: 'Finding logged: Unrestricted Parameter Tampering on Transaction Amount. Assigned severity: Critical.',
        status: 'alert',
      },
      // Second cycle: Account IDOR
      {
        state: 'UNDERSTAND',
        thought: 'Analyzing session state on /account/settings. Inspecting cookie security attributes and authorization bearer tokens.',
        observation: 'Set-Cookie header missing HttpOnly and SameSite=Strict flags.',
        status: 'warning',
      },
      {
        state: 'REASON',
        thought: 'Merchant ID MERC_49012 is passed in URL path. Testing if low-privileged session can view foreign merchant KYC profile.',
        status: 'info',
      },
      {
        state: 'PLAN',
        thought: 'Selecting VerifySessionLogic and IDOR probe against /api/v1/merchants/MERC_CANARY_TEST/settlement-profile.',
        status: 'info',
      },
      {
        state: 'USE TOOLS',
        thought: 'Executing VerifySessionLogic with foreign merchant identifier.',
        toolCall: {
          toolName: 'VerifySessionLogic',
          args: {
            token: 'MERC_USER_204',
            test_type: 'idor_cross_tenant_traversal',
          },
        },
        status: 'info',
      },
      {
        state: 'ACT',
        thought: 'Fired GET request with active bearer token for foreign merchant. HTTP 200 returned with masked bank account and IFSC.',
        observation: 'HIGH SEVERITY IDOR CONFIRMED: Missing server-side tenant isolation.',
        status: 'alert',
      },
      {
        state: 'DELIVER',
        thought: 'Delivered FINDING-BP-02. Flagged DPDP Act 2023 Section 8(1) confidentiality violation.',
        status: 'alert',
      },
      // Third cycle: DPDP Compliance
      {
        state: 'UNDERSTAND',
        thought: 'Inspecting /signup and /privacy-policy for Digital Personal Data Protection (DPDP) Act 2023 compliance.',
        observation: 'Found PAN / Aadhaar collection fields without statutory Section 5 Notice.',
        status: 'warning',
      },
      {
        state: 'REASON',
        thought: 'DPDP Section 5 mandates clear notice of purpose, DPO contacts, and right to withdrawal before data collection.',
        status: 'warning',
      },
      {
        state: 'PLAN',
        thought: 'Triggering CheckComplianceBaselines across registration DOM boundaries.',
        status: 'info',
      },
      {
        state: 'USE TOOLS',
        thought: 'Executing CheckComplianceBaselines.',
        toolCall: {
          toolName: 'CheckComplianceBaselines',
          args: {
            dom_content: '#kyc-form',
          },
        },
        status: 'info',
      },
      {
        state: 'ACT',
        thought: 'Evaluated DOM against DPDP Section 5, 6, 8, 9, 11, 12 obligations. Notice absent; no Consent Manager integration.',
        observation: 'STATUTORY DEFICIT CONFIRMED: High exposure to DPDP Section 33 penalties.',
        status: 'alert',
      },
      {
        state: 'DELIVER',
        thought: 'Synthesized all structured test sequences. Full audit deliverable generated with immediate remediation code fixes.',
        observation: 'Audit loop completed successfully. All 7 modules analyzed.',
        status: 'success',
      },
    ];

    const timer = setInterval(() => {
      if (step < simulationSteps.length) {
        const item = simulationSteps[step];
        setCurrentState(item.state);
        setCurrentCycle(Math.floor(step / 6) + 1);

        setLogs((prev) => [
          ...prev,
          {
            timestamp: new Date().toLocaleTimeString('en-IN', { hour12: false }),
            cycleNumber: Math.floor(step / 6) + 1,
            state: item.state,
            thought: item.thought,
            toolCall: item.toolCall,
            observation: item.observation,
            status: item.status,
          },
        ]);

        step++;
      } else {
        setIsRunning(false);
        clearInterval(timer);
      }
    }, 1100);

    return () => clearInterval(timer);
  }, [isRunning, selectedTarget, setIsRunning]);

  const handleResetLogs = () => {
    setLogs([]);
    setCurrentCycle(1);
    setCurrentState('UNDERSTAND');
    setIsRunning(false);
  };

  const filteredFindings = findings.filter((f) => {
    if (severityFilter === 'All') return true;
    return f.severity === severityFilter;
  });

  const stateList: AgentState[] = ['UNDERSTAND', 'REASON', 'PLAN', 'USE TOOLS', 'ACT', 'DELIVER'];

  return (
    <div className="space-y-6">
      {/* Target Selector Banner */}
      <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/60 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-emerald-400 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
              AUDIT TARGET
            </span>
            <span className="text-xs text-neutral-400 font-mono">{selectedTarget.domain}</span>
            <span className="text-xs text-neutral-500">·</span>
            <span className="text-xs text-neutral-400">{selectedTarget.sector}</span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">{selectedTarget.name}</h2>
          <p className="text-xs text-neutral-400 max-w-3xl leading-relaxed">{selectedTarget.description}</p>
        </div>

        {/* Target Switcher dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <label className="text-xs text-neutral-400 font-medium">Switch Target:</label>
          <select
            value={selectedTarget.id}
            onChange={(e) => {
              const found = targets.find((t) => t.id === e.target.value);
              if (found) onSelectTarget(found);
            }}
            className="text-xs bg-neutral-950 border border-neutral-700/80 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-emerald-500"
          >
            {targets.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.sector.split(' ')[0]})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 6-State Continuous Operational Loop Visualizer */}
      <div className="p-5 rounded-xl border border-neutral-800 bg-neutral-900/40 space-y-3">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Autonomous 6-State Operational Cycle (Cycle #{currentCycle})
            </h3>
          </div>
          <span className="text-xs text-neutral-500 font-mono">
            {isRunning ? 'Continuous Audit Active' : 'Agent Ready'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {stateList.map((state, idx) => {
            const isActive = currentState === state && isRunning;
            return (
              <div
                key={state}
                className={`p-3 rounded-lg border transition-all text-center ${
                  isActive
                    ? 'border-emerald-500 bg-emerald-950/30 text-white shadow-sm shadow-emerald-950'
                    : 'border-neutral-800 bg-neutral-950 text-neutral-400'
                }`}
              >
                <div className="font-mono text-[10px] text-neutral-500 uppercase tracking-widest block mb-0.5">
                  State 0{idx + 1}
                </div>
                <div className={`text-xs font-bold ${isActive ? 'text-emerald-400' : 'text-neutral-300'}`}>
                  {state}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Agent Terminal & Deliverables Grid */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Terminal & Autonomous Reasoning Console (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Chanakya Execution Terminal & Thoughts</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleResetLogs}
                className="px-2.5 py-1 text-xs text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 rounded transition-colors flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                Clear
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 h-[440px] overflow-y-auto font-mono text-xs text-neutral-300 space-y-3">
            {logs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-neutral-500 space-y-2">
                <Terminal className="w-8 h-8 text-neutral-600" />
                <p>Click "Execute Audit Loop" to start autonomous penetration test.</p>
                <p className="text-[11px] text-neutral-600">
                  Agent will systematically execute UNDERSTAND ➔ REASON ➔ PLAN ➔ USE TOOLS ➔ ACT ➔ DELIVER
                </p>
              </div>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} className="border-b border-neutral-900 pb-2.5 space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-neutral-500">
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-600">[{log.timestamp}]</span>
                      <span className="text-emerald-400 font-bold">CYCLE #{log.cycleNumber}</span>
                      <span className="px-1.5 py-0.2 bg-neutral-900 border border-neutral-800 rounded text-neutral-300">
                        {log.state}
                      </span>
                    </div>
                  </div>

                  <p className="text-neutral-200 text-xs leading-relaxed">{log.thought}</p>

                  {log.toolCall && (
                    <div className="bg-neutral-900/90 border border-neutral-800 p-2 rounded text-[11px] text-sky-300 space-y-0.5">
                      <div className="font-bold flex items-center gap-1 text-sky-400">
                        <span>Tool Invoked:</span>
                        <code>{log.toolCall.toolName}()</code>
                      </div>
                      <div className="text-neutral-400 truncate">
                        Args: {JSON.stringify(log.toolCall.args)}
                      </div>
                    </div>
                  )}

                  {log.observation && (
                    <div
                      className={`text-[11px] p-1.5 rounded ${
                        log.status === 'alert'
                          ? 'bg-rose-950/30 text-rose-300 border border-rose-900/30'
                          : log.status === 'warning'
                          ? 'bg-amber-950/30 text-amber-300 border border-amber-900/30'
                          : log.status === 'success'
                          ? 'bg-emerald-950/30 text-emerald-300 border border-emerald-900/30'
                          : 'text-neutral-400'
                      }`}
                    >
                      {log.observation}
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={terminalEndRef} />
          </div>
        </div>

        {/* Structured Vulnerability Findings List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-bold text-white">Discovered Findings ({findings.length})</h3>
            </div>

            {/* Severity Filter */}
            <div className="flex items-center gap-1 p-0.5 bg-neutral-900 border border-neutral-800 rounded-md">
              {(['All', 'Critical', 'High', 'Medium'] as const).map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-2 py-1 text-[11px] font-semibold rounded transition-colors ${
                    severityFilter === sev ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 h-[440px] overflow-y-auto pr-1">
            {filteredFindings.map((finding) => (
              <div
                key={finding.id}
                onClick={() => onSelectFinding(finding)}
                className="cursor-pointer p-4 rounded-xl border border-neutral-800 bg-neutral-900/70 hover:border-neutral-700 hover:bg-neutral-900 transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-neutral-400">{finding.id}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      finding.severity === 'Critical'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : finding.severity === 'High'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                    }`}
                  >
                    {finding.severity}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
                  {finding.name}
                </h4>

                <div className="text-[11px] text-neutral-400 font-mono truncate">
                  Path: <span className="text-neutral-300">{finding.targetPath}</span>
                </div>

                <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                  {finding.explanation}
                </p>

                <div className="pt-1 flex items-center justify-between text-[11px] border-t border-neutral-800/80 text-neutral-500">
                  <span className="truncate">{finding.complianceDeficit.owasp.split(' - ')[0]}</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                    Inspect Fix <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
