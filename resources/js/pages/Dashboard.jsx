import React, { useState, useEffect } from 'react';
import { ShoppingBag, Users as UsersIcon, Store, CreditCard } from 'lucide-react';
import api from '../lib/axios';

const StatCard = ({ icon: Icon, label, value, trend, color }) => (
    <div className="bg-white p-6 rounded-xl border border-[#1914001a] shadow-sm">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
                <Icon size={20} className={color.replace('bg-', 'text-')} />
            </div>
            {trend && <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">{trend}</span>}
        </div>
        <p className="text-sm text-[#706f6c] font-medium">{label}</p>
        <h3 className="text-2xl font-bold mt-1 tracking-tight">{value}</h3>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalEmployees: 0,
        totalShops: 0,
        totalOrders: 0,
        recentOrders: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [employeesRes, shopsRes, ordersRes] = await Promise.all([
                    api.get('/admin/employees'),
                    api.get('/admin/shops'),
                    api.get('/admin/orders'),
                ]);

                setStats({
                    totalEmployees: employeesRes.data.data.length,
                    totalShops: shopsRes.data.data.length,
                    totalOrders: ordersRes.data.data.length,
                    recentOrders: ordersRes.data.data.slice(0, 5),
                });
            } catch (err) {
                console.error('Failed to fetch stats', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return <div className="animate-pulse space-y-8">
            <div className="h-10 w-48 bg-[#1914000d] rounded-md"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1,2,3,4].map(i => <div key={i} className="h-32 bg-[#1914000d] rounded-xl"></div>)}
            </div>
        </div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-semibold tracking-tight">Dashboard Overview</h2>
                <p className="text-[#706f6c]">Welcome back, here's what's happening today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    icon={UsersIcon} 
                    label="Total Employees" 
                    value={stats.totalEmployees} 
                    color="bg-blue-600"
                />
                <StatCard 
                    icon={Store} 
                    label="Active Shops" 
                    value={stats.totalShops} 
                    color="bg-purple-600"
                />
                <StatCard 
                    icon={ShoppingBag} 
                    label="Total Orders" 
                    value={stats.totalOrders} 
                    color="bg-orange-600"
                />
                <StatCard 
                    icon={CreditCard} 
                    label="Pending Orders" 
                    value={stats.recentOrders.filter(o => o.status === 'pending').length} 
                    color="bg-emerald-600"
                />
            </div>

            <div className="bg-white rounded-xl border border-[#1914001a] shadow-sm overflow-hidden">
                <div className="p-6 border-b border-[#1914001a]">
                    <h3 className="font-semibold">Recent Orders</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[#FDFDFC] text-[#706f6c]">
                            <tr>
                                <th className="px-6 py-3 font-medium">Order ID</th>
                                <th className="px-6 py-3 font-medium">Customer</th>
                                <th className="px-6 py-3 font-medium">Amount</th>
                                <th className="px-6 py-3 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1914001a]">
                            {stats.recentOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-[#FDFDFC] transition-colors">
                                    <td className="px-6 py-4 font-medium text-[#1b1b18]">#{order.id}</td>
                                    <td className="px-6 py-4">{order.user?.name}</td>
                                    <td className="px-6 py-4">Rp {order.total_price.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                                            order.status === 'completed' ? 'bg-green-50 text-green-700' :
                                            order.status === 'pending' ? 'bg-orange-50 text-orange-700' :
                                            'bg-blue-50 text-blue-700'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
