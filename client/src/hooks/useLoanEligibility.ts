import { useAccount, useReadContract } from "wagmi";
import LoanEligibilityAbi from "../assets/MetaFloatLoanEligibility.json";
import type { LoanEligibility, TierConfig, LoanTier } from "../types";
import { META_LOAN_ELIGIBILITY_CONTRACT_ADDRESS } from "../constants";

interface UseLoanEligibilityReturn {
  loanEligibility: LoanEligibility | null;
  allTierConfigs: {
    micro: TierConfig;
    small: TierConfig;
    medium: TierConfig;
    large: TierConfig;
  } | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useLoanEligibility = (): UseLoanEligibilityReturn => {
  const { address } = useAccount();
  const LOAN_CONTRACT_ADDRESS = META_LOAN_ELIGIBILITY_CONTRACT_ADDRESS;

  // Get loan eligibility for user
  const { 
    data: loanEligibility, 
    isLoading: isLoadingEligibility, 
    error: eligibilityError,
    refetch: refetchEligibility 
  } = useReadContract({
    address: LOAN_CONTRACT_ADDRESS as `0x${string}`,
    abi: LoanEligibilityAbi,
    functionName: 'checkLoanEligibility',
    args: ["0x80cc263cb3fa1be2aec748b3811261c1e2a1ba8d"],
    query: {
      enabled: !!address && !!LOAN_CONTRACT_ADDRESS,
    }
  });

  // Get all tier configurations
  const { 
    data: allTierConfigs, 
    isLoading: isLoadingTiers, 
    error: tiersError,
    refetch: refetchTiers 
  } = useReadContract({
    address: LOAN_CONTRACT_ADDRESS as `0x${string}`,
    abi: LoanEligibilityAbi,
    functionName: 'getAllTierConfigs',
    args: [],
    query: {
      enabled: !!LOAN_CONTRACT_ADDRESS,
    }
  });

  const refetch = () => {
    refetchEligibility();
    refetchTiers();
  };

  return {
    loanEligibility: loanEligibility as LoanEligibility | null,
    allTierConfigs: allTierConfigs as any,
    isLoading: isLoadingEligibility || isLoadingTiers,
    error: eligibilityError || tiersError,
    refetch
  };
};