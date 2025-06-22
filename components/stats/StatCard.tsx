
import React from 'react';

interface StatCardProps {
  title: string;
  subtitle?: string;
  icon?: React.FC<React.SVGProps<SVGSVGElement>>;
  children: React.ReactNode;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, subtitle, icon: Icon, children, className = '' }) => {
  return (
    <div className={`bg-section-bg rounded-lg shadow-lg border border-section-border overflow-hidden ${className}`}>
      <div className="p-4 md:p-5 bg-section-header-bg border-b border-section-border">
        <div className="flex items-center">
          {Icon && <Icon className="h-6 w-6 mr-3 text-brand-blue" />}
          <div>
            <h3 className="text-lg md:text-xl font-semibold text-app-text-primary">{title}</h3>
            {subtitle && <p className="text-xs text-app-text-secondary mt-0.5">{subtitle}</p>}
          </div>
        </div>
      </div>
      <div className="p-4 md:p-6">
        {children}
      </div>
    </div>
  );
};
