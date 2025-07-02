export interface ReputationScores {
  consistencyScore: number;
  loyaltyScore: number;
  sophisticationScore: number;
  activityScore: number;
  reliabilityScore: number;
  overallReputation: number;
}

export interface RawUserProfile {
  walletAddress: `0x${string}`;
  verificationTimestamp: bigint;
  trustLevel: number;
  userClass: number;
  scores: ReputationScores;
  isVerified: boolean;
  lastUpdateTimestamp: bigint;
  reasoningTags: string[];
}

export interface ParsedUserProfile {
  walletAddress: `0x${string}`;
  trustLevel: string;
  userClass: string;
  scores: {
    consistency: number;
    loyalty: number;
    sophistication: number;
    activity: number;
    reliability: number;
    overall: number;
  };
  isVerified: boolean;
  accountAge: number;
  lastUpdate: string;
  reasoningTags: string[];
}

export interface LoanData {
  maxLoanAmount: number;
  interestRate: number;
  isLoanEligible: boolean;
}

export interface ScoreCategory {
  name: string;
  score: number;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  importance: string;
  maxScore: number;
  isRequired: boolean;
}