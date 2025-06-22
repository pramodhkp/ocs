
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="py-6 text-center border-b border-section-border shadow-md bg-gradient-to-r from-portal-header-from to-portal-header-to rounded-lg mb-4"> {/* Added mb-4 */}
      <h1 className="text-4xl md:text-5xl font-bold text-app-text-primary">
        Oncall Retrospective Summarizer
      </h1>
      <p className="mt-2 text-lg text-slate-700"> {/* Slightly darker secondary text for header on light gradient */}
        AI-Powered Insights for Your Oncall Shifts
      </p>
    </header>
  );
};
