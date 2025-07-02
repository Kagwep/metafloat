import React from 'react';
import { AlertCircle } from 'lucide-react';

interface NoProfileViewProps {
  address: string;
  contractAddress?: string;
}

export const NoProfileView: React.FC<NoProfileViewProps> = ({ address, contractAddress }) => {
  return (
    <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-screen">
      <div className="text-center max-w-lg">
        <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">No Reputation Found</h2>
        <p className="text-slate-300 mb-6">
          Your wallet hasn't been analyzed yet. Please use MetaMask Card transactions to build your reputation.
        </p>
        <div className="space-y-2 text-slate-400 text-sm">
          <p>Connected: {address?.slice(0, 6)}...{address?.slice(-4)}</p>
          <p>Contract: {contractAddress ? '✅ Configured' : '❌ Not configured'}</p>
        </div>
      </div>
    </div>
  );
};