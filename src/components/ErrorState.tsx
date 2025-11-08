import React from 'react';
import { XCircleIcon } from './icons';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ 
  title = 'Unable to Load Data',
  message,
  onRetry 
}) => {
  return (
    <div className="p-12 flex flex-col items-center justify-center min-h-[400px]">
      <div className="glass rounded-xl border-red-500/20 p-8 max-w-md mx-auto text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/20 flex items-center justify-center">
          <XCircleIcon className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-xl font-semibold text-red-400 mb-2">{title}</h2>
        <p className="text-slate-300 text-sm mb-4">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

