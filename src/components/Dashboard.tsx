import React, { useState } from 'react';
import AdminPanel from './AdminPanel';
import TipsPanel from './TipsPanel';
import Checklist from './Checklist';
import IntelligenceHub from './IntelligenceHub'; // Importando a nova central
import { User, Shield, LogOut, BrainCircuit, ListChecks, Cpu } from 'lucide-react';

interface DashboardProps {
  username: string;
  onLogout: () => void;
}

type Tab = 'tips' | 'admin' | 'checklist' | 'intelligence';

const Dashboard: React.FC<DashboardProps> = ({ username, onLogout }) => {
  const [activeTab, setActiveTab] = useState<Tab>('intelligence'); // Nova aba como padrão

  const getTabClass = (tabName: Tab) => 
    `flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200 ${
      activeTab === tabName
        ? 'bg-brand-secondary text-brand-accent'
        : 'text-brand-subtle hover:bg-zinc-700'
    }`;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-brand-secondary p-4 rounded-lg shadow-md">
        <div className="flex items-center gap-2">
            <User className="text-brand-accent"/>
            <span className="font-semibold text-brand-text">Bem-vindo, {username}</span>
        </div>
        <button onClick={onLogout} className="flex items-center gap-2 text-brand-subtle hover:text-red-400 transition-colors duration-200 text-sm">
            <LogOut size={16}/>
            Sair
        </button>
      </div>

      <div>
        <div className="flex border-b border-brand-secondary">
          <button onClick={() => setActiveTab('intelligence')} className={getTabClass('intelligence')}>
            <Cpu size={16} />
            Central de Inteligência
          </button>
          <button onClick={() => setActiveTab('tips')} className={getTabClass('tips')}>
            <BrainCircuit size={16} />
            Monkey Tips AI
          </button>
          <button onClick={() => setActiveTab('checklist')} className={getTabClass('checklist')}>
            <ListChecks size={16} />
            Roadmap
          </button>
          <button onClick={() => setActiveTab('admin')} className={getTabClass('admin')}>
            <Shield size={16} />
            Painel Administrativo
          </button>
        </div>
        <div className="bg-brand-secondary p-4 md:p-6 rounded-b-lg">
          {activeTab === 'tips' && <TipsPanel />}
          {activeTab === 'admin' && <AdminPanel />}
          {activeTab === 'checklist' && <Checklist />} 
          {activeTab === 'intelligence' && <IntelligenceHub />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;