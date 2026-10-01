export type SeverityLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export type AgentState = 'UNDERSTAND' | 'REASON' | 'PLAN' | 'USE TOOLS' | 'ACT' | 'DELIVER';

export interface Finding {
  id: string;
  name: string;
  targetPath: string;
  severity: SeverityLevel;
  moduleCategory: 
    | 'Authentication & Gatekeeping'
    | 'Account Dashboard & Identity'
    | 'Administrative Controls'
    | 'Transactional & Financial'
    | 'Documents & File Actions'
    | 'API Gateways & Ingestion'
    | 'Regulatory & Privacy';
  explanation: string;
  pocStep: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    endpoint: string;
    payloadType: string;
    safeCanaryPayload: string;
    expectedResponse: string;
  };
  remediation: {
    overview: string;
    codeLanguages: {
      language: string;
      vulnerableSnippet: string;
      secureSnippet: string;
      fileLocation: string;
    }[];
  };
  complianceDeficit: {
    owasp: string;
    dpdp2023?: string;
    certIn?: string;
    penaltyRisk?: string;
  };
}

export interface AttackTreeNode {
  id: string;
  title: string;
  path: string;
  status: 'pending' | 'scanning' | 'vulnerable' | 'secure';
  children?: AttackTreeNode[];
  findingId?: string;
  testedCount: number;
}

export interface AgentCycleLog {
  timestamp: string;
  cycleNumber: number;
  state: AgentState;
  thought: string;
  toolCall?: {
    toolName: 'CrawlWebpage' | 'InjectPayload' | 'VerifySessionLogic' | 'CheckComplianceBaselines';
    args: Record<string, unknown>;
  };
  observation?: string;
  status: 'info' | 'warning' | 'alert' | 'success';
}

export interface StagingTarget {
  id: string;
  name: string;
  domain: string;
  sector: string;
  architecture: string;
  description: string;
  endpointsCount: number;
  modules: string[];
}

export interface DPDPRequirement {
  section: string;
  title: string;
  description: string;
  obligations: string[];
  maxPenalty: string;
  complianceStatus: 'Compliant' | 'Non-Compliant' | 'Partial' | 'Needs-Review';
  gapAnalysis: string;
}

export interface CertInDirective {
  directiveId: string;
  title: string;
  timeframe: string;
  details: string;
  verificationMethod: string;
  status: 'Ready' | 'Deficit' | 'Warning';
}
