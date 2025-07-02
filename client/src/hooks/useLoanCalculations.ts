export const useLoanCalculations = (profile: any) => {
  const calculateMaxLoanAmount = (overallScore: number | undefined) => {
    if (!overallScore || overallScore < 400) return 0;
    if (overallScore >= 800) return 5000;
    if (overallScore >= 600) return 2000;
    if (overallScore >= 400) return 500;
    return 0;
  };

  const calculateInterestRate = (trustLevel: string) => {
    const rates = {
      'Platinum': 8.9,
      'Gold': 12.9,
      'Silver': 18.9,
      'Bronze': 24.9
    };
    return rates[trustLevel as keyof typeof rates] || 24.9;
  };

  const checkLoanEligibility = () => {
    if (!profile?.scores) return false;
    return profile.scores.overall >= 600 && profile.scores.consistency >= 600;
  };

  return {
    maxLoanAmount: calculateMaxLoanAmount(profile?.scores?.overall),
    interestRate: calculateInterestRate(profile?.trustLevel),
    isLoanEligible: checkLoanEligibility()
  };
};