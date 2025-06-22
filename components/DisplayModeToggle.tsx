
import React from 'react';
import { DisplayMode } from '../types';

interface DisplayModeToggleProps {
  currentMode: DisplayMode;
  onToggle: () => void;
}

const SidebarIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h8m-8 6h16" />
  </svg>
);

const InlineIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
  </svg>
);


export const DisplayModeToggle: React.FC<DisplayModeToggleProps> = ({ currentMode, onToggle }) => {
  return (
    <div className="flex justify-center items-center my-4 p-2 bg-slate-100 rounded-lg shadow-sm border border-slate-200 max-w-md mx-auto">
      <span className="text-sm font-medium text-app-text-secondary mr-3">View Details:</span>
      <div className="relative flex items-center bg-slate-200 p-0.5 rounded-lg cursor-pointer">
        <button
          onClick={onToggle}
          className={`relative z-10 flex items-center justify-center w-28 py-1.5 px-3 text-xs font-semibold rounded-md transition-colors duration-200 ease-in-out
            ${currentMode === 'sidebar' ? 'text-white' : 'text-slate-600 hover:text-slate-800'}`}
          aria-pressed={currentMode === 'sidebar'}
          title="Switch to Sidebar View"
        >
          <SidebarIcon /> Sidebar
        </button>
        <button
          onClick={onToggle}
          className={`relative z-10 flex items-center justify-center w-28 py-1.5 px-3 text-xs font-semibold rounded-md transition-colors duration-200 ease-in-out
            ${currentMode === 'inline' ? 'text-white' : 'text-slate-600 hover:text-slate-800'}`}
          aria-pressed={currentMode === 'inline'}
          title="Switch to Inline View"
        >
          <InlineIcon /> Inline
        </button>
        <div
          className={`absolute top-0.5 bottom-0.5 w-[calc(50%-4px)] h-[calc(100%-4px)] bg-brand-blue rounded-md shadow-md transition-transform duration-300 ease-in-out
            ${currentMode === 'sidebar' ? 'translate-x-[2px]' : 'translate-x-[calc(100%+2px)]'}`}
            style={{ width: 'calc(50% - 4px)', left: '0' }}
        ></div>
      </div>
    </div>
  );
};
