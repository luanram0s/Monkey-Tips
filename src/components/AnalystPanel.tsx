import React, { useState } from 'react';
import { LiveBasketballAnalysis, LiveBasketballInput } from '../types';
import { generateLiveBasketballAnalysis } from '../services/geminiService';
import Card from './ui/Card';
import { Loader, Zap, ShieldAlert, TrendingUp, TrendingDown, Info, Lightbulb, Repeat, Hash, Target, AlertTriangle } from 'lucide-react';

const LiveBasketballEngine: React.FC = () => {
  const [input, setInput] = useState<LiveBasketballInput>({
    teams: ['Paulistano', 'São José'],
    quarter: 'Q4',
    time_remaining: '6:20',
    score: { home: 81, away: 64 },
    market_line: 141.5,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LiveBasketballAnalysis | null>(null);

  const handleScoreChange = (team: 'home' | 'away', value: string) => {
    const score = parseInt(value, 10);
    if (!isNaN(score)) {
      setInput(prev => ({ ...prev, score: { ...prev.score, [team]: score } }));
    } else if (value === '') {
       setInput(prev => ({ ...prev, score: { ...prev.score, [team]: 0 } }));
    }
  };

  const handleTeamChange = (index: 0 | 1, value: string) => {
    const newTeams = [...input.teams] as [string, string];
    newTeams[index] = value;
    setInput(prev => ({ ...prev, teams: newTeams }));
  };
  
  const handleMarketLineChange = (value: string) => {
    const line = parseFloat(value);
    if(!isNaN(line)) {
      setInput(prev => ({...prev, market_line: line }));
    } else if (value === '') {
      setInput(prev => ({...prev, market_line: 0 }));
    }
  }

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const analysisResult = await generateLiveBasketballAnalysis(input);
      setResult(analysisResult);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStatus = (statusString: string) => {
    if (!statusString) return null;
    const [emoji, ...textParts] = statusString.split(' ');
    const text = textParts.join(' ');
    let color = 'text-brand-subtle';
    if (emoji === '🟢') color = 'text-green-400';
    if (emoji === '🟡') color = 'text-yellow-400';
    if (emoji === '🔴') color = 'text-red-400';
    
    return <span className={`font-bold ${color}`}>{emoji} {text}</span>;
  };
  
  const StatDisplay: React.FC<{icon: React.ElementType, label: string, value: string | number | boolean}> = ({ icon: Icon, label, value}) => (
      <div className="bg-brand-dark p-3 rounded-lg text-center">
          <Icon className="mx-auto text-brand-accent mb-1" size={20} />
          <p className="text-xs text-brand-subtle">{label}</p>
          <p className="font-bold text-brand-text text-sm">
            {typeof value === 'boolean' ? (value ? 'Sim' : 'Não') : value}
          </p>
      </div>
  );

  return (
    <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-5 gap-6">
      <Card className="lg:col-span-2">
        <div className="p-6 space-y-4">
          <h3 className="text-xl font-bold text-brand-accent">Entrada de Dados Ao Vivo</h3>
          <div className="grid grid-cols-2 gap-4">
             <input type="text" value={input.teams[0]} onChange={(e) => handleTeamChange(0, e.target.value)} placeholder="Time da Casa" className="w-full bg-brand-dark border border-zinc-700 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-brand-accent"/>
             <input type="text" value={input.teams[1]} onChange={(e) => handleTeamChange(1, e.target.value)} placeholder="Time Visitante" className="w-full bg-brand-dark border border-zinc-700 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-brand-accent"/>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <input type="number" value={input.score.home} onChange={(e) => handleScoreChange('home', e.target.value)} placeholder="Placar Casa" className="w-full bg-brand-dark border border-zinc-700 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-brand-accent"/>
             <input type="number" value={input.score.away} onChange={(e) => handleScoreChange('away', e.target.value)} placeholder="Placar Visitante" className="w-full bg-brand-dark border border-zinc-700 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-brand-accent"/>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input type="text" value={input.quarter} onChange={(e) => setInput({...input, quarter: e.target.value})} placeholder="Período/Quarto" className="w-full bg-brand-dark border border-zinc-700 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-brand-accent"/>
            <input type="text" value={input.time_remaining} onChange={(e) => setInput({...input, time_remaining: e.target.value})} placeholder="Tempo Restante" className="w-full bg-brand-dark border border-zinc-700 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-brand-accent"/>
          </div>
          <div>
            <label className="text-sm text-brand-subtle mb-1 block">Linha do Mercado (Total de Pontos)</label>
            <input type="number" step="0.5" value={input.market_line} onChange={(e) => handleMarketLineChange(e.target.value)} className="w-full bg-brand-dark border border-zinc-700 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-brand-accent"/>
          </div>
          <button onClick={handleAnalyze} disabled={isLoading} className="w-full mt-2 flex items-center justify-center gap-2 bg-brand-accent text-brand-dark font-bold py-3 rounded-lg hover:bg-yellow-400 transition-colors disabled:bg-zinc-500">
            {isLoading ? <Loader size={20} className="animate-spin" /> : <Zap size={20} />}
            {isLoading ? 'Analisando...' : 'Analisar Cenário'}
          </button>
        </div>
      </Card>

      <div className="lg:col-span-3">
        {isLoading && <div className="flex justify-center items-center h-full"><Loader size={48} className="animate-spin text-brand-accent" /></div>}
        {error && <div className="text-red-400 p-4 bg-red-900/20 rounded-lg flex items-center gap-2"><ShieldAlert size={20}/> {error}</div>}
        {result && (
          <Card className="bg-brand-dark/30">
            <div className="p-6 space-y-5">
                <div className="flex justify-between items-center pb-4 border-b border-zinc-700">
                    <h4 className="text-lg font-bold text-brand-text">Projeção Final: <span className="text-brand-accent">{result.output.projection_final.toFixed(1)}</span></h4>
                    <div className="text-sm px-3 py-1 bg-brand-dark rounded-full">{renderStatus(result.output.status)}</div>
                </div>
                
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm font-semibold">
                        <span className="flex items-center gap-2"><TrendingUp size={16} className="text-green-400"/> OVER {result.input.market_line}</span>
                        <span className="text-brand-text">{result.output.probabilities.over}%</span>
                    </div>
                    <div className="w-full bg-brand-dark rounded-full h-2.5"><div className="bg-green-500 h-2.5 rounded-full" style={{width: `${result.output.probabilities.over}%`}}></div></div>
                    
                    <div className="flex justify-between items-center text-sm font-semibold">
                        <span className="flex items-center gap-2"><TrendingDown size={16} className="text-red-400"/> UNDER {result.input.market_line}</span>
                        <span className="text-brand-text">{result.output.probabilities.under}%</span>
                    </div>
                    <div className="w-full bg-brand-dark rounded-full h-2.5"><div className="bg-red-500 h-2.5 rounded-full" style={{width: `${result.output.probabilities.under}%`}}></div></div>
                </div>
                
                <div className="p-4 bg-brand-dark/50 rounded-lg space-y-3">
                    <p className="text-sm font-semibold text-brand-text flex items-center gap-2"><Info size={16}/> Justificativa da IA</p>
                    <p className="text-sm text-brand-subtle">{result.output.justification}</p>
                     <p className="text-sm font-semibold text-brand-text flex items-center gap-2 pt-2"><Lightbulb size={16}/> Ação Sugerida</p>
                    <p className="text-sm text-brand-subtle">{result.output.suggested_action}</p>
                </div>
                
                {result.alerts && result.alerts.length > 0 && (
                     <div className="p-4 bg-yellow-900/30 border border-yellow-500/50 rounded-lg space-y-2">
                         <h5 className="font-bold text-yellow-400 flex items-center gap-2"><AlertTriangle size={16}/> Alertas Ativos</h5>
                        {result.alerts.map((alert, i) => (
                           <div key={i} className="text-xs text-yellow-200">
                            <p><span className="font-semibold">Condição:</span> {alert.condition}</p>
                            <p><span className="font-semibold">Ação:</span> {alert.action}</p>
                           </div>
                        ))}
                    </div>
                )}
                
                <div>
                    <h5 className="text-md font-bold text-brand-text mb-3">Estatísticas Chave (Simuladas)</h5>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                        <StatDisplay icon={Zap} label="Ritmo" value={result.input.stats.pace_index.toFixed(2)} />
                        <StatDisplay icon={ShieldAlert} label="Faltas" value={result.input.stats.fouls} />
                        <StatDisplay icon={Repeat} label="Turnovers" value={result.input.stats.turnovers} />
                        <StatDisplay icon={Target} label="Bônus" value={result.input.stats.bonus_active} />
                    </div>
                </div>

            </div>
          </Card>
        )}
         {!isLoading && !error && !result && (
            <div className="flex flex-col items-center justify-center h-full text-center text-brand-subtle p-6 bg-brand-secondary rounded-lg">
                <Info size={32} className="mb-2"/>
                <p className="font-semibold">Aguardando Análise</p>
                <p className="text-sm">Preencha os dados do jogo e clique em "Analisar Cenário" para ver os resultados aqui.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default LiveBasketballEngine;