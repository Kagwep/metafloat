// pages/MetaFloatAdvancePage.tsx (With Modal Sidebar)
import React, { useState } from 'react';
import { DollarSign, ArrowLeft, Shield, Zap, Users, TrendingUp, Info, X, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAccount, useConnect } from 'wagmi';
import Navigation from '../componets/Navigation';
import { ActiveLoansTable } from '../componets/ActiveLoansTable';
import { LoanEligibilityChecker } from '../componets/LoanEligibilityChecker';
import { LoanRequestForm } from '../componets/LoanRequestForm';
import { META_USDC_ADDRESS } from '../constants';


// Modal Component
interface LoanInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoanInfoModal: React.FC<LoanInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl border border-slate-600 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-600">
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Info className="w-6 h-6 text-cyan-400" />
            <span>Loan Information</span>
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-700 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          
          {/* How It Works */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              <span>How It Works</span>
            </h3>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Check Your Reputation</h4>
                  <p className="text-slate-300 leading-relaxed">
                    Your MetaFloat reputation score (built from MetaMask Card transaction history) 
                    determines your loan eligibility and maximum borrowing amount. Higher scores unlock larger loans.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Approve Token Spending</h4>
                  <p className="text-slate-300 leading-relaxed">
                    Approve the loan contract to spend your USDC for automatic repayment. 
                    This covers the principal plus 1% interest (calculated for 30 days).
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Receive Instant Cash</h4>
                  <p className="text-slate-300 leading-relaxed">
                    Get USDC deposited directly to your wallet immediately. 
                    The loan is automatically collected after 30 days if you have sufficient balance.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Loan Features */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span>Loan Features</span>
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-green-400" />
                  </div>
                  <span className="font-semibold text-white">Fixed Rate</span>
                </div>
                <p className="text-slate-300 text-sm">1% APR for all loan tiers - no variable rates</p>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="font-semibold text-white">Instant Funding</span>
                </div>
                <p className="text-slate-300 text-sm">Receive USDC immediately after approval</p>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="font-semibold text-white">No Collateral</span>
                </div>
                <p className="text-slate-300 text-sm">Loans based purely on reputation trust</p>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                    <Users className="w-4 h-4 text-cyan-400" />
                  </div>
                  <span className="font-semibold text-white">Auto Collection</span>
                </div>
                <p className="text-slate-300 text-sm">Automatic repayment after 30 days</p>
              </div>
            </div>
          </section>

          {/* Loan Tiers */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
              <Users className="w-5 h-5 text-purple-400" />
              <span>Loan Tiers & Requirements</span>
            </h3>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-green-500/10 to-green-600/10 p-4 rounded-xl border border-green-500/30">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-white text-lg">Micro Tier</h4>
                    <p className="text-green-400 font-semibold">Up to $25 USDC</p>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold">1% APR</div>
                    <div className="text-green-400 text-sm">30 days</div>
                  </div>
                </div>
                <div className="space-y-1 text-sm text-slate-300">
                  <div>• Minimum 600 overall reputation</div>
                  <div>• Minimum 600 consistency score</div>
                  <div>• Bronze tier or higher</div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 p-4 rounded-xl border border-blue-500/30">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-white text-lg">Small Tier</h4>
                    <p className="text-blue-400 font-semibold">Up to $50 USDC</p>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold">1% APR</div>
                    <div className="text-blue-400 text-sm">30 days</div>
                  </div>
                </div>
                <div className="space-y-1 text-sm text-slate-300">
                  <div>• Minimum 700 overall reputation</div>
                  <div>• Minimum 700 consistency score</div>
                  <div>• Bronze tier or higher</div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 p-4 rounded-xl border border-purple-500/30">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-white text-lg">Medium Tier</h4>
                    <p className="text-purple-400 font-semibold">Up to $200 USDC</p>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold">1% APR</div>
                    <div className="text-purple-400 text-sm">30 days</div>
                  </div>
                </div>
                <div className="space-y-1 text-sm text-slate-300">
                  <div>• Minimum 800 overall reputation</div>
                  <div>• Minimum 800 consistency score</div>
                  <div>• Silver tier or higher</div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 p-4 rounded-xl border border-yellow-500/30">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-white text-lg">Large Tier</h4>
                    <p className="text-yellow-400 font-semibold">Up to $1,000 USDC</p>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold">1% APR</div>
                    <div className="text-yellow-400 text-sm">30 days</div>
                  </div>
                </div>
                <div className="space-y-1 text-sm text-slate-300">
                  <div>• Minimum 950 overall reputation</div>
                  <div>• Minimum 950 consistency score</div>
                  <div>• Gold tier or higher</div>
                </div>
              </div>
            </div>
          </section>

          {/* Important Notes */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
              <HelpCircle className="w-5 h-5 text-yellow-400" />
              <span>Important Notes</span>
            </h3>
            <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl">
              <ul className="space-y-2 text-slate-300 text-sm">
                <li>• Only 1 active loan allowed per wallet at a time</li>
                <li>• Loans are automatically collected after 30 days if you have sufficient balance</li>
                <li>• Interest is calculated as 1% APR for exactly 30 days</li>
                <li>• Your reputation must be current (recently updated) to qualify</li>
                <li>• Minimum activity score of 100 required for all loans</li>
              </ul>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-600 bg-slate-800/50">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-cyan-600 hover:to-purple-700 transition-all duration-300"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
};

const MetaFloatAdvancePage: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const [showInfoModal, setShowInfoModal] = useState(false);
  
  // Environment variables
  const USDC_ADDRESS = META_USDC_ADDRESS;
  
  const connectWallet = () => {
    if (connectors[0]) {
      connect({ connector: connectors[0] });
    }
  };

  const handleLoanSuccess = () => {
    console.log('Loan request successful!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <Navigation />

      {/* Header */}
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Link 
                to="/reputation" 
                className="text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
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
            
            {/* Learn More Button */}
            {isConnected && (
              <button
                onClick={() => setShowInfoModal(true)}
                className="flex items-center space-x-2 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white px-4 py-2 rounded-xl border border-slate-600 hover:border-slate-500 transition-all duration-300"
              >
                <Info className="w-4 h-4" />
                <span>Learn More</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {!isConnected ? (
          /* Wallet Connection Required */
          <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-2xl border border-slate-600 p-12 text-center backdrop-blur-sm">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
              <p className="text-slate-300 mb-8 leading-relaxed">
                Connect your wallet to check your MetaFloat reputation and request instant cash advances 
                with competitive rates based on your on-chain reputation.
              </p>
              <button
                onClick={connectWallet}
                className="bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-cyan-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-2xl"
              >
                Connect Wallet
              </button>
            </div>
          </div>
        ) : (
          /* Main Dashboard */
          <div className="space-y-8">
            
            {/* Connected Wallet Info */}
            <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 p-4 rounded-xl border border-slate-600 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">Wallet Connected</div>
                    <div className="text-slate-400 font-mono text-sm">
                      {address?.slice(0, 6)}...{address?.slice(-4)}
                    </div>
                  </div>
                </div>
                <div className="text-green-400 text-sm font-semibold">
                  ✅ Ready for Loans
                </div>
              </div>
            </div>

            {/* Loan Eligibility Check */}
            <LoanEligibilityChecker className="mb-8" />

            {/* Main Content - Single Column for Cleaner Design */}
            <div className="max-w-4xl mx-auto">
              <LoanRequestForm 
                tokenAddress={USDC_ADDRESS}
                tokenSymbol="USDC"
                onSuccess={handleLoanSuccess}
              />
            </div>

            {/* Active Loans Section */}
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                <DollarSign className="w-6 h-6 text-cyan-400" />
                <span>Your Active Loans</span>
              </h2>
              <ActiveLoansTable 
                tokenAddress={USDC_ADDRESS}
                tokenSymbol="USDC"
              />
            </div>
          </div>
        )}
      </div>

      {/* Info Modal */}
      <LoanInfoModal 
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
      />
    </div>
  );
};

export default MetaFloatAdvancePage;