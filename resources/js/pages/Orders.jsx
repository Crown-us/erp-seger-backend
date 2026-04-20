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
    ArrowLeft,
    CreditCard
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
            let method = 'post';
            let data = {};

            if (action === 'confirm') {
                endpoint = `/admin/orders/${id}/confirm`;
            } else if (action === 'ship') {
                endpoint = `/merchant/orders/${id}/status`;
                method = 'put';
                data = { status: 'shipped' };
            } else if (action === 'receive') {
                endpoint = `/buyer/orders/${id}/receive`;
                method = 'put';
            }

            if (method === 'put') {
                await api.put(endpoint, data);
            } else {
                await api.post(endpoint, data);
            }
            
            alert('Status pesanan berhasil diperbarui!');
            fetchOrders();
        } catch (err) {
            alert(err.response?.data?.message || `Gagal melakukan aksi ${action}`);
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 'pending': return { label: 'Menunggu Konfirmasi Admin', sublabel: 'Pembayaran sedang divalidasi', color: 'bg-orange-50 text-orange-700 border-orange-100', icon: CreditCard };
            case 'processing': return { label: 'Dikonfirmasi Admin', sublabel: 'Penjual sedang menyiapkan barang', color: 'bg-blue-50 text-blue-700 border-blue-100', icon: Clock };
            case 'shipped': return { label: 'Sedang Dikirim', sublabel: 'Barang sedang menuju lokasimu', color: 'bg-purple-50 text-purple-700 border-purple-100', icon: Truck };
            case 'completed': return { label: 'Pesanan Selesai', sublabel: 'Barang sudah diterima dengan baik', color: 'bg-green-50 text-green-700 border-green-100', icon: CheckCircle };
            case 'cancelled': return { label: 'Pesanan Dibatalkan', sublabel: 'Transaksi ini dibatalkan', color: 'bg-red-50 text-red-700 border-red-100', icon: XCircle };
            default: return { label: status, sublabel: '', color: 'bg-gray-50 text-gray-700 border-gray-100', icon: AlertCircle };
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
    };

    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-black tracking-tighter text-[#1b1b18] uppercase italic">
                        {user.role === 'pembeli' ? 'Pesanan Saya' : user.role === 'pedagang' ? 'Pesanan Masuk' : 'Kendali Pesanan'}
                    </h2>
                    <p className="text-[#706f6c] font-black uppercase text-[10px] tracking-[0.2em] mt-1">
                        {user.role === 'pembeli' ? 'Pantau alur belanjaanmu di sini bro.' : 'Kelola tiap langkah pesanan dengan teliti.'}
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[3rem] border border-[#1914001a] shadow-sm animate-pulse">
                    <Loader2 size={48} className="animate-spin text-[#1b1b18] mb-4" />
                    <p className="text-[#706f6c] font-black uppercase tracking-[0.2em] text-[10px]">Menarik Data...</p>
                </div>
            ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border border-[#1914001a] shadow-sm text-center">
                    <div className="w-24 h-24 bg-[#19140005] rounded-full flex items-center justify-center mb-8"><ShoppingBag size={48} className="text-[#1914001a]" /></div>
                    <h3 className="text-2xl font-black text-[#1b1b18] uppercase tracking-tight italic">Belum Ada Transaksi</h3>
                    <p className="text-[#706f6c] font-medium mb-10">Sepertinya sepi-sepi aja nih, yuk belanja!</p>
                    {user.role === 'pembeli' && <button onClick={() => navigate('/')} className="bg-[#1b1b18] text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl hover:scale-105 transition-all active:scale-95">Mulai Belanja Sekarang</button>}
                </div>
            ) : (
                <div className="space-y-8">
                    {orders.map((order) => {
                        const status = getStatusInfo(order.status);
                        const StatusIcon = status.icon;
                        
                        return (
                            <div key={order.id} className="bg-white rounded-[3rem] border border-[#1914001a] shadow-sm overflow-hidden hover:shadow-xl transition-all group">
                                <div className="p-8 border-b border-[#1914000d] flex flex-wrap items-center justify-between gap-6 bg-[#FDFDFC]/50">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 bg-[#1b1b18] text-white rounded-2xl flex items-center justify-center shadow-lg"><ShoppingBag size={24} /></div>
                                        <div>
                                            <div className="text-[10px] text-[#706f6c] font-black uppercase tracking-widest leading-none mb-1">Invoice ID</div>
                                            <div className="text-xl font-black text-[#1b1b18]">#{order.id}</div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-wrap items-center gap-4">
                                        <div className={`px-6 py-3 rounded-2xl border-2 flex flex-col ${status.color} min-w-[200px]`}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <StatusIcon size={14} className={order.status === 'processing' ? 'animate-spin' : ''} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">{status.label}</span>
                                            </div>
                                            <div className="text-[9px] opacity-70 font-medium">{status.sublabel}</div>
                                        </div>
                                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-[#706f6c] bg-white px-5 py-3 rounded-2xl border border-[#1914001a]">
                                            {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-10">
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                                        <div className="lg:col-span-2 space-y-6">
                                            <div className="text-[9px] font-black uppercase tracking-[0.4em] text-[#706f6c] mb-6 ml-2">Detail Barang</div>
                                            {order.items?.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-6 p-4 rounded-3xl border border-[#19140005] hover:bg-[#19140005] transition-colors">
                                                    <div className="w-20 h-20 rounded-2xl bg-[#FDFDFC] border border-[#1914001a] flex items-center justify-center text-4xl shadow-inner relative overflow-hidden">{item.product?.image_url ? <img src={item.product.image_url} className="w-full h-full object-cover" /> : item.product?.emoji || '📦'}</div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-black text-[#1b1b18] text-base uppercase italic leading-none mb-2">{item.product?.name}</div>
                                                        <div className="text-xs font-bold text-[#706f6c]">{item.quantity} x {formatCurrency(item.price)}</div>
                                                    </div>
                                                    <div className="font-black text-[#1b1b18] text-lg italic">{formatCurrency(item.quantity * item.price)}</div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="bg-[#FDFDFC] p-8 rounded-[2.5rem] border border-[#1914001a] shadow-inner space-y-8">
                                            <div className="space-y-4">
                                                <div className="text-[9px] font-black uppercase tracking-[0.4em] text-[#706f6c] mb-4">Informasi</div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-[#706f6c] font-medium">Pembeli</span>
                                                    <span className="text-[#1b1b18] font-black italic">{order.user?.name}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-[#706f6c] font-medium">Payment</span>
                                                    <span className="text-[#1b1b18] font-black uppercase italic text-[10px] tracking-widest">{order.payment_method?.replace('_', ' ')}</span>
                                                </div>
                                                <div className="pt-6 border-t-2 border-dashed border-[#1914001a] flex justify-between">
                                                    <span className="text-[#1b1b18] font-black uppercase text-xs tracking-widest">Total Bayar</span>
                                                    <span className="text-[#1b1b18] font-black text-2xl italic tracking-tighter">{formatCurrency(order.total_price)}</span>
                                                </div>
                                            </div>

                                            <div className="pt-2">
                                                {user.role === 'admin' && order.status === 'pending' && (
                                                    <button onClick={() => handleAction(order.id, 'confirm')} disabled={actionLoading === order.id} className="w-full bg-[#1b1b18] text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-[#2b2b28] transition-all shadow-2xl flex items-center justify-center gap-3">
                                                        {actionLoading === order.id ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} strokeWidth={3} />}
                                                        ACC PEMBAYARAN
                                                    </button>
                                                )}

                                                {user.role === 'pedagang' && order.status === 'processing' && (
                                                    <button onClick={() => handleAction(order.id, 'ship')} disabled={actionLoading === order.id} className="w-full bg-orange-600 text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-orange-700 transition-all shadow-xl flex items-center justify-center gap-3">
                                                        {actionLoading === order.id ? <Loader2 size={18} className="animate-spin" /> : <Truck size={18} strokeWidth={3} />}
                                                        KIRIM BARANG
                                                    </button>
                                                )}

                                                {user.role === 'pembeli' && order.status === 'shipped' && (
                                                    <button onClick={() => handleAction(order.id, 'receive')} disabled={actionLoading === order.id} className="w-full bg-emerald-600 text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-emerald-700 transition-all shadow-xl flex items-center justify-center gap-3">
                                                        {actionLoading === order.id ? <Loader2 size={18} className="animate-spin" /> : <PackageCheck size={18} strokeWidth={3} />}
                                                        TERIMA BARANG
                                                    </button>
                                                )}

                                                {order.status === 'completed' && (
                                                    <div className="flex flex-col items-center gap-2 py-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                                        <CheckCircle size={24} className="text-emerald-600" />
                                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-700">TRANSAKSI SELESAI</span>
                                                    </div>
                                                )}

                                                {order.status === 'pending' && user.role === 'pembeli' && (
                                                    <div className="text-center py-4 px-6 bg-orange-50 rounded-2xl border border-orange-100">
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-orange-700">Menunggu Admin Seger memvalidasi pembayaranmu bro.</p>
                                                    </div>
                                                )}
                                                
                                                {order.status === 'processing' && user.role === 'pembeli' && (
                                                    <div className="text-center py-4 px-6 bg-blue-50 rounded-2xl border border-blue-100">
                                                        <p className="text-[9px] font-black uppercase tracking-widest text-blue-700">Penjual sudah terima orderanmu dan lagi siapin barangnya.</p>
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
