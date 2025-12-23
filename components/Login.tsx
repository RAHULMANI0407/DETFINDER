
import React, { useState } from 'react';
import { UserRole, User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  onClose: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Mock authentication
    if (username === 'rahuldet' && password === 'rahuldet24') {
      onLogin({ id: '1', username: 'Admin', role: UserRole.ADMIN });
    } else if (username === 'testing' && password === 'det1') {
      onLogin({ id: '2', username: 'User', role: UserRole.USER });
    } else {
      setError('Invalid credentials. Hint: admin/admin123 or user/user123');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="bg-blue-600 p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-blue-600 text-4xl mx-auto mb-4 shadow-xl">
            <i className="fa-solid fa-user-lock"></i>
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">Access Gate</h2>
          <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mt-1">Doraemon Ever Tamil</p>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-bold p-3 rounded-xl flex items-center gap-2">
              <i className="fa-solid fa-circle-exclamation"></i>
              {error}
            </div>
          )}
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Username</label>
            <div className="relative">
              <i className="fa-solid fa-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-11 pr-4 focus:ring-4 focus:ring-blue-50 focus:border-blue-300 transition-all text-sm outline-none"
                placeholder="Enter username"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Password</label>
            <div className="relative">
              <i className="fa-solid fa-key absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-11 pr-4 focus:ring-4 focus:ring-blue-50 focus:border-blue-300 transition-all text-sm outline-none"
                placeholder="Enter password"
                required
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
          >
            Authenticate
          </button>

          <button 
            type="button"
            onClick={onClose}
            className="w-full py-2 text-slate-400 text-xs font-bold hover:text-slate-600 transition-colors uppercase tracking-widest"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};
