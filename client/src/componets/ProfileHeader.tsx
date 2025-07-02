import React from 'react';
import { Shield, CheckCircle, Calendar, Hash, RefreshCw } from 'lucide-react';

interface ProfileHeaderProps {
  address: string;
  onRefresh: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ address, onRefresh }) => {
  return (
    <div className="text-center mb-12">
      <h1 className="text-5xl font-bold text-white mb-4">My Reputation Profile</h1>
      <p className="text-xl text-slate-300">Your verified identity and borrowing power in the MetaFloat ecosystem</p>
      <div className="flex items-center justify-center space-x-2 mt-4">
        <span className="text-slate-400">Connected:</span>
        <span className="text-cyan-400 font-mono">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
        <button 
          onClick={onRefresh}
          className="text-cyan-400 hover:text-cyan-300 transition-colors"
          title="Refresh Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};