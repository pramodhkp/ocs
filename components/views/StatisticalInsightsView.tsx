
import React from 'react';
import { StatisticalInsightsData } from '../../types';
import { StatCard } from '../stats/StatCard';
import { TopTagsDisplay } from '../stats/TopTagsDisplay';
import { ItemCountsDisplay } from '../stats/ItemCountsDisplay';
import { WeeklyTrendChart } from '../stats/WeeklyTrendChart';
import { OncallLoadPieChart } from '../stats/OncallLoadPieChart';

interface StatisticalInsightsViewProps {
  data: StatisticalInsightsData;
}

const ChartPieIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
  </svg>
);

const TagIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
  </svg>
);

const ListBulletIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25h7.5M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 17.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);

const CalendarDaysIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-3.75h.008v.008H12v-.008z" />
  </svg>
);


export const StatisticalInsightsView: React.FC<StatisticalInsightsViewProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <StatCard title="Top 5 Tags by Count" icon={TagIcon}>
          <TopTagsDisplay topTags={data.topTagsByCount} />
        </StatCard>
        <StatCard title="Count of Items by Type" icon={ListBulletIcon}>
          <ItemCountsDisplay itemCounts={data.itemCountsByType} />
        </StatCard>
      </div>
      <div className="lg:col-span-1 space-y-6">
         <StatCard title="Weekly Trend" subtitle="Daily distribution of oncall items by type" icon={CalendarDaysIcon}>
          <WeeklyTrendChart data={data.weeklyTrend} />
        </StatCard>
        <StatCard title="Oncall Load Distribution" subtitle="Time spent on different categories of issues" icon={ChartPieIcon}>
          <OncallLoadPieChart data={data.oncallLoadDistribution} totalTime={data.totalOncallTime} />
        </StatCard>
      </div>
    </div>
  );
};
