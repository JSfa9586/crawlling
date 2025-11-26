import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number | React.ReactNode;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
}

const colorClasses = {
  primary: 'bg-primary-50 border-primary-200 text-primary-600',
  secondary: 'bg-secondary-50 border-secondary-200 text-secondary-600',
  success: 'bg-green-50 border-green-200 text-green-600',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-600',
  danger: 'bg-red-50 border-red-200 text-red-600',
  info: 'bg-blue-50 border-blue-200 text-blue-600',
};

export function StatCard({
  title,
  value,
  icon,
  trend,
  color = 'primary',
}: StatCardProps) {
  return (
    <div
      className={'border rounded-lg p-4 animate-fadeIn shadow-sm hover:shadow-md transition-shadow ' + colorClasses[color]}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-600 mb-1">{title}</p>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          {trend && (
            <p className={'text-xs mt-1 ' + (trend.direction === 'up' ? 'text-green-600' : 'text-red-600')}>
              {trend.direction === 'up' ? '↑' : '↓'} {trend.value}%
            </p>
          )}
        </div>
        {icon && <div className="text-3xl opacity-20">{icon}</div>}
      </div>
    </div>
  );
}