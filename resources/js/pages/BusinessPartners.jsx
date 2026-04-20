import React, { useState, useEffect } from 'react';
import { Plus, Search, MapPin, Loader2, Trash2, Edit, X, Building2 } from 'lucide-react';
import api from '../lib/axios';

const BusinessPartners = () => {
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingPartner, setEditingUser] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        address: '',
    });

    const fetchPartners = async () => {
        setLoading(true);
        try {
            const response = await api.get('/business-partners');
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
        setEditingUser(partner);
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
                // We'll need to make sure these endpoints exist or use the public one with logic
                await api.put(`/admin/shops/${editingPartner.id}`, formData); // Mocking for now, need real endpoint
            } else {
                await api.post('/admin/shops', formData); // Mocking for now
            }
            setShowModal(false);
            fetchPartners();
        } catch (err) {
            alert('Fitur simpan PT akan segera aktif setelah API update');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black tracking-tighter text-[#1b1b18] uppercase">Daftar Alamat PT</h2>
                    <p className="text-[#706f6c] font-medium mt-1">Kelola daftar perusahaan mitra yang menjadi lokasi pengiriman.</p>
                </div>
                <button 
                    onClick={() => { setEditingUser(null); setFormData({ name: '', address: '' }); setShowModal(true); }}
                    className="inline-flex items-center justify-center gap-2 bg-[#1b1b18] text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-[#2b2b28] transition-all shadow-lg"
                >
                    <Plus size={18} />
                    Tambah PT Baru
                </button>
            </div>

            <div className="bg-white rounded-[2rem] border border-[#1914001a] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[#FDFDFC] text-[#706f6c]">
                            <tr>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest">Nama Perusahaan</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest">Alamat Lengkap</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1914000d]">
                            {loading ? [1,2,3].map(i => <tr key={i} className="animate-pulse"><td colSpan={3} className="px-8 py-6"><div className="h-6 bg-gray-100 rounded-lg w-full"></div></td></tr>) :
                                partners.map((partner) => (
                                    <tr key={partner.id} className="hover:bg-[#FDFDFC] transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-[#19140005] rounded-xl flex items-center justify-center text-[#1b1b18]"><Building2 size={20} /></div>
                                                <div className="font-bold text-[#1b1b18]">{partner.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-[#706f6c] font-medium">
                                            <div className="flex items-center gap-2"><MapPin size={14} /> {partner.address}</div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleEditClick(partner)} className="p-2 text-[#706f6c] hover:text-[#1b1b18] hover:bg-[#1914000d] rounded-xl transition-all"><Edit size={18} /></button>
                                                <button className="p-2 text-[#706f6c] hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
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
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-[#1914001a] overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-[#1914001a] flex items-center justify-between bg-[#FDFDFC]">
                            <h3 className="font-black text-xl tracking-tight uppercase">{editingPartner ? 'Edit' : 'Tambah'} Alamat PT</h3>
                            <button onClick={() => setShowModal(false)} className="text-[#706f6c] p-2 hover:bg-[#1914000d] rounded-xl transition-all"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#706f6c] ml-1">Nama Perusahaan</label>
                                <input name="name" required value={formData.name} onChange={handleInputChange} className="w-full px-5 py-4 bg-[#19140005] border border-[#1914001a] rounded-2xl text-sm focus:ring-2 focus:ring-[#1b1b18] focus:outline-none transition-all" placeholder="Contoh: PT. Maju Jaya" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#706f6c] ml-1">Alamat Kantor</label>
                                <textarea name="address" required value={formData.address} onChange={handleInputChange} className="w-full px-5 py-4 bg-[#19140005] border border-[#1914001a] rounded-2xl text-sm focus:ring-2 focus:ring-[#1b1b18] focus:outline-none transition-all min-h-[100px]" placeholder="Masukkan alamat lengkap kantor..." />
                            </div>
                            <div className="pt-4 flex gap-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-4 border border-[#1914001a] rounded-2xl text-xs font-black uppercase tracking-widest">Batal</button>
                                <button type="submit" disabled={submitting} className="flex-1 bg-[#1b1b18] text-white px-4 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl transition-all">
                                    {submitting ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Simpan Alamat'}
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
