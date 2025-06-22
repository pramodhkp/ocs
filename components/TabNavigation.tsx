
import React from 'react';
import { AppTab } from '../types';

interface TabNavigationProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

const ChartBarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);

const DocumentTextIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m9.75 9.75h-4.5m0-4.5h4.5m-4.5 0V21m0 0h4.5M6.75 7.5h10.5M6.75 12h10.5m-10.5 4.5h10.5M5.25 6H3.75v13.5h16.5V6H5.25z" />
  </svg>
);


export const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs: { key: AppTab; label: string; icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
    { key: 'retrospectiveSummary', label: 'Retrospective Summary', icon: DocumentTextIcon },
    { key: 'statisticalInsights', label: 'Statistical Insights', icon: ChartBarIcon },
  ];

  return (
    <nav className="mb-6 md:mb-8 border-b border-section-border">
      <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-app-text-secondary">
        {tabs.map(tab => (
          <li key={tab.key} className="mr-2">
            <button
              onClick={() => onTabChange(tab.key)}
              aria-current={activeTab === tab.key ? 'page' : undefined}
              className={`inline-flex items-center justify-center p-4 border-b-2 rounded-t-lg group transition-colors duration-150
                ${activeTab === tab.key
                  ? 'border-brand-blue text-brand-blue'
                  : 'border-transparent hover:text-slate-600 hover:border-slate-300'
                }`}
            >
              <tab.icon className={`w-5 h-5 mr-2 ${activeTab === tab.key ? 'text-brand-blue' : 'text-slate-400 group-hover:text-slate-500'}`} />
              {tab.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};
