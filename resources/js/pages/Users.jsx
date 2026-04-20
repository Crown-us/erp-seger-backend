import React, { useState, useEffect } from 'react';
import { Plus, Search, Mail, User, Briefcase, MapPin, Loader2, Trash2, Edit, X } from 'lucide-react';
import api from '../lib/axios';

const Users = () => {
    const [activeTab, setActiveTab] = useState('employees');
    const [users, setUsers] = useState([]);
    const [businessPartners, setBusinessPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({
        nik: '',
        name: '',
        email: '',
        password: '',
        workplace_id: '',
    });

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const endpoint = activeTab === 'employees' ? '/admin/employees' : '/admin/shops';
            const response = await api.get(endpoint);
            setUsers(response.data.data);
        } catch (err) {
            console.error('Failed to fetch users', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchBusinessPartners = async () => {
        try {
            const response = await api.get('/business-partners');
            setBusinessPartners(response.data.data);
        } catch (err) {
            console.error('Failed to fetch business partners', err);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchBusinessPartners();
    }, [activeTab]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEditClick = (user) => {
        setEditingUser(user);
        setFormData({
            nik: user.nik || '',
            name: user.name,
            email: user.email,
            password: '', // Biarkan kosong kalau nggak mau ganti
            workplace_id: user.workplace_id || '',
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingUser) {
                const endpoint = activeTab === 'employees' ? `/admin/employees/${editingUser.id}` : `/admin/shops/${editingUser.id}`;
                await api.put(endpoint, formData);
            } else {
                const endpoint = activeTab === 'employees' ? '/admin/employees' : '/admin/shops';
                await api.post(endpoint, formData);
            }
            setShowModal(false);
            setEditingUser(null);
            setFormData({ nik: '', name: '', email: '', password: '', workplace_id: '' });
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal menyimpan user');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Apakah Anda yakin ingin menghapus user ini?')) return;
        try {
            const endpoint = activeTab === 'employees' ? `/admin/employees/${id}` : `/admin/shops/${id}`;
            await api.delete(endpoint);
            fetchUsers();
        } catch (err) {
            alert('Gagal menghapus user');
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black tracking-tighter text-[#1b1b18] uppercase">Manajemen User</h2>
                    <p className="text-[#706f6c] font-medium mt-1">Kelola akun karyawan pembeli dan toko pedagang di sini.</p>
                </div>
                <button 
                    onClick={() => { setEditingUser(null); setFormData({ nik: '', name: '', email: '', password: '', workplace_id: '' }); setShowModal(true); }}
                    className="inline-flex items-center justify-center gap-2 bg-[#1b1b18] text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#2b2b28] transition-all shadow-lg"
                >
                    <Plus size={18} />
                    Tambah {activeTab === 'employees' ? 'Karyawan' : 'Toko'}
                </button>
            </div>

            <div className="flex border-b border-[#1914001a] gap-10">
                <button 
                    onClick={() => setActiveTab('employees')}
                    className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'employees' ? 'text-[#1b1b18]' : 'text-[#706f6c] hover:text-[#1b1b18]'}`}
                >
                    Karyawan (Pembeli)
                    {activeTab === 'employees' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1b1b18] rounded-full"></div>}
                </button>
                <button 
                    onClick={() => setActiveTab('shops')}
                    className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'shops' ? 'text-[#1b1b18]' : 'text-[#706f6c] hover:text-[#1b1b18]'}`}
                >
                    Toko (Pedagang)
                    {activeTab === 'shops' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1b1b18] rounded-full"></div>}
                </button>
            </div>

            <div className="bg-white rounded-[2rem] border border-[#1914001a] shadow-sm overflow-hidden">
                <div className="p-6 border-b border-[#1914001a] bg-[#FDFDFC]">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#706f6c]" size={18} />
                        <input 
                            type="text" 
                            placeholder="Cari nama, NIK, atau email..." 
                            className="w-full pl-12 pr-4 py-3 bg-white border border-[#1914001a] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1b1b18] transition-all shadow-sm"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[#FDFDFC] text-[#706f6c]">
                            <tr>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest">Nama Lengkap</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest">NIK / Identifier</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest">Email</th>
                                {activeTab === 'employees' && <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest">Tempat Kerja</th>}
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1914000d]">
                            {loading ? (
                                [1,2,3,4].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-8 py-6"><div className="h-6 bg-[#1914000d] rounded-lg w-full"></div></td>
                                    </tr>
                                ))
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center text-[#706f6c] font-medium italic">Data user tidak ditemukan.</td>
                                </tr>
                            ) : users.map((user) => (
                                <tr key={user.id} className="hover:bg-[#FDFDFC] transition-colors group">
                                    <td className="px-8 py-5 font-bold text-[#1b1b18]">{user.name}</td>
                                    <td className="px-8 py-5 text-[#706f6c] font-medium">{user.nik || '-'}</td>
                                    <td className="px-8 py-5 text-[#706f6c]">{user.email}</td>
                                    {activeTab === 'employees' && <td className="px-8 py-5 text-[#706f6c] font-bold">{user.workplace || '-'}</td>}
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                onClick={() => handleEditClick(user)}
                                                className="p-2 text-[#706f6c] hover:text-[#1b1b18] hover:bg-[#1914000d] rounded-xl transition-all"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(user.id)}
                                                className="p-2 text-[#706f6c] hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* User Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-[#1914001a] overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-[#1914001a] flex items-center justify-between bg-[#FDFDFC]">
                            <h3 className="font-black text-xl tracking-tight uppercase">{editingUser ? 'Edit' : 'Tambah'} {activeTab === 'employees' ? 'Karyawan' : 'Toko'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-[#706f6c] hover:text-[#1b1b18] p-2 hover:bg-[#1914000d] rounded-xl transition-all"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#706f6c] ml-1">Nama Lengkap</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#706f6c]" size={18} />
                                    <input name="name" required value={formData.name} onChange={handleInputChange} className="w-full pl-12 pr-4 py-3 bg-[#19140005] border border-[#1914001a] rounded-2xl text-sm focus:ring-2 focus:ring-[#1b1b18] focus:outline-none transition-all" placeholder="Contoh: Budi Santoso" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#706f6c] ml-1">NIK / ID</label>
                                    <input name="nik" required={activeTab === 'employees'} value={formData.nik} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#19140005] border border-[#1914001a] rounded-2xl text-sm focus:ring-2 focus:ring-[#1b1b18] focus:outline-none transition-all" placeholder="123456" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#706f6c] ml-1">Password</label>
                                    <input name="password" type="password" required={!editingUser} value={formData.password} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#19140005] border border-[#1914001a] rounded-2xl text-sm focus:ring-2 focus:ring-[#1b1b18] focus:outline-none transition-all" placeholder="••••••••" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#706f6c] ml-1">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#706f6c]" size={18} />
                                    <input name="email" type="email" required value={formData.email} onChange={handleInputChange} className="w-full pl-12 pr-4 py-3 bg-[#19140005] border border-[#1914001a] rounded-2xl text-sm focus:ring-2 focus:ring-[#1b1b18] focus:outline-none transition-all" placeholder="budi@email.com" />
                                </div>
                            </div>
                            {activeTab === 'employees' && (
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#706f6c] ml-1">Tempat Kerja (PT)</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-[#706f6c]" size={18} />
                                        <select 
                                            name="workplace_id" 
                                            value={formData.workplace_id} 
                                            onChange={handleInputChange} 
                                            className="w-full pl-12 pr-4 py-3 bg-[#19140005] border border-[#1914001a] rounded-2xl text-sm focus:ring-2 focus:ring-[#1b1b18] focus:outline-none transition-all appearance-none"
                                        >
                                            <option value="">Pilih PT / Perusahaan</option>
                                            {businessPartners.map(bp => (
                                                <option key={bp.id} value={bp.id}>{bp.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}
                            <div className="pt-6 flex gap-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-4 border border-[#1914001a] rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#FDFDFC] transition-all">Batal</button>
                                <button type="submit" disabled={submitting} className="flex-1 bg-[#1b1b18] text-white px-4 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#2b2b28] disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl transition-all">
                                    {submitting ? <Loader2 size={18} className="animate-spin" /> : 'Simpan User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
