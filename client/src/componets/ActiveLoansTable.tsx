import React from 'react';
import { Clock, DollarSign, AlertTriangle, CheckCircle } from 'lucide-react';
import { useLoanManager } from '../hooks/useLoanManager';
import { LoanCard } from './LoanCard';

interface ActiveLoansTableProps {
  tokenAddress: `0x${string}`;
  tokenSymbol: string;
}

export const ActiveLoansTable: React.FC<ActiveLoansTableProps> = ({
  tokenAddress,
  tokenSymbol
}) => {
  const {
    userLoans,
    repayLoan,
    isRepayingLoan,
    isLoading
  } = useLoanManager(tokenAddress);

  if (isLoading) {
    return (
      <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-slate-700 rounded"></div>
          <div className="h-4 bg-slate-700 rounded w-3/4"></div>
          <div className="h-4 bg-slate-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!userLoans || userLoans.length === 0) {
    return (
      <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 text-center">
        <DollarSign className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">No Loans Yet</h3>
        <p className="text-slate-400">Request your first loan to get started</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
        <Clock className="w-5 h-5" />
        <span>Your Loans</span>
      </h3>

      <div className="space-y-4">
        {userLoans.map((loanId) => (
          <LoanCard 
            key={loanId}
            loanId={loanId}
            tokenSymbol={tokenSymbol}
            onRepay={() => repayLoan(loanId)}
            isRepaying={isRepayingLoan}
          />
        ))}
      </div>
    </div>
  );
};
