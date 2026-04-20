import React, { useState, useEffect } from 'react';
import { ShoppingBag, Users as UsersIcon, Store, CreditCard, TrendingUp, Package, AlertTriangle, CheckCircle } from 'lucide-react';
import api from '../lib/axios';

const StatCard = ({ icon: Icon, label, value, trend, color, subtitle }) => (
    <div className="bg-white p-6 rounded-3xl border border-[#1914001a] shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-2xl ${color} bg-opacity-10`}>
                <Icon size={24} className={color.replace('bg-', 'text-')} />
            </div>
            {trend && <span className="text-[10px] font-black uppercase tracking-widest text-green-600 bg-green-50 px-2 py-1 rounded-lg">{trend}</span>}
        </div>
        <p className="text-[10px] text-[#706f6c] font-black uppercase tracking-widest leading-none mb-2">{label}</p>
        <h3 className="text-3xl font-black text-[#1b1b18] tracking-tighter">{value}</h3>
        {subtitle && <p className="text-[11px] text-[#706f6c] mt-2 font-medium">{subtitle}</p>}
    </div>
);

const Dashboard = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [stats, setStats] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            if (user.role === 'admin') {
                const [employeesRes, shopsRes, ordersRes] = await Promise.all([
                    api.get('/admin/employees'),
                    api.get('/admin/shops'),
                    api.get('/admin/orders'),
                ]);

                setStats({
                    totalEmployees: employeesRes.data.data.length,
                    totalShops: shopsRes.data.data.length,
                    totalOrders: ordersRes.data.data.length,
                    pendingOrders: ordersRes.data.data.filter(o => o.status === 'pending').length,
                    turnover: ordersRes.data.data.reduce((acc, curr) => acc + curr.total_price, 0)
                });
                setRecentOrders(ordersRes.data.data.slice(0, 5));
            } else {
                const statsRes = await api.get('/merchant/dashboard');
                const ordersRes = await api.get('/merchant/orders');
                
                setStats({
                    turnover: statsRes.data.data.turnover,
                    activeOrders: statsRes.data.data.active_orders,
                    lowStock: statsRes.data.data.low_stock,
                    totalProducts: statsRes.data.data.total_products
                });
                setRecentOrders(ordersRes.data.data.slice(0, 5));
            }
        } catch (err) {
            console.error('Failed to fetch dashboard data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-8">
                <div className="h-10 w-64 bg-[#1914000d] rounded-2xl"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1,2,3,4].map(i => <div key={i} className="h-40 bg-[#1914000d] rounded-3xl"></div>)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10">
            <div>
                <h2 className="text-4xl font-black tracking-tighter text-[#1b1b18] uppercase">Ringkasan Bisnis</h2>
                <p className="text-[#706f6c] font-medium mt-1">Halo {user.name}, berikut adalah performa tokomu hari ini.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {user.role === 'admin' ? (
                    <>
                        <StatCard icon={UsersIcon} label="Total Karyawan" value={stats.totalEmployees} color="bg-blue-600" />
                        <StatCard icon={Store} label="Toko Aktif" value={stats.totalShops} color="bg-purple-600" />
                        <StatCard icon={ShoppingBag} label="Total Pesanan" value={stats.totalOrders} color="bg-orange-600" />
                        <StatCard icon={TrendingUp} label="Total Omzet" value={formatCurrency(stats.turnover)} color="bg-emerald-600" />
                    </>
                ) : (
                    <>
                        <StatCard icon={TrendingUp} label="Total Omzet" value={formatCurrency(stats.turnover)} color="bg-emerald-600" subtitle="Penghasilan dari pesanan selesai" />
                        <StatCard icon={ShoppingBag} label="Pesanan Aktif" value={stats.activeOrders} color="bg-blue-600" subtitle="Perlu segera diproses" />
                        <StatCard icon={AlertTriangle} label="Stok Menipis" value={stats.lowStock} color="bg-red-600" subtitle="Produk di bawah 5 pcs" />
                        <StatCard icon={Package} label="Total Produk" value={stats.totalProducts} color="bg-purple-600" subtitle="Jumlah koleksi tokomu" />
                    </>
                )}
            </div>

            <div className="bg-white rounded-[2rem] border border-[#1914001a] shadow-sm overflow-hidden">
                <div className="p-8 border-b border-[#1914000d] flex items-center justify-between">
                    <h3 className="text-xl font-black tracking-tight text-[#1b1b18] uppercase">Pesanan Terbaru</h3>
                    <button className="text-[11px] font-black uppercase tracking-widest text-[#706f6c] hover:text-[#1b1b18] border-b-2 border-transparent hover:border-[#1b1b18] transition-all pb-0.5">Lihat Semua</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[#FDFDFC] text-[#706f6c]">
                            <tr>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest">Order ID</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest">Customer</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest">Total Bayar</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1914000d]">
                            {recentOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-12 text-center text-[#706f6c] font-medium italic">Belum ada pesanan masuk hari ini bro.</td>
                                </tr>
                            ) : recentOrders.map((order) => (
                                <tr key={order.id} className="hover:bg-[#FDFDFC] transition-colors group">
                                    <td className="px-8 py-5 font-bold text-[#1b1b18]">#{order.id}</td>
                                    <td className="px-8 py-5">
                                        <div className="font-bold text-[#1b1b18]">{order.user?.name}</div>
                                        <div className="text-[10px] text-[#706f6c]">{order.user?.nik}</div>
                                    </td>
                                    <td className="px-8 py-5 font-black text-[#1b1b18]">{formatCurrency(order.total_price)}</td>
                                    <td className="px-8 py-5">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                            order.status === 'completed' ? 'bg-green-50 text-green-700 border-green-100' :
                                            order.status === 'pending' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                            'bg-blue-50 text-blue-700 border-blue-100'
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
