import React, { useState, useEffect, useRef } from 'react';
import { 
    Plus, 
    Search, 
    Package, 
    Edit, 
    Trash2, 
    Image as ImageIcon, 
    Loader2, 
    X, 
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import api from '../lib/axios';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        original_price: '',
        discount_percent: 0,
        stock: '',
        unit: 'pcs',
        category: 'Sembako',
        emoji: '📦',
        image: null
    });

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await api.get('/merchant/products');
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, image: file });
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            original_price: '',
            discount_percent: 0,
            stock: '',
            unit: 'pcs',
            category: 'Sembako',
            emoji: '📦',
            image: null
        });
        setPreviewImage(null);
        setEditingProduct(null);
    };

    const handleAddClick = () => {
        resetForm();
        setShowModal(true);
    };

    const handleEditClick = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description || '',
            original_price: product.original_price,
            discount_percent: product.discount_percent,
            stock: product.stock,
            unit: product.unit,
            category: product.category,
            emoji: product.emoji || '📦',
            image: null
        });
        setPreviewImage(product.image_url);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null) {
                data.append(key, formData[key]);
            }
        });

        try {
            if (editingProduct) {
                // Laravel workaround for PUT requests with multipart/form-data
                data.append('_method', 'PUT');
                await api.post(`/merchant/products/${editingProduct.id}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/merchant/products', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            setShowModal(false);
            resetForm();
            fetchProducts();
        } catch (err) {
            console.error('Error saving product', err);
            alert(err.response?.data?.message || 'Failed to save product');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            await api.delete(`/merchant/products/${id}`);
            fetchProducts();
        } catch (err) {
            alert('Failed to delete product');
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight">Products Management</h2>
                    <p className="text-[#706f6c]">Manage your items and stock for the store.</p>
                </div>
                <button 
                    onClick={handleAddClick}
                    className="inline-flex items-center justify-center gap-2 bg-[#1b1b18] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2b2b28] transition-all shadow-sm"
                >
                    <Plus size={18} />
                    Add Product
                </button>
            </div>

            <div className="bg-white rounded-xl border border-[#1914001a] shadow-sm overflow-hidden">
                <div className="p-4 border-b border-[#1914001a] bg-[#FDFDFC]">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#706f6c]" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search products..." 
                            className="w-full pl-10 pr-4 py-2 bg-white border border-[#1914001a] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1b1b18] focus:border-transparent"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[#FDFDFC] text-[#706f6c]">
                            <tr>
                                <th className="px-6 py-3 font-medium">Product</th>
                                <th className="px-6 py-3 font-medium">Category</th>
                                <th className="px-6 py-3 font-medium">Price</th>
                                <th className="px-6 py-3 font-medium">Stock</th>
                                <th className="px-6 py-3 font-medium">Status</th>
                                <th className="px-6 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1914001a]">
                            {loading ? (
                                [1,2,3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-4"><div className="h-12 bg-[#1914000d] rounded w-full"></div></td>
                                    </tr>
                                ))
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-[#706f6c]">
                                        <div className="flex flex-col items-center gap-2">
                                            <Package size={40} className="opacity-20" />
                                            <p>No products found.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : products.map((product) => (
                                <tr key={product.id} className="hover:bg-[#FDFDFC] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-[#FDFDFC] border border-[#1914001a] flex items-center justify-center overflow-hidden shrink-0">
                                                {product.image_url ? (
                                                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-xl">{product.emoji || '📦'}</span>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-medium text-[#1b1b18] truncate">{product.name}</div>
                                                <div className="text-[11px] text-[#706f6c]">{product.unit}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-[#706f6c]">
                                        <span className="bg-[#FDFDFC] px-2 py-1 rounded border border-[#1914001a] text-[11px]">
                                            {product.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-[#1b1b18]">{formatCurrency(product.price)}</div>
                                        {product.discount_percent > 0 && (
                                            <div className="text-[10px] text-[#706f6c] line-through">{formatCurrency(product.original_price)}</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className={`font-medium ${product.stock <= 5 ? 'text-red-600' : 'text-[#1b1b18]'}`}>
                                            {product.stock}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                            product.is_active ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                        }`}>
                                            {product.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => handleEditClick(product)}
                                                className="p-1.5 text-[#706f6c] hover:text-[#1b1b18] hover:bg-[#1914000d] rounded-md transition-all"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(product.id)}
                                                className="p-1.5 text-[#706f6c] hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Product Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl border border-[#1914001a] my-8">
                        <div className="p-6 border-b border-[#1914001a] flex items-center justify-between">
                            <h3 className="font-semibold text-lg">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-[#706f6c] hover:text-[#1b1b18]"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Image Upload Section */}
                                <div className="space-y-4">
                                    <label className="text-sm font-medium block">Product Image</label>
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="aspect-square w-full rounded-xl border-2 border-dashed border-[#1914001a] flex flex-col items-center justify-center cursor-pointer hover:bg-[#FDFDFC] transition-all overflow-hidden relative group"
                                    >
                                        {previewImage ? (
                                            <>
                                                <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                    <ImageIcon className="text-white" size={24} />
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <ImageIcon className="text-[#706f6c] mb-2" size={32} />
                                                <span className="text-[11px] text-[#706f6c] text-center px-4">Click to upload image</span>
                                            </>
                                        )}
                                    </div>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        accept="image/*" 
                                        onChange={handleFileChange}
                                    />
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium">Image URL (Optional Link)</label>
                                        <input 
                                            name="image_url" 
                                            value={formData.image_url || ''} 
                                            onChange={handleInputChange} 
                                            className="w-full px-4 py-2 border border-[#1914001a] rounded-lg text-sm focus:ring-2 focus:ring-[#1b1b18] focus:outline-none" 
                                            placeholder="https://example.com/image.jpg" 
                                        />
                                        <p className="text-[10px] text-[#706f6c]">Leave empty to use uploaded file or emoji.</p>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium">Emoji Icon (Fallback)</label>
                                        <input 
                                            name="emoji" 
                                            value={formData.emoji} 
                                            onChange={handleInputChange} 
                                            className="w-full px-4 py-2 border border-[#1914001a] rounded-lg text-sm focus:ring-2 focus:ring-[#1b1b18] focus:outline-none" 
                                            placeholder="📦" 
                                        />
                                    </div>
                                </div>

                                {/* Form Fields Section */}
                                <div className="md:col-span-2 space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium">Product Name</label>
                                        <input 
                                            name="name" 
                                            required 
                                            value={formData.name} 
                                            onChange={handleInputChange} 
                                            className="w-full px-4 py-2 border border-[#1914001a] rounded-lg text-sm focus:ring-2 focus:ring-[#1b1b18] focus:outline-none" 
                                            placeholder="e.g. Beras Premium 5kg" 
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium">Category</label>
                                            <input 
                                                name="category" 
                                                required 
                                                value={formData.category} 
                                                onChange={handleInputChange} 
                                                className="w-full px-4 py-2 border border-[#1914001a] rounded-lg text-sm focus:ring-2 focus:ring-[#1b1b18] focus:outline-none" 
                                                placeholder="Sembako" 
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium">Unit</label>
                                            <select 
                                                name="unit" 
                                                required 
                                                value={formData.unit} 
                                                onChange={handleInputChange} 
                                                className="w-full px-4 py-2 border border-[#1914001a] rounded-lg text-sm focus:ring-2 focus:ring-[#1b1b18] focus:outline-none bg-white"
                                            >
                                                <option value="pcs">pcs</option>
                                                <option value="kg">kg</option>
                                                <option value="liter">liter</option>
                                                <option value="bks">bks</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium">Original Price</label>
                                            <input 
                                                name="original_price" 
                                                type="number" 
                                                required 
                                                value={formData.original_price} 
                                                onChange={handleInputChange} 
                                                className="w-full px-4 py-2 border border-[#1914001a] rounded-lg text-sm focus:ring-2 focus:ring-[#1b1b18] focus:outline-none" 
                                                placeholder="15000" 
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium">Discount (%)</label>
                                            <input 
                                                name="discount_percent" 
                                                type="number" 
                                                min="0" 
                                                max="100" 
                                                value={formData.discount_percent} 
                                                onChange={handleInputChange} 
                                                className="w-full px-4 py-2 border border-[#1914001a] rounded-lg text-sm focus:ring-2 focus:ring-[#1b1b18] focus:outline-none" 
                                                placeholder="0" 
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium">Stock</label>
                                            <input 
                                                name="stock" 
                                                type="number" 
                                                required 
                                                value={formData.stock} 
                                                onChange={handleInputChange} 
                                                className="w-full px-4 py-2 border border-[#1914001a] rounded-lg text-sm focus:ring-2 focus:ring-[#1b1b18] focus:outline-none" 
                                                placeholder="10" 
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium">Final Price</label>
                                            <div className="w-full px-4 py-2 bg-[#FDFDFC] border border-[#1914001a] rounded-lg text-sm font-bold text-green-600">
                                                {formatCurrency(formData.original_price - (formData.original_price * (formData.discount_percent / 100)))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium">Description</label>
                                        <textarea 
                                            name="description" 
                                            value={formData.description} 
                                            onChange={handleInputChange} 
                                            className="w-full px-4 py-2 border border-[#1914001a] rounded-lg text-sm focus:ring-2 focus:ring-[#1b1b18] focus:outline-none min-h-[80px]" 
                                            placeholder="Product description..."
                                        ></textarea>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 flex gap-3 border-t border-[#1914001a] mt-6">
                                <button 
                                    type="button" 
                                    onClick={() => setShowModal(false)} 
                                    className="flex-1 px-4 py-2.5 border border-[#1914001a] rounded-lg text-sm font-medium hover:bg-[#FDFDFC] transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={submitting} 
                                    className="flex-1 bg-[#1b1b18] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#2b2b28] disabled:opacity-50 flex items-center justify-center gap-2 transition-all shadow-md"
                                >
                                    {submitting ? <Loader2 size={18} className="animate-spin" /> : (editingProduct ? 'Update Product' : 'Create Product')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Products;
