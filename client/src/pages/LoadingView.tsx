import React from 'react';

export const LoadingView: React.FC = () => {
  return (
    <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-white mb-2">Loading Your Reputation</h2>
        <p className="text-slate-300">Reading from blockchain...</p>
      </div>
    </div>
  );
};