import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminShield: React.FC = () => {
    const [showModal, setShowModal] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [twoFactorToken, setTwoFactorToken] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate login & redirect to dashboard
        navigate('/admin-dashboard');
        setShowModal(false);
    };

    return (
        <>
            {/* Floating Shield Icon */}
            <div
                className="fixed bottom-4 right-4 z-50 group cursor-pointer"
                onClick={() => {
                    navigate('/secure-admin-login');
                }}
                title="Admin Access"
            >
                <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center shadow-lg hover:bg-black transition-colors">
                    <Shield className="w-5 h-5 text-gray-400 group-hover:text-white" />
                </div>
                {/* Tooltip */}
                <div className="absolute right-12 bottom-2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
                    Admin Access
                </div>
            </div>
        </>
    );
};

export default AdminShield;
