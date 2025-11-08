import React from 'react';
import { InboxIcon } from './icons';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  title, 
  description, 
  icon: Icon = InboxIcon 
}) => {
  return (
    <div className="p-12 flex flex-col items-center justify-center min-h-[400px]">
      <div className="glass rounded-xl border-purple-500/20 p-8 max-w-md mx-auto text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/20 flex items-center justify-center">
          <Icon className="w-8 h-8 text-purple-400" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">{title}</h2>
        <p className="text-slate-300 text-sm">{description}</p>
      </div>
    </div>
  );
};

