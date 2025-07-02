import React, { useState, useEffect } from 'react';
import { DollarSign, Shield, Zap, Users, CheckCircle, AlertCircle, ArrowLeft, Wallet, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '../componets/Navigation';

interface LoanEligibility {
  eligible: boolean;
  maxTier: string;
  maxAmount: string;
  interestRate: number;
  requirements: string[];
  reasons: string[];
}

interface Token {
  symbol: string;
  name: string;
  icon: string;
}

const MetaFloatAdvancePage: React.FC = () => {
  const [selectedToken, setSelectedToken] = useState<string>('USDC');
  const [requestAmount, setRequestAmount] = useState<string>('');
  const [eligibility, setEligibility] = useState<LoanEligibility | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [userAddress, setUserAddress] = useState<string>('');

  const tokens: Token[] = [
    { symbol: 'USDC', name: 'USD Coin', icon: '🇺🇸' },
    { symbol: 'aUSDC', name: 'Aave USDC', icon: '🏛️' },
    { symbol: 'USDT', name: 'Tether USD', icon: '🟢' },
    { symbol: 'WETH', name: 'Wrapped Ethereum', icon: '🔷' },
    { symbol: 'EURe', name: 'Euro Token', icon: '🇪🇺' },
    { symbol: 'GBPe', name: 'British Pound Token', icon: '🇬🇧' }
  ];

  const connectWallet = async () => {
    try {
      const mockAddress = '0x1234567890123456789012345678901234567890';
      setUserAddress(mockAddress);
      setWalletConnected(true);
    } catch (error) {
      console.error('Wallet connection failed:', error);
    }
  };

  const disconnectWallet = () => {
    setWalletConnected(false);
    setUserAddress('');
  };

  const truncate = (addr: string) => addr.slice(0, 6) + '...' + addr.slice(-4);

  // Mock eligibility check - replace with actual contract call
  const checkEligibility = async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setEligibility({
      eligible: true,
      maxTier: 'Small',
      maxAmount: '200',
      interestRate: 12,
      requirements: ['Min reputation score', 'Valid MetaFloat ID'],
      reasons: ['Qualified for Small tier', 'Strong consistency', 'Reliable user']
    });
    
    setIsLoading(false);
  };

  useEffect(() => {
    if (walletConnected) {
      checkEligibility();
    }
  }, [walletConnected]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setRequestAmount(value);
    }
  };

  const handleRequestAdvance = () => {
    console.log(`Requesting ${requestAmount} ${selectedToken}`);
    // Add contract interaction logic here
  };

  const isValidAmount = () => {
    const amount = parseFloat(requestAmount);
    const maxAmount = eligibility ? parseFloat(eligibility.maxAmount) : 0;
    return amount > 0 && amount <= maxAmount;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <Navigation />

      {/* Header */}
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-4 mb-6">
            <button className="text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Cash Advance</h1>
                <p className="text-slate-300">Get instant loans based on your MetaFloat reputation</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {!walletConnected ? (
          // Wallet Connection Required
          <div className="max-w-2xl mx-auto">
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-12 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Wallet className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
              <p className="text-slate-300 mb-8">
                Connect your wallet to check your MetaFloat reputation and request a cash advance
              </p>
              <button
                onClick={connectWallet}
                className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
              >
                Connect Wallet
              </button>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Main Request Form */}
            <div className="lg:col-span-2">
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-8">
                <div className="mb-8">
                  <h2 className="text-2xl font-semibold text-white mb-3">Request Your Advance</h2>
                  <p className="text-slate-300">Get instant cash based on your MetaFloat reputation score</p>
                </div>

                {/* Token Selection */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-slate-200 mb-4">
                    Select Token
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {tokens.map((token) => (
                      <button
                        key={token.symbol}
                        onClick={() => setSelectedToken(token.symbol)}
                        className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                          selectedToken === token.symbol
                            ? 'border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/20'
                            : 'border-slate-600 hover:border-slate-500 bg-slate-700/30'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-3xl mb-2">{token.icon}</div>
                          <div className="font-medium text-sm text-white">{token.symbol}</div>
                          <div className="text-xs text-slate-400">{token.name}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount Input */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-slate-200 mb-3">
                    Amount
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={requestAmount}
                      onChange={handleAmountChange}
                      placeholder="0.00"
                      className="w-full px-6 py-4 bg-slate-700/50 border border-slate-600 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-xl text-white placeholder-slate-400"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-6">
                      <span className="text-slate-400 text-lg font-medium">{selectedToken}</span>
                    </div>
                  </div>
                  {eligibility && (
                    <p className="mt-3 text-sm text-slate-300">
                      Maximum available: <span className="font-medium text-cyan-400">{eligibility.maxAmount} {selectedToken}</span>
                    </p>
                  )}
                </div>

                {/* Interest Rate Display */}
                {eligibility && (
                  <div className="mb-8 p-6 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-xl border border-cyan-500/20">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-medium text-white">Interest Rate (APR)</span>
                      <span className="text-2xl font-bold text-cyan-400">{eligibility.interestRate}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Loan Tier</span>
                      <span className="font-medium text-white bg-slate-700/50 px-3 py-1 rounded-lg">{eligibility.maxTier}</span>
                    </div>
                  </div>
                )}

                {/* Request Button */}
                <button
                  onClick={handleRequestAdvance}
                  disabled={!isValidAmount() || !eligibility?.eligible}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
                    isValidAmount() && eligibility?.eligible
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white transform hover:scale-105 shadow-lg'
                      : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {isValidAmount() && eligibility?.eligible 
                    ? `Request ${requestAmount || '0'} ${selectedToken} Advance`
                    : 'Enter Valid Amount'
                  }
                </button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              
              {/* Eligibility Status */}
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
                <h3 className="text-xl font-semibold text-white mb-6">Eligibility Status</h3>
                
                {isLoading ? (
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500"></div>
                    <span className="text-slate-300">Checking eligibility...</span>
                  </div>
                ) : eligibility ? (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                      {eligibility.eligible ? (
                        <CheckCircle className="h-6 w-6 text-green-400" />
                      ) : (
                        <AlertCircle className="h-6 w-6 text-red-400" />
                      )}
                      <span className={`font-semibold text-lg ${
                        eligibility.eligible ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {eligibility.eligible ? 'Eligible for Advance' : 'Not Eligible'}
                      </span>
                    </div>
                    
                    {eligibility.eligible && (
                      <div className="space-y-3">
                        <div className="flex justify-between text-slate-300">
                          <span>Max Amount:</span>
                          <span className="font-medium text-white">{eligibility.maxAmount} tokens</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                          <span>Tier:</span>
                          <span className="font-medium text-white">{eligibility.maxTier}</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="border-t border-slate-600 pt-4">
                      <h4 className="text-sm font-medium text-white mb-3">Qualification Reasons:</h4>
                      <ul className="space-y-2">
                        {eligibility.reasons.map((reason, index) => (
                          <li key={index} className="text-sm text-slate-300 flex items-start">
                            <span className="w-2 h-2 bg-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* How It Works */}
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
                <h3 className="text-xl font-semibold text-white mb-6">How It Works</h3>
                <div className="space-y-5">
                  <div className="flex items-start space-x-4">
                    <Shield className="h-6 w-6 text-cyan-400 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-white mb-1">Reputation Based</h4>
                      <p className="text-sm text-slate-300">Your loan terms are based on your MetaFloat reputation score</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <Zap className="h-6 w-6 text-cyan-400 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-white mb-1">Instant Approval</h4>
                      <p className="text-sm text-slate-300">Get approved and funded within minutes</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <Users className="h-6 w-6 text-cyan-400 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-white mb-1">No Collateral</h4>
                      <p className="text-sm text-slate-300">Loans are based on trust and reputation only</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interest Rates */}
              <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-6">
                <h3 className="text-xl font-semibold text-white mb-6">Interest Rates by Tier</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-slate-600">
                    <div>
                      <span className="font-medium text-white">Micro Tier</span>
                      <div className="text-xs text-slate-400">Up to $50</div>
                    </div>
                    <span className="text-slate-300 font-medium">15% APR</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-slate-600">
                    <div>
                      <span className="font-medium text-white">Small Tier</span>
                      <div className="text-xs text-slate-400">Up to $200</div>
                    </div>
                    <span className="text-slate-300 font-medium">12% APR</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-slate-600">
                    <div>
                      <span className="font-medium text-white">Medium Tier</span>
                      <div className="text-xs text-slate-400">Up to $1000</div>
                    </div>
                    <span className="text-slate-300 font-medium">9% APR</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <div>
                      <span className="font-medium text-white">Large Tier</span>
                      <div className="text-xs text-slate-400">Up to $1000</div>
                    </div>
                    <span className="text-slate-300 font-medium">6% APR</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetaFloatAdvancePage;