import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Save, Loader2, Key, MapPin, Building2 } from 'lucide-react';
import api from '../lib/axios';

const Profile = () => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [partners, setPartners] = useState([]);

    const [formData, setFormData] = useState({
        name: user.name || '',
        email: user.email || '',
        workplace_id: user.workplace_id || '',
        workplace_address: user.workplace_address || '',
    });

    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
    });

    useEffect(() => {
        const fetchPartners = async () => {
            try {
                const response = await api.get('/business-partners');
                setPartners(response.data.data);
            } catch (err) {}
        };
        fetchPartners();
    }, []);

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.put('/user/update-profile', formData);
            localStorage.setItem('user', JSON.stringify(response.data.data));
            setUser(response.data.data);
            setMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Gagal memperbarui profil' });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put('/user/update-password', passwordData);
            setMessage({ type: 'success', text: 'Password berhasil diganti!' });
            setPasswordData({ current_password: '', new_password: '', new_password_confirmation: '' });
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Gagal mengganti password' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10">
            <div>
                <h2 className="text-4xl font-black tracking-tighter text-[#1b1b18] uppercase italic">Pengaturan Profil</h2>
                <p className="text-[#706f6c] font-medium mt-1 uppercase text-[10px] tracking-[0.2em]">Update informasi akun dan keamananmu.</p>
            </div>

            {message && (
                <div className={`p-6 rounded-[1.5rem] border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'} animate-in fade-in duration-300 font-bold text-sm`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Form Profil */}
                <form onSubmit={handleProfileSubmit} className="bg-white p-10 rounded-[3rem] border border-[#1914001a] shadow-sm space-y-8">
                    <div className="flex items-center gap-4 text-[#1b1b18] mb-2">
                        <User size={24} strokeWidth={3} />
                        <h3 className="font-black uppercase tracking-tighter text-xl italic">Data Pribadi</h3>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#706f6c] ml-1">Nama Lengkap</label>
                            <input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-5 py-4 bg-[#19140005] border border-[#1914001a] rounded-2xl text-sm focus:ring-2 focus:ring-[#1b1b18] outline-none transition-all font-bold" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#706f6c] ml-1">Email Aktif</label>
                            <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-5 py-4 bg-[#19140005] border border-[#1914001a] rounded-2xl text-sm focus:ring-2 focus:ring-[#1b1b18] outline-none transition-all font-bold" />
                        </div>
                        
                        {user.role === 'pembeli' && (
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#706f6c] ml-1 text-orange-600">Lokasi Kerja (PT)</label>
                                <select value={formData.workplace_id} onChange={(e) => setFormData({...formData, workplace_id: e.target.value})} className="w-full px-5 py-4 bg-[#19140005] border border-[#1914001a] rounded-2xl text-sm focus:ring-2 focus:ring-[#1b1b18] outline-none transition-all font-bold appearance-none">
                                    <option value="">Pilih PT</option>
                                    {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                        )}
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-[#1b1b18] text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all">
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Simpan Profil
                    </button>
                </form>

                {/* Form Password */}
                <form onSubmit={handlePasswordSubmit} className="bg-[#1b1b18] p-10 rounded-[3rem] text-white space-y-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
                    
                    <div className="flex items-center gap-4 mb-2 relative z-10">
                        <Shield size={24} strokeWidth={3} />
                        <h3 className="font-black uppercase tracking-tighter text-xl italic">Keamanan</h3>
                    </div>

                    <div className="space-y-6 relative z-10">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Password Sekarang</label>
                            <input type="password" value={passwordData.current_password} onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})} className="w-full px-5 py-4 bg-white/10 border border-white/10 rounded-2xl text-sm focus:bg-white/20 outline-none transition-all" placeholder="••••••••" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Password Baru</label>
                            <input type="password" value={passwordData.new_password} onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})} className="w-full px-5 py-4 bg-white/10 border border-white/10 rounded-2xl text-sm focus:bg-white/20 outline-none transition-all" placeholder="Min. 8 Karakter" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Ulangi Password Baru</label>
                            <input type="password" value={passwordData.new_password_confirmation} onChange={(e) => setPasswordData({...passwordData, new_password_confirmation: e.target.value})} className="w-full px-5 py-4 bg-white/10 border border-white/10 rounded-2xl text-sm focus:bg-white/20 outline-none transition-all" placeholder="••••••••" />
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-white text-[#1b1b18] py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all">
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Key size={18} />} Update Password
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Profile;
