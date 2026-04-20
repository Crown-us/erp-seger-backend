import React, { useState, useEffect } from 'react';
import { Plus, Search, MapPin, Loader2, Trash2, Edit, X, Building2 } from 'lucide-react';
import api from '../lib/axios';

const BusinessPartners = () => {
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPartner, setEditingPartner] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        address: '',
    });

    const fetchPartners = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/partners');
            setPartners(response.data.data);
        } catch (err) {
            console.error('Failed to fetch partners', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPartners();
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEditClick = (partner) => {
        setEditingPartner(partner);
        setFormData({
            name: partner.name,
            address: partner.address,
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingPartner) {
                await api.put(`/admin/partners/${editingPartner.id}`, formData);
            } else {
                await api.post('/admin/partners', formData);
            }
            setShowModal(false);
            setEditingPartner(null);
            setFormData({ name: '', address: '' });
            fetchPartners();
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal menyimpan PT');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Apakah Anda yakin ingin menghapus alamat PT ini?')) return;
        try {
            await api.delete(`/admin/partners/${id}`);
            fetchPartners();
        } catch (err) {
            alert('Gagal menghapus PT');
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black tracking-tighter text-[#1b1b18] uppercase italic">Daftar Alamat PT</h2>
                    <p className="text-[#706f6c] font-medium mt-1 uppercase text-[10px] tracking-[0.2em]">Kelola lokasi pengiriman untuk karyawan.</p>
                </div>
                <button 
                    onClick={() => { setEditingPartner(null); setFormData({ name: '', address: '' }); setShowModal(true); }}
                    className="inline-flex items-center justify-center gap-2 bg-[#1b1b18] text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#2b2b28] transition-all shadow-lg active:scale-95"
                >
                    <Plus size={18} />
                    Tambah PT Baru
                </button>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-[#1914001a] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[#FDFDFC] text-[#706f6c] border-b border-[#1914001a]">
                            <tr>
                                <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest">Nama Perusahaan</th>
                                <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest">Alamat Lengkap</th>
                                <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1914000d]">
                            {loading ? [1,2,3].map(i => <tr key={i} className="animate-pulse"><td colSpan={3} className="px-10 py-8"><div className="h-6 bg-gray-50 rounded-lg w-full"></div></td></tr>) :
                                partners.length === 0 ? (
                                    <tr><td colSpan={3} className="px-10 py-20 text-center text-[#706f6c] italic font-bold">Belum ada PT yang terdaftar bro.</td></tr>
                                ) :
                                partners.map((partner) => (
                                    <tr key={partner.id} className="hover:bg-[#FDFDFC] transition-colors group">
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-[#1b1b18] text-white rounded-[1.2rem] flex items-center justify-center shadow-lg"><Building2 size={24} /></div>
                                                <div className="font-black text-[#1b1b18] text-base">{partner.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 text-[#706f6c] font-medium leading-relaxed max-w-md">
                                            <div className="flex items-start gap-2"><MapPin size={16} className="mt-1 shrink-0" /> {partner.address}</div>
                                        </td>
                                        <td className="px-10 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleEditClick(partner)} className="p-3 text-[#706f6c] hover:text-[#1b1b18] hover:bg-[#1914000d] rounded-2xl transition-all active:scale-75"><Edit size={20} /></button>
                                                <button onClick={() => handleDelete(partner.id)} className="p-3 text-[#706f6c] hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all active:scale-75"><Trash2 size={20} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal PT */}
            {showModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-[#1b1b182a] backdrop-blur-md">
                    <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl border border-white/50 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-10 border-b border-[#1914001a] flex items-center justify-between bg-[#FDFDFC]/50">
                            <h3 className="font-black text-2xl tracking-tighter uppercase italic">{editingPartner ? 'Edit' : 'Tambah'} Alamat PT</h3>
                            <button onClick={() => setShowModal(false)} className="p-3 hover:bg-[#1914000d] rounded-2xl transition-all active:scale-75"><X size={28} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-10 space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#706f6c] ml-1">Nama Perusahaan</label>
                                <input name="name" required value={formData.name} onChange={handleInputChange} className="w-full px-6 py-5 bg-[#19140005] border border-[#1914001a] rounded-[1.5rem] text-sm focus:ring-2 focus:ring-[#1b1b18] outline-none transition-all font-bold" placeholder="Contoh: PT. Seger Sejahtera" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#706f6c] ml-1">Alamat Kantor</label>
                                <textarea name="address" required value={formData.address} onChange={handleInputChange} className="w-full px-6 py-5 bg-[#19140005] border border-[#1914001a] rounded-[1.5rem] text-sm focus:ring-2 focus:ring-[#1b1b18] outline-none transition-all font-bold min-h-[120px] leading-relaxed" placeholder="Masukkan alamat lengkap kantor..." />
                            </div>
                            <div className="pt-4 flex gap-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-5 border border-[#1914001a] rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all active:scale-95">Batal</button>
                                <button type="submit" disabled={submitting} className="flex-1 bg-[#1b1b18] text-white px-4 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-[#2b2b28] transition-all active:scale-95 flex items-center justify-center gap-3">
                                    {submitting ? <Loader2 className="animate-spin" size={20} /> : 'Simpan Alamat'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessPartners;
