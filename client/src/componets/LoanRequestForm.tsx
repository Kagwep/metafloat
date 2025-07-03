// components/LoanRequestForm.tsx (Updated)
import React, { useState, useEffect } from 'react';
import { DollarSign, Calculator, Clock, Shield, AlertTriangle, CheckCircle, Zap } from 'lucide-react';
import { useLoanManager, formatUSDC } from '../hooks/useLoanManager';
import { useLoanEligibility } from '../hooks/useLoanEligibility';

interface LoanRequestFormProps {
  tokenAddress: `0x${string}`;
  tokenSymbol: string;
  onSuccess?: () => void;
}

export const LoanRequestForm: React.FC<LoanRequestFormProps> = ({
  tokenAddress,
  tokenSymbol,
  onSuccess
}) => {
  const [amount, setAmount] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  
  const { loanEligibility } = useLoanEligibility();
  const {
    // Data
    userBalance,
    userApproval,
    activeLoansCount,
    contractBalance,
    
    // Actions
    approveToken,
    requestLoan,
    
    // States
    isApprovingToken,
    isRequestingLoan,
    
    // Utils
    calculateLoanCost,
    needsApproval,
    canRequestLoan,
  } = useLoanManager(tokenAddress);

  // Calculate loan details
  const loanCost = calculateLoanCost(amount);
  const maxAmount = loanEligibility?.maxAmount ? 
    parseFloat(formatUSDC(loanEligibility.maxAmount)) : 0;
  
  // Validation checks
  const isValidAmount = amount && parseFloat(amount) > 0 && parseFloat(amount) <= maxAmount;
  const needsTokenApproval = isValidAmount && needsApproval(amount);
  const canRequest = isValidAmount && canRequestLoan(amount);
  const hasEnoughBalance = userBalance && loanCost && userBalance >= loanCost.totalAmount;
  const belowLoanLimit = (activeLoansCount || 0) < 1;

  // Handle approval
  const handleApprove = () => {
    if (!loanCost || !needsTokenApproval) return;
    
    // Approve 20% extra for gas fluctuations
    const approvalAmount = (loanCost.totalAmount * 120n) / 100n;
    approveToken(approvalAmount);
  };

  // Handle loan request
  const handleRequest = () => {
    if (!canRequest) return;
    requestLoan(amount);
  };

  // Auto-call success callback
  useEffect(() => {
    if (onSuccess && !isRequestingLoan) {
      // You could add logic here to detect successful loan creation
      // For now, we'll rely on parent component to handle this
    }
  }, [isRequestingLoan, onSuccess]);

  // Quick amount buttons
  const quickAmounts = [25, 50, 100, maxAmount].filter(amt => amt <= maxAmount && amt > 0);

  if (!loanEligibility?.eligible) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl">
        <div className="flex items-center space-x-2 text-red-400 mb-4">
          <Shield className="w-5 h-5" />
          <span className="font-semibold">Not Eligible for Loans</span>
        </div>
        <p className="text-slate-300 mb-4">
          You need to meet the minimum reputation requirements to request loans.
        </p>
        <div className="text-sm text-slate-400">
          Check the Loan Eligibility section above for requirements.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 p-6 rounded-2xl border border-slate-600">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center">
          <DollarSign className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Request Loan</h3>
          <p className="text-slate-400">Get instant {tokenSymbol} with 1% APR</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Amount Input */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            Loan Amount ({tokenSymbol})
          </label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="1"
              max={maxAmount}
              step="0.01"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
            <div className="absolute right-3 top-3 text-slate-400">
              {tokenSymbol}
            </div>
          </div>
          
          {/* Quick Amount Buttons */}
          <div className="flex justify-between items-center mt-3">
            <div className="flex space-x-2">
              {quickAmounts.map((quickAmount) => (
                <button
                  key={quickAmount}
                  type="button"
                  onClick={() => setAmount(quickAmount.toString())}
                  className="px-3 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition-colors"
                >
                  ${quickAmount}
                </button>
              ))}
            </div>
            <div className="text-sm text-slate-400">
              Max: ${maxAmount.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Loan Cost Breakdown */}
        {loanCost && isValidAmount && (
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center justify-between w-full text-left"
            >
              <span className="font-semibold text-white flex items-center space-x-2">
                <Calculator className="w-4 h-4" />
                <span>Loan Breakdown</span>
              </span>
              <span className="text-slate-400">
                {showDetails ? '−' : '+'}
              </span>
            </button>
            
            {showDetails && (
              <div className="mt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Principal:</span>
                  <span className="text-white">${formatUSDC(loanCost.totalAmount - loanCost.interestAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Interest (1% APR, 30 days):</span>
                  <span className="text-white">${formatUSDC(loanCost.interestAmount)}</span>
                </div>
                <div className="flex justify-between font-semibold border-t border-slate-600 pt-2">
                  <span className="text-white">Total Repayment:</span>
                  <span className="text-white">${formatUSDC(loanCost.totalAmount)}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-400">
                  <Clock className="w-4 h-4" />
                  <span>Due in 30 days</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Status Checks */}
        {isValidAmount && (
          <div className="space-y-3">
            {/* Balance Check */}
            <div className={`flex items-center justify-between p-3 rounded-lg border ${
              hasEnoughBalance 
                ? 'bg-green-500/10 border-green-500/20'
                : 'bg-red-500/10 border-red-500/20'
            }`}>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${hasEnoughBalance ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="text-sm text-slate-300">
                  Balance: ${userBalance ? formatUSDC(userBalance) : '0.00'}
                </span>
              </div>
              <span className={`text-sm font-semibold ${hasEnoughBalance ? 'text-green-400' : 'text-red-400'}`}>
                {hasEnoughBalance ? 'Sufficient' : 'Insufficient'}
              </span>
            </div>

            {/* Approval Check */}
            <div className={`flex items-center justify-between p-3 rounded-lg border ${
              !needsTokenApproval 
                ? 'bg-green-500/10 border-green-500/20'
                : 'bg-yellow-500/10 border-yellow-500/20'
            }`}>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${!needsTokenApproval ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                <span className="text-sm text-slate-300">
                  Approval: ${userApproval ? formatUSDC(userApproval) : '0.00'}
                </span>
              </div>
              <span className={`text-sm font-semibold ${!needsTokenApproval ? 'text-green-400' : 'text-yellow-400'}`}>
                {!needsTokenApproval ? 'Ready' : 'Needed'}
              </span>
            </div>

            {/* Loan Limit Check */}
            <div className={`flex items-center justify-between p-3 rounded-lg border ${
              belowLoanLimit 
                ? 'bg-green-500/10 border-green-500/20'
                : 'bg-red-500/10 border-red-500/20'
            }`}>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${belowLoanLimit ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span className="text-sm text-slate-300">
                  Active Loans: {activeLoansCount || 0}/1
                </span>
              </div>
              <span className={`text-sm font-semibold ${belowLoanLimit ? 'text-green-400' : 'text-red-400'}`}>
                {belowLoanLimit ? 'Available' : 'Limit Reached'}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Approve Button */}
          {needsTokenApproval && (
            <button
              onClick={handleApprove}
              disabled={!isValidAmount || isApprovingToken}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center space-x-2 ${
                isValidAmount && !isApprovingToken
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transform hover:scale-105'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isApprovingToken ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Approving {tokenSymbol}...</span>
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  <span>Approve ${loanCost ? formatUSDC(loanCost.totalAmount) : '0'} {tokenSymbol}</span>
                </>
              )}
            </button>
          )}

          {/* Request Button */}
          <button
            onClick={handleRequest}
            disabled={!canRequest || isRequestingLoan || needsTokenApproval}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center space-x-2 ${
              canRequest && !isRequestingLoan && !needsTokenApproval
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transform hover:scale-105'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isRequestingLoan ? (
              <>
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Processing Loan...</span>
              </>
            ) : needsTokenApproval ? (
              <>
                <AlertTriangle className="w-5 h-5" />
                <span>Approve Tokens First</span>
              </>
            ) : !canRequest ? (
              <>
                <AlertTriangle className="w-5 h-5" />
                <span>Check Requirements Above</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                <span>Request ${amount || '0'} {tokenSymbol} Loan</span>
              </>
            )}
          </button>
        </div>

        {/* Contract Info Footer */}
        <div className="bg-slate-900/50 p-3 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-xs text-slate-400">
            <div>
              <div className="font-semibold text-slate-300 mb-1">Contract Status</div>
              <div>Balance: ${contractBalance ? formatUSDC(contractBalance) : '0.00'}</div>
              <div>Rate: 1% APR Fixed</div>
            </div>
            <div>
              <div className="font-semibold text-slate-300 mb-1">Your Status</div>
              <div>Loans: {activeLoansCount || 0}/1</div>
              <div>Balance: ${userBalance ? formatUSDC(userBalance) : '0.00'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};