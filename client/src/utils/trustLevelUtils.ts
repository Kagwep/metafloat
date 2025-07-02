export const getTrustLevelColor = (trustLevel: string) => {
  const colors = {
    'Platinum': 'from-purple-600 to-purple-800',
    'Gold': 'from-yellow-500 to-yellow-700',
    'Silver': 'from-gray-400 to-gray-600',
    'Bronze': 'from-amber-600 to-amber-800'
  };
  return colors[trustLevel as keyof typeof colors] || colors.Bronze;
};
