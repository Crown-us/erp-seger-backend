import './bootstrap';
import '../css/app.css';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './layouts/Layout';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import Users from './pages/Users';
import Orders from './pages/Orders';
import Products from './pages/Products';
import Login from './pages/Login';
import BusinessPartners from './pages/BusinessPartners';
import Profile from './pages/Profile';

// Komponen cerdas buat nentuin halaman pertama setelah klik "Panel"
const PanelIndex = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role === 'pembeli') {
        return <Navigate to="/admin/orders" replace />;
    }
    return <Dashboard />;
};

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Marketplace */}
                <Route path="/" element={<Home />} />
                
                {/* Auth */}
                <Route path="/login" element={<Login />} />
                
                {/* Admin/User Panel */}
                <Route path="/admin" element={<Layout />}>
                    <Route index element={<PanelIndex />} />
                    <Route path="users" element={<Users />} />
                    <Route path="partners" element={<BusinessPartners />} />
                    <Route path="orders" element={<Orders />} />
                    <Route path="products" element={<Products />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="dashboard" element={<Dashboard />} />
                </Route>
                
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

const container = document.getElementById('app');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}
