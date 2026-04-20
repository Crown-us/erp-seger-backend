import React, { useState, useEffect } from 'react';
import { 
    ShoppingBag, 
    CheckCircle, 
    Clock, 
    AlertCircle, 
    Search, 
    Eye, 
    Loader2, 
    Truck, 
    PackageCheck,
    XCircle,
    ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const fetchOrders = async () => {
        setLoading(true);
        try {
            let endpoint = '/admin/orders';
            if (user.role === 'pembeli') endpoint = '/orders/my';
            if (user.role === 'pedagang') endpoint = '/merchant/orders';
            
            const response = await api.get(endpoint);
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

    const handleAction = async (id, action) => {
        setActionLoading(id);
        try {
            let endpoint = '';
            if (action === 'confirm') endpoint = `/admin/orders/${id}/confirm`;
            if (action === 'ship') endpoint = `/merchant/orders/${id}/status`;
            if (action === 'receive') endpoint = `/buyer/orders/${id}/receive`;

            if (action === 'ship') {
                await api.put(endpoint, { status: 'shipped' });
            } else if (action === 'receive') {
                await api.put(endpoint);
            } else {
                await api.post(endpoint);
            }
            
            fetchOrders();
        } catch (err) {
            alert(err.response?.data?.message || `Gagal melakukan aksi ${action}`);
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 'pending': return { label: 'Menunggu Konfirmasi', color: 'bg-orange-50 text-orange-700 border-orange-100', icon: Clock };
            case 'processing': return { label: 'Sedang Diproses', color: 'bg-blue-50 text-blue-700 border-blue-100', icon: Loader2 };
            case 'shipped': return { label: 'Dalam Pengiriman', color: 'bg-purple-50 text-purple-700 border-purple-100', icon: Truck };
            case 'completed': return { label: 'Selesai', color: 'bg-green-50 text-green-700 border-green-100', icon: CheckCircle };
            case 'cancelled': return { label: 'Dibatalkan', color: 'bg-red-50 text-red-700 border-red-100', icon: XCircle };
            default: return { label: status, color: 'bg-gray-50 text-gray-700 border-gray-100', icon: AlertCircle };
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black tracking-tighter text-[#1b1b18] uppercase">
                        {user.role === 'pembeli' ? 'Pesanan Saya' : user.role === 'pedagang' ? 'Pesanan Masuk' : 'Manajemen Pesanan'}
                    </h2>
                    <p className="text-[#706f6c] text-sm font-medium mt-1">
                        {user.role === 'pembeli' ? 'Pantau status belanjaanmu di sini bro.' : 'Kelola pesanan pelanggan dengan cepat dan akurat.'}
                    </p>
                </div>
                {user.role === 'pembeli' && (
                    <button 
                        onClick={() => navigate('/')}
                        className="bg-[#1b1b18] text-white px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-[#2b2b28] transition-all shadow-lg"
                    >
                        <ShoppingBag size={18} />
                        Belanja Lagi
                    </button>
                )}
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-[#1914001a] shadow-sm">
                    <Loader2 size={48} className="animate-spin text-[#1b1b18] mb-4" />
                    <p className="text-[#706f6c] font-bold uppercase tracking-widest text-xs">Memuat Data Pesanan...</p>
                </div>
            ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-[#1914001a] shadow-sm text-center">
                    <div className="w-20 h-20 bg-[#19140005] rounded-full flex items-center justify-center mb-6">
                        <ShoppingBag size={40} className="text-[#1914001a]" />
                    </div>
                    <h3 className="text-xl font-bold text-[#1b1b18]">Belum Ada Pesanan</h3>
                    <p className="text-[#706f6c] mb-8">Sepertinya belum ada transaksi yang tercatat nih.</p>
                    {user.role === 'pembeli' && (
                        <button 
                            onClick={() => navigate('/')}
                            className="text-[#1b1b18] font-black uppercase text-sm border-b-2 border-[#1b1b18] pb-1"
                        >
                            Mulai Belanja Sekarang
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {orders.map((order) => {
                        const status = getStatusInfo(order.status);
                        const StatusIcon = status.icon;
                        
                        return (
                            <div key={order.id} className="bg-white rounded-3xl border border-[#1914001a] shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                <div className="p-6 border-b border-[#1914000d] flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-[#19140005] rounded-2xl">
                                            <ShoppingBag size={24} className="text-[#1b1b18]" />
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-[#706f6c] font-black uppercase tracking-widest">Order ID</div>
                                            <div className="text-lg font-black text-[#1b1b18]">#{order.id}</div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-wrap items-center gap-3">
                                        <div className={`px-4 py-1.5 rounded-full border flex items-center gap-2 text-[11px] font-black uppercase tracking-widest ${status.color}`}>
                                            <StatusIcon size={14} className={order.status === 'processing' ? 'animate-spin' : ''} />
                                            {status.label}
                                        </div>
                                        <div className="text-sm font-bold text-[#706f6c] bg-[#19140005] px-4 py-1.5 rounded-full border border-[#1914000d]">
                                            {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 lg:p-8">
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        {/* Order Items */}
                                        <div className="lg:col-span-2 space-y-4">
                                            <div className="text-[10px] text-[#706f6c] font-black uppercase tracking-widest mb-4">Item Pesanan</div>
                                            {order.items?.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-4 group">
                                                    <div className="w-16 h-16 rounded-2xl bg-[#FDFDFC] border border-[#1914001a] flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                                                        {item.product?.image_url ? (
                                                            <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span className="text-3xl">{item.product?.emoji || '📦'}</span>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-bold text-[#1b1b18] truncate text-sm">{item.product?.name}</div>
                                                        <div className="text-xs text-[#706f6c]">{item.quantity} x {formatCurrency(item.price)}</div>
                                                    </div>
                                                    <div className="font-black text-[#1b1b18] text-sm">{formatCurrency(item.quantity * item.price)}</div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Order Summary & Actions */}
                                        <div className="bg-[#FDFDFC] p-6 rounded-2xl border border-[#1914000d] space-y-6">
                                            <div>
                                                <div className="text-[10px] text-[#706f6c] font-black uppercase tracking-widest mb-4">Ringkasan</div>
                                                <div className="space-y-3 text-sm font-medium">
                                                    <div className="flex justify-between">
                                                        <span className="text-[#706f6c]">Pemesan</span>
                                                        <span className="text-[#1b1b18] font-bold">{order.user?.name}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-[#706f6c]">Pembayaran</span>
                                                        <span className="text-[#1b1b18] font-bold uppercase">{order.payment_method?.replace('_', ' ')}</span>
                                                    </div>
                                                    <div className="pt-3 border-t border-[#1914001a] flex justify-between text-lg font-black italic">
                                                        <span className="text-[#1b1b18]">Total</span>
                                                        <span className="text-[#1b1b18]">{formatCurrency(order.total_price)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Buttons based on Role & Status */}
                                            <div className="pt-2">
                                                {user.role === 'admin' && order.status === 'pending' && (
                                                    <button 
                                                        onClick={() => handleAction(order.id, 'confirm')}
                                                        disabled={actionLoading === order.id}
                                                        className="w-full bg-green-600 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-green-700 transition-all shadow-md flex items-center justify-center gap-2"
                                                    >
                                                        {actionLoading === order.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                                                        Konfirmasi Pesanan
                                                    </button>
                                                )}

                                                {user.role === 'pedagang' && order.status === 'processing' && (
                                                    <button 
                                                        onClick={() => handleAction(order.id, 'ship')}
                                                        disabled={actionLoading === order.id}
                                                        className="w-full bg-[#1b1b18] text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#2b2b28] transition-all shadow-md flex items-center justify-center gap-2"
                                                    >
                                                        {actionLoading === order.id ? <Loader2 size={16} className="animate-spin" /> : <Truck size={16} />}
                                                        Kirim Pesanan
                                                    </button>
                                                )}

                                                {user.role === 'pembeli' && order.status === 'shipped' && (
                                                    <button 
                                                        onClick={() => handleAction(order.id, 'receive')}
                                                        disabled={actionLoading === order.id}
                                                        className="w-full bg-[#1b1b18] text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#2b2b28] transition-all shadow-md flex items-center justify-center gap-2"
                                                    >
                                                        {actionLoading === order.id ? <Loader2 size={16} className="animate-spin" /> : <PackageCheck size={16} />}
                                                        Pesanan Diterima
                                                    </button>
                                                )}

                                                {order.status === 'completed' && (
                                                    <div className="text-center py-2 text-green-600 font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2">
                                                        <CheckCircle size={14} />
                                                        Transaksi Selesai
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Orders;
