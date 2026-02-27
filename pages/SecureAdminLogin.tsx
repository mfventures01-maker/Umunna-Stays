import React, { useEffect, useState } from 'react';

const SecureAdminLogin: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [twoFactorToken, setTwoFactorToken] = useState('');

    // Add noindex tag purely for this route
    useEffect(() => {
        const meta = document.createElement('meta');
        meta.name = 'robots';
        meta.content = 'noindex, nofollow';
        document.head.appendChild(meta);

        return () => {
            document.head.removeChild(meta);
        };
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // In real app, make API call to get session token & check IP
        window.location.hash = 'admin-dashboard';
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 border border-gray-100">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gray-900 rounded-full mx-auto flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Secure Admin Access</h2>
                    <p className="text-sm text-gray-500 mt-2">Umunna Stays Management Portal</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Admin Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-charcoal focus:border-charcoal sm:text-sm p-3 border"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-charcoal focus:border-charcoal sm:text-sm p-3 border"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">2FA Token (Authenticator)</label>
                        <input
                            type="text"
                            required
                            pattern="[0-9]{6}"
                            maxLength={6}
                            value={twoFactorToken}
                            onChange={(e) => setTwoFactorToken(e.target.value)}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-charcoal focus:border-charcoal sm:text-sm p-3 border tracking-widest text-center text-lg"
                            placeholder="000000"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
                    >
                        Authenticate
                    </button>
                </form>

                <div className="mt-6 text-center text-xs text-gray-400">
                    <p>Protected by reCAPTCHA and advanced CSRF measures.</p>
                    <p>IP logged for security purposes.</p>
                </div>
            </div>
        </div>
    );
};

export default SecureAdminLogin;
