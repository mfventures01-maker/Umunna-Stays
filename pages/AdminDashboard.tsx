import React from 'react';

const AdminDashboard: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm p-6 flex justify-between items-center mb-8 border border-gray-200">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="text-gray-500 text-sm">Welcome back, Super Admin</p>
                    </div>
                    <button
                        onClick={() => window.location.hash = 'home'}
                        className="text-sm bg-red-50 text-red-600 px-4 py-2 rounded-md hover:bg-red-100 transition-colors"
                    >
                        Logout
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-gray-500 text-sm font-medium">Active Bookings</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-2">14</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-gray-500 text-sm font-medium">Pending Transport</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-2">3</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-gray-500 text-sm font-medium">Total Properties</h3>
                        <p className="text-3xl font-bold text-gray-900 mt-2">20</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
