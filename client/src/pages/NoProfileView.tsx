// components/NoProfileView.tsx (Updated)
import React from 'react';
import { AlertCircle, Zap, CreditCard, TrendingUp } from 'lucide-react';
import { UpdateReputationButton } from '../componets/UpdateReputationButton';


interface NoProfileViewProps {
  address: `0x${string}`;
  contractAddress?: string;
  onUpdateSuccess?: () => void;
}

export const NoProfileView: React.FC<NoProfileViewProps> = ({ 
  address, 
  contractAddress,
  onUpdateSuccess 
}) => {
  return (
    <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-screen">
      <div className="text-center max-w-2xl">
        <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
        <h2 className="text-3xl font-bold text-white mb-4">No Reputation Found</h2>
        <p className="text-xl text-slate-300 mb-8 leading-relaxed">
          Your wallet hasn't been analyzed yet. We'll scan your MetaMask Card transactions to build your reputation profile.
        </p>

        {/* Action Section */}
        <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 p-8 rounded-2xl border border-slate-600 backdrop-blur-sm mb-8">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Build Your Reputation</h3>
              <p className="text-slate-400">Analyze your MetaMask Card transaction history</p>
            </div>
          </div>

          <UpdateReputationButton
            walletAddress={address}
            onSuccess={onUpdateSuccess}
            variant="primary"
            size="lg"
            className="mb-6"
          />

          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center justify-center space-x-2 text-slate-400">
              <CreditCard className="w-4 h-4 text-blue-400" />
              <span>Scans MetaMask Card usage</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-slate-400">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span>Calculates reputation scores</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-slate-400">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span>Updates on-chain profile</span>
            </div>
          </div>
        </div>

        {/* Requirements Section */}
        <div className="bg-slate-800/30 p-6 rounded-xl border border-slate-700 mb-8">
          <h4 className="text-lg font-semibold text-white mb-4">Requirements to Build Reputation:</h4>
          <div className="grid md:grid-cols-2 gap-4 text-left">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-slate-300">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                <span>Active MetaMask Card usage</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                <span>Transaction history available</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-slate-300">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>Consistent spending patterns</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>Verified wallet address</span>
              </div>
            </div>
          </div>
        </div>

        {/* Connection Details */}
        <div className="space-y-2 text-slate-400 text-sm">
          <p>Connected: <span className="text-cyan-400 font-mono">{address?.slice(0, 6)}...{address?.slice(-4)}</span></p>
          <p>Contract: {contractAddress ? '✅ Configured' : '❌ Not configured'}</p>
        </div>
      </div>
    </div>
  );
};