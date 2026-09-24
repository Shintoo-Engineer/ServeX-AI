import React, { useState } from 'react';
import { Shield, GraduationCap, Sparkles, Headphones, X, ArrowRight, UserCheck } from 'lucide-react';
import { User, UserRole } from '../types/index.ts';
import { api } from '../services/api.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSelectUser }) => {
  const [activeTab, setActiveTab] = useState<'demo' | 'login' | 'register'>('demo');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [role, setRole] = useState<UserRole>('employee');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const demoAccounts = [
    {
      role: 'admin' as UserRole,
      name: 'Sarah Vance',
      email: 'sarah.vance@servex.demo',
      desc: 'VP of Customer Experience & AI Governance',
      icon: Shield,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30 hover:border-indigo-500',
    },
    {
      role: 'trainer' as UserRole,
      name: 'Marcus Sterling',
      email: 'marcus.sterling@servex.demo',
      desc: 'Head of Quality, Coaching & Enablement',
      icon: GraduationCap,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/30 hover:border-purple-500',
    },
    {
      role: 'employee' as UserRole,
      name: 'Elena Rostova',
      email: 'elena.rostova@servex.demo',
      desc: 'Senior Support Specialist (Simulations & Practice)',
      icon: Sparkles,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500',
    },
    {
      role: 'customer' as UserRole,
      name: 'David Miller',
      email: 'david.miller@example.com',
      desc: 'External Customer (Support & Inquiries)',
      icon: Headphones,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30 hover:border-cyan-500',
    },
  ];

  const handleDemoSelect = async (account: typeof demoAccounts[0]) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.login(account.email);
      onSelectUser(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to switch demo account');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.login(email, password);
      onSelectUser(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.register({
        name,
        email,
        organizationName: orgName || 'ServeX Enterprises',
        role,
      });
      onSelectUser(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#0B1630] border border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
        >
          <X className="w-4 h-4" />
        </button>

        <h2 className="text-xl font-bold text-white mb-1">ServeX AI Enterprise Access</h2>
        <p className="text-xs text-slate-400 mb-6">
          Switch test persona or sign into your customized enterprise workspace.
        </p>

        {/* Tab switch */}
        <div className="flex border-b border-white/10 mb-6">
          <button
            onClick={() => setActiveTab('demo')}
            className={`flex-1 pb-3 text-xs font-semibold text-center border-b-2 transition-colors ${
              activeTab === 'demo'
                ? 'border-[#4F8CFF] text-[#4F8CFF]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            1-Click Demo Accounts
          </button>
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 pb-3 text-xs font-semibold text-center border-b-2 transition-colors ${
              activeTab === 'login'
                ? 'border-[#4F8CFF] text-[#4F8CFF]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 pb-3 text-xs font-semibold text-center border-b-2 transition-colors ${
              activeTab === 'register'
                ? 'border-[#4F8CFF] text-[#4F8CFF]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Create Organization
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300">
            {error}
          </div>
        )}

        {/* 1-Click Demo accounts */}
        {activeTab === 'demo' && (
          <div className="space-y-3">
            {demoAccounts.map(acc => {
              const Icon = acc.icon;
              return (
                <button
                  key={acc.email}
                  onClick={() => handleDemoSelect(acc)}
                  disabled={loading}
                  className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between group ${acc.color}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/5">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{acc.name}</span>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-white/10">
                          {acc.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{acc.desc}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-white transition-all" />
                </button>
              );
            })}
          </div>
        )}

        {/* Login form */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Work Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                className="w-full bg-[#101B35] border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#101B35] border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-500/20 transition-colors"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        )}

        {/* Register form */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Your Full Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Rachel Adams"
                required
                className="w-full bg-[#101B35] border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Work Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="rachel@enterprise.com"
                required
                className="w-full bg-[#101B35] border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Company / Organization</label>
              <input
                type="text"
                value={orgName}
                onChange={e => setOrgName(e.target.value)}
                placeholder="Acme Global Logistics"
                className="w-full bg-[#101B35] border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Primary Role</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as any)}
                className="w-full bg-[#101B35] border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="admin">Administrator / CX Lead</option>
                <option value="trainer">Trainer / Quality Coach</option>
                <option value="employee">Support Specialist / Agent</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-500/20 transition-colors"
            >
              {loading ? 'Creating Workspace...' : 'Register Workspace'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
