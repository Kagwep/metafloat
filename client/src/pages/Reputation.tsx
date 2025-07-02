import React from 'react';
import { useConnect } from "wagmi";
import Navigation from '../componets/Navigation';
import { useReputationData } from '../hooks/useReputationData';
import { useProfileParser } from '../hooks/useProfileParser';
import { useLoanCalculations } from '../hooks/useLoanCalculations';
import { LoadingView } from './LoadingView';
import { ErrorView } from './ErrorView';
import { NoProfileView } from './NoProfileView';
import { ReputationDashboard } from './ReputationDashboard';
import { WalletConnectView } from '../componets/WalletConnectView';

const MetaFloatReputationPage: React.FC = () => {
  const { connectors, connect } = useConnect();
  const {
    address,
    isConnected,
    userProfile,
    isLoadingProfile,
    contractError,
    refetchProfile,
    CONTRACT_ADDRESS
  } = useReputationData();

  const parsedProfile = useProfileParser(userProfile);
  const loanData = useLoanCalculations(parsedProfile);

  const connectWallet = () => {
    if (connectors[0]) {
      connect({ connector: connectors[0] });
    }
  };

  const hasValidProfile = parsedProfile && parsedProfile.scores.overall > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />
      
       {!isConnected && (
        <WalletConnectView  />
      )}
      
      {isConnected && isLoadingProfile && (
        <LoadingView />
      )}
      
      {isConnected && contractError && (
        <ErrorView error={contractError} onRetry={refetchProfile} />
      )}
      
      {isConnected && !isLoadingProfile && !contractError && !hasValidProfile && (
        <NoProfileView address={address!} contractAddress={CONTRACT_ADDRESS} />
      )}
      
      {isConnected && !isLoadingProfile && !contractError && hasValidProfile && (
        <ReputationDashboard 
          profile={parsedProfile}
          loanData={loanData}
          address={address!}
          onRefresh={refetchProfile}
        />
      )}
    </div>
  );
};

export default MetaFloatReputationPage;