import React from 'react';
import { CheckCircle, ExternalLink, X, TrendingUp, Shield, Users } from 'lucide-react';

interface ContractUpdateResult {
  success: boolean;
  transactionHash: string;
  blockNumber: number;
  gasUsed: string;
  userAddress: string;
  overallReputation: number;
  trustLevel: number;
  userClass: number;
}

interface UpdateSuccessModalProps {
  contractResult: ContractUpdateResult;
  isOpen: boolean;
  onClose: () => void;
}

export const UpdateSuccessModal: React.FC<UpdateSuccessModalProps> = ({
  contractResult,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const getTrustLevelName = (level: number) => {
    const levels = ['Bronze', 'Silver', 'Gold', 'Platinum'];
    return levels[level] || 'Bronze';
  };

  const getUserClassName = (userClass: number) => {
    const classes = ['Newcomer', 'Casual User', 'Regular User', 'Power User', 'Whale', 'Veteran'];
    return classes[userClass] || 'Newcomer';
  };

  const getTrustLevelColor = (level: number) => {
    const colors = ['from-amber-600 to-amber-800', 'from-gray-400 to-gray-600', 'from-yellow-500 to-yellow-700', 'from-purple-600 to-purple-800'];
    return colors[level] || colors[0];
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl border border-slate-600 max-w-md w-full p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Success header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Reputation Updated!</h2>
          <p className="text-slate-300">Your reputation has been successfully updated on-chain</p>
        </div>

        {/* Updated stats */}
        <div className="space-y-4 mb-6">
          <div className="bg-slate-700/50 p-4 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <span className="text-slate-300">Overall Reputation</span>
              </div>
              <span className="text-2xl font-bold text-white">{contractResult.overallReputation}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-700/50 p-4 rounded-xl">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="w-4 h-4 text-purple-400" />
                <span className="text-slate-400 text-sm">Trust Level</span>
              </div>
              <div className={`text-lg font-bold bg-gradient-to-r ${getTrustLevelColor(contractResult.trustLevel)} bg-clip-text text-transparent`}>
                {getTrustLevelName(contractResult.trustLevel)}
              </div>
            </div>

            <div className="bg-slate-700/50 p-4 rounded-xl">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <span className="text-slate-400 text-sm">User Class</span>
              </div>
              <div className="text-lg font-bold text-white">
                {getUserClassName(contractResult.userClass)}
              </div>
            </div>
          </div>
        </div>

        {/* Transaction details */}
        <div className="bg-slate-800/50 p-4 rounded-xl mb-6">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Transaction Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Block Number:</span>
              <span className="text-white">{contractResult.blockNumber.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Gas Used:</span>
              <span className="text-white">{parseInt(contractResult.gasUsed).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Transaction:</span>
              <a
                href={`https://etherscan.io/tx/${contractResult.transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <span className="font-mono text-xs">{contractResult.transactionHash.slice(0, 8)}...</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-cyan-600 hover:to-purple-700 transition-all duration-300"
        >
          Continue
        </button>
      </div>
    </div>
  );
};