
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { OncallLoadDistributionItem } from '../../types';

interface OncallLoadPieChartProps {
  data: OncallLoadDistributionItem[];
  totalTime: number;
}

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
  if (percent < 0.05) return null; // Don't render label for very small slices
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-[10px] font-medium">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export const OncallLoadPieChart: React.FC<OncallLoadPieChartProps> = ({ data, totalTime }) => {
  if (!data || data.length === 0) {
    return <p className="text-center text-app-text-secondary py-2 text-sm">No load data available.</p>;
  }

  return (
    <div className="h-64 md:h-72 w-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius="80%"
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            stroke="white" 
            strokeWidth={1}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
             contentStyle={{ backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '0.375rem', fontSize: '0.8rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)' }}
             formatter={(value: number, name: string) => [`${value} hours`, name]}
          />
          <Legend 
            layout="horizontal" 
            verticalAlign="bottom" 
            align="center"
            wrapperStyle={{ fontSize: '0.75rem', color: '#64748b', marginTop: '10px' }}
            iconSize={10}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-2xl font-bold text-app-text-primary">{totalTime}</span>
        <span className="text-xs text-app-text-secondary">Total oncall time this week</span>
      </div>
    </div>
  );
};
