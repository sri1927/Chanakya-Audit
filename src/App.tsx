import React, { useState } from 'react';
import { Header } from './components/Header';
import { AuditRunner } from './components/AuditRunner';
import { AttackTreeMap } from './components/AttackTreeMap';
import { ComplianceMatrix } from './components/ComplianceMatrix';
import { TargetModulesView } from './components/TargetModulesView';
import { RemediationHub } from './components/RemediationHub';
import { AuditReportView } from './components/AuditReportView';
import { LiveProbeModal } from './components/LiveProbeModal';
import { STAGING_TARGETS, MOCK_FINDINGS, INITIAL_ATTACK_TREE } from './data/mockScenarios';
import { StagingTarget, Finding } from './types/audit';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'runner' | 'attack-tree' | 'compliance' | 'modules' | 'remediations' | 'report'
  >('runner');
  const [selectedTarget, setSelectedTarget] = useState<StagingTarget>(STAGING_TARGETS[0]);
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isLiveProbeOpen, setIsLiveProbeOpen] = useState<boolean>(false);

  // Findings for the active target
  const currentFindings: Finding[] =
    MOCK_FINDINGS[selectedTarget.id] || MOCK_FINDINGS['bharatpay'];

  const handleSelectFinding = (finding: Finding) => {
    setSelectedFinding(finding);
    setActiveTab('remediations');
  };

  const handleQuickRun = () => {
    setActiveTab('runner');
    setIsRunning(true);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isRunning={isRunning}
        onOpenLiveProbe={() => setIsLiveProbeOpen(true)}
        onQuickRun={handleQuickRun}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        {activeTab === 'runner' && (
          <AuditRunner
            targets={STAGING_TARGETS}
            selectedTarget={selectedTarget}
            onSelectTarget={(target) => {
              setSelectedTarget(target);
              setSelectedFinding(null);
            }}
            findings={currentFindings}
            onSelectFinding={handleSelectFinding}
            isRunning={isRunning}
            setIsRunning={setIsRunning}
            onRunAudit={handleQuickRun}
          />
        )}

        {activeTab === 'attack-tree' && (
          <AttackTreeMap
            tree={INITIAL_ATTACK_TREE}
            findings={currentFindings}
            onSelectFinding={handleSelectFinding}
          />
        )}

        {activeTab === 'compliance' && <ComplianceMatrix />}

        {activeTab === 'modules' && (
          <TargetModulesView
            onModuleClick={() => {
              setActiveTab('runner');
            }}
          />
        )}

        {activeTab === 'remediations' && (
          <RemediationHub
            findings={currentFindings}
            selectedFinding={selectedFinding}
          />
        )}

        {activeTab === 'report' && (
          <AuditReportView
            target={selectedTarget}
            findings={currentFindings}
          />
        )}
      </main>

      <footer className="border-t border-neutral-900 bg-neutral-950 px-4 lg:px-8 py-6 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-400">Chanakya-Audit Engine</span>
            <span>·</span>
            <span>DPDP Act 2023 & CERT-In Directives Baseline</span>
          </div>
          <div className="flex items-center gap-4 text-neutral-400">
            <span>Ethical Boundary: Staging Root Scopes</span>
            <span>·</span>
            <span>Safe Canary Payloads Only</span>
          </div>
        </div>
      </footer>

      <LiveProbeModal
        isOpen={isLiveProbeOpen}
        onClose={() => setIsLiveProbeOpen(false)}
      />
    </div>
  );
}
