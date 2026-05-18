import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <div className="max-w-md w-full text-center">
                <div className="text-9xl font-black text-slate-200 mb-8">404</div>
                <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter">Content Not Found</h1>
                <p className="text-slate-500 mb-8 font-medium">
                    The requested content does not exist or has not been authorized for public exposure.
                </p>
                <button
                    onClick={() => navigate('/')}
                    className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black hover:scale-105 transition-all shadow-xl"
                >
                    Return to Reality
                </button>
            </div>
        </div>
    );
};

export default NotFound;
