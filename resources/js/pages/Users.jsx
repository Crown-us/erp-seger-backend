import React, { useState, useEffect } from 'react';
import { Plus, Search, Mail, User, Briefcase, MapPin, Loader2, Trash2 } from 'lucide-react';
import api from '../lib/axios';

const Users = () => {
    const [activeTab, setActiveTab] = useState('employees');
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        nik: '',
        name: '',
        email: '',
        password: '',
        workplace: '',
        workplace_address: '',
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

    useEffect(() => {
        fetchUsers();
    }, [activeTab]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const endpoint = activeTab === 'employees' ? '/admin/employees' : '/admin/shops';
            await api.post(endpoint, formData);
            setShowModal(false);
            setFormData({ nik: '', name: '', email: '', password: '', workplace: '', workplace_address: '' });
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal menambahkan user');
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
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight">Users Management</h2>
                    <p className="text-[#706f6c]">Manage your employees and merchant shops.</p>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center justify-center gap-2 bg-[#1b1b18] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2b2b28] transition-all shadow-sm"
                >
                    <Plus size={18} />
                    Add {activeTab === 'employees' ? 'Employee' : 'Shop'}
                </button>
            </div>

            <div className="flex border-b border-[#1914001a] gap-8">
                <button 
                    onClick={() => setActiveTab('employees')}
                    className={`pb-4 text-sm font-medium transition-all relative ${activeTab === 'employees' ? 'text-[#1b1b18]' : 'text-[#706f6c] hover:text-[#1b1b18]'}`}
                >
                    Employees
                    {activeTab === 'employees' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1b1b18]"></div>}
                </button>
                <button 
                    onClick={() => setActiveTab('shops')}
                    className={`pb-4 text-sm font-medium transition-all relative ${activeTab === 'shops' ? 'text-[#1b1b18]' : 'text-[#706f6c] hover:text-[#1b1b18]'}`}
                >
                    Shops / Merchants
                    {activeTab === 'shops' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1b1b18]"></div>}
                </button>
            </div>

            <div className="bg-white rounded-xl border border-[#1914001a] shadow-sm overflow-hidden">
                <div className="p-4 border-b border-[#1914001a] bg-[#FDFDFC]">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#706f6c]" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search users..." 
                            className="w-full pl-10 pr-4 py-2 bg-white border border-[#1914001a] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1b1b18] focus:border-transparent"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[#FDFDFC] text-[#706f6c]">
                            <tr>
                                <th className="px-6 py-3 font-medium">Name</th>
                                <th className="px-6 py-3 font-medium">NIK / Identifier</th>
                                <th className="px-6 py-3 font-medium">Email</th>
                                {activeTab === 'employees' && <th className="px-6 py-3 font-medium">Workplace</th>}
                                <th className="px-6 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1914001a]">
                            {loading ? (
                                [1,2,3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-6 py-4"><div className="h-4 bg-[#1914000d] rounded w-full"></div></td>
                                    </tr>
                                ))
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-[#706f6c]">No users found.</td>
                                </tr>
                            ) : users.map((user) => (
                                <tr key={user.id} className="hover:bg-[#FDFDFC] transition-colors group">
                                    <td className="px-6 py-4 font-medium text-[#1b1b18]">{user.name}</td>
                                    <td className="px-6 py-4 text-[#706f6c]">{user.nik || '-'}</td>
                                    <td className="px-6 py-4 text-[#706f6c]">{user.email}</td>
                                    {activeTab === 'employees' && <td className="px-6 py-4 text-[#706f6c]">{user.workplace || '-'}</td>}
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => handleDelete(user.id)}
                                            className="text-[#706f6c] hover:text-red-600 transition-colors p-1"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add User Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-xl shadow-xl border border-[#1914001a] overflow-hidden">
                        <div className="p-6 border-b border-[#1914001a] flex items-center justify-between">
                            <h3 className="font-semibold text-lg">Add New {activeTab === 'employees' ? 'Employee' : 'Shop'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-[#706f6c] hover:text-[#1b1b18]"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#706f6c]" size={16} />
                                    <input name="name" required value={formData.name} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2 border border-[#1914001a] rounded-lg text-sm focus:ring-2 focus:ring-[#1b1b18] focus:outline-none" placeholder="John Doe" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium">NIK / ID</label>
                                    <input name="nik" required={activeTab === 'employees'} value={formData.nik} onChange={handleInputChange} className="w-full px-4 py-2 border border-[#1914001a] rounded-lg text-sm focus:ring-2 focus:ring-[#1b1b18] focus:outline-none" placeholder="12345678" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium">Password</label>
                                    <input name="password" type="password" required value={formData.password} onChange={handleInputChange} className="w-full px-4 py-2 border border-[#1914001a] rounded-lg text-sm focus:ring-2 focus:ring-[#1b1b18] focus:outline-none" placeholder="••••••••" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#706f6c]" size={16} />
                                    <input name="email" type="email" required value={formData.email} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2 border border-[#1914001a] rounded-lg text-sm focus:ring-2 focus:ring-[#1b1b18] focus:outline-none" placeholder="john@example.com" />
                                </div>
                            </div>
                            {activeTab === 'employees' && (
                                <>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium">Workplace (PT/Company)</label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-[#706f6c]" size={16} />
                                            <input name="workplace" value={formData.workplace} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2 border border-[#1914001a] rounded-lg text-sm focus:ring-2 focus:ring-[#1b1b18] focus:outline-none" placeholder="PT Maju Mundur" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium">Workplace Address</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-[#706f6c]" size={16} />
                                            <input name="workplace_address" value={formData.workplace_address} onChange={handleInputChange} className="w-full pl-10 pr-4 py-2 border border-[#1914001a] rounded-lg text-sm focus:ring-2 focus:ring-[#1b1b18] focus:outline-none" placeholder="Jakarta, Indonesia" />
                                        </div>
                                    </div>
                                </>
                            )}
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-[#1914001a] rounded-lg text-sm font-medium hover:bg-[#FDFDFC]">Cancel</button>
                                <button type="submit" disabled={submitting} className="flex-1 bg-[#1b1b18] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2b2b28] disabled:opacity-50 flex items-center justify-center gap-2">
                                    {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Save User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const X = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);

export default Users;
