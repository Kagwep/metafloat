import React from 'react';
import { DollarSign, Shield, TrendingUp, CheckCircle, XCircle, AlertTriangle, Sparkles, Circle } from 'lucide-react';
import { useLoanEligibility } from '../hooks/useLoanEligibility';
import type { LoanTier } from '../types';

interface LoanEligibilityCheckerProps {
  className?: string;
}

export const LoanEligibilityChecker: React.FC<LoanEligibilityCheckerProps> = ({ className = "" }) => {
  const { loanEligibility, allTierConfigs, isLoading, error } = useLoanEligibility();

  const getTierName = (tier: LoanTier): string => {
    const names = { 0: 'None', 1: 'Micro', 2: 'Small', 3: 'Medium', 4: 'Large' };
    return names[tier] || 'None';
  };

  const getTierColor = (tier: LoanTier): string => {
    const colors = {
      0: 'from-gray-500 to-gray-600',
      1: 'from-green-500 to-green-600',
      2: 'from-blue-500 to-blue-600',
      3: 'from-purple-500 to-purple-600',
      4: 'from-yellow-500 to-yellow-600'
    };
    return colors[tier] || colors[0];
  };

  const formatUSDC = (amount: bigint): string => {
    return (Number(amount) / 1e6).toFixed(0);
  };

  const formatAPR = (basisPoints: number): string => {
    return (basisPoints / 100).toFixed(1);
  };

  if (isLoading) {
    return (
      <div className={`bg-gradient-to-r from-slate-800/50 to-slate-700/50 p-6 rounded-2xl border border-slate-600 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-slate-700 rounded mb-4"></div>
          <div className="h-4 bg-slate-700 rounded mb-2"></div>
          <div className="h-4 bg-slate-700 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-500/10 border border-red-500/20 p-6 rounded-2xl ${className}`}>
        <div className="flex items-center space-x-2 text-red-400">
          <XCircle className="w-5 h-5" />
          <span>Unable to check loan eligibility</span>
        </div>
      </div>
    );
  }

  if (!loanEligibility) {
    return (
      <div className={`bg-slate-800/50 border border-slate-700 p-6 rounded-2xl ${className}`}>
        <div className="text-slate-400 text-center">
          Connect wallet to check loan eligibility
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-r from-slate-800/50 to-slate-700/50 p-6 rounded-2xl border border-slate-600 backdrop-blur-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${
            loanEligibility.eligible ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600'
          } flex items-center justify-center`}>
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Loan Eligibility</h3>
            <p className="text-slate-400">
              {loanEligibility.eligible ? 'You qualify for loans!' : 'Not currently eligible'}
            </p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
          loanEligibility.eligible 
            ? 'bg-green-500/20 text-green-400' 
            : 'bg-red-500/20 text-red-400'
        }`}>
          {loanEligibility.eligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}
        </div>
      </div>

      {loanEligibility.eligible ? (
        <>
          {/* Qualification Summary */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className={`p-4 rounded-xl bg-gradient-to-r ${getTierColor(loanEligibility.maxTier)} bg-opacity-20 border border-opacity-30`}>
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="w-5 h-5 text-white" />
                <span className="text-white font-semibold">Max Tier</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {getTierName(loanEligibility.maxTier)}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-green-500/20 border border-green-500/30">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-semibold">Max Amount</span>
              </div>
              <div className="text-2xl font-bold text-white">
                ${formatUSDC(loanEligibility.maxAmount)}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-500/20 border border-blue-500/30">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                <span className="text-blue-400 font-semibold">Interest Rate</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {formatAPR(loanEligibility.interestRate)}% APR
              </div>
            </div>
          </div>

          {/* Reasons for Eligibility */}
          {loanEligibility.reasons.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-green-400" />
                <span>Why You Qualify</span>
              </h4>
              <div className="space-y-2">
                {loanEligibility.reasons.map((reason, index) => (
                  <div key={index} className="flex items-start space-x-2 text-slate-300">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Tiers Overview */}
          {allTierConfigs && (
            <div>
              <h4 className="text-lg font-semibold text-white mb-3">All Loan Tiers</h4>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {Object.entries(allTierConfigs).map(([tierName, config], index) => {
                  const tierNum = index + 1 as LoanTier;
                  const isQualified = loanEligibility.maxTier >= tierNum;
                  
                  return (
                    <div 
                      key={tierName}
                      className={`p-4 rounded-xl border transition-all duration-300 ${
                        isQualified 
                          ? `bg-gradient-to-r ${getTierColor(tierNum)} bg-opacity-20 border-opacity-50`
                          : 'bg-slate-800/30 border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-semibold capitalize ${
                          isQualified ? 'text-white' : 'text-slate-400'
                        }`}>
                          {tierName}
                        </span>
                        {isQualified ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-slate-500" />
                        )}
                      </div>
                      <div className={`text-lg font-bold ${
                        isQualified ? 'text-white' : 'text-slate-500'
                      }`}>
                        ${formatUSDC(config.maxLoanAmount)}
                      </div>
                      <div className={`text-xs ${
                        isQualified ? 'text-slate-300' : 'text-slate-500'
                      }`}>
                        Min: {config.minOverallReputation} overall
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Requirements to Meet */}
          {loanEligibility.requirements.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <span>Requirements to Meet</span>
              </h4>
              <div className="space-y-2">
                {loanEligibility.requirements.map((requirement, index) => (
                  <div key={index} className="flex items-start space-x-2 text-slate-300">
                    <Circle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>{requirement}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reasons for Ineligibility */}
          {loanEligibility.reasons.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-white mb-3">Current Requirements Not Met</h4>
              <div className="space-y-2">
                {loanEligibility.reasons.map((reason, index) => (
                  <div key={index} className="flex items-start space-x-2 text-slate-300">
                    <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Path to Eligibility */}
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
            <h4 className="text-md font-semibold text-white mb-2">Path to Loan Eligibility</h4>
            <div className="text-sm text-slate-400 space-y-1">
              <p>• Build your reputation with consistent MetaMask Card usage</p>
              <p>• Maintain minimum 600 overall and consistency scores</p>
              <p>• Ensure your reputation data is current</p>
              <p>• Stay active on the platform</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};