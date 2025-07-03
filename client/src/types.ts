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

export enum LoanTier {
  None = 0,
  Micro = 1,
  Small = 2,
  Medium = 3,
  Large = 4
}

export interface TierConfig {
  minOverallReputation: number;
  minConsistencyScore: number;
  minLoyaltyScore: number;
  minReliabilityScore: number;
  minTrustLevel: number;
  maxLoanAmount: bigint;
  baseInterestRate: number;
}

export interface LoanEligibility {
  eligible: boolean;
  maxTier: LoanTier;
  maxAmount: bigint;
  interestRate: number;
  requirements: string[];
  reasons: string[];
}


export interface Loan {
  borrower: `0x${string}`;
  tokenAddress: `0x${string}`;
  principalAmount: bigint;
  interestAmount: bigint;
  totalAmount: bigint;
  issueTimestamp: bigint;
  dueTimestamp: bigint;
  isActive: boolean;
  isRepaid: boolean;
  isDefaulted: boolean;
}

export interface LoanCost {
  interestAmount: bigint;
  totalAmount: bigint;
}