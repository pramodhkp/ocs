
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DailyTrendItem } from '../../types';

interface WeeklyTrendChartProps {
  data: DailyTrendItem[];
}

// Define colors for the bars, can be customized or moved to constants
const BAR_COLORS = {
  incidents: '#fb923c', // orange-400
  alerts: '#60a5fa',   // blue-400
  tasks: '#34d399',    // emerald-400
  notes: '#a7f3d0',    // emerald-200
};

export const WeeklyTrendChart: React.FC<WeeklyTrendChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <p className="text-center text-app-text-secondary py-2 text-sm">No trend data available.</p>;
  }

  return (
    <div className="h-64 md:h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 0, 
            left: -25, // Adjusted for YAxis labels
            bottom: 5,
          }}
          barGap={4}
        >
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} stroke="#e2e8f0" />
          <XAxis 
            dataKey="day" 
            tick={{ fill: '#64748b', fontSize: 11 }} 
            axisLine={{ stroke: '#cbd5e1' }} 
            tickLine={{ stroke: '#cbd5e1' }}
          />
          <YAxis 
            tick={{ fill: '#64748b', fontSize: 11 }} 
            allowDecimals={false}
            axisLine={{ stroke: '#cbd5e1' }} 
            tickLine={{ stroke: '#cbd5e1' }}
          />
          <Tooltip
            contentStyle={{ backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '0.375rem', fontSize: '0.8rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)' }}
            labelStyle={{ color: '#1e293b', fontWeight: 'bold', marginBottom: '4px' }}
            itemStyle={{ color: '#64748b' }}
            cursor={{ fill: 'rgba(203, 213, 225, 0.3)' }} // slate-300 with opacity
          />
          <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: '10px', color: '#64748b' }} iconSize={10} />
          <Bar dataKey="incidents" fill={BAR_COLORS.incidents} name="Incidents" radius={[3, 3, 0, 0]} barSize={10}/>
          <Bar dataKey="alerts" fill={BAR_COLORS.alerts} name="Alerts" radius={[3, 3, 0, 0]} barSize={10}/>
          <Bar dataKey="tasks" fill={BAR_COLORS.tasks} name="Tasks" radius={[3, 3, 0, 0]} barSize={10}/>
          <Bar dataKey="notes" fill={BAR_COLORS.notes} name="Notes" radius={[3, 3, 0, 0]} barSize={10}/>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
