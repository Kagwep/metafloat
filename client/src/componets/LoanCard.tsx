import React from 'react';
import { Calendar, DollarSign, AlertTriangle, CheckCircle } from 'lucide-react';

interface LoanCardProps {
  loanId: number;
  tokenSymbol: string;
  onRepay: () => void;
  isRepaying: boolean;
}

export const LoanCard: React.FC<LoanCardProps> = ({
  loanId,
  tokenSymbol,
  onRepay,
  isRepaying
}) => {
  // This would need a separate hook to fetch individual loan details
  // For now, showing placeholder data
  const loan = {
    principalAmount: 100,
    totalAmount: 101,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    isActive: true,
    isOverdue: false
  };

  const daysUntilDue = Math.ceil((loan.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysUntilDue < 0;
  const isDueSoon = daysUntilDue <= 3;

  return (
    <div className={`p-4 rounded-xl border ${
      isOverdue 
        ? 'bg-red-500/10 border-red-500/30'
        : isDueSoon
        ? 'bg-yellow-500/10 border-yellow-500/30'
        : 'bg-slate-700/50 border-slate-600'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isOverdue 
              ? 'bg-red-500/20'
              : isDueSoon
              ? 'bg-yellow-500/20'
              : 'bg-slate-600'
          }`}>
            <DollarSign className={`w-5 h-5 ${
              isOverdue 
                ? 'text-red-400'
                : isDueSoon
                ? 'text-yellow-400'
                : 'text-slate-300'
            }`} />
          </div>
          <div>
            <div className="font-semibold text-white">
              Loan #{loanId}
            </div>
            <div className="text-sm text-slate-400">
              ${loan.totalAmount} {tokenSymbol} due {loan.dueDate.toLocaleDateString()}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className={`text-sm font-semibold ${
              isOverdue ? 'text-red-400' : isDueSoon ? 'text-yellow-400' : 'text-slate-300'
            }`}>
              {isOverdue ? 'OVERDUE' : `${daysUntilDue} days left`}
            </div>
            <div className="text-xs text-slate-400">
              Principal: ${loan.principalAmount}
            </div>
          </div>

          <button
            onClick={onRepay}
            disabled={isRepaying}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
              isOverdue
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : isDueSoon
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            } ${isRepaying ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isRepaying ? 'Repaying...' : 'Repay Loan'}
          </button>
        </div>
      </div>
    </div>
  );
};