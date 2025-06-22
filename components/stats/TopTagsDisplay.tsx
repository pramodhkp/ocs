
import React from 'react';
import { TopTagCountItem } from '../../types';
import { TAG_COLORS } from '../../constants';

interface TopTagsDisplayProps {
  topTags: TopTagCountItem[];
}

export const TopTagsDisplay: React.FC<TopTagsDisplayProps> = ({ topTags }) => {
  if (!topTags || topTags.length === 0) {
    return <p className="text-app-text-secondary text-sm">No tag data available.</p>;
  }

  return (
    <div className="space-y-2">
      {topTags.map((item, index) => {
        const colorClass = item.colorClass || TAG_COLORS[item.tag] || TAG_COLORS['default'];
        return (
          <div key={index} className="flex justify-between items-center p-2.5 bg-slate-50 rounded-md border border-slate-200">
            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${colorClass} whitespace-nowrap shadow-sm`}>
              {item.tag}
            </span>
            <span className="text-sm font-medium text-app-text-primary">{item.count}</span>
          </div>
        );
      })}
    </div>
  );
};
