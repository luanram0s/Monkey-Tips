import React from 'react';
import { 
  CheckCircle, 
  CircleDashed, 
  Construction, 
  Bot, 
  LayoutDashboard, 
  Upload, 
  Mic, 
  Gamepad2, 
  Database, 
  ListChecks, 
  Layers, 
  BarChart,
  ShieldCheck,
  BrainCircuit,
  Gavel,
  Cloud,
  TestTube2,
  XCircle,
  ShieldAlert
} from 'lucide-react';
import Card from './ui/Card';

type Status = 'Concluído' | 'Em Desenvolvimento' | 'Em Teste' | 'Planejado' | 'Pendente';

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
  status: Status;
}

const roadmapData: { category: string, features: Feature[] }[] = [
  {
    category: 'Modo Painel Administrativo',
    features: [
      { icon: LayoutDashboard, title: 'Interface de Gestão', description: 'Painel para controle de módulos, logs do sistema e ações rápidas como backup e sincronização.', status: 'Concluído' },
      { icon: ShieldCheck, title: 'Login Protegido', description: 'Acesso ao sistema protegido por credenciais de usuário.', status: 'Concluído' },
      { icon: Upload, title: 'Gerenciador de Módulos', description: 'Interface para adicionar, remover e ativar/desativar módulos de análise (simulado).', status: 'Concluído' },
    ]
  },
  {
    category: 'Modo Analista (Monkey Tips AI)',
    features: [
      { icon: BrainCircuit, title: 'Interface de Análise Preditiva', description: 'Painel central com todas as ferramentas de IA para análise esportiva.', status: 'Em Desenvolvimento' },
      { icon: Gamepad2, title: 'Análise de Partida (Deep Dive)', description: 'Gera relatórios completos pré-jogo com probabilidades, H2H, dados recentes e dicas de mercado.', status: 'Concluído' },
      { icon: BarChart, title: 'Análise de Basquete', description: 'Gera uma análise técnica completa para jogos de basquete com base em dados brutos.', status: 'Concluído' },
      { icon: Layers, title: 'Análise de Múltiplas', description: 'Analisa um bilhete com múltiplas seleções e sugere combinações otimizadas.', status: 'Concluído' },
      { icon: Upload, title: 'Analisador de Bilhete por Imagem', description: 'Extrai informações de uma imagem e calcula a probabilidade de acerto.', status: 'Concluído' },
      { icon: Gavel, title: 'Análise de Perfil de Árbitro', description: 'Fornece estatísticas e um resumo sobre o estilo de arbitragem para o mercado de cartões.', status: 'Concluído' },
    ]
  },
  {
    category: 'Modo Ao Vivo (Monkey Live Engine)',
    features: [
      { icon: Mic, title: 'Analista de Voz (Live)', description: 'Interface de conversação em tempo real para obter insights rápidos por voz.', status: 'Concluído' },
      { icon: Database, title: 'Coleta de Dados em Tempo Real', description: 'Motor para coletar dados ao vivo durante as partidas para alimentar análises dinâmicas (backend).', status: 'Em Teste' },
      { icon: ShieldAlert, title: 'Alertas de Oportunidades Ao Vivo', description: 'Notificações sobre tendências de gols, escanteios e viradas detectadas pela IA.', status: 'Planejado' },
    ]
  },
  {
    category: 'Modo Inteligente (Core & AI)',
    features: [
      { icon: Bot, title: 'Motor de Análise Preditiva', description: 'Integração com a API da Gemini para processar dados e gerar todas as análises.', status: 'Concluído' },
      { icon: Database, title: 'Coleta de Dados Pré-Jogo', description: 'Scripts para coletar dados dos últimos jogos e confrontos diretos (simulado).', status: 'Em Desenvolvimento' },
      { icon: Cloud, title: 'Sincronização com Nuvem', description: 'Interface pronta, pendente de integração com o backend para sincronização real.', status: 'Pendente' },
      { icon: ListChecks, title: 'Checklist Inteligente de Progresso', description: 'Esta tela, exibindo o progresso de desenvolvimento do projeto.', status: 'Concluído' },
    ]
  },
];


const StatusBadge: React.FC<{ status: Status }> = ({ status }) => {
  const styles: Record<Status, { icon: React.ElementType; color: string }> = {
    'Concluído': { icon: CheckCircle, color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    'Em Desenvolvimento': { icon: CircleDashed, color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 animate-pulse' },
    'Em Teste': { icon: TestTube2, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    'Planejado': { icon: Construction, color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    'Pendente': { icon: XCircle, color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  };
  const { icon: Icon, color } = styles[status];
  return (
    <div className={`flex items-center gap-2 text-xs font-semibold px-2 py-1 rounded-full border ${color}`}>
      <Icon size={14} />
      <span>{status}</span>
    </div>
  );
};

const Checklist: React.FC = () => {
  const allFeatures = roadmapData.flatMap(section => section.features);
  const completedFeatures = allFeatures.filter(f => f.status === 'Concluído').length;
  const totalFeatures = allFeatures.length;
  const progressPercentage = totalFeatures > 0 ? Math.round((completedFeatures / totalFeatures) * 100) : 0;

  return (
    <Card className="animate-fade-in">
      <div className="p-6">
        <h3 className="text-xl font-bold text-brand-accent mb-1 flex items-center gap-2">
          <ListChecks size={24} />
          Checklist Inteligente de Progresso
        </h3>
        <p className="text-sm text-brand-subtle mb-6">Acompanhe o progresso e as futuras funcionalidades do Monkey Tips.</p>

        <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-brand-text">Progresso Geral do Projeto</span>
                <span className="text-sm font-bold text-brand-accent">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-brand-dark rounded-full h-2.5">
                <div 
                    className="bg-brand-accent h-2.5 rounded-full transition-all duration-500 ease-out" 
                    style={{ width: `${progressPercentage}%` }}
                ></div>
            </div>
        </div>

        <div className="space-y-8">
          {roadmapData.map((section, index) => (
            <div key={index}>
              <h4 className="text-lg font-semibold text-brand-text mb-4 pb-2 border-b border-zinc-700">{section.category}</h4>
              <div className="space-y-4">
                {section.features.map((feature, fIndex) => (
                  <div key={fIndex} className="bg-brand-dark/50 p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <feature.icon className="text-brand-accent mt-1 flex-shrink-0" size={20} />
                      <div>
                        <p className="font-semibold text-brand-text">{feature.title}</p>
                        <p className="text-sm text-brand-subtle">{feature.description}</p>
                      </div>
                    </div>
                    <div className="flex-shrink-0 self-end sm:self-center">
                      <StatusBadge status={feature.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
       <style>{`
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fade-in 0.5s ease-out forwards;
        }
    `}</style>
    </Card>
  );
};

export default Checklist;