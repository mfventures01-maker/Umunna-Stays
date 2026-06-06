import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw, Shield } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class CmsErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('CMS Runtime Collapse:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-950 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-[40px] p-10 shadow-2xl border-4 border-red-500 text-center">
            <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Shield size={40} className="text-red-500 animate-pulse" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tighter">CMS Isolation Active</h2>
            <p className="text-slate-500 font-medium mb-8 leading-relaxed">
              A runtime error occurred within the CMS boundary. Global application state remains protected.
            </p>
            
            <div className="bg-red-50 p-4 rounded-2xl text-left mb-8 overflow-hidden">
                <div className="flex items-center gap-2 text-red-600 mb-2">
                    <AlertCircle size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Error Trace</span>
                </div>
                <p className="text-[10px] font-mono text-red-900 break-all opacity-70">
                    {this.state.error?.message || 'Unknown Governance Violation'}
                </p>
            </div>

            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-black transition-all"
            >
              <RefreshCcw size={20} /> Reset CMS Instance
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
