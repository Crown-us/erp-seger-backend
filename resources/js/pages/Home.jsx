import React, { useState, useEffect } from 'react';
import { 
    Search, 
    ShoppingBasket, 
    Plus, 
    Minus, 
    X,
    ChevronRight,
    Store,
    Filter,
    ArrowRight
} from 'lucide-react';
import api from '../lib/axios';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('Semua');
    const [cart, setCart] = useState([]);
    const [showCart, setShowCart] = useState(false);

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
        <div className="pb-24">
            {/* Header / Hero */}
            <div className="relative mb-8 p-6 rounded-2xl bg-[#1b1b18] text-white overflow-hidden shadow-xl">
                <div className="relative z-10 max-w-lg">
                    <h1 className="text-3xl font-bold mb-2">Seger Marketplace</h1>
                    <p className="text-white/70 text-sm mb-6">Pesan kebutuhan harianmu langsung dari kantin kantor. Lebih cepat, lebih seger!</p>
                    
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                        <input 
                            type="text" 
                            placeholder="Cari makanan, minuman..." 
                            className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:bg-white/20 transition-all placeholder:text-white/40"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
                {/* Decorative circles */}
                <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-10%] left-[-5%] w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            </div>

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar -mx-1 px-1 mb-6">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-all border ${
                            category === cat 
                                ? 'bg-[#1b1b18] text-white border-[#1b1b18]' 
                                : 'bg-white text-[#706f6c] border-[#1914001a] hover:border-[#1b1b18]'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {loading ? (
                    [1,2,3,4,5,6,7,8].map(i => (
                        <div key={i} className="bg-white rounded-2xl border border-[#1914001a] p-3 animate-pulse">
                            <div className="aspect-square bg-[#1914000d] rounded-xl mb-3"></div>
                            <div className="h-4 bg-[#1914000d] rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-[#1914000d] rounded w-1/2"></div>
                        </div>
                    ))
                ) : filteredProducts.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-[#706f6c]">
                        <Store size={48} className="mx-auto mb-4 opacity-20" />
                        <p className="text-lg font-medium">Wah, produknya nggak ketemu nih.</p>
                        <p className="text-sm">Coba cari kata kunci lain ya.</p>
                    </div>
                ) : filteredProducts.map((product) => (
                    <div 
                        key={product.id} 
                        className="group bg-white rounded-2xl border border-[#1914001a] p-3 hover:shadow-lg transition-all hover:border-[#1b1b1800] relative flex flex-col"
                    >
                        <div className="aspect-square bg-[#FDFDFC] rounded-xl mb-3 overflow-hidden border border-[#1914000d] relative">
                            {product.image_url ? (
                                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-500">
                                    {product.emoji || '📦'}
                                </div>
                            )}
                            {product.discount_percent > 0 && (
                                <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                                    -{product.discount_percent}%
                                </div>
                            )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <div className="text-[10px] text-[#706f6c] uppercase tracking-wider font-bold mb-1">{product.category}</div>
                            <h3 className="font-semibold text-[#1b1b18] text-sm mb-1 truncate">{product.name}</h3>
                            <div className="flex items-baseline gap-2 mb-3">
                                <span className="text-sm font-bold text-[#1b1b18]">{formatCurrency(product.price)}</span>
                                {product.discount_percent > 0 && (
                                    <span className="text-[10px] text-[#706f6c] line-through">{formatCurrency(product.original_price)}</span>
                                )}
                            </div>
                        </div>

                        <button 
                            onClick={() => addToCart(product)}
                            className="w-full bg-[#1b1b18] text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#2b2b28] transition-all"
                        >
                            <Plus size={14} />
                            Tambah
                        </button>
                    </div>
                ))}
            </div>

            {/* Floating Cart Button (Mobile-ish) */}
            {totalItems > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md z-40 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <button 
                        onClick={() => setShowCart(true)}
                        className="w-full bg-[#1b1b18] text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-lg relative">
                                <ShoppingBasket size={20} />
                                <span className="absolute -top-2 -right-2 bg-red-600 text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#1b1b18]">
                                    {totalItems}
                                </span>
                            </div>
                            <div className="text-left">
                                <div className="text-[10px] text-white/60 uppercase font-bold leading-tight">Total Pesanan</div>
                                <div className="text-sm font-bold">{formatCurrency(totalPrice)}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 font-bold text-sm">
                            Lihat Keranjang
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </button>
                </div>
            )}

            {/* Cart Sidebar/Modal */}
            {showCart && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowCart(false)} />
                    <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                        <div className="p-6 border-b border-[#1914001a] flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <ShoppingBasket size={24} className="text-[#1b1b18]" />
                                <h2 className="text-xl font-bold">Keranjang Saya</h2>
                            </div>
                            <button onClick={() => setShowCart(false)} className="p-2 hover:bg-[#1914000d] rounded-xl transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-[#706f6c]">
                                    <ShoppingBasket size={64} className="opacity-10 mb-4" />
                                    <p className="font-medium">Keranjang masih kosong nih.</p>
                                    <button 
                                        onClick={() => setShowCart(false)}
                                        className="mt-4 text-[#1b1b18] font-bold text-sm flex items-center gap-2"
                                    >
                                        Mulai Belanja <ArrowRight size={16} />
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {cart.map((item) => (
                                        <div key={item.id} className="flex gap-4 group">
                                            <div className="w-20 h-20 rounded-xl bg-[#FDFDFC] border border-[#1914001a] flex items-center justify-center overflow-hidden shrink-0 relative">
                                                {item.image_url ? (
                                                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-3xl">{item.emoji || '📦'}</span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h3 className="font-bold text-[#1b1b18] truncate">{item.name}</h3>
                                                    <button onClick={() => removeFromCart(item.id)} className="text-[#706f6c] hover:text-red-600">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                                <div className="text-sm font-bold text-[#1b1b18] mb-3">{formatCurrency(item.price)}</div>
                                                <div className="flex items-center gap-3 bg-[#FDFDFC] border border-[#1914001a] w-fit rounded-lg px-2 py-1">
                                                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:text-[#1b1b18] text-[#706f6c]">
                                                        <Minus size={14} />
                                                    </button>
                                                    <span className="text-sm font-bold min-w-[20px] text-center">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:text-[#1b1b18] text-[#706f6c]">
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {cart.length > 0 && (
                            <div className="p-6 border-t border-[#1914001a] bg-[#FDFDFC] space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-[#706f6c]">Subtotal</span>
                                    <span className="font-bold">{formatCurrency(totalPrice)}</span>
                                </div>
                                <div className="flex justify-between text-lg">
                                    <span className="font-bold">Total Pembayaran</span>
                                    <span className="font-bold text-[#1b1b18]">{formatCurrency(totalPrice)}</span>
                                </div>
                                <button className="w-full bg-[#1b1b18] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-[#2b2b28] transition-all">
                                    Checkout Sekarang
                                    <ArrowRight size={20} />
                                </button>
                                <p className="text-[10px] text-center text-[#706f6c]">Dengan klik tombol di atas, kamu setuju dengan syarat & ketentuan Seger.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// Add Trash2 to imports
import { Trash2 } from 'lucide-react';

export default Home;
