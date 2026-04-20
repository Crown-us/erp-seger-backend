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
    Flame,
    ShieldCheck,
    MapPin,
    Zap,
    Trophy,
    Heart,
    CreditCard,
    QrCode
} from 'lucide-react';
import api from '../lib/axios';

const Home = () => {
    // --- LOGIC ---
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('Semua');
    const [cart, setCart] = useState([]);
    const [showCart, setShowCart] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('qris'); // Default
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    
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

        // Validasi Alamat (Sangat Penting)
        if (!user.workplace_id && !user.workplace_address) {
            alert('Waduh bro, alamat pengirimanmu belum diset! \n\nSilakan masuk ke Panel User > Edit Profil buat milih Lokasi Kerja (PT) kamu dulu ya.');
            navigate('/admin/profile');
            return;
        }
        
        setCheckoutLoading(true);
        try {
            const items = cart.map(item => ({ id: item.id, quantity: item.quantity }));
            await api.post('/orders/checkout', { 
                items, 
                payment_method: paymentMethod 
            });
            
            alert('GACOR! Pesananmu sudah masuk. \n\nSilakan cek status pengiriman di menu Pesanan Saya.');
            setCart([]);
            setShowCart(false);
            navigate('/admin/orders');
        } catch (err) {
            alert(err.response?.data?.message || 'Checkout gagal. Coba cek lagi datamu bro.');
        } finally {
            setCheckoutLoading(false);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
    };

    return (
        <div className="min-h-screen bg-[#FDFDFC] text-[#1b1b18] font-sans selection:bg-[#1b1b18] selection:text-white">
            
            {/* Navbar Premium */}
            <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-[#1914000d] py-5 px-6 lg:px-12">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
                    <Link to="/" className="text-3xl font-black tracking-tighter hover:scale-105 transition-transform uppercase italic">SEGER<span className="text-[#706f6c]">.</span></Link>
                    
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
                
                {/* Hero Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
                    <div className="space-y-8 animate-in slide-in-from-left duration-700">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 shadow-sm">
                            <Flame size={16} className="animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Paling Gacor di Kantor</span>
                        </div>
                        <h1 className="text-6xl lg:text-[7rem] font-black leading-[0.85] tracking-tighter uppercase italic text-[#1b1b18]">
                            SEGER <br /> 
                            <span className="text-[#1b1b18]/20 not-italic tracking-[-0.05em]">GACOR!</span>
                        </h1>
                        <p className="text-lg text-[#706f6c] font-medium max-w-md leading-relaxed">
                            Marketplace resmi buat kamu yang mau jajan seger tanpa ribet keluar kantor. Tinggal klik, kurir gas pol!
                        </p>
                        <div className="flex items-center gap-6">
                            <button onClick={() => document.getElementById('products-grid').scrollIntoView({ behavior: 'smooth' })} className="bg-[#1b1b18] text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-[0_20px_40px_-5px_rgba(0,0,0,0.3)] flex items-center gap-4 active:scale-95 group">
                                Beli Sekarang <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
                            </button>
                        </div>
                    </div>

                    <div className="relative hidden lg:block animate-in fade-in zoom-in duration-1000">
                        <div className="aspect-square bg-white/40 backdrop-blur-sm rounded-[5rem] relative flex items-center justify-center p-12 border border-white/50 shadow-inner">
                            <div className="absolute top-0 -right-12 bg-white p-5 rounded-[2rem] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15)] flex items-center gap-4 animate-bounce duration-[4000ms] z-20 border border-[#19140005]">
                                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center shadow-inner"><Clock size={24} strokeWidth={3} /></div>
                                <div><div className="text-[10px] font-black uppercase tracking-widest text-[#706f6c]">Express</div><div className="text-sm font-black italic">15 Menit</div></div>
                            </div>
                            <div className="absolute top-1/2 -left-16 bg-white p-5 rounded-[2.5rem] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15)] flex items-center gap-4 animate-pulse z-20 border border-[#19140005]">
                                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner"><ShieldCheck size={24} strokeWidth={3} /></div>
                                <div><div className="text-[10px] font-black uppercase tracking-widest text-[#706f6c]">Official</div><div className="text-sm font-black italic">100% Seger</div></div>
                            </div>
                            <div className="w-full h-full bg-white rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] flex flex-col p-12 relative z-10 border border-[#19140005] overflow-hidden group/card">
                                <div className="flex items-center justify-between mb-10">
                                    <div className="w-20 h-20 bg-[#1b1b18] rounded-[1.5rem] flex items-center justify-center text-white text-4xl shadow-[0_20px_30px_-5px_rgba(0,0,0,0.3)]">📦</div>
                                    <div className="text-right">
                                        <div className="text-3xl font-black italic tracking-tighter leading-none text-[#1b1b18]">SEGER.</div>
                                        <div className="text-[11px] font-black uppercase tracking-widest text-[#706f6c] mt-1">Market Service</div>
                                    </div>
                                </div>
                                <div className="space-y-8 flex-1">
                                    <div className="flex items-center gap-5"><div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl shadow-inner">🍎</div><div className="space-y-2 flex-1"><div className="h-4 bg-[#1b1b18]/10 rounded-full w-full"></div><div className="h-2.5 bg-[#1b1b18]/5 rounded-full w-1/2"></div></div></div>
                                    <div className="flex items-center gap-5"><div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-2xl shadow-inner">🥛</div><div className="space-y-2 flex-1"><div className="h-4 bg-[#1b1b18]/10 rounded-full w-[85%]"></div><div className="h-2.5 bg-[#1b1b18]/5 rounded-full w-1/3"></div></div></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Categories */}
                <div className="flex items-center justify-between mb-12 border-b border-[#1914001a] pb-8 overflow-x-auto no-scrollbar gap-8">
                    <div className="flex gap-4">
                        {categories.map((cat) => (
                            <button key={cat} onClick={() => setCategory(cat)} className={`whitespace-nowrap px-10 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all ${category === cat ? 'bg-[#1b1b18] text-white shadow-[0_20px_40px_-10px_rgba(0,0,0,0.4)] scale-110' : 'bg-white text-[#706f6c] border border-[#1914001a] hover:border-[#1b1b18]'}`}>{cat}</button>
                        ))}
                    </div>
                </div>

                {/* Product Grid */}
                <div id="products-grid" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-10">
                    {loading ? [1,2,3,4,5,6,7,8].map(i => <div key={i} className="aspect-[4/5] bg-gray-50 rounded-[3rem] animate-pulse" />) :
                        products.map((product) => (
                            <div key={product.id} className="group bg-white rounded-[3rem] border border-[#1914000d] p-5 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] transition-all duration-700 flex flex-col hover:-translate-y-4 relative overflow-hidden">
                                <div className="aspect-square bg-[#FDFDFC] rounded-[2.5rem] mb-6 flex items-center justify-center text-6xl border border-[#19140005] shadow-inner relative overflow-hidden group-hover:shadow-none transition-all">
                                    {product.image_url ? <img src={product.image_url} className="w-full h-full object-cover rounded-[2.5rem] group-hover:scale-125 transition-transform duration-1000" /> : <div className="group-hover:scale-125 transition-transform duration-1000 drop-shadow-2xl">{product.emoji || '📦'}</div>}
                                </div>
                                <div className="flex-1 px-2">
                                    <div className="flex items-center gap-2 mb-3"><span className="text-[9px] font-black uppercase tracking-widest text-[#706f6c] bg-[#19140005] px-3 py-1 rounded-full">{product.category}</span></div>
                                    <h3 className="font-black text-[#1b1b18] text-lg mb-2 line-clamp-1 leading-tight group-hover:text-[#1b1b18] transition-colors uppercase tracking-tight">{product.name}</h3>
                                    <div className="flex items-end justify-between mb-6">
                                        <div className="flex flex-col"><div className="text-xl font-black text-[#1b1b18] leading-none mb-1 italic">{formatCurrency(product.price)}</div></div>
                                        <div className="text-[9px] font-black text-[#706f6c]/40 uppercase tracking-widest italic">{product.stock} Tersisa</div>
                                    </div>
                                </div>
                                <button onClick={() => addToCart(product)} className="w-full bg-[#1b1b18] text-white py-5 rounded-[1.8rem] text-[11px] font-black uppercase tracking-[0.25em] shadow-lg hover:bg-[#2b2b28] transition-all active:scale-95 flex items-center justify-center gap-3 group/btn">
                                    <Plus size={16} strokeWidth={4} className="group-hover/btn:rotate-90 transition-transform" /> BELI
                                </button>
                            </div>
                        ))
                    }
                </div>
            </main>

            {/* Float Cart Button */}
            {cart.length > 0 && !showCart && (
                <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 duration-700">
                    <button onClick={() => setShowCart(true)} className="bg-[#1b1b18] text-white px-10 py-6 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] flex items-center gap-8 hover:scale-105 active:scale-95 transition-all group border border-white/10">
                        <div className="flex items-center gap-4"><div className="p-3 bg-white/10 rounded-2xl"><ShoppingBasket size={28} strokeWidth={2.5} /></div><div className="text-left"><div className="text-[10px] font-black uppercase tracking-widest text-white/40 leading-none mb-1">Cek Keranjang</div><div className="text-2xl font-black leading-none italic">{formatCurrency(cart.reduce((a,b)=>a+(b.price*b.quantity),0))}</div></div></div>
                        <div className="h-10 w-[1px] bg-white/20"></div>
                        <div className="flex items-center gap-2 text-sm font-black uppercase tracking-widest">Checkout <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" /></div>
                    </button>
                </div>
            )}

            {/* Cart Drawer WITH PAYMENT OPTIONS */}
            {showCart && (
                <div className="fixed inset-0 z-[60] overflow-hidden">
                    <div className="absolute inset-0 bg-[#1b1b182a] backdrop-blur-xl transition-opacity duration-500" onClick={() => setShowCart(false)} />
                    <div className="absolute inset-y-0 right-0 max-w-lg w-full bg-white shadow-[-50px_0_100px_-20px_rgba(0,0,0,0.2)] flex flex-col animate-in slide-in-from-right duration-700 rounded-l-[4rem] border-l border-white/50">
                        <div className="p-12 border-b border-[#1914000d] flex items-center justify-between bg-[#FDFDFC]/50">
                            <div className="flex items-center gap-5"><div className="w-16 h-16 bg-[#1b1b18] rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl rotate-3"><ShoppingBasket size={32} strokeWidth={2.5} /></div><h2 className="text-4xl font-black uppercase tracking-tighter italic leading-none">KERANJANG<br/><span className="text-[#706f6c] text-[10px] not-italic tracking-[0.4em] font-black uppercase ml-1">My Shopping Bag</span></h2></div>
                            <button onClick={() => setShowCart(false)} className="p-4 hover:bg-[#1914000d] rounded-3xl transition-all active:scale-75 border border-[#1914000a]"><X size={32} strokeWidth={3} /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-12 space-y-10 scrollbar-hide">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-8"><div className="w-40 h-40 bg-[#19140005] rounded-full flex items-center justify-center animate-pulse"><Store size={80} className="opacity-10" /></div><div className="space-y-3"><p className="font-black text-2xl uppercase tracking-tighter italic">Laper atau haus bro?</p><p className="text-sm text-[#706f6c] font-medium px-16 leading-relaxed">Isi keranjangmu dengan pilihan menu seger yang ada di kantin.</p></div></div>
                            ) : (
                                <>
                                    <div className="space-y-8">
                                        {cart.map(item => (
                                            <div key={item.id} className="flex gap-8 group animate-in slide-in-from-right duration-500">
                                                <div className="w-32 h-32 bg-[#FDFDFC] rounded-[2rem] border border-[#1914000d] flex items-center justify-center text-5xl shadow-inner shrink-0 relative overflow-hidden group-hover:shadow-2xl transition-all duration-500">{item.image_url ? <img src={item.image_url} className="w-full h-full object-cover" /> : item.emoji || '📦'}</div>
                                                <div className="flex-1 flex flex-col justify-center">
                                                    <div className="flex justify-between items-start mb-2"><h3 className="font-black text-[#1b1b18] truncate pr-6 text-xl tracking-tight uppercase italic leading-none">{item.name}</h3><button onClick={() => setCart(cart.filter(i => i.id !== item.id))} className="text-[#706f6c]/30 hover:text-red-600 transition-all active:scale-75 p-1"><Trash2 size={22} /></button></div>
                                                    <div className="text-2xl font-black text-[#1b1b18] mb-6 leading-none tracking-tighter">{formatCurrency(item.price)}</div>
                                                    <div className="flex items-center gap-6 bg-[#19140005] w-fit rounded-[1.5rem] px-6 py-3 shadow-inner border border-[#1914000d]"><button onClick={() => setCart(prev => prev.map(i => i.id === item.id ? {...i, quantity: Math.max(1, i.quantity - 1)} : i))} className="p-1 hover:text-[#1b1b18] transition-all"><Minus size={20} strokeWidth={4} /></button><span className="text-xl font-black min-w-[30px] text-center italic">{item.quantity}</span><button onClick={() => setCart(prev => prev.map(i => i.id === item.id ? {...i, quantity: i.quantity + 1} : i))} className="p-1 hover:text-[#1b1b18] transition-all"><Plus size={20} strokeWidth={4} /></button></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* PAYMENT OPTIONS AREA */}
                                    <div className="pt-10 border-t border-[#1914001a] space-y-6">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#706f6c] ml-1">Pilih Pembayaran</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button 
                                                onClick={() => setPaymentMethod('qris')}
                                                className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 ${paymentMethod === 'qris' ? 'border-[#1b1b18] bg-[#1b1b18] text-white shadow-xl scale-105' : 'border-[#1914000d] bg-white text-[#706f6c]'}`}
                                            >
                                                <QrCode size={32} strokeWidth={paymentMethod === 'qris' ? 3 : 2} />
                                                <span className="text-[10px] font-black uppercase tracking-widest italic">QRIS Gacor</span>
                                            </button>
                                            <button 
                                                onClick={() => setPaymentMethod('bank_jatim')}
                                                className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 ${paymentMethod === 'bank_jatim' ? 'border-[#1b1b18] bg-[#1b1b18] text-white shadow-xl scale-105' : 'border-[#1914000d] bg-white text-[#706f6c]'}`}
                                            >
                                                <CreditCard size={32} strokeWidth={paymentMethod === 'bank_jatim' ? 3 : 2} />
                                                <span className="text-[10px] font-black uppercase tracking-widest italic">Bank Jatim</span>
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div className="p-12 border-t border-[#1914000d] bg-white space-y-8 rounded-t-[4rem] shadow-[0_-30px_80px_-20px_rgba(0,0,0,0.1)]">
                                <div className="space-y-4">
                                    <div className="flex justify-between text-xs font-black uppercase tracking-[0.3em] text-[#706f6c]"><span>Total Belanja</span><span>{cart.length} Items</span></div>
                                    <div className="flex justify-between text-4xl font-black italic tracking-tighter leading-none pt-2"><span>Total</span><span className="text-[#1b1b18]">{formatCurrency(cart.reduce((a,b)=>a+(b.price*b.quantity),0))}</span></div>
                                </div>
                                <button 
                                    onClick={handleCheckout} 
                                    disabled={checkoutLoading}
                                    className="w-full bg-[#1b1b18] text-white py-8 rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-sm shadow-[0_30px_60px_-10px_rgba(0,0,0,0.4)] hover:bg-[#2b2b28] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-6 group disabled:opacity-50"
                                >
                                    {checkoutLoading ? <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div> : (
                                        <>Bayar Sekarang <ArrowRight size={32} strokeWidth={3} className="group-hover:translate-x-3 transition-transform" /></>
                                    )}
                                </button>
                                <div className="flex items-center justify-center gap-3 opacity-30"><ShieldCheck size={16} /><span className="text-[10px] font-black uppercase tracking-[0.2em]">Secure Checkout by Seger</span></div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
