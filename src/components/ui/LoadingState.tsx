import React from 'react';

export interface LoadingStateProps {
  count?: number;
  type?: 'card' | 'list' | 'spinner';
}

export const LoadingState: React.FC<LoadingStateProps> = ({ count = 4, type = 'card' }) => {
  if (type === 'spinner') {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-slate-900 animate-spin" />
        <span className="text-xs text-slate-500 font-medium">Chargement en cours...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-slate-200/60 p-4 space-y-3 bg-white">
          <div className="aspect-4/3 rounded-xl bg-slate-100 animate-pulse" />
          <div className="space-y-2 pt-1">
            <div className="h-3 w-16 bg-slate-100 rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-slate-100 rounded animate-pulse" />
            <div className="h-5 w-1/2 bg-slate-100 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
};
