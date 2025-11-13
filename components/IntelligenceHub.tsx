import React from 'react';
import { BrainCircuit, BarChart, Gamepad2, Gavel, Layers, Camera, Mic, Cpu, Cloud } from 'lucide-react';
import Card from './ui/Card';
import * as Prompts from '../services/prompts';
import { MONKEY_TIPS_AUTOMATED_SCRIPT_PROMPT } from '../services/prompts_automated';
import { MONKEY_TIPS_VERCEL_MANAGER_PROMPT } from '../services/prompts_vercel'; // Import the new prompt
import VercelPanel from './VercelPanel';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface PromptDisplay {
    icon: React.ElementType;
    title: string;
    description: string;
    prompt: string;
}

const promptsData: PromptDisplay[] = [
    {
        icon: Cpu,
        title: 'Prompt Automático (Script Engine)',
        description: 'Versão otimizada e reduzida do prompt, contendo apenas a lógica operacional para uso direto em scripts de cálculo em tempo real.',
        prompt: MONKEY_TIPS_AUTOMATED_SCRIPT_PROMPT,
    },
    {
        icon: Cloud,
        title: 'Persona: Gerente de Deploy Vercel',
        description: 'Instruções para monitorar builds da Vercel, analisar logs, detectar dependências obsoletas e gerar relatórios de status em JSON.',
        prompt: MONKEY_TIPS_VERCEL_MANAGER_PROMPT,
    },
    {
        icon: Gamepad2,
        title: 'Persona: Análise de Partida (Deep Dive)',
        description: 'Instruções para gerar relatórios completos de partidas (Futebol, Vôlei, etc.), retornando um JSON estruturado com resumo, probabilidades e dicas.',
        prompt: Prompts.DEEP_DIVE_PERSONA,
    },
    {
        icon: BarChart,
        title: 'Persona: Análise de Basquete',
        description: 'Instruções para gerar a análise técnica de basquete no formato padrão "Monkey Tips", retornando texto puro para fácil cópia.',
        prompt: Prompts.BASKETBALL_ANALYSIS_PERSONA,
    },
    {
        icon: Layers,
        title: 'Persona: Análise de Múltipla',
        description: 'Instruções para avaliar um bilhete com múltiplas seleções e sugerir combinações otimizadas, retornando um JSON estruturado.',
        prompt: Prompts.MULTI_BET_ANALYSIS_PERSONA,
    },
    {
        icon: Camera,
        title: 'Persona: Análise de Bilhete por Imagem',
        description: 'Instruções para analisar uma imagem de bilhete de aposta, retornando um JSON com probabilidade e sugestões.',
        prompt: Prompts.BET_SLIP_IMAGE_ANALYSIS_PERSONA,
    },
    {
        icon: Gavel,
        title: 'Persona: Análise de Árbitro',
        description: 'Instruções para criar um perfil de árbitro com base em estatísticas e estilo, retornando um JSON com os dados.',
        prompt: Prompts.REFEREE_ANALYSIS_PERSONA,
    },
    {
        icon: Mic,
        title: 'Instrução de Sistema: Analista de Voz (Live)',
        description: 'Instrução de sistema para o modo de conversação por voz, definindo o tom e o escopo das respostas.',
        prompt: Prompts.LIVE_VOICE_SYSTEM_INSTRUCTION,
    },
];

const IntelligenceHub: React.FC = () => {
    return (
        <div className="animate-fade-in space-y-8">
            <Card>
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-brand-text mb-2 flex items-center gap-3">
                        <BrainCircuit className="text-brand-accent" />
                        Central de Inteligência da IA
                    </h2>
                    <p className="text-brand-subtle">
                        Aqui estão as "personas" e instruções-mestre que guiam o comportamento do Monkey Tips AI, junto com o status de implantação.
                    </p>
                </div>
            </Card>

            {/* Vercel Panel Section */}
            <div>
                <h3 className="text-xl font-bold text-brand-text mb-4 flex items-center gap-3">
                    <Cloud className="text-brand-accent" />
                    Sincronização Vercel (Simulado)
                </h3>
                <VercelPanel />
            </div>

            {/* Prompts Section */}
            <Card>
                <div className="p-6">
                    <h3 className="text-xl font-bold text-brand-text mb-6">
                       Biblioteca de Prompts da IA
                    </h3>
                    <div className="space-y-6">
                        {promptsData.map((item, index) => (
                            <Card key={index} className="bg-brand-dark/50">
                                <div className="p-5">
                                    <div className="flex items-start gap-4 mb-3">
                                        <item.icon className="text-brand-accent flex-shrink-0 mt-1" size={20} />
                                        <div>
                                            <h3 className="font-semibold text-brand-text">{item.title}</h3>
                                            <p className="text-sm text-brand-subtle">{item.description}</p>
                                        </div>
                                    </div>
                                    <details>
                                        <summary className="cursor-pointer text-sm text-brand-accent hover:underline">
                                            Ver prompt completo
                                        </summary>
                                        <div className="mt-4 bg-brand-dark p-4 rounded-lg">
                                            <pre className="whitespace-pre-wrap font-mono text-xs text-gray-300">
                                                {item.prompt}
                                            </pre>
                                        </div>
                                    </details>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </Card>

            <style>{`
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default IntelligenceHub;