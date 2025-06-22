
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendDataPoint } from '../types';

interface TrendLineChartProps {
  data: TrendDataPoint[];
  title?: string;
}

export const TrendLineChart: React.FC<TrendLineChartProps> = ({ data, title = "Alert Trend (Last 7 Days)" }) => {
  if (!data || data.length === 0) {
    return <p className="text-center text-app-text-secondary py-2 text-xs">No trend data available.</p>;
  }

  return (
    <div className="h-48 md:h-56 mt-3">
      {title && <h5 className="text-xs font-semibold text-app-text-primary mb-2 text-center">{title}</h5>}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5, right: 20, left: -20, bottom: 5, 
          }}
        >
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} stroke="#e2e8f0" /> {/* slate-200 */}
          <XAxis 
            dataKey="date" 
            tick={{ fill: '#64748b', fontSize: 10 }} // app-text-secondary (slate-500)
            interval={Math.max(0, Math.floor(data.length / 7) -1)} 
            padding={{ left: 10, right: 10 }}
            axisLine={{ stroke: '#cbd5e1' }} // slate-300
            tickLine={{ stroke: '#cbd5e1' }} // slate-300
          />
          <YAxis 
            tick={{ fill: '#64748b', fontSize: 10 }} // app-text-secondary (slate-500)
            allowDecimals={false}
            domain={['auto', 'auto']}
            axisLine={{ stroke: '#cbd5e1' }} // slate-300
            tickLine={{ stroke: '#cbd5e1' }} // slate-300
          />
          <Tooltip
            contentStyle={{ backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '0.375rem', fontSize: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)' }} // section-border (slate-300)
            labelStyle={{ color: '#1e293b', fontWeight: 'bold', marginBottom: '4px' }} // app-text-primary (slate-800)
            itemStyle={{ color: '#64748b' }} // app-text-secondary (slate-500)
            cursor={{ stroke: '#94a3b8', strokeDasharray: '3 3' }} // slate-400
          />
          <Legend wrapperStyle={{ fontSize: '0.7rem', paddingTop: '5px', color: '#64748b' }} />
          <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} dot={{ r: 3, fill: '#2563eb' }} activeDot={{ r: 5, fill: '#2563eb' }} name="Alerts" /> {/* brand-blue */}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};