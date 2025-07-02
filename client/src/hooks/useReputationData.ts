import { useAccount, useReadContract } from "wagmi";
import MetaFloatReputionAbi from "../assets/MetaFloatReputation.json";
import { META_FLOAT_REPUTATION_CONTRACT_ADDRES } from "../constants";

export const useReputationData = () => {
  const { address, isConnected } = useAccount();
  const CONTRACT_ADDRESS = META_FLOAT_REPUTATION_CONTRACT_ADDRES;

  const { 
    data: userProfile, 
    isLoading: isLoadingProfile, 
    error: contractError,
    refetch: refetchProfile 
  } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: MetaFloatReputionAbi,
    functionName: 'getUserProfile',
    args: [address],
  });

  const { data: reputationBreakdown } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: MetaFloatReputionAbi,
    functionName: 'getReputationBreakdown',
    args: [address],
  });

  const { data: meetsMinimum } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: MetaFloatReputionAbi,
    functionName: 'meetsMinimumReputation',
    args: [address, 600],
  });

  return {
    address,
    isConnected,
    userProfile,
    isLoadingProfile,
    contractError,
    refetchProfile,
    reputationBreakdown,
    meetsMinimum,
    CONTRACT_ADDRESS
  };
};
