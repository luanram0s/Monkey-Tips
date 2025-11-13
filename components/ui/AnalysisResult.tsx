import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BetSlipAnalysis, DeepDiveResult, RefereeAnalysis, MultiBetAnalysis } from '../../types';
import { Star, ShieldCheck, TrendingUp, Scissors, Info, BarChart, CheckCircle, XCircle, Lightbulb } from 'lucide-react';
import Card from './Card';

type AnalysisResultProps = {
  result: DeepDiveResult | BetSlipAnalysis | RefereeAnalysis | MultiBetAnalysis | null;
  type: 'deep-dive' | 'image-analysis' | 'referee' | 'multi-bet';
};

const renderDeepDive = (result: DeepDiveResult) => (
  <div className="space-y-6">
    <div>
      <h4 className="text-lg font-bold text-brand-text mb-2">Resumo da Análise</h4>
      <div className="prose prose-invert prose-sm max-w-none bg-brand-dark/50 p-4 rounded-lg">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.summary}</ReactMarkdown>
      </div>
    </div>
    <div>
        <h4 className="text-lg font-bold text-brand-text mb-3">Probabilidades do Jogo</h4>
        <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
                <span className="font-semibold">Time A</span>
                <span className="font-bold">{result.probabilities.teamA}%</span>
            </div>
             <div className="w-full bg-brand-dark rounded-full h-2.5"><div className="bg-blue-500 h-2.5 rounded-full" style={{width: `${result.probabilities.teamA}%`}}></div></div>
             <div className="flex justify-between items-center text-sm">
                <span className="font-semibold">Empate</span>
                <span className="font-bold">{result.probabilities.draw}%</span>
            </div>
             <div className="w-full bg-brand-dark rounded-full h-2.5"><div className="bg-gray-500 h-2.5 rounded-full" style={{width: `${result.probabilities.draw}%`}}></div></div>
             <div className="flex justify-between items-center text-sm">
                <span className="font-semibold">Time B</span>
                <span className="font-bold">{result.probabilities.teamB}%</span>
            </div>
             <div className="w-full bg-brand-dark rounded-full h-2.5"><div className="bg-red-500 h-2.5 rounded-full" style={{width: `${result.probabilities.teamB}%`}}></div></div>
        </div>
    </div>
    <div>
      <h4 className="text-lg font-bold text-brand-text mb-2">Dicas da IA</h4>
      <div className="space-y-3">
        {result.tips.map((tip, index) => (
          <Card key={index} className="bg-brand-dark/50 p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-brand-accent">{tip.market}: <span className="text-brand-text">{tip.prediction}</span></p>
                <p className="text-xs text-brand-subtle mt-1">{tip.rationale}</p>
              </div>
              <div className="text-right ml-4">
                <p className="font-bold text-lg text-brand-text">{tip.confidence}%</p>
                <p className="text-xs text-brand-subtle">Confiança</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  </div>
);

const renderImageAnalysis = (result: BetSlipAnalysis) => (
  <div className="space-y-4">
    <div className="text-center bg-brand-dark p-4 rounded-lg">
        <p className="text-brand-subtle text-sm">Probabilidade de Acerto</p>
        <p className="text-4xl font-bold text-brand-accent">{result.probability}%</p>
    </div>
    <div className="p-4 bg-brand-dark/50 rounded-lg">
        <p className="text-sm font-semibold text-brand-text mb-1 flex items-center gap-2"><Info size={16}/> Justificativa da IA</p>
        <p className="text-sm text-brand-subtle">{result.rationale}</p>
    </div>
    <h4 className="text-lg font-bold text-brand-text pt-2">Sugestões de Otimização</h4>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[result.primarySuggestionTip, result.alternativeSuggestionTip].map((tip, index) => tip && (
            <Card key={index} className={index === 0 ? 'border-2 border-brand-accent' : ''}>
                <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                        {index === 0 ? <Star size={18} className="text-brand-accent"/> : <Lightbulb size={18} className="text-blue-400"/>}
                        <h5 className="font-bold text-brand-text">{index === 0 ? 'Dica Principal' : 'Alternativa'}</h5>
                    </div>
                    <p className="font-semibold">{tip.market}: <span className="font-normal">{tip.prediction}</span></p>
                    <p className="text-xs text-brand-subtle my-2">{tip.rationale}</p>
                    <div className="flex justify-between text-xs bg-brand-dark p-2 rounded-md">
                        <span>Odd Mínima: <span className="font-bold">{tip.minOdd.toFixed(2)}</span></span>
                        <span>Confiança: <span className="font-bold">{tip.confidence}%</span></span>
                    </div>
                </div>
            </Card>
        ))}
    </div>
  </div>
);

const renderRefereeAnalysis = (result: RefereeAnalysis) => (
    <div className="space-y-4">
        <h3 className="text-xl font-bold text-brand-text">Perfil: {result.name}</h3>
        <p className="text-brand-accent font-semibold bg-brand-dark/50 px-3 py-1 rounded-full self-start w-fit">{result.style}</p>
        <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-brand-dark p-3 rounded-lg">
                <p className="text-2xl font-bold text-yellow-400">{result.avgYellowCards.toFixed(1)}</p>
                <p className="text-xs text-brand-subtle"> amarelos/jogo</p>
            </div>
            <div className="bg-brand-dark p-3 rounded-lg">
                <p className="text-2xl font-bold text-red-500">{result.avgRedCards.toFixed(1)}</p>
                <p className="text-xs text-brand-subtle"> vermelhos/jogo</p>
            </div>
             <div className="bg-brand-dark p-3 rounded-lg">
                <p className="text-2xl font-bold text-gray-300">{result.avgFouls.toFixed(1)}</p>
                <p className="text-xs text-brand-subtle"> faltas/jogo</p>
            </div>
        </div>
        <div>
            <h4 className="text-lg font-bold text-brand-text mb-2">Resumo da Análise</h4>
            <div className="prose prose-invert prose-sm max-w-none bg-brand-dark/50 p-4 rounded-lg">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.summary}</ReactMarkdown>
            </div>
        </div>
    </div>
);


const renderMultiBetAnalysis = (result: MultiBetAnalysis) => (
    <div className="space-y-6">
        <div className="text-center bg-brand-dark p-4 rounded-lg">
            <p className="text-brand-subtle text-sm">Probabilidade Total da Múltipla</p>
            <p className="text-4xl font-bold text-brand-accent">{result.overallProbability}%</p>
        </div>
        <div className="p-4 bg-brand-dark/50 rounded-lg">
            <p className="text-sm font-semibold text-brand-text mb-1 flex items-center gap-2"><Info size={16}/> Justificativa Geral da IA</p>
            <p className="text-sm text-brand-subtle">{result.rationale}</p>
        </div>
        <div>
            <h4 className="text-lg font-bold text-brand-text mb-2">Análise das Seleções</h4>
            <div className="space-y-2">
                {result.evaluatedBets.map(leg => (
                    <div key={leg.id} className="bg-brand-dark/50 p-3 rounded-lg flex justify-between items-center">
                        <div className="text-sm">
                            <p className="font-semibold">{leg.teamA} vs {leg.teamB}</p>
                            <p className="text-xs text-brand-subtle">{leg.market}</p>
                        </div>
                        <div className="text-right">
                             <p className="font-bold text-lg">{leg.confidence}%</p>
                             <p className="text-xs text-brand-subtle">Confiança</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        <Card className="border-2 border-brand-accent bg-yellow-500/5">
            <div className="p-4">
                 <h4 className="text-lg font-bold text-brand-accent mb-2 flex items-center gap-2"><Scissors size={18} /> Combinação Otimizada</h4>
                 <p className="text-sm text-brand-subtle mb-3">{result.suggestedCombination.rationale}</p>
                 <div className="space-y-2">
                    {result.suggestedCombination.bets.map(leg => (
                         <div key={leg.id} className="bg-brand-dark/50 p-3 rounded-lg flex justify-between items-center text-sm">
                            <div>
                                <p className="font-semibold">{leg.teamA} vs {leg.teamB}</p>
                                <p className="text-xs text-brand-subtle">{leg.market}</p>
                            </div>
                            <span className="font-bold text-green-400 flex items-center gap-1"><CheckCircle size={14}/> Mantida</span>
                        </div>
                    ))}
                 </div>
            </div>
        </Card>
    </div>
);


const AnalysisResult: React.FC<AnalysisResultProps> = ({ result, type }) => {
  if (!result) return null;

  const renderContent = () => {
    switch (type) {
      case 'deep-dive':
        return renderDeepDive(result as DeepDiveResult);
      case 'image-analysis':
        return renderImageAnalysis(result as BetSlipAnalysis);
      case 'referee':
        return renderRefereeAnalysis(result as RefereeAnalysis);
      case 'multi-bet':
        return renderMultiBetAnalysis(result as MultiBetAnalysis);
      default:
        return <p>Tipo de resultado não suportado.</p>;
    }
  };

  return (
    <div className="animate-fade-in">
        {renderContent()}
    </div>
  );
};

export default AnalysisResult;
