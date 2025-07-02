import React from 'react';

interface ReasoningTagsProps {
  tags: string[];
}

export const ReasoningTags: React.FC<ReasoningTagsProps> = ({ tags }) => {
  return (
    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 mb-8">
      <h3 className="text-xl font-bold text-white mb-4">Classification Reasoning</h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <span 
            key={index}
            className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-full text-sm border border-slate-600"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};