
import React, { useState, useCallback, useEffect } from 'react';
import { Module, ModuleStatus, SyncStatus, LogEntry } from '../types';
import { Cloud, HardDrive, UploadCloud, TestTube2, Trash2 } from 'lucide-react';
import Card from './ui/Card';
import StatusIndicator from './ui/StatusIndicator';

const initialModules: Module[] = [
  { id: '1', name: 'Análise de Gols (Futebol)', code: '# Python code here...', status: ModuleStatus.Active },
  { id: '2', name: 'Probabilidade de Cestas (Basquete)', code: '# Python code here...', status: ModuleStatus.Active },
  { id: '3', name: 'Análise de Saques (Vôlei)', code: '# Python code here...', status: ModuleStatus.Inactive },
  { id: '4', name: 'Detecção de Lesões (Beta)', code: '# Python code here...', status: ModuleStatus.Testing },
];

const AdminPanel: React.FC = () => {
  const [modules, setModules] = useState<Module[]>(initialModules);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(SyncStatus.Synced);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [newModuleName, setNewModuleName] = useState('');
  const [newModuleCode, setNewModuleCode] = useState('');
  
  const addLog = useCallback((message: string, level: 'info' | 'warn' | 'error') => {
    setLogs(prevLogs => [
      { id: Date.now(), timestamp: new Date().toLocaleTimeString(), message, level },
      ...prevLogs
    ].slice(0, 100)); // Keep last 100 logs
  }, []);

  useEffect(() => {
    addLog('Painel administrativo iniciado.', 'info');
    const autoSync = setInterval(() => {
        handleSync();
    }, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(autoSync);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addLog]);

  const handleSync = () => {
    addLog('Iniciando sincronização com a nuvem...', 'info');
    setSyncStatus(SyncStatus.Syncing);
    setTimeout(() => {
      const success = Math.random() > 0.1; // 90% success rate
      if (success) {
        setSyncStatus(SyncStatus.Synced);
        addLog('Sincronização com a nuvem concluída com sucesso.', 'info');
      } else {
        setSyncStatus(SyncStatus.Error);
        addLog('Falha na sincronização com a nuvem.', 'error');
      }
    }, 2000);
  };
  
  const handleBackup = () => {
    addLog('Criando backup local...', 'info');
    const dataStr = JSON.stringify({ modules, logs }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'monkey_tips_backup.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    addLog('Backup local criado com sucesso.', 'info');
  };

  const handleAddModule = () => {
      if (!newModuleName.trim() || !newModuleCode.trim()) {
          addLog('Nome do módulo e código são obrigatórios.', 'warn');
          return;
      }
      const newModule: Module = {
        id: (modules.length + 1).toString(),
        name: newModuleName,
        code: newModuleCode,
        status: ModuleStatus.Inactive
      };
      setModules([...modules, newModule]);
      addLog(`Módulo "${newModuleName}" instalado com sucesso.`, 'info');
      setNewModuleName('');
      setNewModuleCode('');
  };

  const toggleModuleStatus = (id: string) => {
    setModules(modules.map(m => {
        if (m.id === id) {
            const newStatus = m.status === ModuleStatus.Active ? ModuleStatus.Inactive : ModuleStatus.Active;
            addLog(`Status do módulo "${m.name}" alterado para ${newStatus}.`, 'info');
            return { ...m, status: newStatus };
        }
        return m;
    }));
  };

  const deleteModule = (id: string) => {
    const moduleToDelete = modules.find(m => m.id === id);
    if (window.confirm(`Tem certeza que deseja remover o módulo "${moduleToDelete?.name}"?`)) {
        setModules(modules.filter(m => m.id !== id));
        addLog(`Módulo "${moduleToDelete?.name}" removido.`, 'warn');
    }
  };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <div className="p-6">
            <h3 className="text-xl font-bold text-brand-accent mb-4">Ações Rápidas</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <button onClick={handleSync} className="flex items-center justify-center gap-2 bg-blue-600/80 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-500 transition-colors">
                <Cloud size={20} /> Sincronizar Nuvem
              </button>
              <button onClick={handleBackup} className="flex items-center justify-center gap-2 bg-green-600/80 text-white font-semibold py-3 px-4 rounded-lg hover:bg-green-500 transition-colors">
                <HardDrive size={20} /> Criar Backup
              </button>
               <div className="flex items-center justify-center gap-2 bg-brand-secondary py-3 px-4 rounded-lg">
                <StatusIndicator status={syncStatus} />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-xl font-bold text-brand-accent mb-4">Gerenciamento de Módulos</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {modules.map(module => (
                <div key={module.id} className="bg-brand-dark p-3 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <StatusIndicator status={module.status} />
                    <span>{module.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleModuleStatus(module.id)} className="p-2 text-brand-subtle hover:text-brand-accent transition-colors">
                      {module.status === ModuleStatus.Active ? 'Desativar' : 'Ativar'}
                    </button>
                    <button onClick={() => deleteModule(module.id)} className="p-2 text-brand-subtle hover:text-red-500 transition-colors">
                        <Trash2 size={16}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-6">
            <h3 className="text-xl font-bold text-brand-accent mb-4">Adicionar Novo Módulo (.py)</h3>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Nome do módulo"
                value={newModuleName}
                onChange={(e) => setNewModuleName(e.target.value)}
                className="w-full bg-brand-dark border border-zinc-700 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-brand-accent"
              />
              <textarea 
                placeholder="Cole o código Python aqui..." 
                rows={5}
                value={newModuleCode}
                onChange={(e) => setNewModuleCode(e.target.value)}
                className="w-full bg-brand-dark border border-zinc-700 rounded-lg py-2 px-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
              />
              <p className="text-xs text-brand-subtle">Nota: A execução de código Python não é suportada no navegador. Esta é uma interface para gerenciamento de scripts que seriam executados em um backend.</p>
              <button onClick={handleAddModule} className="flex items-center justify-center gap-2 bg-brand-accent text-brand-dark font-bold py-2 px-6 rounded-lg hover:bg-yellow-400 transition-colors">
                <UploadCloud size={20} /> Instalar Módulo
              </button>
            </div>
          </div>
        </Card>
      </div>

      <div className="lg:col-span-1">
        <Card>
          <div className="p-6 h-[70vh] flex flex-col">
            <h3 className="text-xl font-bold text-brand-accent mb-4">Logs do Sistema</h3>
            <div className="flex-grow bg-brand-dark p-3 rounded-lg overflow-y-auto font-mono text-sm space-y-2">
                {logs.map(log => (
                    <div key={log.id} className={`flex gap-2 ${log.level === 'error' ? 'text-red-400' : log.level === 'warn' ? 'text-yellow-400' : 'text-gray-400'}`}>
                        <span>[{log.timestamp}]</span>
                        <span className="flex-1">{log.message}</span>
                    </div>
                ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;