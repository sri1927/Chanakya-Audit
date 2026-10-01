import React, { useState } from 'react';
import { AttackTreeNode, Finding } from '../types/audit';
import { ChevronRight, ChevronDown, ShieldAlert, CheckCircle2, CircleDashed, Terminal, ArrowUpRight } from 'lucide-react';

interface AttackTreeMapProps {
  tree: AttackTreeNode;
  findings: Finding[];
  onSelectFinding: (finding: Finding) => void;
}

export const AttackTreeMap: React.FC<AttackTreeMapProps> = ({ tree, findings, onSelectFinding }) => {
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'root-target': true,
    'auth-gate': true,
    'account-mgmt': true,
    'transact-fin': true,
    'admin-ctrl': true,
    'docs-upload': true,
    'api-gateway': true,
    'privacy-dpdp': true,
  });

  const toggleExpand = (nodeId: string) => {
    setExpandedNodes((prev) => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const getStatusBadge = (status: AttackTreeNode['status']) => {
    switch (status) {
      case 'vulnerable':
        return (
          <span className="text-xs font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" /> Vulnerable
          </span>
        );
      case 'secure':
        return (
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Hardened
          </span>
        );
      case 'scanning':
        return (
          <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 flex items-center gap-1">
            <CircleDashed className="w-3 h-3 animate-spin" /> In Scope
          </span>
        );
      default:
        return <span className="text-xs text-neutral-500">Pending</span>;
    }
  };

  const renderNode = (node: AttackTreeNode, depth = 0) => {
    const isExpanded = expandedNodes[node.id];
    const hasChildren = node.children && node.children.length > 0;
    const nodeFinding = node.findingId ? findings.find((f) => f.id === node.findingId) : null;

    return (
      <div key={node.id} className="space-y-1">
        <div
          className={`flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border transition-all ${
            node.status === 'vulnerable'
              ? 'border-rose-900/50 bg-rose-950/10 hover:bg-rose-950/20'
              : node.status === 'secure'
              ? 'border-neutral-800 bg-neutral-900/40 hover:bg-neutral-900'
              : 'border-neutral-800/80 bg-neutral-900/20 hover:bg-neutral-900/40'
          }`}
          style={{ marginLeft: `${depth * 1.5}rem` }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {hasChildren ? (
              <button
                onClick={() => toggleExpand(node.id)}
                className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                aria-label="Toggle node"
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            ) : (
              <span className="w-6" />
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-neutral-200 truncate">{node.title}</span>
                <span className="font-mono text-xs text-neutral-500 bg-neutral-950 px-1.5 py-0.5 rounded border border-neutral-800">
                  {node.path}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-neutral-500 font-mono">
              {node.testedCount} tests fired
            </span>
            {getStatusBadge(node.status)}

            {nodeFinding && (
              <button
                onClick={() => onSelectFinding(nodeFinding)}
                className="px-2.5 py-1 text-xs font-semibold text-rose-300 bg-rose-500/20 hover:bg-rose-500/30 rounded border border-rose-500/30 transition-colors flex items-center gap-1"
              >
                <span>View Remediation</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-1">
            {node.children!.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="border border-neutral-800 bg-neutral-900/60 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5 mb-6">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Dynamic Attack Tree & Exploit Map</h2>
            <p className="text-xs text-neutral-400 mt-1">
              Autonomous vector branching based on parsed DOM forms, internal router paths, and session privilege levels.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-neutral-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Vulnerable</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Hardened</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Scanning Scope</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">{renderNode(tree)}</div>
      </div>
    </div>
  );
};
