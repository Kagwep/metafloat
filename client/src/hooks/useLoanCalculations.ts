import type { ParsedUserProfile } from "../types";


export enum LoanTier {
  None = 0,
  Micro = 1,
  Small = 2,
  Medium = 3,
  Large = 4
}

export interface LoanData {
  maxLoanAmount: number;
  interestRate: number;
  isLoanEligible: boolean;
  tier: LoanTier;
  tierName: string;
  requirements: string[];
  reasons: string[];
}

export const useLoanCalculations = (profile: ParsedUserProfile | null): LoanData => {
  
  // Tier configurations matching the contract
  const tierConfigs = {
    [LoanTier.Micro]: {
      name: 'Micro',
      maxAmount: 25,
      minOverallReputation: 600,
      minConsistencyScore: 600,
      minLoyaltyScore: 150,
      minReliabilityScore: 200,
      minTrustLevel: 'Bronze' as const,
      requirements: [
        'Min 600 overall reputation',
        'Min 600 consistency score',
        'Min 150 loyalty score',
        'Min 200 reliability score',
        'Bronze tier or higher'
      ]
    },
    [LoanTier.Small]: {
      name: 'Small',
      maxAmount: 50,
      minOverallReputation: 700,
      minConsistencyScore: 700,
      minLoyaltyScore: 200,
      minReliabilityScore: 300,
      minTrustLevel: 'Bronze' as const,
      requirements: [
        'Min 700 overall reputation',
        'Min 700 consistency score',
        'Min 200 loyalty score',
        'Min 300 reliability score',
        'Bronze tier or higher'
      ]
    },
    [LoanTier.Medium]: {
      name: 'Medium',
      maxAmount: 200,
      minOverallReputation: 800,
      minConsistencyScore: 800,
      minLoyaltyScore: 300,
      minReliabilityScore: 400,
      minTrustLevel: 'Silver' as const,
      requirements: [
        'Min 800 overall reputation',
        'Min 800 consistency score',
        'Min 300 loyalty score',
        'Min 400 reliability score',
        'Silver tier or higher'
      ]
    },
    [LoanTier.Large]: {
      name: 'Large',
      maxAmount: 1000,
      minOverallReputation: 950,
      minConsistencyScore: 950,
      minLoyaltyScore: 500,
      minReliabilityScore: 600,
      minTrustLevel: 'Gold' as const,
      requirements: [
        'Min 950 overall reputation',
        'Min 950 consistency score',
        'Min 500 loyalty score',
        'Min 600 reliability score',
        'Gold tier or higher'
      ]
    }
  };

  const getTrustLevelPriority = (trustLevel: string): number => {
    const priorities = { 'Bronze': 0, 'Silver': 1, 'Gold': 2, 'Platinum': 3 };
    return priorities[trustLevel as keyof typeof priorities] || 0;
  };

  const getMaxEligibleTier = (): LoanTier => {
    if (!profile?.scores) return LoanTier.None;

    const userTrustPriority = getTrustLevelPriority(profile.trustLevel);
    
    // Check tiers from highest to lowest
    const tiersToCheck = [LoanTier.Large, LoanTier.Medium, LoanTier.Small, LoanTier.Micro];
    
    for (const tier of tiersToCheck) {
      const config = tierConfigs[tier];
      const requiredTrustPriority = getTrustLevelPriority(config.minTrustLevel);
      
      const meetsRequirements = 
        profile.scores.overall >= config.minOverallReputation &&
        profile.scores.consistency >= config.minConsistencyScore &&
        profile.scores.loyalty >= config.minLoyaltyScore &&
        profile.scores.reliability >= config.minReliabilityScore &&
        userTrustPriority >= requiredTrustPriority;
      
      if (meetsRequirements) {
        return tier;
      }
    }
    
    return LoanTier.None;
  };

  const checkBasicEligibility = (): { eligible: boolean; reasons: string[] } => {
    if (!profile) {
      return {
        eligible: false,
        reasons: ['Connect wallet and update reputation']
      };
    }

    if (!profile.scores) {
      return {
        eligible: false,
        reasons: ['No reputation scores found']
      };
    }

    // Basic requirements for any loan
    if (profile.scores.activity < 100) {
      return {
        eligible: false,
        reasons: ['Minimum activity score of 100 required']
      };
    }

    if (!profile.isVerified) {
      return {
        eligible: false,
        reasons: ['Valid MetaFloat ID required']
      };
    }

    return { eligible: true, reasons: [] };
  };

  const maxTier = getMaxEligibleTier();
  const basicEligibility = checkBasicEligibility();
  const isEligible = basicEligibility.eligible && maxTier !== LoanTier.None;

  if (!isEligible) {
    const unmetRequirements = maxTier === LoanTier.None 
      ? tierConfigs[LoanTier.Micro].requirements
      : [];

    return {
      maxLoanAmount: 0,
      interestRate: 1.0, // Fixed 1% APR
      isLoanEligible: false,
      tier: LoanTier.None,
      tierName: 'None',
      requirements: unmetRequirements,
      reasons: basicEligibility.reasons.length > 0 
        ? basicEligibility.reasons 
        : ['Minimum requirements not met for Micro tier']
    };
  }

  const tierConfig = tierConfigs[maxTier];
  
  return {
    maxLoanAmount: tierConfig.maxAmount,
    interestRate: 1.0, // Fixed 1% APR for all tiers
    isLoanEligible: true,
    tier: maxTier,
    tierName: tierConfig.name,
    requirements: [],
    reasons: [
      `Qualified for ${tierConfig.name} tier loans`,
      'Meets all reputation requirements',
      'Fixed 1% APR for 30-day terms'
    ]
  };
};

// Utility function to calculate loan cost (30-day, 1% APR)
export const calculateLoanCost = (principalAmount: number) => {
  // 1% APR for 30 days = (principal * 1% * 30) / 365
  const interestAmount = (principalAmount * 0.01 * 30) / 365;
  const totalAmount = principalAmount + interestAmount;
  
  return {
    principal: principalAmount,
    interest: interestAmount,
    total: totalAmount,
    apr: 1.0
  };
};

// Utility function to get tier information
export const getTierInfo = (tier: LoanTier) => {
  const tierConfigs = {
    [LoanTier.None]: { name: 'None', maxAmount: 0, color: 'gray' },
    [LoanTier.Micro]: { name: 'Micro', maxAmount: 25, color: 'green' },
    [LoanTier.Small]: { name: 'Small', maxAmount: 50, color: 'blue' },
    [LoanTier.Medium]: { name: 'Medium', maxAmount: 200, color: 'purple' },
    [LoanTier.Large]: { name: 'Large', maxAmount: 1000, color: 'yellow' }
  };
  
  return tierConfigs[tier] || tierConfigs[LoanTier.None];
};

// Utility function to check if user meets requirements for a specific tier
export const checkTierRequirements = (profile: ParsedUserProfile | null, targetTier: LoanTier): {
  meets: boolean;
  missing: string[];
} => {
  if (!profile?.scores || targetTier === LoanTier.None) {
    return { meets: false, missing: ['Valid reputation profile required'] };
  }

  const tierConfigs = {
    [LoanTier.Micro]: {
      minOverallReputation: 600,
      minConsistencyScore: 600,
      minLoyaltyScore: 150,
      minReliabilityScore: 200,
      minTrustLevel: 'Bronze'
    },
    [LoanTier.Small]: {
      minOverallReputation: 700,
      minConsistencyScore: 700,
      minLoyaltyScore: 200,
      minReliabilityScore: 300,
      minTrustLevel: 'Bronze'
    },
    [LoanTier.Medium]: {
      minOverallReputation: 800,
      minConsistencyScore: 800,
      minLoyaltyScore: 300,
      minReliabilityScore: 400,
      minTrustLevel: 'Silver'
    },
    [LoanTier.Large]: {
      minOverallReputation: 950,
      minConsistencyScore: 950,
      minLoyaltyScore: 500,
      minReliabilityScore: 600,
      minTrustLevel: 'Gold'
    }
  };

  const config = tierConfigs[targetTier];
  if (!config) return { meets: false, missing: ['Invalid tier'] };

  const missing: string[] = [];
  
  if (profile.scores.overall < config.minOverallReputation) {
    missing.push(`Overall reputation: ${profile.scores.overall}/${config.minOverallReputation}`);
  }
  
  if (profile.scores.consistency < config.minConsistencyScore) {
    missing.push(`Consistency score: ${profile.scores.consistency}/${config.minConsistencyScore}`);
  }
  
  if (profile.scores.loyalty < config.minLoyaltyScore) {
    missing.push(`Loyalty score: ${profile.scores.loyalty}/${config.minLoyaltyScore}`);
  }
  
  if (profile.scores.reliability < config.minReliabilityScore) {
    missing.push(`Reliability score: ${profile.scores.reliability}/${config.minReliabilityScore}`);
  }

  const trustLevels = ['Bronze', 'Silver', 'Gold', 'Platinum'];
  const userTrustIndex = trustLevels.indexOf(profile.trustLevel);
  const requiredTrustIndex = trustLevels.indexOf(config.minTrustLevel);
  
  if (userTrustIndex < requiredTrustIndex) {
    missing.push(`Trust level: ${profile.trustLevel} (need ${config.minTrustLevel}+)`);
  }

  if (profile.scores.activity < 100) {
    missing.push(`Activity score: ${profile.scores.activity}/100`);
  }

  return {
    meets: missing.length === 0,
    missing
  };
};;