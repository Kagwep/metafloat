import React from 'react';
import { Wallet } from 'lucide-react';

interface WalletConnectViewProps {
 
}

export const WalletConnectView: React.FC<WalletConnectViewProps> = () => {
  return (
    <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-screen">
      <div className="text-center max-w-lg">
        <div className="w-32 h-32 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-slate-700">
          <Wallet className="w-16 h-16 text-slate-400" />
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-6">Connect Your Wallet</h1>
        
        <p className="text-xl text-slate-300 mb-8 leading-relaxed">
          Connect your wallet to view your MetaFloat reputation profile and check your loan eligibility.
        </p>
        
      </div>
    </div>
  );
};
