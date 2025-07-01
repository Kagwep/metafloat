import React, { useState, useEffect } from 'react';
import { Shield, User, BarChart3, Award, TrendingUp, Activity, CheckCircle, Wallet, Star, Users, Globe, ArrowRight, Calendar, Hash, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const ReputationPage = () => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [userReputation, setUserReputation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Mock wallet connection
  const connectWallet = async () => {
    setIsLoading(true);
    try {
      const mockAddress = '0x1234...5678';
      setWalletAddress(mockAddress);
      setWalletConnected(true);
      
      // Simulate loading and then set reputation data
      setTimeout(() => {
        setUserReputation({
          overallScore: 742,
          consistencyScore: 850,
          loyaltyScore: 720,
          sophisticationScore: 680,
          activityScore: 790,
          reliabilityScore: 830,
          verifiedHuman: true,
          accountAge: 247,
          totalTransactions: 156,
          successRate: 98.7,
          platformsUsed: 8,
          metaSenseId: '#MS742G',
          lastUpdate: '2 hours ago'
        });
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      console.error('Wallet connection failed:', error);
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setWalletConnected(false);
    setWalletAddress('');
    setUserReputation(null);
  };

  const getTrustLevelColor = () => {
    const score = userReputation?.overallScore || 0;
    if (score >= 800) return 'from-purple-600 to-purple-800';
    if (score >= 600) return 'from-yellow-500 to-yellow-700';
    if (score >= 400) return 'from-gray-400 to-gray-600';
    return 'from-amber-600 to-amber-800';
  };

  const scoreCategories = [
    { name: 'Consistency', score: userReputation?.consistencyScore || 0, icon: BarChart3, description: 'Spending pattern regularity', maxScore: 1000 },
    { name: 'Loyalty', score: userReputation?.loyaltyScore || 0, icon: Award, description: 'Platform engagement duration', maxScore: 1000 },
    { name: 'Sophistication', score: userReputation?.sophisticationScore || 0, icon: TrendingUp, description: 'Crypto/DeFi experience level', maxScore: 1000 },
    { name: 'Activity', score: userReputation?.activityScore || 0, icon: Activity, description: 'Platform usage frequency', maxScore: 1000 },
    { name: 'Reliability', score: userReputation?.reliabilityScore || 0, icon: CheckCircle, description: 'Transaction success rate', maxScore: 1000 }
  ];

  const benefits = [
    { icon: TrendingUp, title: 'Better Loan Terms', description: 'Access improved LTV ratios based on reputation', color: 'text-green-400' },
    { icon: Star, title: 'Reduced Fees', description: 'Lower trading and protocol fees across DeFi', color: 'text-yellow-400' },
    { icon: Users, title: 'Governance Weight', description: 'Enhanced voting power in DAO governance', color: 'text-purple-400' },
    { icon: Zap, title: 'Priority Access', description: 'Early access to new features and opportunities', color: 'text-cyan-400' },
    { icon: Shield, title: 'Human Verification', description: 'Proof of humanity for protocol access', color: 'text-blue-400' },
    { icon: Globe, title: 'Cross-Protocol ID', description: 'Portable reputation across all DeFi platforms', color: 'text-emerald-400' }
  ];

  // Connect wallet view
  if (!walletConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <Link to='/'>
                <span className="text-xl font-bold text-white">MetaSense</span>
                </Link>
              </div>
              <div className="flex items-center space-x-6">
                <span className="text-slate-300">Reputation Dashboard</span>
                <button 
                  onClick={connectWallet}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 disabled:opacity-50"
                >
                  <Wallet className="w-4 h-4" />
                  <span>{isLoading ? 'Connecting...' : 'Connect Wallet'}</span>
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Connect Wallet Content */}
        <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-screen">
          <div className="text-center max-w-lg">
            <div className="w-32 h-32 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-slate-700">
              {isLoading ? (
                <div className="animate-spin w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full"></div>
              ) : (
                <Wallet className="w-16 h-16 text-slate-400" />
              )}
            </div>
            
            <h1 className="text-4xl font-bold text-white mb-6">
              {isLoading ? 'Connecting...' : 'Connect Your Wallet'}
            </h1>
            
            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              {isLoading 
                ? 'Setting up your reputation profile...' 
                : 'Connect your MetaMask wallet to view your MetaSense reputation profile and unlock personalized DeFi benefits.'
              }
            </p>
            
            {!isLoading && (
              <button 
                onClick={connectWallet}
                className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 mx-auto shadow-2xl"
              >
                <Wallet className="w-5 h-5" />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main reputation dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">MetaSense</span>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 bg-slate-800/50 rounded-lg px-3 py-2 border border-slate-700">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-slate-300 text-sm">{walletAddress}</span>
              </div>
              <button 
                onClick={disconnectWallet}
                className="text-slate-400 hover:text-white transition-colors"
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4">My Reputation Profile</h1>
            <p className="text-xl text-slate-300">Your verified identity and reputation across the DeFi ecosystem</p>
          </div>

          {/* Main Reputation Card */}
          <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 p-8 rounded-3xl border border-slate-600 backdrop-blur-sm mb-8">
            <div className="grid lg:grid-cols-3 gap-8 items-center">
              {/* Identity Section */}
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start space-x-3 mb-4">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${getTrustLevelColor()} flex items-center justify-center`}>
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white">Verified Human</h2>
                    <p className="text-slate-300">MetaSense Identity</p>
                  </div>
                </div>
                <div className="space-y-2 text-slate-300">
                  <div className="flex items-center justify-center lg:justify-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span>KYC Verified via MetaMask Card</span>
                  </div>
                  <div className="flex items-center justify-center lg:justify-start space-x-2">
                    <Hash className="w-5 h-5 text-cyan-400" />
                    <span>ID: {userReputation?.metaSenseId || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-center lg:justify-start space-x-2">
                    <Calendar className="w-5 h-5 text-purple-400" />
                    <span>{userReputation?.accountAge || 0} days verified</span>
                  </div>
                </div>
              </div>
              
              {/* Overall Score */}
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-full border-8 border-slate-700 flex items-center justify-center mx-auto mb-4 relative overflow-hidden">
                    <div 
                      className="absolute inset-0 rounded-full border-8 border-transparent bg-gradient-to-r from-cyan-500 to-purple-600"
                      style={{
                        clipPath: `polygon(50% 50%, 50% 0%, ${50 + ((userReputation?.overallScore || 0) / 1000) * 50}% 0%, 100% 100%, 0% 100%)`
                      }}
                    ></div>
                    <div className="text-4xl font-bold text-white z-10 relative">{userReputation?.overallScore || 0}</div>
                  </div>
                  <div className="text-slate-300 text-lg font-medium">Overall Reputation</div>
                  <div className="text-slate-400 text-sm">Updated {userReputation?.lastUpdate || 'recently'}</div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700">
                  <div className="text-2xl font-bold text-white">{userReputation?.totalTransactions || 0}</div>
                  <div className="text-slate-300 text-sm">Total Transactions</div>
                </div>
                <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700">
                  <div className="text-2xl font-bold text-white">{userReputation?.successRate || 0}%</div>
                  <div className="text-slate-300 text-sm">Success Rate</div>
                </div>
                <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700">
                  <div className="text-2xl font-bold text-white">{userReputation?.platformsUsed || 0}</div>
                  <div className="text-slate-300 text-sm">Platforms Used</div>
                </div>
                <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-700">
                  <div className="text-2xl font-bold text-white">#{Math.floor((userReputation?.overallScore || 0) / 10)}</div>
                  <div className="text-slate-300 text-sm">Percentile</div>
                </div>
              </div>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="mb-8">
            <h3 className="text-3xl font-bold text-white mb-6 text-center">Reputation Breakdown</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {scoreCategories.map((category, index) => (
                <div key={index} className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 hover:border-slate-600 transition-all duration-300 group">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <category.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white">{category.name}</h4>
                      <p className="text-sm text-slate-400">{category.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl font-bold text-white">{category.score}</span>
                    <span className="text-slate-400">/ {category.maxScore}</span>
                  </div>
                  <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full transition-all duration-1000"
                      style={{ width: `${(category.score / category.maxScore) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits Section */}
          <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 mb-8">
            <h3 className="text-3xl font-bold text-white mb-6 text-center">Your Reputation Benefits</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition-all duration-300">
                  <benefit.icon className={`w-8 h-8 ${benefit.color} flex-shrink-0 mt-1`} />
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">{benefit.title}</h4>
                    <p className="text-slate-300 text-sm">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="text-center">
            <div className="inline-flex flex-col sm:flex-row gap-4">
              <button className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 shadow-2xl">
                <TrendingUp className="w-5 h-5" />
                <span>Improve Reputation</span>
              </button>
              <button className="border-2 border-slate-600 text-slate-300 px-8 py-4 rounded-xl text-lg font-semibold hover:border-slate-500 hover:text-white transition-all duration-300 flex items-center space-x-2">
                <ArrowRight className="w-5 h-5" />
                <span>Explore DeFi Benefits</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReputationPage;