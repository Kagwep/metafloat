import React from 'react';
import { ProfileHeader } from '../componets/ProfileHeader';
import { LoanEligibilityAlert } from '../componets/LoanEligibilityAlert';
import { ReputationOverview } from '../componets/ReputationOverview';
import { ScoreBreakdown } from '../componets/ScoreBreakdown';
import { ReasoningTags } from '../componets/ReasoningTags';
import { ActionButtons } from '../componets/ActionButtons';

interface ReputationDashboardProps {
  profile: any;
  loanData: any;
  address: string;
  onRefresh: () => void;
}

export const ReputationDashboard: React.FC<ReputationDashboardProps> = ({
  profile,
  loanData,
  address,
  onRefresh
}) => {
  return (
    <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <ProfileHeader address={address} onRefresh={onRefresh} />
        
        <LoanEligibilityAlert 
          isEligible={loanData.isLoanEligible}
          maxLoanAmount={loanData.maxLoanAmount}
        />
        
        <ReputationOverview 
          profile={profile}
          loanData={loanData}
        />
        
        <ScoreBreakdown scores={profile.scores} />
        
        {profile.reasoningTags.length > 0 && (
          <ReasoningTags tags={profile.reasoningTags} />
        )}
        
        <ActionButtons 
          isLoanEligible={loanData.isLoanEligible}
          onRefresh={onRefresh}
        />
      </div>
    </div>
  );
};