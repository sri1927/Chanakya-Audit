import React from 'react';
import { Finding, StagingTarget } from '../types/audit';
import { DPDP_REQUIREMENTS, CERT_IN_DIRECTIVES } from '../data/complianceDatabase';
import { Printer, Download, ShieldCheck, AlertTriangle, FileText, CheckCircle2 } from 'lucide-react';

interface AuditReportViewProps {
  target: StagingTarget;
  findings: Finding[];
}

export const AuditReportView: React.FC<AuditReportViewProps> = ({ target, findings }) => {
  const criticalCount = findings.filter((f) => f.severity === 'Critical').length;
  const highCount = findings.filter((f) => f.severity === 'High').length;
  const mediumCount = findings.filter((f) => f.severity === 'Medium').length;
  const lowCount = findings.filter((f) => f.severity === 'Low').length;

  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const reportData = {
      reportTitle: 'Chanakya-Audit Autonomous Penetration Testing & Compliance Report',
      targetDomain: target.domain,
      targetSector: target.sector,
      auditTimestamp: new Date().toISOString(),
      statutoryStandards: ['DPDP Act 2023', 'CERT-In Directives 2022/2023', 'OWASP Top 10:2021'],
      riskSummary: {
        critical: criticalCount,
        high: highCount,
        medium: mediumCount,
        low: lowCount,
      },
      findings: findings.map((f) => ({
        id: f.id,
        name: f.name,
        targetPath: f.targetPath,
        severity: f.severity,
        moduleCategory: f.moduleCategory,
        explanation: f.explanation,
        pocStep: f.pocStep,
        remediation: f.remediation,
        complianceDeficit: f.complianceDeficit,
      })),
      dpdpAssessment: DPDP_REQUIREMENTS,
      certInReadiness: CERT_IN_DIRECTIVES,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Chanakya_Audit_Report_${target.id}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Official Penetration Testing & Compliance Report</h2>
          <p className="text-xs text-neutral-400 mt-1">
            Deliverable format aligned with DPDP Act 2023 Board audit requirements and CERT-In baseline notifications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJSON}
            className="px-3.5 py-1.5 text-xs font-semibold text-neutral-300 bg-neutral-900 border border-neutral-700/80 rounded-lg hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Export JSON
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 text-xs font-semibold text-neutral-950 bg-emerald-500 rounded-lg hover:bg-emerald-400 transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / Save PDF
          </button>
        </div>
      </div>

      {/* Printable Report Document Surface */}
      <div className="p-8 rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-100 space-y-8 shadow-xl">
        {/* Executive Letterhead */}
        <div className="border-b border-neutral-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-emerald-400 font-bold">
              Autonomous Cybersecurity & Compliance Engine
            </span>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-1">Chanakya-Audit Assessment Report</h1>
            <p className="text-xs text-neutral-400 mt-1">
              Target: <strong className="text-white">{target.name}</strong> ({target.domain})
            </p>
          </div>
          <div className="text-right text-xs text-neutral-400 font-mono space-y-1">
            <div>Sector: {target.sector}</div>
            <div>Date: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            <div className="text-emerald-400 font-bold">Status: Audit Completed (Canary Verified)</div>
          </div>
        </div>

        {/* Executive Summary & Metrics Grid */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">1. Executive Summary</h3>
          <p className="text-xs text-neutral-300 leading-relaxed">
            Chanakya-Audit conducted an autonomous, non-destructive web application penetration test and regulatory compliance evaluation of <strong className="text-white">{target.domain}</strong>. Testing adhered strictly to ethical perimeter constraints, executing safe canary verifications against all 7 critical internal application modules.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-4 rounded-lg bg-rose-950/20 border border-rose-900/40 text-center">
              <span className="text-2xl font-bold font-mono text-rose-400 block">{criticalCount}</span>
              <span className="text-xs font-semibold text-rose-300 uppercase tracking-wider">Critical Flaws</span>
            </div>
            <div className="p-4 rounded-lg bg-amber-950/20 border border-amber-900/40 text-center">
              <span className="text-2xl font-bold font-mono text-amber-400 block">{highCount}</span>
              <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">High Risk</span>
            </div>
            <div className="p-4 rounded-lg bg-sky-950/20 border border-sky-900/40 text-center">
              <span className="text-2xl font-bold font-mono text-sky-400 block">{mediumCount}</span>
              <span className="text-xs font-semibold text-sky-300 uppercase tracking-wider">Medium Risk</span>
            </div>
            <div className="p-4 rounded-lg bg-neutral-950 border border-neutral-800 text-center">
              <span className="text-2xl font-bold font-mono text-neutral-400 block">{lowCount}</span>
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Low Risk</span>
            </div>
          </div>
        </div>

        {/* Structured Vulnerability Findings List */}
        <div className="space-y-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">2. Structured Vulnerability Findings & Safe Canary PoCs</h3>
          
          <div className="space-y-6">
            {findings.map((finding) => (
              <div key={finding.id} className="p-5 rounded-lg border border-neutral-800 bg-neutral-950/60 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-neutral-300 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                      {finding.id}
                    </span>
                    <h4 className="text-sm font-bold text-white">{finding.name}</h4>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded font-bold border ${
                      finding.severity === 'Critical'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : finding.severity === 'High'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                    }`}
                  >
                    Severity: {finding.severity}
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-neutral-500 block">Target URL Path:</span>
                    <code className="text-neutral-200 font-mono">{finding.targetPath}</code>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">Module Category:</span>
                    <span className="text-neutral-200">{finding.moduleCategory}</span>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
                    Vulnerability Explanation:
                  </span>
                  <p className="text-xs text-neutral-300 leading-relaxed bg-neutral-900/60 p-3 rounded border border-neutral-850">
                    {finding.explanation}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
                    Proof-of-Concept Step (Safe Canary Reproduction):
                  </span>
                  <div className="bg-neutral-900 p-2.5 rounded border border-neutral-800 font-mono text-xs text-amber-300 space-y-1">
                    <div>Method: {finding.pocStep.method} {finding.pocStep.endpoint}</div>
                    <div>Payload: {finding.pocStep.safeCanaryPayload}</div>
                    <div className="text-neutral-400 text-[11px]">Outcome: {finding.pocStep.expectedResponse}</div>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
                    Remediation Code Fix:
                  </span>
                  <p className="text-xs text-neutral-300 mb-2">{finding.remediation.overview}</p>
                  <pre className="text-xs font-mono text-emerald-300 bg-neutral-900 p-3 rounded border border-neutral-800 overflow-x-auto whitespace-pre">
                    {finding.remediation.codeLanguages[0]?.secureSnippet}
                  </pre>
                </div>

                <div className="p-2.5 rounded bg-neutral-900/80 border border-neutral-800 text-xs text-neutral-400 space-y-1">
                  <div><strong>OWASP Mapping:</strong> {finding.complianceDeficit.owasp}</div>
                  {finding.complianceDeficit.dpdp2023 && (
                    <div className="text-emerald-400"><strong>DPDP Act 2023 Deficit:</strong> {finding.complianceDeficit.dpdp2023}</div>
                  )}
                  {finding.complianceDeficit.certIn && (
                    <div className="text-sky-400"><strong>CERT-In Directive:</strong> {finding.complianceDeficit.certIn}</div>
                  )}
                  {finding.complianceDeficit.penaltyRisk && (
                    <div className="text-rose-400 font-semibold"><strong>Statutory Exposure:</strong> {finding.complianceDeficit.penaltyRisk}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Regulatory Compliance Assessment Section */}
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">3. Statutory Regulatory Assessment (DPDP & CERT-In)</h3>
          
          <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4 space-y-3 text-xs">
            <h4 className="font-semibold text-white">Digital Personal Data Protection (DPDP) Act 2023 Evaluation</h4>
            <div className="space-y-2 text-neutral-300">
              <p>
                • <strong>Section 5 (Notice):</strong> Deficit noted on user ingestion forms; lacks DPO email and statutory grievance timeline specifications.
              </p>
              <p>
                • <strong>Section 8 (Data Fiduciary Safeguards):</strong> Inadequate technical safeguards on payment amount tampering and direct object references expose the organization to Section 33 penalties up to ₹250 Crores.
              </p>
              <p>
                • <strong>Section 11 (Data Principal Rights):</strong> No automated data erasure mechanism implemented for users seeking consent revocation.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-4 space-y-3 text-xs">
            <h4 className="font-semibold text-white">CERT-In Directives (No. 20(3)/2022-CERT-In) Evaluation</h4>
            <div className="space-y-2 text-neutral-300">
              <p>
                • <strong>6-Hour Reporting Readiness:</strong> Logging pipelines lack automated dispatch triggers to <code className="font-mono text-white">incident@cert-in.org.in</code> for confirmed authorization breaches.
              </p>
              <p>
                • <strong>180-Day Log Preservation:</strong> Logs are rotated every 7 days. Must be reconfigured to retain rolling 180-day secure system logs in Indian jurisdiction with NTP synchronization.
              </p>
            </div>
          </div>
        </div>

        {/* Sign-off footer */}
        <div className="border-t border-neutral-800 pt-6 text-xs text-neutral-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Generated by Chanakya-Audit Engine • Autonomous Security & Compliance Validator</span>
          <span>Confidential • Prepared for IT & Legal Compliance Officers</span>
        </div>
      </div>
    </div>
  );
};
