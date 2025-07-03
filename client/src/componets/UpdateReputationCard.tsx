import React from 'react';
import { Zap, TrendingUp, Clock } from 'lucide-react';
import { UpdateReputationButton } from './UpdateReputationButton';

interface UpdateReputationCardProps {
  walletAddress: `0x${string}`;
  onSuccess?: () => void;
  lastUpdate?: string;
}

export const UpdateReputationCard: React.FC<UpdateReputationCardProps> = ({
  walletAddress,
  onSuccess,
  lastUpdate
}) => {
  return (
    <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 p-6 rounded-2xl border border-slate-600 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-1">Update Your Reputation</h3>
            <p className="text-slate-400 text-sm">
              Sync your latest MetaMask Card transactions to improve your score
            </p>
            {lastUpdate && (
              <div className="flex items-center space-x-1 mt-2 text-xs text-slate-500">
                <Clock className="w-3 h-3" />
                <span>Last updated: {lastUpdate}</span>
              </div>
            )}
          </div>
        </div>
        
        <UpdateReputationButton
          walletAddress={walletAddress}
          onSuccess={onSuccess}
          variant="primary"
          size="md"
        />
      </div>
      
      <div className="mt-4 flex items-center space-x-4 text-sm text-slate-400">
        <div className="flex items-center space-x-1">
          <TrendingUp className="w-4 h-4 text-green-400" />
          <span>Analyzes recent transactions</span>
        </div>
        <div className="flex items-center space-x-1">
          <Zap className="w-4 h-4 text-yellow-400" />
          <span>Updates scores in real-time</span>
        </div>
      </div>
    </div>
  );
};