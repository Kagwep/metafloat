import React from 'react';
import { AlertCircle } from 'lucide-react';
import { getScoreCategories } from '../constants';


interface ScoreBreakdownProps {
  scores: any;
}

export const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({ scores }) => {
  const scoreCategories = getScoreCategories(scores);

  return (
    <div className="mb-8">
      <h3 className="text-3xl font-bold text-white mb-6 text-center">Reputation Breakdown</h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scoreCategories.map((category, index) => (
          <div key={index} className={`p-6 rounded-xl border transition-all duration-300 group ${
            category.isRequired && category.score < 600
              ? 'bg-red-500/10 border-red-500/30 hover:border-red-500/50'
              : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
          }`}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <category.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-bold text-white flex items-center space-x-2">
                  <span>{category.name}</span>
                  {category.isRequired && category.score < 600 && (
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  )}
                </h4>
                <p className="text-sm text-slate-400">{category.description}</p>
                <p className={`text-xs mt-1 ${
                  category.isRequired && category.score < 600 ? 'text-red-400' : 'text-cyan-400'
                }`}>{category.importance}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl font-bold text-white">{category.score}</span>
              <span className="text-slate-400">/ {category.maxScore}</span>
            </div>
            <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${
                  category.isRequired && category.score < 600
                    ? 'bg-gradient-to-r from-red-500 to-red-600'
                    : 'bg-gradient-to-r from-cyan-500 to-purple-600'
                }`}
                style={{ width: `${(category.score / category.maxScore) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
