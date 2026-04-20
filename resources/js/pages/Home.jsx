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
    Trash2,
    Star,
    Clock,
    Flame
} from 'lucide-react';
import api from '../lib/axios';

const Home = () => {
    // --- LOGIC TETAP SAMA ---
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
        try { await api.post('/logout'); } catch (e) {}
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

    // --- TAMPILAN DRIBBBLE STYLE ---
    return (
        <div className="min-h-screen bg-[#FDFDFC] text-[#1b1b18] font-sans selection:bg-[#1b1b18] selection:text-white">
            
            {/* Navbar Premium */}
            <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-[#1914000d] py-5 px-6 lg:px-12">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
                    <Link to="/" className="text-3xl font-black tracking-tighter hover:scale-105 transition-transform">SEGER<span className="text-[#706f6c]">.</span></Link>
                    
                    <div className="flex-1 max-w-2xl relative group hidden md:block">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#706f6c] group-focus-within:text-[#1b1b18] transition-colors" size={20} />
                        <input 
                            type="text" 
                            placeholder="Cari sesuatu yang seger hari ini..." 
                            className="w-full bg-[#19140005] border-none rounded-[1.5rem] py-3 pl-12 pr-6 text-sm focus:outline-none focus:ring-2 focus:ring-[#1b1b181a] transition-all placeholder:text-[#706f6c]/50 font-medium"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        {isLoggedIn ? (
                            <>
                                <Link to="/admin" className="flex items-center gap-2 px-5 py-2.5 bg-[#1b1b18] text-white rounded-[1.2rem] text-[10px] font-black uppercase tracking-[0.15em] hover:bg-[#2b2b28] transition-all shadow-[0_10px_20px_-5px_rgba(0,0,0,0.2)] active:scale-95">
                                    <LayoutDashboard size={16} strokeWidth={2.5} />
                                    <span className="hidden lg:block">Panel {user.role === 'pembeli' ? 'User' : 'Toko'}</span>
                                </Link>

                                <button onClick={() => setShowCart(true)} className="p-3 bg-[#19140005] hover:bg-[#1b1b18] hover:text-white rounded-[1.2rem] relative transition-all group active:scale-95 shadow-sm">
                                    <ShoppingBasket size={22} strokeWidth={2} />
                                    {cart.length > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-in zoom-in group-hover:scale-110 transition-transform">
                                            {cart.reduce((a,b) => a+b.quantity, 0)}
                                        </span>
                                    )}
                                </button>

                                <button onClick={handleLogout} className="p-3 text-[#706f6c] hover:text-red-600 hover:bg-red-50 rounded-[1.2rem] transition-all active:scale-95" title="Logout">
                                    <LogOut size={22} />
                                </button>
                            </>
                        ) : (
                            <Link to="/login" className="bg-[#1b1b18] text-white px-7 py-3 rounded-[1.2rem] text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-[#2b2b28] shadow-xl active:scale-95 transition-all">
                                <LogIn size={18} strokeWidth={2.5} /> Masuk
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
                
                {/* Hero Section Dribbble Style */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
                    <div className="space-y-8 animate-in slide-in-from-left duration-700">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 shadow-sm animate-bounce">
                            <Flame size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Lagi Hits Bro!</span>
                        </div>
                        <h1 className="text-6xl lg:text-8xl font-black leading-[0.9] tracking-tighter">
                            SEGER <br /> 
                            <span className="text-[#706f6c] italic">MARKET.</span>
                        </h1>
                        <p className="text-lg text-[#706f6c] font-medium max-w-md leading-relaxed">
                            Kebutuhan kantor paling lengkap, seger, dan gacor. Siap antar sampe meja kerjamu!
                        </p>
                        <div className="flex items-center gap-4">
                            <button className="bg-[#1b1b18] text-white px-8 py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-2xl flex items-center gap-3 active:scale-95">
                                Belanja Sekarang <ArrowRight size={20} />
                            </button>
                            <div className="flex -space-x-4">
                                {[1,2,3].map(i => <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-sm"><img src={`https://i.pravatar.cc/100?img=${i+10}`} /></div>)}
                                <div className="w-12 h-12 rounded-full border-4 border-white bg-[#1b1b18] text-white flex items-center justify-center text-[10px] font-black italic">+2k</div>
                            </div>
                        </div>
                    </div>
                    <div className="relative hidden lg:block animate-in fade-in zoom-in duration-1000">
                        <div className="aspect-square bg-gradient-to-br from-[#1b1b180a] to-transparent rounded-[4rem] relative overflow-hidden flex items-center justify-center p-12">
                            <Store size={240} className="text-[#1b1b18] opacity-10 absolute -rotate-12 -bottom-10 -right-10" />
                            <div className="w-full h-full bg-white rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] flex flex-col p-10 relative z-10">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="w-16 h-16 bg-[#1b1b18] rounded-2xl flex items-center justify-center text-white text-3xl">📦</div>
                                    <div className="text-right">
                                        <div className="text-2xl font-black italic tracking-tighter leading-none">SEGER</div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-[#706f6c]">Delivery Service</div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="h-4 bg-[#1b1b180d] rounded-full w-full"></div>
                                    <div className="h-4 bg-[#1b1b180d] rounded-full w-3/4"></div>
                                    <div className="h-4 bg-[#1b1b180d] rounded-full w-1/2"></div>
                                </div>
                                <div className="mt-auto flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Star size={18} fill="#1b1b18" className="text-[#1b1b18]" />
                                        <span className="font-black">4.9</span>
                                    </div>
                                    <div className="px-4 py-2 bg-white border border-[#1914001a] rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">Official</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Categories Tab Premium */}
                <div className="flex items-center justify-between mb-10 border-b border-[#1914001a] pb-6 overflow-x-auto no-scrollbar gap-8">
                    <div className="flex gap-3">
                        {categories.map((cat) => (
                            <button 
                                key={cat} 
                                onClick={() => setCategory(cat)} 
                                className={`whitespace-nowrap px-8 py-3.5 rounded-[1.2rem] text-xs font-black uppercase tracking-widest transition-all ${
                                    category === cat 
                                        ? 'bg-[#1b1b18] text-white shadow-[0_15px_30px_-10px_rgba(0,0,0,0.3)] scale-105' 
                                        : 'bg-white text-[#706f6c] border border-[#1914001a] hover:border-[#1b1b18] hover:text-[#1b1b18]'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product Grid Premium Card */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                    {loading ? [1,2,3,4,5,6,7,8].map(i => (
                        <div key={i} className="aspect-[4/5] bg-gray-50 rounded-[2.5rem] animate-pulse" />
                    )) :
                        products.map((product) => (
                            <div key={product.id} className="group bg-white rounded-[2.5rem] border border-[#1914000d] p-4 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 flex flex-col hover:-translate-y-3 relative overflow-hidden">
                                <div className="aspect-square bg-[#FDFDFC] rounded-[2rem] mb-5 flex items-center justify-center text-5xl border border-[#19140005] shadow-inner relative overflow-hidden group-hover:shadow-none transition-all">
                                    {product.image_url ? (
                                        <img src={product.image_url} className="w-full h-full object-cover rounded-[2rem] group-hover:scale-110 transition-transform duration-700" />
                                    ) : (
                                        <div className="group-hover:scale-110 transition-transform duration-700 drop-shadow-2xl">{product.emoji || '📦'}</div>
                                    )}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                                </div>
                                <div className="flex-1 px-2">
                                    <div className="flex items-center gap-2 mb-2 text-[10px] font-black uppercase tracking-widest text-[#706f6c]/60">
                                        <span className="px-2 py-0.5 bg-[#19140005] rounded-full">{product.category}</span>
                                        <div className="flex items-center gap-1">
                                            <Star size={10} fill="#1b1b18" className="text-[#1b1b18]" />
                                            <span>4.5</span>
                                        </div>
                                    </div>
                                    <h3 className="font-black text-[#1b1b18] text-base mb-2 line-clamp-1 leading-tight group-hover:text-[#1b1b18] transition-colors">{product.name}</h3>
                                    <div className="flex items-end justify-between mb-4">
                                        <div className="flex flex-col">
                                            <div className="text-lg font-black text-[#1b1b18] leading-none mb-1">{formatCurrency(product.price)}</div>
                                            {product.discount_percent > 0 && <span className="text-[10px] text-[#706f6c] line-through font-bold">-{product.discount_percent}%</span>}
                                        </div>
                                        <div className="text-[10px] font-black text-[#706f6c] bg-[#19140005] px-2 py-1 rounded-lg">Stok: {product.stock}</div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => addToCart(product)} 
                                    className="w-full bg-[#1b1b18] text-white py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-lg hover:bg-[#2b2b28] hover:shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <Plus size={14} strokeWidth={3} />
                                    BELI
                                </button>
                            </div>
                        ))
                    }
                </div>
            </main>

            {/* Float Cart Button Premium */}
            {cart.length > 0 && !showCart && (
                <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 duration-500">
                    <button 
                        onClick={() => setShowCart(true)}
                        className="bg-[#1b1b18] text-white px-8 py-5 rounded-[2rem] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] flex items-center gap-6 hover:scale-105 active:scale-95 transition-all group border border-white/10"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/10 rounded-xl">
                                <ShoppingBasket size={24} strokeWidth={2.5} />
                            </div>
                            <div className="text-left">
                                <div className="text-[9px] font-black uppercase tracking-widest text-white/50 leading-none">Total Pesanan</div>
                                <div className="text-lg font-black leading-none">{formatCurrency(cart.reduce((a,b)=>a+(b.price*b.quantity),0))}</div>
                            </div>
                        </div>
                        <div className="h-8 w-[1px] bg-white/20"></div>
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                            Checkout <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </button>
                </div>
            )}

            {/* Cart Drawer Premium Style */}
            {showCart && (
                <div className="fixed inset-0 z-[60] overflow-hidden">
                    <div className="absolute inset-0 bg-[#1b1b181a] backdrop-blur-md transition-opacity" onClick={() => setShowCart(false)} />
                    <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-[-50px_0_100px_-20px_rgba(0,0,0,0.1)] flex flex-col animate-in slide-in-from-right duration-500 rounded-l-[3rem]">
                        <div className="p-10 border-b border-[#1914000d] flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-[#1b1b18] rounded-2xl flex items-center justify-center text-white shadow-lg">
                                    <ShoppingBasket size={28} />
                                </div>
                                <h2 className="text-3xl font-black uppercase tracking-tighter leading-none">Keranjang<br/><span className="text-[#706f6c] text-sm tracking-widest">Saya</span></h2>
                            </div>
                            <button onClick={() => setShowCart(false)} className="p-3 hover:bg-[#1914000d] rounded-2xl transition-all active:scale-90"><X size={28} /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-hide">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                                    <div className="w-32 h-32 bg-[#19140005] rounded-full flex items-center justify-center">
                                        <Store size={64} className="opacity-10" />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="font-black text-xl uppercase tracking-tighter italic">Belum ada barang, bro!</p>
                                        <p className="text-sm text-[#706f6c] font-medium px-10">Isi perutmu dulu dengan jajanan seger dari kantin kami.</p>
                                    </div>
                                </div>
                            ) : (
                                cart.map(item => (
                                    <div key={item.id} className="flex gap-6 group animate-in slide-in-from-right duration-300">
                                        <div className="w-24 h-24 bg-[#FDFDFC] rounded-[1.5rem] border border-[#1914000d] flex items-center justify-center text-4xl shadow-inner shrink-0 relative overflow-hidden">
                                            {item.image_url ? <img src={item.image_url} className="w-full h-full object-cover" /> : item.emoji || '📦'}
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="font-black text-[#1b1b18] truncate pr-4 text-base tracking-tight">{item.name}</h3>
                                                <button onClick={() => setCart(cart.filter(i => i.id !== item.id))} className="text-[#706f6c] hover:text-red-600 transition-all active:scale-90"><Trash2 size={18} /></button>
                                            </div>
                                            <div className="text-lg font-black text-[#1b1b18] mb-4 leading-none">{formatCurrency(item.price)}</div>
                                            <div className="flex items-center gap-4 bg-[#19140005] w-fit rounded-xl px-4 py-2 shadow-sm border border-[#1914000d]">
                                                <button onClick={() => setCart(prev => prev.map(i => i.id === item.id ? {...i, quantity: Math.max(1, i.quantity - 1)} : i))} className="p-1 hover:text-[#1b1b18] transition-all"><Minus size={16} strokeWidth={3} /></button>
                                                <span className="text-sm font-black min-w-[25px] text-center">{item.quantity}</span>
                                                <button onClick={() => setCart(prev => prev.map(i => i.id === item.id ? {...i, quantity: i.quantity + 1} : i))} className="p-1 hover:text-[#1b1b18] transition-all"><Plus size={16} strokeWidth={3} /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div className="p-10 border-t border-[#1914000d] bg-[#FDFDFC] space-y-6 rounded-t-[3rem] shadow-[0_-20px_50px_-10px_rgba(0,0,0,0.05)]">
                                <div className="space-y-3">
                                    <div className="flex justify-between text-xs font-black uppercase tracking-[0.2em] text-[#706f6c]"><span>Subtotal</span><span>{formatCurrency(cart.reduce((a,b)=>a+(b.price*b.quantity),0))}</span></div>
                                    <div className="flex justify-between text-2xl font-black italic tracking-tighter"><span>Total Bayar</span><span className="text-[#1b1b18]">{formatCurrency(cart.reduce((a,b)=>a+(b.price*b.quantity),0))}</span></div>
                                </div>
                                <button onClick={handleCheckout} className="w-full bg-[#1b1b18] text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm shadow-[0_20px_50px_-10px_rgba(0,0,0,0.4)] hover:bg-[#2b2b28] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 group">
                                    Bayar Sekarang
                                    <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                                </button>
                                <p className="text-[9px] text-center text-[#706f6c] font-black uppercase tracking-widest opacity-50 px-8">Pengiriman super cepat langsung oleh kurir Seger Gacor!</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
