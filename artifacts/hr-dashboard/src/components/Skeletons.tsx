import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ rows = 5, columns = 6 }) => {
  return (
    <div className="w-full bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-2xs animate-pulse select-none">
      <div className="h-12 bg-gray-50 border-b border-gray-100 flex items-center px-4 gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="h-3.5 bg-gray-200 rounded-md flex-1 max-w-[140px]" />
        ))}
      </div>
      <div className="divide-y divide-gray-100">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="h-14 px-4 flex items-center gap-4">
            {Array.from({ length: columns }).map((_, c) => (
              <div
                key={c}
                className="h-3 bg-gray-200/70 rounded-md flex-1"
                style={{ maxWidth: c === 0 ? '160px' : c === 1 ? '100px' : '120px' }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const CardGridSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 select-none animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-3 bg-gray-200 rounded-md w-24" />
            <div className="w-8 h-8 bg-gray-100 rounded-xl" />
          </div>
          <div className="h-7 bg-gray-300 rounded-lg w-16" />
          <div className="h-2.5 bg-gray-100 rounded-md w-32" />
        </div>
      ))}
    </div>
  );
};

export const KanbanSkeleton: React.FC<{ columns?: number }> = ({ columns = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 select-none animate-pulse">
      {Array.from({ length: columns }).map((_, col) => (
        <div key={col} className="bg-gray-50/70 border border-gray-200/70 rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-gray-200 rounded-md w-28" />
            <div className="h-5 bg-gray-200 rounded-full w-8" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, card) => (
              <div key={card} className="bg-white border border-gray-200/80 rounded-xl p-4 shadow-2xs space-y-2.5">
                <div className="h-3.5 bg-gray-200 rounded-md w-3/4" />
                <div className="h-2.5 bg-gray-100 rounded-md w-1/2" />
                <div className="flex items-center justify-between pt-2">
                  <div className="h-5 bg-gray-100 rounded-md w-14" />
                  <div className="w-6 h-6 bg-gray-200 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export const InlineErrorRetry: React.FC<{
  title?: string;
  message?: string;
  onRetry: () => void;
}> = ({
  title = 'Failed to load live data',
  message = 'There was an issue fetching the latest updates. You can retry loading below.',
  onRetry,
}) => {
  return (
    <div className="bg-rose-50 border border-rose-200/90 rounded-2xl p-6 text-center select-none shadow-2xs">
      <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center mx-auto mb-3">
        <AlertCircle className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-extrabold text-rose-950 mb-1">{title}</h3>
      <p className="text-xs text-rose-700/90 max-w-md mx-auto mb-4">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>Retry Loading</span>
      </button>
    </div>
  );
};
