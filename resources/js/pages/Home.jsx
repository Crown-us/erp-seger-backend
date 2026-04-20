import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    Search, 
    ShoppingBasket, 
    Plus, 
    Minus, 
    X,
    ChevronRight,
    Store,
    Filter,
    ArrowRight,
    User,
    LogOut,
    LogIn
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
    
    // Check login status
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const isLoggedIn = !!localStorage.getItem('token');

    const categories = ['Semua', 'Sembako', 'Minuman', 'Camilan', 'Kebutuhan Rumah'];

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await api.get('/products');
            setProducts(response.data.data);
        } catch (err) {
            console.error('Failed to fetch products', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const addToCart = (product) => {
        if (!isLoggedIn) {
            alert('Silakan login terlebih dahulu untuk belanja!');
            navigate('/login');
            return;
        }

        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                return prev.map(item => 
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        
        try {
            // Simplified checkout logic for now
            const items = cart.map(item => ({ id: item.id, quantity: item.quantity }));
            await api.post('/orders/checkout', {
                items,
                payment_method: 'qris', // Default
            });
            
            alert('Pesanan berhasil dibuat! Silakan cek menu Pesanan Saya.');
            setCart([]);
            setShowCart(false);
            navigate('/admin/orders');
        } catch (err) {
            alert(err.response?.data?.message || 'Checkout gagal');
        }
    };

    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId, delta) => {
        setCart(prev => prev.map(item => {
            if (item.id === productId) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    const filteredProducts = products.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
        const matchCat = category === 'Semua' || p.category === category;
        return matchSearch && matchCat;
    });

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
    };

    return (
        <div className="min-h-screen bg-[#FDFDFC]">
            {/* Top Navigation ala Tokopedia */}
            <nav className="sticky top-0 z-40 bg-white border-b border-[#1914001a] py-4 px-6 shadow-sm">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
                    <Link to="/" className="text-2xl font-black text-[#1b1b18] tracking-tighter">SEGER.</Link>
                    
                    <div className="flex-1 max-w-2xl relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#706f6c]" size={18} />
                        <input 
                            type="text" 
                            placeholder="Cari kebutuhan harianmu di Seger..." 
                            className="w-full bg-[#19140005] border border-[#1914001a] rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#1b1b18] transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        {isLoggedIn ? (
                            <div className="flex items-center gap-3">
                                <Link to="/admin" className="p-2 hover:bg-[#1914000d] rounded-xl transition-all relative text-[#1b1b18]">
                                    <User size={22} />
                                    <span className="text-xs font-bold ml-2 hidden sm:inline">Hi, {user.name.split(' ')[0]}</span>
                                </Link>
                                <button onClick={() => setShowCart(true)} className="p-2 hover:bg-[#1914000d] rounded-xl transition-all relative text-[#1b1b18]">
                                    <ShoppingBasket size={22} />
                                    {totalItems > 0 && (
                                        <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">
                                            {totalItems}
                                        </span>
                                    )}
                                </button>
                            </div>
                        ) : (
                            <Link to="/login" className="bg-[#1b1b18] text-white px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#2b2b28] transition-all shadow-md">
                                <LogIn size={18} />
                                Masuk
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto p-6 lg:p-10">
                {/* Hero Banner */}
                <div className="relative mb-12 p-8 rounded-3xl bg-gradient-to-br from-[#1b1b18] to-[#3b3b38] text-white overflow-hidden shadow-2xl min-h-[220px] flex items-center">
                    <div className="relative z-10 max-w-xl">
                        <span className="bg-white/20 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4 inline-block">Official Marketplace</span>
                        <h1 className="text-4xl lg:text-5xl font-black mb-4 tracking-tighter leading-none">SEGER GACOR <br/><span className="text-white/50 italic">2026!</span></h1>
                        <p className="text-white/60 text-sm lg:text-base mb-0">Belanja sembako & minuman kantin kantor nggak perlu ribet. Seger terus setiap hari!</p>
                    </div>
                    {/* Decorative blobs */}
                    <div className="absolute top-[-40%] right-[-10%] w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-[-20%] left-[-10%] w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                </div>

                {/* Categories Tab */}
                <div className="flex gap-2 overflow-x-auto pb-6 no-scrollbar mb-4 border-b border-[#1914000d]">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`whitespace-nowrap px-6 py-2.5 rounded-2xl text-sm font-bold transition-all border ${
                                category === cat 
                                    ? 'bg-[#1b1b18] text-white border-[#1b1b18] shadow-lg scale-105' 
                                    : 'bg-white text-[#706f6c] border-[#1914001a] hover:border-[#1b1b18] hover:text-[#1b1b18]'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {loading ? (
                        [1,2,3,4,5,6,7,8,9,10].map(i => (
                            <div key={i} className="bg-white rounded-3xl border border-[#1914000d] p-4 animate-pulse shadow-sm">
                                <div className="aspect-square bg-[#1914000d] rounded-2xl mb-4"></div>
                                <div className="h-4 bg-[#1914000d] rounded w-3/4 mb-3"></div>
                                <div className="h-4 bg-[#1914000d] rounded w-1/2"></div>
                            </div>
                        ))
                    ) : filteredProducts.length === 0 ? (
                        <div className="col-span-full py-24 text-center">
                            <Store size={64} className="mx-auto mb-6 text-[#1914001a]" />
                            <h3 className="text-xl font-bold text-[#1b1b18]">Produk Belum Ada</h3>
                            <p className="text-[#706f6c]">Coba cari produk atau kategori lain ya bro.</p>
                        </div>
                    ) : filteredProducts.map((product) => (
                        <div 
                            key={product.id} 
                            className="group bg-white rounded-3xl border border-[#1914001a] p-3 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex flex-col relative"
                        >
                            <div className="aspect-square bg-[#FDFDFC] rounded-2xl mb-4 overflow-hidden border border-[#1914000d] relative shadow-inner">
                                {product.image_url ? (
                                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-5xl group-hover:scale-110 transition-transform duration-700 drop-shadow-lg">
                                        {product.emoji || '📦'}
                                    </div>
                                )}
                                {product.discount_percent > 0 && (
                                    <div className="absolute top-3 left-3 bg-[#1b1b18] text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-xl uppercase">
                                        -{product.discount_percent}% OFF
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex-1 px-1">
                                <div className="text-[10px] text-[#706f6c] uppercase font-black tracking-widest mb-1">{product.category}</div>
                                <h3 className="font-bold text-[#1b1b18] text-sm mb-1 line-clamp-2 leading-snug h-10">{product.name}</h3>
                                <div className="flex flex-col mb-4">
                                    <span className="text-base font-black text-[#1b1b18]">{formatCurrency(product.price)}</span>
                                    {product.discount_percent > 0 && (
                                        <span className="text-[11px] text-[#706f6c] line-through font-medium">{formatCurrency(product.original_price)}</span>
                                    )}
                                </div>
                            </div>

                            <button 
                                onClick={() => addToCart(product)}
                                className="w-full bg-white text-[#1b1b18] border-2 border-[#1b1b18] py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-[#1b1b18] hover:text-white transition-all shadow-sm active:scale-95"
                            >
                                TAMBAH
                            </button>
                        </div>
                    ))}
                </div>
            </main>

            {/* Cart Button */}
            {totalItems > 0 && (
                <div className="fixed bottom-10 right-10 z-50">
                    <button 
                        onClick={() => setShowCart(true)}
                        className="bg-[#1b1b18] text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform relative group"
                    >
                        <ShoppingBasket size={28} />
                        <span className="absolute -top-1 -right-1 bg-red-600 text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full border-2 border-white">
                            {totalItems}
                        </span>
                    </button>
                </div>
            )}

            {/* Cart Modal Sidebar */}
            {showCart && (
                <div className="fixed inset-0 z-[60] overflow-hidden">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setShowCart(false)} />
                    <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-[#1914001a]">
                        <div className="p-8 border-b border-[#1914001a] flex items-center justify-between bg-[#FDFDFC]">
                            <div className="flex items-center gap-4 text-[#1b1b18]">
                                <ShoppingBasket size={32} />
                                <h2 className="text-2xl font-black tracking-tighter uppercase">Keranjang</h2>
                            </div>
                            <button onClick={() => setShowCart(false)} className="p-2 hover:bg-[#1914000d] rounded-2xl transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-8">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-[#706f6c]">
                                    <Store size={80} className="opacity-10 mb-6" />
                                    <p className="font-bold text-lg">Keranjang masih sepi bro.</p>
                                    <button 
                                        onClick={() => setShowCart(false)}
                                        className="mt-6 text-[#1b1b18] font-black uppercase text-sm flex items-center gap-3 border-b-2 border-[#1b1b18] pb-1"
                                    >
                                        Mulai Belanja <ArrowRight size={20} />
                                    </button>
                                </div>
                            ) : (
                                cart.map((item) => (
                                    <div key={item.id} className="flex gap-6 group relative">
                                        <div className="w-24 h-24 rounded-3xl bg-[#FDFDFC] border border-[#1914001a] flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                                            {item.image_url ? (
                                                <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-4xl">{item.emoji || '📦'}</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="font-black text-[#1b1b18] truncate pr-4 text-base">{item.name}</h3>
                                                <button onClick={() => removeFromCart(item.id)} className="text-[#706f6c] hover:text-red-600 transition-colors">
                                                    <X size={18} />
                                                </button>
                                            </div>
                                            <div className="text-lg font-black text-[#1b1b18] mb-4">{formatCurrency(item.price)}</div>
                                            <div className="flex items-center gap-4 bg-[#19140005] border border-[#1914000d] w-fit rounded-2xl px-4 py-1.5 shadow-sm">
                                                <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:text-[#1b1b18] text-[#706f6c]">
                                                    <Minus size={18} />
                                                </button>
                                                <span className="text-base font-black min-w-[30px] text-center text-[#1b1b18]">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:text-[#1b1b18] text-[#706f6c]">
                                                    <Plus size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div className="p-8 border-t border-[#1914001a] bg-[#FDFDFC] space-y-6">
                                <div className="flex justify-between text-base">
                                    <span className="text-[#706f6c] font-bold uppercase tracking-widest">Subtotal</span>
                                    <span className="font-black text-xl">{formatCurrency(totalPrice)}</span>
                                </div>
                                <button 
                                    onClick={handleCheckout}
                                    className="w-full bg-[#1b1b18] text-white py-5 rounded-[2rem] font-black uppercase tracking-widest flex items-center justify-center gap-4 shadow-2xl hover:bg-[#2b2b28] hover:scale-[1.02] transition-all"
                                >
                                    Bayar Sekarang
                                    <ArrowRight size={24} />
                                </button>
                                <p className="text-[10px] text-center text-[#706f6c] font-medium leading-relaxed px-6 italic">Pesananmu akan langsung dikirim ke meja kerjamu oleh kurir Seger.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
