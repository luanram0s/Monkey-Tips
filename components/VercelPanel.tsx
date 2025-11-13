import React from 'react';
import { Clock, GitBranch, Link as LinkIcon, ExternalLink, Loader, ShieldAlert, AlertTriangle } from 'lucide-react';
import Card from './ui/Card';
import { VercelDeploymentReport, VercelLogAnalysis } from '../types';

interface VercelPanelProps {
    report: VercelDeploymentReport | null;
    isLoading: boolean;
    error: string | null;
}

const VercelPanel: React.FC<VercelPanelProps> = ({ report, isLoading, error }) => {
    
    if (isLoading) {
        return (
            <Card className="bg-brand-dark/50">
                <div className="p-10 flex flex-col items-center justify-center text-brand-subtle">
                    <Loader size={32} className="animate-spin text-brand-accent" />
                    <p className="mt-4">Consultando a IA para o status do deploy...</p>
                </div>
            </Card>
        );
    }

    if (error) {
        return (
             <Card className="bg-red-900/20 border border-red-500/30">
                <div className="p-6 flex items-center gap-4 text-red-300">
                    <ShieldAlert size={24} />
                    <div>
                        <h4 className="font-bold">Erro ao Sincronizar</h4>
                        <p className="text-sm">{error}</p>
                    </div>
                </div>
            </Card>
        );
    }

    if (!report) {
        return null; // O componente pai mostrará o estado inicial
    }

    const getStatusInfo = () => {
        switch (report.deploymentStatus) {
            case 'Success':
                return { color: 'text-green-400', bgColor: 'bg-green-500', text: 'Sucesso' };
            case 'Warning':
                return { color: 'text-yellow-400', bgColor: 'bg-yellow-500', text: 'Aviso' };
            case 'Failed':
                return { color: 'text-red-400', bgColor: 'bg-red-500', text: 'Falha' };
            default:
                return { color: 'text-blue-400', bgColor: 'bg-blue-500', text: 'Em Progresso' };
        }
    };
    
    const statusInfo = getStatusInfo();

    const getLogStyle = (logStatus: string) => {
        if (logStatus.includes('✅')) return 'text-green-400';
        if (logStatus.includes('🟡')) return 'text-yellow-400';
        if (logStatus.includes('🔴')) return 'text-red-400';
        return 'text-gray-400';
    };

    return (
        <Card className="bg-brand-dark/50 animate-fade-in">
            <div className="p-5">
                <h3 className="font-semibold text-brand-text mb-4">Relatório de Implantação da IA</h3>
                <div className="bg-brand-dark p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Preview & Main Info */}
                        <div className="md:col-span-2 flex gap-4">
                           <div className="w-24 h-24 bg-black rounded-md flex-shrink-0"></div>
                           <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className={`w-3 h-3 ${statusInfo.bgColor} rounded-full animate-pulse`}></div>
                                    <span className={`${statusInfo.color} font-semibold`}>{statusInfo.text}</span>
                                    <span className="text-xs bg-brand-secondary px-2 py-0.5 rounded-full">Mais Recente</span>
                                </div>
                                <p className="text-sm text-brand-subtle">Domínios</p>
                                <ul className="text-sm space-y-1 mt-1">
                                    <li className="flex items-center gap-2 text-brand-text">
                                        <LinkIcon size={14}/> {report.deploymentDetails.primaryDomain}
                                    </li>
                                </ul>
                                <p className="text-sm text-brand-subtle mt-3">Fonte</p>
                                <div className="flex items-center gap-2 text-sm text-brand-text mt-1">
                                    <GitBranch size={14} />
                                    <span>principal</span>
                                    <span className="text-brand-subtle">{report.deploymentDetails.commit.hash}</span>
                                </div>
                                <p className="text-sm text-brand-text mt-1 truncate">{report.deploymentDetails.commit.message}</p>
                           </div>
                        </div>

                        {/* Metadata */}
                        <div className="text-sm space-y-3">
                            <div>
                                <p className="text-brand-subtle">Duração</p>
                                <p className="flex items-center gap-1"><Clock size={14}/> {report.deploymentDetails.durationInSeconds}s</p>
                            </div>
                             <div>
                                <p className="text-brand-subtle">Ambiente</p>
                                <p>Produção <span className="text-xs text-brand-subtle">(Atual)</span></p>
                            </div>
                            <a href={`https://${report.deploymentDetails.primaryDomain}`} target="_blank" rel="noopener noreferrer" className="block w-full text-center bg-white text-black font-semibold py-2 rounded-md hover:bg-gray-200 transition-colors">
                                Visita <ExternalLink className="inline-block" size={14}/>
                            </a>
                        </div>
                    </div>
                     {report.dependencyReport.issuesFound && (
                         <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-500/50 rounded-lg text-xs">
                             <h5 className="font-bold text-yellow-400 flex items-center gap-2 mb-2"><AlertTriangle size={16}/> Relatório de Dependências</h5>
                             {report.dependencyReport.deprecatedPackages.map((pkg, i) => (
                                 <p key={i} className="text-yellow-200">
                                     <span className="font-semibold">{pkg.oldPackage}</span> obsoleto. Ação: <code className="bg-black/50 px-1 rounded">{report.dependencyReport.suggestedActions[i*2+1]}</code>
                                 </p>
                             ))}
                         </div>
                     )}
                </div>

                {/* Compilation Logs */}
                <details className="mt-6" open>
                    <summary className="cursor-pointer text-sm font-semibold text-brand-text mb-2">
                        Registros de Compilação (Análise da IA)
                    </summary>
                    <div className="bg-black p-4 rounded-lg font-mono text-xs max-h-60 overflow-y-auto">
                        {report.logAnalysis.map((log, index) => (
                            <div key={index} className={`flex gap-4`}>
                                <span className="text-gray-500">{log.timestamp}</span>
                                <pre className={`whitespace-pre-wrap ${getLogStyle(log.status)}`}>{log.status} {log.message}</pre>
                            </div>
                        ))}
                    </div>
                </details>
            </div>
             <style>{`.animate-fade-in { animation: fade-in 0.5s ease-out forwards; } @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }`}</style>
        </Card>
    );
};

export default VercelPanel;