import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, 
    Users, 
    ShoppingBag, 
    LogOut, 
    Menu, 
    X,
    ChevronRight
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
        <span class="font-medium text-sm">{label}</span>
        {active && <ChevronRight size={14} className="ml-auto opacity-50" />}
    </Link>
);

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await api.post('/logout');
            localStorage.removeItem('token');
            navigate('/login');
        } catch (error) {
            console.error('Logout failed', error);
            localStorage.removeItem('token');
            navigate('/login');
        }
    };

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Users, label: 'Users Management', path: '/users' },
        { icon: ShoppingBag, label: 'Orders', path: '/orders' },
    ];

    return (
        <div className="flex min-h-screen bg-[#FDFDFC]">
            {/* Sidebar Mobile Toggle */}
            <button 
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white border border-[#1914001a] rounded-md shadow-sm"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
                {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-[#1914001a] transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:relative lg:translate-x-0
            `}>
                <div className="flex flex-col h-full p-6">
                    <div className="mb-10 px-2">
                        <h1 className="text-xl font-semibold tracking-tight">Seger Admin</h1>
                        <p className="text-[12px] text-[#706f6c]">Management Dashboard</p>
                    </div>

                    <nav className="flex-1 space-y-1">
                        {menuItems.map((item) => (
                            <SidebarItem
                                key={item.path}
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
                            <span class="font-medium text-sm">Log out</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 lg:p-8">
                    <div className="max-w-6xl mx-auto">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Layout;
