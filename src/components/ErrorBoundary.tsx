import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                    <div className="text-center max-w-md bg-white p-8 rounded-2xl shadow-xl">
                        <h2 className="text-2xl font-black text-gray-900 mb-4">Something went wrong</h2>
                        <p className="text-gray-500 mb-6">We encountered an unexpected error. Please try reloading the page.</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-[#C46210] text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-colors"
                        >
                            Reload Page
                        </button>
                        <a
                            href="https://wa.me/2347048033575"
                            className="block mt-4 text-sm text-gray-400 font-medium hover:text-[#C46210] transition-colors"
                        >
                            Contact Concierge Support
                        </a>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
