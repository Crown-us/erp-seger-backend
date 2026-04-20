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
    Settings,
    Building2,
    UserCircle,
    ClipboardList
} from 'lucide-react';
import api from '../lib/axios';

const SidebarItem = ({ icon: Icon, label, path, active, onClick }) => (
    <Link
        to={path}
        onClick={onClick}
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
            active 
                ? 'bg-[#1b1b18] text-white shadow-lg scale-[1.02]' 
                : 'text-[#706f6c] hover:bg-[#1b1b180a] hover:text-[#1b1b18]'
        }`}
    >
        <Icon size={20} strokeWidth={active ? 3 : 2} />
        <span className={`font-black uppercase tracking-widest text-[10px] ${active ? 'opacity-100' : 'opacity-70'}`}>{label}</span>
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

    // Menu Sidebar yang disesuaikan
    const menuItems = [
        { icon: Store, label: 'Buka Toko', path: '/' },
        
        // --- MENU ADMIN ---
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin', roles: ['admin'] },
        { icon: ClipboardList, label: 'Semua Pesanan', path: '/admin/orders', roles: ['admin'] }, // INI YANG TADI KETINGGALAN
        { icon: Settings, label: 'User & Toko', path: '/admin/users', roles: ['admin'] },
        { icon: Building2, label: 'Alamat PT', path: '/admin/partners', roles: ['admin'] },
        
        // --- MENU PEDAGANG ---
        { icon: Package, label: 'Kelola Produk', path: '/admin/products', roles: ['pedagang'] },
        { icon: ShoppingBag, label: 'Pesanan Masuk', path: '/admin/orders', roles: ['pedagang'] },
        
        // --- MENU PEMBELI ---
        { icon: ShoppingBag, label: 'Pesanan Saya', path: '/admin/orders', roles: ['pembeli'] },
        
        // --- SEMUA ROLE ---
        { icon: UserCircle, label: 'Edit Profil', path: '/admin/profile', roles: ['pembeli', 'pedagang', 'admin'] },
        
    ].filter(item => !item.roles || item.roles.includes(user.role));

    return (
        <div className="flex h-screen bg-[#FDFDFC] overflow-hidden font-sans selection:bg-[#1b1b18] selection:text-white">
            {/* Mobile Nav */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-[#1914001a] z-30 flex items-center px-6 justify-between">
                <div className="font-black tracking-tighter text-xl italic uppercase">SEGER.</div>
                <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-[#1b1b180a] rounded-xl"><Menu size={24} /></button>
            </div>

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-[#1914001a] transform transition-transform duration-500 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:relative lg:translate-x-0 lg:flex lg:flex-col
            `}>
                <div className="flex flex-col h-full p-8">
                    <div className="mb-12 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-black tracking-tighter text-[#1b1b18] uppercase italic">SEGER<span className="text-[#706f6c]">.</span></h1>
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#706f6c] mt-1">Control Center</p>
                        </div>
                        <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 hover:bg-gray-100 rounded-xl"><X size={20} /></button>
                    </div>

                    {/* Profile Card */}
                    <div className="mb-10 p-6 bg-[#1b1b18] rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                        <div className="flex items-center gap-4 relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/10 shadow-inner">
                                <User size={24} strokeWidth={3} />
                            </div>
                            <div className="min-w-0">
                                <div className="text-sm font-black truncate">{user.name}</div>
                                <div className="text-[9px] font-black uppercase tracking-widest text-white/40 italic">{user.role}</div>
                            </div>
                        </div>
                    </div>

                    <nav className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
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
                            className="flex items-center gap-4 w-full px-6 py-5 text-[#706f6c] hover:bg-red-50 hover:text-red-600 rounded-[1.5rem] transition-all group font-black uppercase tracking-widest text-[10px]"
                        >
                            <LogOut size={22} className="group-hover:-translate-x-2 transition-transform duration-300" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 h-full pt-16 lg:pt-0 overflow-y-auto bg-[#FDFDFC]">
                <div className="p-8 lg:p-16 max-w-7xl mx-auto w-full animate-in fade-in duration-700">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
