
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { BetSlipAnalysis, DeepDiveResult, RefereeAnalysis, MultiBetAnalysis, BetLeg, MatchResult, HeadToHeadMatch, LiveBasketballAnalysis, LiveBasketballInput, VercelDeploymentReport } from '../types';
import * as Prompts from './prompts';
import { MONKEY_TIPS_VERCEL_MANAGER_PROMPT } from './prompts_vercel';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This is a fallback for development. In a real environment, the key should be set.
  console.warn("API_KEY environment variable not set. Using a placeholder. AI features will be mocked.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });
const model = 'gemini-2.5-pro'; // Usando um modelo poderoso para todas as análises

// Helper para parsear JSON da resposta da IA de forma segura
const parseJsonResponse = <T>(text: string, fallback: T): T => {
    try {
        // A IA pode retornar o JSON dentro de um bloco de código markdown.
        const jsonString = text.replace(/^```json\n/, '').replace(/\n```$/, '');
        return JSON.parse(jsonString) as T;
    } catch (error) {
        console.error("Failed to parse JSON response from AI:", error);
        console.error("Raw response was:", text);
        return fallback;
    }
}

export const fetchRecentTeamData = async (teamName: string): Promise<MatchResult[]> => {
    // Simulação de uma chamada de API para buscar dados recentes.
    return new Promise(resolve => setTimeout(() => {
        const results: Array<'V' | 'E' | 'D'> = ['V', 'E', 'D'];
        const mockMatches: MatchResult[] = Array.from({ length: 5 }, (_, i) => ({
            opponent: `Time Adversário ${i + 1}`,
            result: results[Math.floor(Math.random() * 3)],
            score: `${Math.floor(Math.random() * 4)}-${Math.floor(Math.random() * 4)}`,
            competition: `Competição ${i % 2 + 1}`
        }));
        resolve(mockMatches);
    }, 500));
};

export const fetchHeadToHeadData = async (teamA: string, teamB: string): Promise<HeadToHeadMatch[]> => {
  return new Promise(resolve => setTimeout(() => {
    const winnerOptions = [teamA, teamB, 'Empate'];
    const mockMatches: HeadToHeadMatch[] = Array.from({ length: 2 }, (_, i) => ({
      winner: winnerOptions[Math.floor(Math.random() * winnerOptions.length)],
      score: `${Math.floor(Math.random() * 3)}-${Math.floor(Math.random() * 3)}`,
      competition: `Liga ${i+1}`,
      date: `2023-0${i+3}-15`
    }));
    resolve(mockMatches);
  }, 300));
};

export const generateMatchDeepDive = async (teamA: string, teamB: string, sport: string, markets: string[], recentData?: { teamA: MatchResult[], teamB: MatchResult[] }, h2hData?: HeadToHeadMatch[]): Promise<DeepDiveResult> => {
    const mockResult: DeepDiveResult = {
        summary: `### Análise Tática (Mock)\n\n**${teamA}** mostra um ataque forte, mas a defesa do **${teamB}** é mais sólida. O confronto direto favorece o ${teamB}. \n\n| Estatística | ${teamA} | ${teamB} |\n| :--- | :---: | :---: |\n| Gols/Jogo | 2.1 | 1.8 |\n| Finalizações | 15 | 12 |\n| Posse | 60% | 40% |`,
        probabilities: { teamA: 45, draw: 25, teamB: 30 },
        tips: markets.map(market => ({ market, prediction: 'Previsão de Exemplo para ' + market, confidence: Math.floor(Math.random() * 50) + 50, rationale: 'Baseado em dados recentes e H2H simulados.' }))
    };
    if (!API_KEY) return new Promise(resolve => setTimeout(() => resolve(mockResult), 1500));

    const prompt = `
      Análise de Jogo: ${teamA} vs ${teamB}
      Esporte: ${sport}
      Mercados de interesse: ${markets.join(', ')}
      Dados Recentes ${teamA}: ${JSON.stringify(recentData?.teamA)}
      Dados Recentes ${teamB}: ${JSON.stringify(recentData?.teamB)}
      Confrontos Diretos (H2H): ${JSON.stringify(h2hData)}
    `;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: `${Prompts.DEEP_DIVE_PERSONA}\n\n${prompt}`,
        });
        return parseJsonResponse(response.text, mockResult);
    } catch (error) {
        console.error("Error in generateMatchDeepDive:", error);
        throw new Error("Falha ao gerar a análise da partida.");
    }
};

export const analyzeBetSlipImage = async (imageData: { data: string, mimeType: string }): Promise<BetSlipAnalysis> => {
    const mockResult: BetSlipAnalysis = {
        probability: Math.floor(Math.random() * 40) + 40, // 40-80%
        rationale: "Análise simulada: A IA identificou uma boa combinação de jogos com odds de valor, mas há um jogo de risco elevado.",
        primarySuggestionTip: { market: "Total de Gols", prediction: "Mais de 2.5", rationale: "Ambos os times têm ataques potentes.", minOdd: 1.80, confidence: 85 },
        alternativeSuggestionTip: { market: "Handicap Asiático", prediction: `Time Exemplo -0.5`, rationale: "Time da casa é muito forte.", minOdd: 1.95, confidence: 70 }
    };
    if (!API_KEY) return new Promise(resolve => setTimeout(() => resolve(mockResult), 1500));

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash', // Usar um modelo que suporta imagem
            contents: {
              parts: [
                { inlineData: imageData },
                { text: Prompts.BET_SLIP_IMAGE_ANALYSIS_PERSONA }
              ]
            }
        });
        return parseJsonResponse(response.text, mockResult);
    } catch (error) {
        console.error("Error in analyzeBetSlipImage:", error);
        throw new Error("Falha ao analisar a imagem do bilhete.");
    }
};

export const analyzeReferee = async (refereeName: string): Promise<RefereeAnalysis> => {
    const mockResult: RefereeAnalysis = {
        name: refereeName, style: "Rigoroso, não tolera reclamações.", avgYellowCards: 5.5, avgRedCards: 0.3, avgFouls: 26.1,
        summary: `**${refereeName}** é conhecido por manter o jogo sob controle com muitos cartões. A tendência é de jogos mais 'picados' e com muitas interrupções. É um bom cenário para o mercado de cartões.`
    };
    if (!API_KEY) return new Promise(resolve => setTimeout(() => resolve(mockResult), 1000));
    
    try {
        const response = await ai.models.generateContent({
            model,
            contents: `${Prompts.REFEREE_ANALYSIS_PERSONA}\n\nNome do árbitro: ${refereeName}`,
        });
        return parseJsonResponse(response.text, mockResult);
    } catch (error) {
        console.error("Error in analyzeReferee:", error);
        throw new Error("Falha ao analisar o árbitro.");
    }
};

export const analyzeMultiBet = async (legs: BetLeg[]): Promise<MultiBetAnalysis> => {
    const mockResult: MultiBetAnalysis = {
        overallProbability: Math.floor(Math.random() * 40) + 30,
        rationale: "Análise geral simulada da múltipla, considerando a correlação e o risco combinado.",
        evaluatedBets: legs.map(leg => ({ ...leg, confidence: Math.floor(Math.random() * 50) + 50 })),
        suggestedCombination: {
            bets: legs.slice(0, Math.max(1, legs.length - 1)).map(leg => ({ ...leg, confidence: Math.floor(Math.random() * 50) + 50 })),
            rationale: "Sugestão otimizada: removendo a aposta de maior risco, a probabilidade geral aumenta consideravelmente."
        }
    };
    if (!API_KEY) return new Promise(resolve => setTimeout(() => resolve(mockResult), 1500));

    try {
        const response = await ai.models.generateContent({
            model,
            contents: `${Prompts.MULTI_BET_ANALYSIS_PERSONA}\n\nSeleções do bilhete: ${JSON.stringify(legs)}`,
        });
        return parseJsonResponse(response.text, mockResult);
    } catch (error) {
        console.error("Error in analyzeMultiBet:", error);
        throw new Error("Falha ao analisar a aposta múltipla.");
    }
};

export const generateLiveBasketballAnalysis = async (gameData: LiveBasketballInput): Promise<LiveBasketballAnalysis> => {
    const mockResult: LiveBasketballAnalysis = {
        "engine": "Monkey Fusion Engine (Mock)",
        "version": "B2.0 Pós-147",
        "mode": "Auto Híbrido (Pré + Ao Vivo)",
        "integration": ["Scout Engine", "Painel Analistas", "Painel Admin"],
        "input": {
          "teams": gameData.teams,
          "quarter": gameData.quarter,
          "time_remaining": gameData.time_remaining,
          "score": gameData.score,
          "market_line": gameData.market_line,
          "stats": {
            "3pts": {"made": 9, "attempts": 28},
            "2pts": {"made": 17, "attempts": 29},
            "ft": {"made": 7, "attempts": 11},
            "rebounds": 34,
            "turnovers": 12,
            "fouls": 16,
            "bonus_active": true,
            "pace_index": 1.12,
            "burst_recent": true
          }
        },
        "calculation_engine": {
          "base_pace": "(poss_real / tempo_decorrido) * 40",
          "weighted_pace": "(0.7 * ritmo_últimos5) + (0.3 * ritmo_total)",
          "bonus_FT": "FTporMin * prob_FTconv",
          "burst_effect": "if (2+ bolas_3_seguidas) then +5 pts",
          "risk_bonus": "if (bonus_active=true) then +1.2 pts/min",
          "adjusted_pace": "base_pace * (1 + delta_turnover + delta_timeout)",
          "projection_final": "(adjusted_pace * weighted_pace) + bonus_FT + burst_effect",
          "error_margin": "±3 pts (CI90)"
        },
        "probability_module": { "over_prob": 63, "under_prob": 37, "confidence_interval": "90%", "trend": "Over", "line_distance": 5.5 },
        "status_logic": {
          "safe": { "conditions": ["ritmo_estavel", "sem_bonus", "sem_burst"], "status": "🟢" },
          "warning": { "conditions": ["bonus_active", "burst_recent", "odd_var<=10%", "diff_line<=3"], "status": "🟡" },
          "risk": { "conditions": ["bonus_active && burst_recent", "odd_var>10%", "FTporMin>0.8"], "status": "🔴" },
          "neutral": { "conditions": ["diff_line<=2", "ritmo_indefinido"], "status": "⚫" }
        },
        "alerts": [
          { "condition": "bonus_active && time_remaining<=6", "action": "Emitir alerta 'ALTO RISCO FT' + hedge_parcial(25%)" }
        ],
        "output": {
          "projection_final": 147,
          "probabilities": { "over": 63, "under": 37 },
          "status": "🟡 WARNING",
          "justification": "Ritmo alto e bônus ativo aumentam a projeção. Últimos 4 min com +18 pts.",
          "suggested_action": "Aguardar novo ciclo ou hedge parcial (20%)",
          "auto_update": "1 min"
        },
        "system_cycle": {
          "interval": "60s",
          "recalculation_triggers": ["mudança_bonus", "variação_odd>=5%", "mudança_burst", "nova_posse_detectada"],
          "sync": "Scout Engine / Painel Analistas"
        }
      };
    if (!API_KEY) return new Promise(resolve => setTimeout(() => resolve(mockResult), 1500));
    
    const prompt = `Dados do jogo para análise: ${JSON.stringify(gameData)}`;
    
    try {
        const response = await ai.models.generateContent({
            model,
            contents: `${Prompts.LIVE_BASKETBALL_ENGINE_PERSONA}\n\n${prompt}`,
        });
        return parseJsonResponse(response.text, mockResult);
    } catch (error) {
        console.error("Error in generateLiveBasketballAnalysis:", error);
        throw new Error("Falha ao gerar a análise ao vivo de basquete.");
    }
}

export const fetchVercelDeploymentStatus = async (): Promise<VercelDeploymentReport> => {
    const mockResult: VercelDeploymentReport = {
        "deploymentStatus": "Success",
        "summary": "Implantação (mock) bem-sucedida. O limite de aviso de tamanho de chunk foi ajustado para 1000kb, resolvendo avisos de build.",
        "logAnalysis": [
            {"timestamp": "10:35:01.123", "message": "Clonagem do repositório...", "status": "✅"},
            {"timestamp": "10:35:05.456", "message": "Instalando dependências...", "status": "✅"},
            {"timestamp": "10:35:15.789", "message": "Dependências instaladas.", "status": "✅"},
            {"timestamp": "10:35:20.111", "message": "Compilando para produção com Vite...", "status": "✅"},
            {"timestamp": "10:35:22.345", "message": "Configuração 'build.chunkSizeWarningLimit' definida como 1000kb.", "status": "✅"},
            {"timestamp": "10:35:35.999", "message": "Implantação concluída com sucesso.", "status": "✅"}
        ],
        "dependencyReport": {
            "issuesFound": false,
            "deprecatedPackages": [],
            "suggestedActions": []
        },
        "deploymentDetails": {
            "primaryDomain": "monkey-tips-live.vercel.app",
            "commit": { "hash": "e4f5g6h", "message": "Chore: Adjust vite chunkSizeWarningLimit to 1000kb" },
            "durationInSeconds": 35
        }
    };
    if (!API_KEY) return new Promise(resolve => setTimeout(() => resolve(mockResult), 1500));

    try {
        const response = await ai.models.generateContent({
            model,
            contents: `${MONKEY_TIPS_VERCEL_MANAGER_PROMPT}\n\nInstrução: Gere um novo relatório de status de implantação para um build bem-sucedido. A otimização mais recente foi o ajuste do 'build.chunkSizeWarningLimit' para 1000kb para silenciar avisos sobre o tamanho dos blocos. Os logs agora devem estar limpos, sem esse aviso específico.`,
        });
        return parseJsonResponse(response.text, mockResult);
    } catch (error) {
        console.error("Error in fetchVercelDeploymentStatus:", error);
        throw new Error("Falha ao buscar o status de implantação da Vercel.");
    }
};
