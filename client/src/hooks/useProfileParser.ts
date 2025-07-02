export const useProfileParser = (userProfile: any) => {
  const getTrustLevelName = (level: number) => {
    const levels = ['Bronze', 'Silver', 'Gold', 'Platinum'];
    return levels[level] || 'Bronze';
  };

  const getUserClassName = (userClass: number) => {
    const classes = ['Newcomer', 'Casual User', 'Regular User', 'Power User', 'Whale', 'Veteran'];
    return classes[userClass] || 'Newcomer';
  };

  const calculateAccountAge = (timestamp: any) => {
    if (!timestamp) return 0;
    const verificationDate = new Date(Number(timestamp) * 1000);
    const now = new Date();
    return Math.floor((now.getTime() - verificationDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  const parsedProfile = userProfile ? {
    walletAddress: userProfile.walletAddress,
    trustLevel: getTrustLevelName(userProfile.trustLevel),
    userClass: getUserClassName(userProfile.userClass),
    scores: {
      consistency: Number(userProfile.scores.consistencyScore),
      loyalty: Number(userProfile.scores.loyaltyScore),
      sophistication: Number(userProfile.scores.sophisticationScore),
      activity: Number(userProfile.scores.activityScore),
      reliability: Number(userProfile.scores.reliabilityScore),
      overall: Number(userProfile.scores.overallReputation)
    },
    isVerified: userProfile.isVerified,
    accountAge: calculateAccountAge(userProfile.verificationTimestamp),
    lastUpdate: new Date(Number(userProfile.lastUpdateTimestamp) * 1000).toLocaleDateString(),
    reasoningTags: userProfile.reasoningTags || []
  } : null;

  return parsedProfile;
};
