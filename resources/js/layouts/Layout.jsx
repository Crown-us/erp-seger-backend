import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, 
    ShoppingBag, 
    Package,
    Store,
    LogOut, 
    Menu, 
    X,
    User,
    Settings
} from 'lucide-react';
import api from '../lib/axios';

const SidebarItem = ({ icon: Icon, label, path, active, onClick }) => (
    <Link
        to={path}
        onClick={onClick}
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
            active 
                ? 'bg-[#1b1b18] text-white shadow-lg' 
                : 'text-[#706f6c] hover:bg-[#1b1b180a] hover:text-[#1b1b18]'
        }`}
    >
        <Icon size={20} />
        <span className="font-black uppercase tracking-widest text-[10px]">{label}</span>
    </Link>
);

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = async () => {
        try { await api.post('/logout'); } catch (e) {}
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
    };

    // CUMA 3 PILIHAN DI SIDEBAR SESUAI PERMINTAAN
    const menuItems = [
        { icon: Store, label: 'Buka Toko', path: '/' }, // Pilihan 1: Balik ke Marketplace
        { 
            icon: user.role === 'pembeli' ? ShoppingBag : Package, 
            label: user.role === 'pembeli' ? 'Pesanan Saya' : 'Kelola Produk', 
            path: user.role === 'pembeli' ? '/admin/orders' : '/admin/products' 
        }, // Pilihan 2: Menu Utama sesuai Role
        { icon: Settings, label: 'Manajemen User', path: '/admin/users', roles: ['admin'] }, // Pilihan 3: Khusus Admin
    ].filter(item => !item.roles || item.roles.includes(user.role));

    return (
        <div className="flex h-screen bg-[#FDFDFC] overflow-hidden font-sans">
            {/* Mobile Nav */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-[#1914001a] z-30 flex items-center px-6 justify-between">
                <div className="font-black tracking-tighter text-xl">SEGER.</div>
                <button onClick={() => setIsSidebarOpen(true)}><Menu size={24} /></button>
            </div>

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-[#1914001a] transform transition-transform duration-300
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:relative lg:translate-x-0 lg:flex lg:flex-col
            `}>
                <div className="flex flex-col h-full p-8">
                    <div className="mb-12">
                        <h1 className="text-3xl font-black tracking-tighter text-[#1b1b18]">SEGER.</h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#706f6c] mt-1">Panel Kendali</p>
                    </div>

                    {/* Profile Singkat */}
                    <div className="mb-10 p-5 bg-[#19140005] rounded-[2rem] border border-[#1914000d] flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#1b1b18] text-white flex items-center justify-center shrink-0 shadow-lg">
                            <User size={24} />
                        </div>
                        <div className="min-w-0">
                            <div className="text-sm font-black text-[#1b1b18] truncate">{user.name}</div>
                            <div className="text-[9px] font-black uppercase tracking-widest text-[#706f6c]">{user.role}</div>
                        </div>
                    </div>

                    <nav className="flex-1 space-y-2">
                        {menuItems.map((item, index) => (
                            <SidebarItem
                                key={index}
                                {...item}
                                active={location.pathname === item.path}
                                onClick={() => setIsSidebarOpen(false)}
                            />
                        ))}
                    </nav>

                    <div className="mt-auto pt-8 border-t border-[#1914001a]">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-5 py-4 text-[#706f6c] hover:bg-red-50 hover:text-red-600 rounded-2xl transition-all group"
                        >
                            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                            <span className="font-black uppercase tracking-widest text-[10px]">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 h-full pt-16 lg:pt-0 overflow-y-auto">
                <div className="p-6 lg:p-12 max-w-7xl mx-auto w-full">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
