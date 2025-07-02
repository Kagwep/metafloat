import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface LoanEligibilityAlertProps {
  isEligible: boolean;
  maxLoanAmount: number;
}

export const LoanEligibilityAlert: React.FC<LoanEligibilityAlertProps> = ({ 
  isEligible, 
  maxLoanAmount 
}) => {
  return (
    <div className={`mb-8 p-4 rounded-xl border ${
      isEligible 
        ? 'bg-green-500/10 border-green-500/20 text-green-400'
        : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
    }`}>
      <div className="flex items-center space-x-2 text-center justify-center">
        {isEligible ? (
          <>
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">✅ Loan Qualified! You can borrow up to ${maxLoanAmount}</span>
          </>
        ) : (
          <>
            <AlertCircle className="w-5 h-5" />
            <span className="font-semibold">⚠️ Need 600+ Overall & Consistency scores to qualify for loans</span>
          </>
        )}
      </div>
    </div>
  );
};