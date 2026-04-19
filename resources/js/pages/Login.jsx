import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User as UserIcon, AlertCircle, Loader2 } from 'lucide-react';
import api from '../lib/axios';

const Login = () => {
    const [nik, setNik] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem('token')) {
            navigate('/');
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/login', { nik, password });
            const { token, data: user } = response.data;
            
            if (user.role !== 'admin') {
                setError('Hanya Admin yang dapat mengakses dashboard ini.');
                setLoading(false);
                return;
            }

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login gagal. Periksa kembali NIK dan Password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FDFDFC] p-6">
            <div className="w-full max-w-sm">
                <div className="text-center mb-10">
                    <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
                    <p className="text-sm text-[#706f6c] mt-2">Enter your credentials to access admin panel</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-3">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-[#1b1b18]" htmlFor="nik">NIK</label>
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-[#706f6c]" size={18} />
                            <input
                                id="nik"
                                type="text"
                                placeholder="Enter your NIK"
                                className="w-full pl-10 pr-4 py-2 bg-white border border-[#1914001a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b1b18] focus:border-transparent transition-all"
                                value={nik}
                                onChange={(e) => setNik(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-[#1b1b18]" htmlFor="password">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#706f6c]" size={18} />
                            <input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                className="w-full pl-10 pr-4 py-2 bg-white border border-[#1914001a] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1b1b18] focus:border-transparent transition-all"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#1b1b18] text-white py-2.5 rounded-lg font-medium hover:bg-[#2b2b28] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : 'Sign in'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
