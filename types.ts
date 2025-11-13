export enum ModuleStatus {
  Active = 'Ativo',
  Inactive = 'Inativo',
  Testing = 'Em Teste',
}

export interface Module {
  id: string;
  name: string;
  code: string;
  status: ModuleStatus;
}

export enum SyncStatus {
  Synced = 'Sincronizado',
  Syncing = 'Sincronizando...',
  Error = 'Erro de Sincronização',
}

export interface LogEntry {
  id: number;
  timestamp: string;
  message: string;
  level: 'info' | 'warn' | 'error';
}

export interface AiSuggestionTip {
  market: string;
  prediction: string;
  rationale: string;
  minOdd: number;
  confidence: number;
}

export interface BetSlipAnalysis {
  probability: number;
  rationale: string;
  suggestions?: string;
  primarySuggestionTip: AiSuggestionTip;
  alternativeSuggestionTip?: AiSuggestionTip;
}

export interface DeepDiveResult {
  summary: string; // Markdown com análise tática e estatísticas
  probabilities: {
    teamA: number;
    draw: number;
    teamB: number;
  };
  tips: {
    market: string;
    prediction: string;
    confidence: number;
    rationale: string;
  }[];
}

export interface RefereeAnalysis {
  name: string;
  style: string;
  avgYellowCards: number;
  avgRedCards: number;
  avgFouls: number;
  summary: string; // Markdown
}

// Tipos para Análise de Múltiplas
export interface BetLeg {
  id: number;
  teamA: string;
  teamB: string;
  market: string;
}

export interface EvaluatedBetLeg extends BetLeg {
  confidence: number;
}

export interface SuggestedCombination {
  bets: EvaluatedBetLeg[];
  rationale: string;
}

export interface MultiBetAnalysis {
  overallProbability: number;
  rationale: string;
  evaluatedBets: EvaluatedBetLeg[];
  suggestedCombination: SuggestedCombination;
}

// Tipos para Coletor de Dados
export interface MatchResult {
  opponent: string;
  result: 'V' | 'E' | 'D'; // Vitória, Empate, Derrota
  score: string;
  competition: string;
}

export interface TeamRecentData {
  teamName: string;
  lastMatches: MatchResult[];
}

export interface HeadToHeadMatch {
  winner: string; // Nome do time vencedor ou 'Empate'
  score: string;
  competition: string;
  date: string;
}

// Tipos para Motor Híbrido de Basquete Ao Vivo
export interface LiveBasketballInput {
  teams: [string, string];
  quarter: string;
  time_remaining: string;
  score: { home: number; away: number };
  market_line: number;
}

export interface LiveBasketballOutput {
  projection_final: number;
  probabilities: {
    over: number;
    under: number;
  };
  status: string; // e.g., "🟡 WARNING"
  justification: string;
  suggested_action: string;
  // FIX: Added auto_update to match the mock data in geminiService.ts.
  auto_update: string;
}

export interface LiveBasketballAnalysis {
  engine: string;
  version: string;
  mode: string;
  // FIX: Added missing properties to fully represent the AI response structure.
  integration: string[];
  input: {
    teams: [string, string];
    quarter: string;
    time_remaining: string;
    score: { home: number; away: number };
    market_line: number;
    stats: {
      "3pts": { made: number; attempts: number };
      "2pts": { made: number; attempts: number };
      ft: { made: number; attempts: number };
      rebounds: number;
      turnovers: number;
      fouls: number;
      bonus_active: boolean;
      pace_index: number;
      burst_recent: boolean;
    };
  };
  calculation_engine: {
    base_pace: string;
    weighted_pace: string;
    bonus_FT: string;
    burst_effect: string;
    risk_bonus: string;
    adjusted_pace: string;
    projection_final: string;
    error_margin: string;
  };
  probability_module: {
    over_prob: number;
    under_prob: number;
    confidence_interval: string;
    trend: string;
    line_distance: number;
  };
  status_logic: {
    safe: { conditions: string[]; status: string };
    warning: { conditions: string[]; status: string };
    risk: { conditions: string[]; status: string };
    neutral: { conditions: string[]; status: string };
  };
  output: LiveBasketballOutput;
  alerts: {
      condition: string;
      action: string;
  }[];
  system_cycle: {
    interval: string;
    recalculation_triggers: string[];
    sync: string;
  };
}

// Tipos para Sincronização Vercel
export interface VercelLogAnalysis {
    timestamp: string;
    message: string;
    status: string; // Emoji
}

export interface VercelDependencyReport {
    issuesFound: boolean;
    deprecatedPackages: {
        oldPackage: string;
        newPackage: string;
        reason: string;
    }[];
    suggestedActions: string[];
}

export interface VercelDeploymentDetails {
    primaryDomain: string;
    commit: {
        hash: string;
        message: string;
    };
    durationInSeconds: number;
}

export interface VercelDeploymentReport {
    deploymentStatus: 'Success' | 'InProgress' | 'Failed' | 'Warning';
    summary: string;
    logAnalysis: VercelLogAnalysis[];
    dependencyReport: VercelDependencyReport;
    deploymentDetails: VercelDeploymentDetails;
}