import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    Search, 
    ShoppingBasket, 
    Plus, 
    Minus, 
    X,
    Store,
    ArrowRight,
    User,
    LogOut,
    LogIn,
    LayoutDashboard,
    Trash2
} from 'lucide-react';
import api from '../lib/axios';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('Semua');
    const [cart, setCart] = useState([]);
    const [showCart, setShowCart] = useState(false);
    const navigate = useNavigate();
    
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const isLoggedIn = !!localStorage.getItem('token');

    const categories = ['Semua', 'Sembako', 'Minuman', 'Camilan', 'Kebutuhan Rumah'];

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await api.get('/products', {
                params: { search, category }
            });
            setProducts(response.data.data);
        } catch (err) {
            console.error('Failed to fetch products', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProducts();
        }, 500);
        return () => clearTimeout(timer);
    }, [search, category]);

    const handleLogout = async () => {
        try {
            await api.post('/logout');
        } catch (e) {}
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
    };

    const addToCart = (product) => {
        if (!isLoggedIn) {
            alert('Silakan login terlebih dahulu untuk belanja!');
            navigate('/login');
            return;
        }
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        try {
            const items = cart.map(item => ({ id: item.id, quantity: item.quantity }));
            await api.post('/orders/checkout', { items, payment_method: 'qris' });
            alert('Pesanan berhasil dibuat!');
            setCart([]);
            setShowCart(false);
            navigate('/admin/orders');
        } catch (err) {
            alert(err.response?.data?.message || 'Checkout gagal');
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
    };

    return (
        <div className="min-h-screen bg-[#FDFDFC]">
            {/* Navigasi Simpel: 3 Pilihan */}
            <nav className="sticky top-0 z-40 bg-white border-b border-[#1914001a] py-4 px-6 shadow-sm">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
                    <Link to="/" className="text-2xl font-black text-[#1b1b18] tracking-tighter">SEGER.</Link>
                    
                    <div className="flex-1 max-w-xl relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#706f6c]" size={18} />
                        <input 
                            type="text" 
                            placeholder="Cari sesuatu..." 
                            className="w-full bg-[#19140005] border border-[#1914001a] rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#1b1b18]"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        {isLoggedIn ? (
                            <>
                                {/* 1. Pilihan ke Admin/Panel */}
                                <Link to="/admin" className="hidden sm:flex items-center gap-2 px-4 py-2 bg-[#1b1b18] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#2b2b28] transition-all shadow-md">
                                    <LayoutDashboard size={16} />
                                    Panel {user.role === 'pembeli' ? 'User' : 'Toko'}
                                </Link>

                                {/* 2. Pilihan Keranjang / Pesanan */}
                                <button onClick={() => setShowCart(true)} className="p-2 hover:bg-[#1914000d] rounded-xl relative text-[#1b1b18]">
                                    <ShoppingBasket size={22} />
                                    {cart.length > 0 && <span className="absolute top-1 right-1 bg-red-600 text-white text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full">{cart.reduce((a,b) => a+b.quantity, 0)}</span>}
                                </button>

                                {/* 3. Pilihan Logout */}
                                <button onClick={handleLogout} className="p-2 text-[#706f6c] hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Logout">
                                    <LogOut size={20} />
                                </button>
                            </>
                        ) : (
                            <Link to="/login" className="bg-[#1b1b18] text-white px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                                <LogIn size={18} /> Masuk
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto p-6 lg:p-10">
                <div className="relative mb-12 p-8 rounded-3xl bg-[#1b1b18] text-white overflow-hidden shadow-2xl min-h-[180px] flex items-center">
                    <div className="relative z-10">
                        <h1 className="text-4xl font-black mb-2">SEGER GACOR!</h1>
                        <p className="text-white/60 text-sm">Marketplace kebutuhan kantor terpercaya.</p>
                    </div>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-6 mb-6">
                    {categories.map((cat) => (
                        <button key={cat} onClick={() => setCategory(cat)} className={`whitespace-nowrap px-6 py-2 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all ${category === cat ? 'bg-[#1b1b18] text-white' : 'bg-white text-[#706f6c] border-[#1914001a]'}`}>{cat}</button>
                    ))}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {loading ? [1,2,3,4,5].map(i => <div key={i} className="aspect-square bg-gray-100 rounded-3xl animate-pulse" />) :
                        products.map((product) => (
                            <div key={product.id} className="bg-white rounded-3xl border border-[#1914001a] p-3 hover:shadow-xl transition-all flex flex-col">
                                <div className="aspect-square bg-[#FDFDFC] rounded-2xl mb-3 flex items-center justify-center text-4xl border border-[#1914000d]">
                                    {product.image_url ? <img src={product.image_url} className="w-full h-full object-cover rounded-2xl" /> : product.emoji || '📦'}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-sm mb-1 truncate">{product.name}</h3>
                                    <div className="text-sm font-black text-[#1b1b18] mb-3">{formatCurrency(product.price)}</div>
                                </div>
                                <button onClick={() => addToCart(product)} className="w-full border-2 border-[#1b1b18] py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#1b1b18] hover:text-white transition-all">TAMBAH</button>
                            </div>
                        ))
                    }
                </div>
            </main>

            {/* Cart Drawer */}
            {showCart && (
                <div className="fixed inset-0 z-[60] flex justify-end">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCart(false)} />
                    <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right">
                        <div className="p-6 border-b flex items-center justify-between">
                            <h2 className="text-xl font-black uppercase tracking-tighter">Keranjang</h2>
                            <button onClick={() => setShowCart(false)}><X size={24} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {cart.map(item => (
                                <div key={item.id} className="flex gap-4 border-b pb-4">
                                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">{item.emoji || '📦'}</div>
                                    <div className="flex-1">
                                        <div className="font-bold">{item.name}</div>
                                        <div className="text-sm">{item.quantity} x {formatCurrency(item.price)}</div>
                                    </div>
                                    <button onClick={() => setCart(cart.filter(i => i.id !== item.id))} className="text-red-500"><Trash2 size={16} /></button>
                                </div>
                            ))}
                        </div>
                        {cart.length > 0 && (
                            <div className="p-6 border-t space-y-4">
                                <div className="flex justify-between font-black text-lg"><span>Total</span><span>{formatCurrency(cart.reduce((a,b)=>a+(b.price*b.quantity),0))}</span></div>
                                <button onClick={handleCheckout} className="w-full bg-[#1b1b18] text-white py-4 rounded-2xl font-black uppercase tracking-widest">Bayar Sekarang</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
