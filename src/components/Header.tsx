import React from 'react';
import { Shield, Radio, Terminal, FileText, Zap } from 'lucide-react';
import emblemImage from '../assets/images/chanakya_emblem_1790826895489.jpg';

interface HeaderProps {
  activeTab: 'runner' | 'attack-tree' | 'compliance' | 'modules' | 'remediations' | 'report';
  setActiveTab: (tab: 'runner' | 'attack-tree' | 'compliance' | 'modules' | 'remediations' | 'report') => void;
  isRunning: boolean;
  onOpenLiveProbe: () => void;
  onQuickRun: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isRunning,
  onOpenLiveProbe,
  onQuickRun,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-md px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-neutral-900 border border-neutral-800 overflow-hidden flex items-center justify-center shrink-0">
            <img
              src={emblemImage}
              alt="Chanakya Emblem"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <button
            onClick={() => setActiveTab('runner')}
            className="text-left font-bold text-lg tracking-tight text-neutral-100 hover:text-white transition-colors"
          >
            Chanakya-Audit
          </button>
        </div>

        {/* Zone 2: Clean 4-6 text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-400">
          <button
            onClick={() => setActiveTab('runner')}
            className={`transition-colors hover:text-neutral-100 ${
              activeTab === 'runner' ? 'text-emerald-400 font-semibold' : ''
            }`}
          >
            Agent Console
          </button>
          <button
            onClick={() => setActiveTab('attack-tree')}
            className={`transition-colors hover:text-neutral-100 ${
              activeTab === 'attack-tree' ? 'text-emerald-400 font-semibold' : ''
            }`}
          >
            Attack Tree
          </button>
          <button
            onClick={() => setActiveTab('compliance')}
            className={`transition-colors hover:text-neutral-100 ${
              activeTab === 'compliance' ? 'text-emerald-400 font-semibold' : ''
            }`}
          >
            DPDP & CERT-In
          </button>
          <button
            onClick={() => setActiveTab('modules')}
            className={`transition-colors hover:text-neutral-100 ${
              activeTab === 'modules' ? 'text-emerald-400 font-semibold' : ''
            }`}
          >
            Target Modules
          </button>
          <button
            onClick={() => setActiveTab('remediations')}
            className={`transition-colors hover:text-neutral-100 ${
              activeTab === 'remediations' ? 'text-emerald-400 font-semibold' : ''
            }`}
          >
            Remediations
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`transition-colors hover:text-neutral-100 ${
              activeTab === 'report' ? 'text-emerald-400 font-semibold' : ''
            }`}
          >
            Executive Report
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenLiveProbe}
            className="px-3.5 py-1.5 text-xs font-medium text-neutral-300 bg-neutral-900 border border-neutral-700/80 rounded-md hover:bg-neutral-800 hover:text-white transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            Live URL Probe
          </button>
          <button
            onClick={onQuickRun}
            disabled={isRunning}
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap ${
              isRunning
                ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                : 'bg-emerald-500 text-neutral-950 hover:bg-emerald-400 shadow-sm shadow-emerald-950'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Auditing Target...' : 'Execute Audit Loop'}
          </button>
        </div>
      </div>
    </header>
  );
};
