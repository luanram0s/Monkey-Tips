
import React from 'react';
import { ModuleStatus, SyncStatus } from '../../types';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';

interface StatusIndicatorProps {
  status: ModuleStatus | SyncStatus;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  const getStatusStyle = () => {
    switch (status) {
      // Sync Status
      case SyncStatus.Synced:
        return { color: 'text-green-400', icon: <CheckCircle size={16} /> };
      case SyncStatus.Syncing:
        return { color: 'text-yellow-400', icon: <RefreshCw size={16} className="animate-spin" /> };
      case SyncStatus.Error:
        return { color: 'text-red-400', icon: <XCircle size={16} /> };
      // Module Status
      case ModuleStatus.Active:
        return { color: 'text-green-400', icon: <CheckCircle size={16} /> };
      case ModuleStatus.Inactive:
        return { color: 'text-gray-400', icon: <XCircle size={16} /> };
      case ModuleStatus.Testing:
        return { color: 'text-blue-400', icon: <AlertTriangle size={16} /> };
      default:
        return { color: 'text-gray-500', icon: null };
    }
  };

  const { color, icon } = getStatusStyle();

  return (
    <div className={`flex items-center gap-2 text-sm font-medium ${color}`}>
      {icon}
      <span>{status}</span>
    </div>
  );
};

export default StatusIndicator;
