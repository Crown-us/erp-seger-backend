import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Users, 
    ShoppingBag, 
    Package,
    Store,
    LogOut, 
    Menu, 
    X,
    ChevronRight,
    User
} from 'lucide-react';
import api from '../lib/axios';

const SidebarItem = ({ icon: Icon, label, path, active, onClick }) => (
    <Link
        to={path}
        onClick={onClick}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group ${
            active 
                ? 'bg-[#1b1b18] text-white shadow-sm' 
                : 'text-[#706f6c] hover:bg-[#1b1b180a] hover:text-[#1b1b18]'
        }`}
    >
        <Icon size={18} className={active ? 'text-white' : 'text-[#706f6c] group-hover:text-[#1b1b18]'} />
        <span className="font-medium text-sm">{label}</span>
        {active && <ChevronRight size={14} className="ml-auto opacity-50" />}
    </Link>
);

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = async () => {
        try {
            await api.post('/logout');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
        } catch (error) {
            console.error('Logout failed', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
        }
    };

    const allMenuItems = [
        { icon: Store, label: 'Marketplace', path: '/', roles: ['admin', 'pedagang', 'pembeli'] },
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: ['admin', 'pedagang'] },
        { icon: ShoppingBag, label: 'Pesanan Saya', path: '/orders', roles: ['admin', 'pembeli'] },
        { icon: ShoppingBag, label: 'Pesanan Masuk', path: '/orders', roles: ['pedagang'] },
        { icon: Package, label: 'Produk Saya', path: '/products', roles: ['admin', 'pedagang'] },
        { icon: Users, label: 'Manajemen User', path: '/users', roles: ['admin'] },
    ];

    const menuItems = allMenuItems.filter(item => item.roles?.includes(user.role) || user.role === 'admin');

    return (
        <div className="flex h-screen bg-[#FDFDFC] overflow-hidden">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-[#1914001a] z-30 flex items-center px-4 justify-between">
                <div className="font-semibold tracking-tight text-lg">Seger Marketplace</div>
                <button 
                    className="p-2 -mr-2 text-[#1b1b18] hover:bg-[#1914000d] rounded-md transition-colors"
                    onClick={() => setIsSidebarOpen(true)}
                >
                    <Menu size={24} />
                </button>
            </div>

            {/* Mobile Backdrop */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#1914001a] transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:relative lg:translate-x-0 lg:flex lg:flex-col
            `}>
                <div className="flex flex-col h-full p-6">
                    <div className="flex items-center justify-between mb-8 px-2">
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">Seger</h1>
                            <p className="text-[11px] text-[#706f6c] uppercase font-bold tracking-widest mt-0.5">Marketplace</p>
                        </div>
                        <button 
                            className="lg:hidden p-1 text-[#706f6c] hover:bg-[#1914000d] rounded-md"
                            onClick={() => setIsSidebarOpen(false)}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* User Profile Summary */}
                    <div className="mb-8 px-2 py-3 bg-[#FDFDFC] border border-[#1914001a] rounded-xl flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#1b1b18] text-white flex items-center justify-center shrink-0">
                            <User size={20} />
                        </div>
                        <div className="min-w-0">
                            <div className="text-sm font-bold text-[#1b1b18] truncate">{user.name || 'User'}</div>
                            <div className="text-[10px] text-[#706f6c] uppercase font-bold tracking-tighter">{user.role || 'Role'}</div>
                        </div>
                    </div>

                    <nav className="flex-1 space-y-1 overflow-y-auto">
                        {menuItems.map((item, index) => (
                            <SidebarItem
                                key={index}
                                {...item}
                                active={location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))}
                                onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)}
                            />
                        ))}
                    </nav>

                    <div className="pt-6 mt-6 border-t border-[#1914001a]">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-[#706f6c] hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200 group"
                        >
                            <LogOut size={18} className="group-hover:text-red-600" />
                            <span className="font-medium text-sm">Log out</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 h-full pt-16 lg:pt-0 overflow-y-auto">
                <div className="p-4 sm:p-6 lg:p-8">
                    <div className="max-w-6xl mx-auto">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Layout;
