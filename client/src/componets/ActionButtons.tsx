import React from 'react';
import { DollarSign, RefreshCw } from 'lucide-react';

interface ActionButtonsProps {
  isLoanEligible: boolean;
  onRefresh: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  isLoanEligible, 
  onRefresh 
}) => {
  return (
    <div className="text-center">
      <div className="inline-flex flex-col sm:flex-row gap-4">
        <button 
          disabled={!isLoanEligible}
          className={`px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 shadow-2xl ${
            isLoanEligible
              ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white hover:from-cyan-600 hover:to-purple-700'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          <DollarSign className="w-5 h-5" />
          <span>{isLoanEligible ? 'Get Cash Advance' : 'Improve Scores to Qualify'}</span>
        </button>
        <button 
          onClick={onRefresh}
          className="border-2 border-slate-600 text-slate-300 px-8 py-4 rounded-xl text-lg font-semibold hover:border-slate-500 hover:text-white transition-all duration-300 flex items-center space-x-2"
        >
          <RefreshCw className="w-5 h-5" />
          <span>Refresh from Blockchain</span>
        </button>
      </div>
    </div>
  );
}; 