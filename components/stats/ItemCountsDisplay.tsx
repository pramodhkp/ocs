
import React from 'react';
import { ItemTypeCountItem } from '../../types';

interface ItemCountsDisplayProps {
  itemCounts: ItemTypeCountItem[];
}

export const ItemCountsDisplay: React.FC<ItemCountsDisplayProps> = ({ itemCounts }) => {
  if (!itemCounts || itemCounts.length === 0) {
    return <p className="text-app-text-secondary text-sm">No item count data available.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:gap-4">
      {itemCounts.map((item, index) => (
        <div 
          key={index} 
          className={`p-3 rounded-lg border flex items-start space-x-3 shadow-sm ${item.colorClass}`}
        >
          <item.icon className="h-6 w-6 md:h-7 md:w-7 opacity-80 shrink-0 mt-0.5" />
          <div>
            <div className="text-2xl md:text-3xl font-bold">{item.count}</div>
            <div className="text-xs md:text-sm font-medium opacity-90">{item.type}</div>
          </div>
        </div>
      ))}
    </div>
  );
};
