import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone, Loader2 } from 'lucide-react';
import { useAuth } from '../../src/contexts/AuthContext';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialView?: 'login' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialView = 'login' }) => {
    const [view, setView] = useState<'login' | 'signup'>(initialView);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { signIn, signUp } = useAuth();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (view === 'login') {
                const { error } = await signIn(email, password);
                if (error) throw error;
            } else {
                const { error } = await signUp(email, password, fullName, phone);
                if (error) throw error;
            }
            onClose();
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="p-6 pb-0 flex justify-between items-center">
                    <h2 className="text-2xl font-black text-gray-900">
                        {view === 'login' ? 'Welcome Back' : 'Join Umunna'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex p-6 pb-4 gap-4">
                    <button
                        onClick={() => { setView('login'); setError(null); }}
                        className={`flex-1 pb-2 text-sm font-bold uppercase tracking-widest border-b-2 transition-colors ${view === 'login' ? 'border-[#C46210] text-[#C46210]' : 'border-transparent text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        Log In
                    </button>
                    <button
                        onClick={() => { setView('signup'); setError(null); }}
                        className={`flex-1 pb-2 text-sm font-bold uppercase tracking-widest border-b-2 transition-colors ${view === 'signup' ? 'border-[#C46210] text-[#C46210]' : 'border-transparent text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        Sign Up
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 pt-0 space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold">
                            {error}
                        </div>
                    )}

                    {view === 'signup' && (
                        <>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Full Name</label>
                                <div className="relative">
                                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-10 pr-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[#C46210] transition-all"
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Phone (Optional)</label>
                                <div className="relative">
                                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-10 pr-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[#C46210] transition-all"
                                        placeholder="+234..."
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Email</label>
                        <div className="relative">
                            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-10 pr-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[#C46210] transition-all"
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest ml-1">Password</label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-10 pr-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[#C46210] transition-all"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#C46210] text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2 mt-4"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : (view === 'login' ? 'Log In' : 'Create Account')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AuthModal;
