

import React from 'react';
import { TAG_COLORS } from '../constants';

interface TagChipProps {
  tag: string;
}

export const TagChip: React.FC<TagChipProps> = ({ tag }) => {
  const colorClass = TAG_COLORS[tag] || TAG_COLORS['default'];
  return (
    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${colorClass} whitespace-nowrap shadow-sm`}>
      {tag}
    </span>
  );
};