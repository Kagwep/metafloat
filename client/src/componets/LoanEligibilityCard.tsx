import React from 'react';
import { DollarSign, CheckCircle, XCircle } from 'lucide-react';
import { useLoanEligibility } from '../hooks/useLoanEligibility';

interface LoanEligibilityCardProps {
  className?: string;
}

export const LoanEligibilityCard: React.FC<LoanEligibilityCardProps> = ({ className = "" }) => {
  const { loanEligibility, isLoading } = useLoanEligibility();

  const formatUSDC = (amount: bigint): string => {
    return (Number(amount) / 1e6).toFixed(0);
  };

  const getTierName = (tier: number): string => {
    const names = { 0: 'None', 1: 'Micro', 2: 'Small', 3: 'Medium', 4: 'Large' };
    return names[tier] || 'None';
  };

  if (isLoading) {
    return (
      <div className={`bg-slate-800/50 p-4 rounded-xl border border-slate-700 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-slate-700 rounded mb-2"></div>
          <div className="h-6 bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!loanEligibility) {
    return (
      <div className={`bg-slate-800/50 p-4 rounded-xl border border-slate-700 ${className}`}>
        <div className="text-slate-400 text-sm">Connect wallet to check loans</div>
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-xl border transition-all duration-300 ${
      loanEligibility.eligible 
        ? 'bg-green-500/10 border-green-500/30'
        : 'bg-red-500/10 border-red-500/30'
    } ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            loanEligibility.eligible ? 'bg-green-500/20' : 'bg-red-500/20'
          }`}>
            <DollarSign className={`w-5 h-5 ${
              loanEligibility.eligible ? 'text-green-400' : 'text-red-400'
            }`} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              {loanEligibility.eligible ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <XCircle className="w-4 h-4 text-red-400" />
              )}
              <span className="font-semibold text-white">
                {loanEligibility.eligible ? 'Loan Eligible' : 'Not Eligible'}
              </span>
            </div>
            {loanEligibility.eligible && (
              <div className="text-slate-300 text-sm">
                Up to ${formatUSDC(loanEligibility.maxAmount)} • {getTierName(loanEligibility.maxTier)} tier
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};