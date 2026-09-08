import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[UNCAUGHT REACT ERROR]:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset = () => {
    localStorage.removeItem('hros_token');
    localStorage.removeItem('hros_active_role');
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white font-sans select-none">
          <div className="bg-slate-900 border border-red-500/40 rounded-3xl p-8 max-w-lg w-full shadow-2xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-500/20 text-red-400 rounded-2xl border border-red-500/30">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight text-white">Application Exception Caught</h2>
                <p className="text-xs text-red-400 font-medium mt-0.5">EHM-Climagro OS Safeguard Active</p>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-300 space-y-2 overflow-x-auto">
              <p className="font-bold text-red-400">{this.state.error?.name || 'Error'}: {this.state.error?.message || 'An unexpected error occurred'}</p>
              {this.state.error?.stack && (
                <p className="text-[10px] text-slate-500 whitespace-pre-wrap max-h-40 overflow-y-auto leading-relaxed pt-2 border-t border-slate-900">
                  {this.state.error.stack}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>

              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Clear Cache & Reset Session
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
