import React from 'react';
import { Shield, CheckCircle, Calendar, Hash } from 'lucide-react';
import { getTrustLevelColor } from '../utils/trustLevelUtils';

interface ReputationOverviewProps {
  profile: any;
  loanData: any;
}

export const ReputationOverview: React.FC<ReputationOverviewProps> = ({ 
  profile, 
  loanData 
}) => {
  return (
    <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 p-8 rounded-3xl border border-slate-600 backdrop-blur-sm mb-8">
      <div className="grid lg:grid-cols-3 gap-8 items-center">
        {/* Identity Section */}
        <div className="text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start space-x-3 mb-4">
            <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${getTrustLevelColor(profile.trustLevel)} flex items-center justify-center`}>
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">{profile.trustLevel} Tier</h2>
              <p className="text-slate-300">{profile.userClass}</p>
            </div>
          </div>
          <div className="space-y-2 text-slate-300">
            <div className="flex items-center justify-center lg:justify-start space-x-2">
              <CheckCircle className={`w-5 h-5 ${profile.isVerified ? 'text-green-400' : 'text-gray-400'}`} />
              <span>{profile.isVerified ? 'Verified' : 'Not Verified'}</span>
            </div>
            <div className="flex items-center justify-center lg:justify-start space-x-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              <span>{profile.accountAge} days active</span>
            </div>
            <div className="flex items-center justify-center lg:justify-start space-x-2">
              <Hash className="w-5 h-5 text-cyan-400" />
              <span>On-chain verified</span>
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
                  clipPath: `polygon(50% 50%, 50% 0%, ${50 + (profile.scores.overall / 1000) * 50}% 0%, 100% 100%, 0% 100%)`
                }}
              ></div>
              <div className="text-4xl font-bold text-white z-10 relative">{profile.scores.overall}</div>
            </div>
            <div className="text-slate-300 text-lg font-medium">Overall Reputation</div>
            <div className="text-slate-400 text-sm">Updated {profile.lastUpdate}</div>
          </div>
        </div>

        {/* Loan Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-xl border ${
            loanData.isLoanEligible 
              ? 'bg-gradient-to-r from-green-500/10 to-green-600/10 border-green-500/20'
              : 'bg-gradient-to-r from-gray-500/10 to-gray-600/10 border-gray-500/20'
          }`}>
            <div className="text-2xl font-bold text-white">${loanData.maxLoanAmount}</div>
            <div className={loanData.isLoanEligible ? 'text-green-400' : 'text-gray-400'}>Max Loan Amount</div>
          </div>
          <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 p-4 rounded-xl border border-blue-500/20">
            <div className="text-2xl font-bold text-white">{loanData.interestRate}%</div>
            <div className="text-blue-400 text-sm">Interest Rate</div>
          </div>
          <div className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 p-4 rounded-xl border border-purple-500/20">
            <div className="text-2xl font-bold text-white">{profile.reasoningTags.length}</div>
            <div className="text-purple-400 text-sm">Reasoning Tags</div>
          </div>
          <div className="bg-gradient-to-r from-cyan-500/10 to-cyan-600/10 p-4 rounded-xl border border-cyan-500/20">
            <div className="text-2xl font-bold text-white">{profile.isVerified ? 'Yes' : 'No'}</div>
            <div className="text-cyan-400 text-sm">KYC Status</div>
          </div>
        </div>
      </div>
    </div>
  );
};