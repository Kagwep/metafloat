import { useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { erc20Abi } from "viem";
import LoanManagerAbi from "../assets/MetaFloatLoanManager.json";
import { META_LOAN_MANAGER_ADDRESS } from '../constants';

export interface LoanCost {
  interestAmount: bigint;
  totalAmount: bigint;
}

interface UseLoanManagerReturn {
  // Data
  userLoans: number[] | undefined;
  activeLoansCount: number | undefined;
  contractBalance: bigint | undefined;
  userApproval: bigint | undefined;
  userBalance: bigint | undefined;
  
  // Actions
  approveToken: (amount: bigint) => void;
  requestLoan: (amount: string) => void;
  repayLoan: (loanId: number) => void;
  
  // States
  isApprovingToken: boolean;
  isRequestingLoan: boolean;
  isRepayingLoan: boolean;
  
  // Utils
  calculateLoanCost: (amount: string) => LoanCost | undefined;
  needsApproval: (amount: string) => boolean;
  canRequestLoan: (amount: string) => boolean;
  
  // System
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useLoanManager = (tokenAddress: `0x${string}`): UseLoanManagerReturn => {
  const { address, chain } = useAccount();
  const LOAN_MANAGER_ADDRESS = META_LOAN_MANAGER_ADDRESS;

  // ===== READ CONTRACTS =====
  
  // User loans
  const { 
    data: userLoans, 
    isLoading: isLoadingLoans,
    error: loansError,
    refetch: refetchLoans
  } = useReadContract({
    address: LOAN_MANAGER_ADDRESS,
    abi: LoanManagerAbi,
    functionName: 'getUserLoans',
    args: [address],
    query: {
      enabled: !!address && !!LOAN_MANAGER_ADDRESS,
    }
  });

  // Active loans count
  const { 
    data: activeLoansCount,
    refetch: refetchActiveCount
  } = useReadContract({
    address: LOAN_MANAGER_ADDRESS,
    abi: LoanManagerAbi,
    functionName: 'getUserActiveLoansCount',
    args: [address],
    query: {
      enabled: !!address && !!LOAN_MANAGER_ADDRESS,
    }
  });

  // Contract balance
  const { 
    data: contractBalance,
    refetch: refetchBalance
  } = useReadContract({
    address: LOAN_MANAGER_ADDRESS,
    abi: LoanManagerAbi,
    functionName: 'getContractBalance',
    args: [tokenAddress],
    query: {
      enabled: !!LOAN_MANAGER_ADDRESS && !!tokenAddress,
    }
  });

  // User token approval for loan manager
  const { 
    data: userApproval,
    refetch: refetchApproval
  } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [address!, LOAN_MANAGER_ADDRESS],
    query: {
      enabled: !!address && !!tokenAddress && !!LOAN_MANAGER_ADDRESS,
    }
  });

  // User token balance
  const { 
    data: userBalance,
    refetch: refetchUserBalance
  } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address!],
    query: {
      enabled: !!address && !!tokenAddress,
    }
  });

  // ===== WRITE CONTRACTS =====
  
  // Approve token
  const { 
    writeContract: writeApprove,
    data: approveHash,
    isPending: isApprovingPending,
    error: approveError
  } = useWriteContract();

  // Request loan
  const { 
    writeContract: writeRequestLoan,
    data: requestHash,
    isPending: isRequestingPending,
    error: requestError
  } = useWriteContract();

  // Repay loan
  const { 
    writeContract: writeRepayLoan,
    data: repayHash,
    isPending: isRepayingPending,
    error: repayError
  } = useWriteContract();

  // ===== TRANSACTION RECEIPTS =====
  
  const { 
    isLoading: isConfirmingApprove, 
    isSuccess: approveSuccess 
  } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  const { 
    isLoading: isConfirmingRequest,
    isSuccess: requestSuccess
  } = useWaitForTransactionReceipt({
    hash: requestHash,
  });

  const { 
    isLoading: isConfirmingRepay,
    isSuccess: repaySuccess
  } = useWaitForTransactionReceipt({
    hash: repayHash,
  });

  // ===== ACTIONS =====
  
  const approveToken = (amount: bigint) => {
    if (!tokenAddress || !LOAN_MANAGER_ADDRESS || !address || !chain) return;
    
    writeApprove({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'approve',
        args: [LOAN_MANAGER_ADDRESS, amount],
        chain: chain,
        account: address
    });
  };

  const requestLoan = (amount: string) => {
    if (!LOAN_MANAGER_ADDRESS || !tokenAddress || !address || !chain) return;
    
    const amountWei = parseUnits(amount, 6); // USDC has 6 decimals
    
    writeRequestLoan({
        address: LOAN_MANAGER_ADDRESS,
        abi: LoanManagerAbi,
        functionName: 'requestLoan',
        args: [amountWei, tokenAddress],
        chain: chain,
        account: address
    });
  };

  const repayLoan = (loanId: number) => {
    if (!LOAN_MANAGER_ADDRESS || !address || !chain) return;
    
    writeRepayLoan({
        address: LOAN_MANAGER_ADDRESS,
        abi: LoanManagerAbi,
        functionName: 'repayLoan',
        args: [loanId],
        chain: chain,
        account: address
    });
  };

  // ===== UTILITIES =====
  
  const calculateLoanCost = (amount: string): LoanCost | undefined => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) return undefined;
    
    try {
      const principal = parseUnits(amount, 6);
      // 1% APR for 30 days = (principal * 100 * 30) / (10000 * 365)
      const interest = (principal * 100n * 30n) / (10000n * 365n);
      const total = principal + interest;
      
      return {
        interestAmount: interest,
        totalAmount: total
      };
    } catch {
      return undefined;
    }
  };

  const needsApproval = (amount: string): boolean => {
    const loanCost = calculateLoanCost(amount);
    if (!loanCost || !userApproval) return true;
    
    return userApproval < loanCost.totalAmount;
  };

  const canRequestLoan = (amount: string): boolean => {
    const loanCost = calculateLoanCost(amount);
    if (!loanCost || !userBalance || !userApproval) return false;
    
    const hasEnoughBalance = userBalance >= loanCost.totalAmount;
    const hasEnoughApproval = userApproval >= loanCost.totalAmount;
    const belowLoanLimit = (activeLoansCount as number || 0) < 1;
    
    return hasEnoughBalance && hasEnoughApproval && belowLoanLimit;
  };

  // ===== AUTO-REFRESH =====
  
  const refetch = () => {
    refetchLoans();
    refetchActiveCount();
    refetchBalance();
    refetchApproval();
    refetchUserBalance();
  };

  // Auto-refresh after successful transactions
  useEffect(() => {
    if (approveSuccess) {
      setTimeout(() => {
        refetchApproval();
      }, 2000);
    }
  }, [approveSuccess, refetchApproval]);

  useEffect(() => {
    if (requestSuccess) {
      setTimeout(() => {
        refetch();
      }, 2000);
    }
  }, [requestSuccess]);

  useEffect(() => {
    if (repaySuccess) {
      setTimeout(() => {
        refetch();
      }, 2000);
    }
  }, [repaySuccess]);

  // ===== COMPUTED STATES =====
  
  const isApprovingToken = isApprovingPending || isConfirmingApprove;
  const isRequestingLoan = isRequestingPending || isConfirmingRequest;
  const isRepayingLoan = isRepayingPending || isConfirmingRepay;
  
  const error = loansError || approveError || requestError || repayError;

  return {
    // Data
    userLoans: userLoans as number[] | undefined,
    activeLoansCount: activeLoansCount as number | undefined,
    contractBalance: contractBalance as bigint | undefined,
    userApproval: userApproval as bigint | undefined,
    userBalance: userBalance as bigint | undefined,
    
    // Actions
    approveToken,
    requestLoan,
    repayLoan,
    
    // States
    isApprovingToken,
    isRequestingLoan,
    isRepayingLoan,
    
    // Utils
    calculateLoanCost,
    needsApproval,
    canRequestLoan,
    
    // System
    isLoading: isLoadingLoans,
    error: error || null,
    refetch
  };
};

// ===== UTILITY FUNCTIONS =====

export const formatUSDC = (amount: bigint): string => {
  return parseFloat(formatUnits(amount, 6)).toFixed(2);
};

export const formatUSDCShort = (amount: bigint): string => {
  const formatted = parseFloat(formatUnits(amount, 6));
  if (formatted >= 1000) {
    return `${(formatted / 1000).toFixed(1)}K`;
  }
  return formatted.toFixed(0);
};

export const calculateAPR = (principal: bigint, interest: bigint): number => {
  if (principal === 0n) return 0;
  return (Number(interest) / Number(principal)) * 365 / 30 * 100;
};