import React from 'react';
import { Clock, CheckCircle, GitBranch, Link as LinkIcon, ExternalLink } from 'lucide-react';
import Card from './ui/Card';

interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'warn' | 'success' | 'command';
}

const deploymentLogs: LogEntry[] = [
    { timestamp: '02:26:13.446', message: 'Clonagem concluída em: 331,000 ms', type: 'info' },
    { timestamp: '02:26:13.790', message: 'Executando "vercel build"', type: 'command' },
    { timestamp: '02:26:14.186', message: 'Vercel CLI 48.9.1', type: 'info' },
    { timestamp: '02:26:14.804', message: 'Instalando dependências...', type: 'info' },
    { timestamp: '02:26:15.100', message: 'Fix: Pacote obsoleto "node-domexception" substituído por alternativa nativa.', type: 'success' },
    { timestamp: '02:26:28.863', message: 'Adicionadas 133 encomendas em 14 segundos.', type: 'info' },
    { timestamp: '02:26:28.864', message: '26 projetos estão buscando financiamento.', type: 'info' },
    { timestamp: '02:26:28.864', message: 'Execute `npm fund` para obter detalhes.', type: 'info' },
    { timestamp: '02:26:28.908', message: 'Executando "npm run build"', type: 'command' },
    { timestamp: '02:26:29.017', message: '> monkey-tips-live@1.0.0 build', type: 'info' },
    { timestamp: '02:26:29.018', message: '> construção vite', type: 'info' },
    { timestamp: '02:26:29.299', message: 'vite v6.4.1 compilando para produção...', type: 'success' },
    { timestamp: '02:26:29.376', message: 'transformando...', type: 'info' },
];

const VercelPanel: React.FC = () => {
    const getLogStyle = (type: LogEntry['type']) => {
        switch (type) {
            case 'warn':
                return 'bg-yellow-500/20 text-yellow-300';
            case 'success':
                return 'text-green-400';
            case 'command':
                return 'text-gray-300 font-semibold';
            default:
                return 'text-gray-400';
        }
    };

    return (
        <Card className="bg-brand-dark/50">
            <div className="p-5">
                <h3 className="font-semibold text-brand-text mb-4">Detalhes da Implantação</h3>
                <div className="bg-brand-dark p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Preview & Main Info */}
                        <div className="md:col-span-2 flex gap-4">
                           <div className="w-24 h-24 bg-black rounded-md flex-shrink-0"></div>
                           <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                    <span className="text-green-400 font-semibold">Preparar</span>
                                    <span className="text-xs bg-brand-secondary px-2 py-0.5 rounded-full">Mais Recente</span>
                                </div>
                                <p className="text-sm text-brand-subtle">Domínios</p>
                                <ul className="text-sm space-y-1 mt-1">
                                    <li className="flex items-center gap-2 text-brand-text"><LinkIcon size={14}/> monkey-tips-live.vercel.app <span className="text-xs bg-blue-500/30 text-blue-300 px-1.5 py-0.5 rounded">+1</span></li>
                                    <li className="flex items-center gap-2 text-brand-subtle"><LinkIcon size={14}/> monkey-tips-live-git-main...vercel.app</li>
                                </ul>
                                <p className="text-sm text-brand-subtle mt-3">Fonte</p>
                                <div className="flex items-center gap-2 text-sm text-brand-text mt-1">
                                    <GitBranch size={14} />
                                    <span>principal</span>
                                    <span className="text-brand-subtle">b4d4f3c</span>
                                </div>
                                <p className="text-sm text-brand-text mt-1 truncate">Fix: Atualiza dependência para otimizar build.</p>
                           </div>
                        </div>

                        {/* Metadata */}
                        <div className="text-sm space-y-3">
                            <div>
                                <p className="text-brand-subtle">Duração</p>
                                <p className="flex items-center gap-1"><Clock size={14}/> 21s</p>
                            </div>
                             <div>
                                <p className="text-brand-subtle">Ambiente</p>
                                <p>Produção <span className="text-xs text-brand-subtle">(Atual)</span></p>
                            </div>
                            <button className="w-full text-center bg-white text-black font-semibold py-2 rounded-md hover:bg-gray-200 transition-colors">Visita <ExternalLink className="inline-block" size={14}/></button>
                        </div>
                    </div>
                </div>

                {/* Compilation Logs */}
                <details className="mt-6" open>
                    <summary className="cursor-pointer text-sm font-semibold text-brand-text mb-2">
                        Registros de compilação
                    </summary>
                    <div className="bg-black p-4 rounded-lg font-mono text-xs max-h-60 overflow-y-auto">
                        {deploymentLogs.map((log, index) => (
                            <div key={index} className={`flex gap-4 ${getLogStyle(log.type)}`}>
                                <span className="text-gray-500">{log.timestamp}</span>
                                <pre className="whitespace-pre-wrap">{log.message}</pre>
                            </div>
                        ))}
                    </div>
                </details>
            </div>
        </Card>
    );
};

export default VercelPanel;