import { useState } from 'react';

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

interface UpdateReputationResponse {
  success: boolean;
  userProfile?: any;
  contractUpdate?: ContractUpdateResult;
  error?: string;
  message?: string;
}

interface UseUpdateReputationReturn {
  updateReputation: (walletAddress: `0x${string}`) => Promise<void>;
  isUpdating: boolean;
  updateError: string | null;
  updateSuccess: boolean;
  contractResult: ContractUpdateResult | null;
  errorStatusCode: number | null;
  clearState: () => void;
}

export const useUpdateReputation = (): UseUpdateReputationReturn => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [contractResult, setContractResult] = useState<ContractUpdateResult | null>(null);
  const [errorStatusCode, setErrorStatusCode] = useState<number | null>(null);

  const updateReputation = async (walletAddress: `0x${string}`) => {
    setIsUpdating(true);
    setUpdateError(null);
    setUpdateSuccess(false);
    setContractResult(null);
    setErrorStatusCode(null);

    try {
      const response = await fetch('https://9u5mg4kde9.execute-api.eu-north-1.amazonaws.com/dev/reputation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify({
          wallet_address: "0x80cc263cb3fa1be2aec748b3811261c1e2a1ba8d"
        })
      });

      const data: UpdateReputationResponse = await response.json();

      if (!response.ok) {
        setErrorStatusCode(response.status);
        setUpdateError(data.error || data.message || `HTTP ${response.status}`);
        return;
      }

      if (data.success && data.contractUpdate?.success) {
        setUpdateSuccess(true);
        setContractResult(data.contractUpdate);
      } else {
        setUpdateError(data.error || 'Update failed - contract transaction unsuccessful');
      }
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setUpdateError('Network error: Unable to connect to server');
      } else {
        setUpdateError(error instanceof Error ? error.message : 'Failed to update reputation');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const clearState = () => {
    setUpdateError(null);
    setUpdateSuccess(false);
    setContractResult(null);
    setErrorStatusCode(null);
  };

  return {
    updateReputation,
    isUpdating,
    updateError,
    updateSuccess,
    contractResult,
    errorStatusCode,
    clearState
  };
};