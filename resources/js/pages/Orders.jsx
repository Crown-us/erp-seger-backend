import React, { useState, useEffect } from 'react';
import { ShoppingBag, CheckCircle, Clock, AlertCircle, Search, Eye, Loader2 } from 'lucide-react';
import api from '../lib/axios';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirming, setConfirming] = useState(null);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/orders');
            setOrders(response.data.data);
        } catch (err) {
            console.error('Failed to fetch orders', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleConfirmOrder = async (id) => {
        setConfirming(id);
        try {
            await api.post(`/admin/orders/${id}/confirm`);
            fetchOrders();
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal mengonfirmasi pesanan');
        } finally {
            setConfirming(null);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-50 text-green-700 border-green-100';
            case 'pending': return 'bg-orange-50 text-orange-700 border-orange-100';
            case 'processing': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'shipped': return 'bg-purple-50 text-purple-700 border-purple-100';
            case 'cancelled': return 'bg-red-50 text-red-700 border-red-100';
            default: return 'bg-gray-50 text-gray-700 border-gray-100';
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold tracking-tight">Order Management</h2>
                <p className="text-[#706f6c]">Review and confirm incoming customer orders.</p>
            </div>

            <div className="bg-white rounded-xl border border-[#1914001a] shadow-sm overflow-hidden">
                <div className="p-4 border-b border-[#1914001a] bg-[#FDFDFC] flex flex-col sm:flex-row justify-between gap-4">
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#706f6c]" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search by order ID or customer..." 
                            className="w-full pl-10 pr-4 py-2 bg-white border border-[#1914001a] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1b1b18] focus:border-transparent"
                        />
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[#FDFDFC] text-[#706f6c]">
                            <tr>
                                <th className="px-6 py-3 font-medium">Order Details</th>
                                <th className="px-6 py-3 font-medium">Customer</th>
                                <th className="px-6 py-3 font-medium">Payment</th>
                                <th className="px-6 py-3 font-medium">Total</th>
                                <th className="px-6 py-3 font-medium">Status</th>
                                <th className="px-6 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1914001a]">
                            {loading ? (
                                [1,2,3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-4"><div className="h-4 bg-[#1914000d] rounded w-full"></div></td>
                                    </tr>
                                ))
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-2 text-[#706f6c]">
                                            <ShoppingBag size={40} strokeWidth={1.5} />
                                            <p>No orders found.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : orders.map((order) => (
                                <tr key={order.id} className="hover:bg-[#FDFDFC] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-[#1b1b18]">#{order.id}</div>
                                        <div className="text-[11px] text-[#706f6c]">{new Date(order.created_at).toLocaleDateString()}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-[#1b1b18]">{order.user?.name}</div>
                                        <div className="text-[11px] text-[#706f6c]">{order.user?.nik}</div>
                                    </td>
                                    <td className="px-6 py-4 capitalize text-[#706f6c]">
                                        {order.payment_method?.replace('_', ' ')}
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-[#1b1b18]">
                                        Rp {order.total_price?.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${getStatusStyle(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {order.status === 'pending' && (
                                                <button 
                                                    onClick={() => handleConfirmOrder(order.id)}
                                                    disabled={confirming === order.id}
                                                    className="inline-flex items-center gap-1.5 bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-700 transition-all disabled:opacity-50"
                                                >
                                                    {confirming === order.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                                                    Confirm
                                                </button>
                                            )}
                                            <button className="p-1.5 text-[#706f6c] hover:text-[#1b1b18] hover:bg-[#1914000d] rounded-md transition-all">
                                                <Eye size={16} />
                                            </button>
                                        </div>
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

export default Orders;
