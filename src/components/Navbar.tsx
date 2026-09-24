import React, { useState } from 'react';
import {
  Shield,
  Bot,
  GraduationCap,
  Headphones,
  Bell,
  Sparkles,
  ChevronDown,
  Layers,
  LogOut,
  Building2,
  ExternalLink,
  UserCheck,
  Menu,
  X
} from 'lucide-react';
import { User, UserRole, AppNotification, Organization } from '../types/index.ts';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  currentUser: User;
  onSwitchRole: (role: UserRole) => void;
  notifications: AppNotification[];
  onMarkNotificationRead: (id: string) => void;
  organization: Organization;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  currentUser,
  onSwitchRole,
  notifications,
  onMarkNotificationRead,
  organization,
  onOpenAuth
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const roleLabels: Record<UserRole, { label: string; color: string; desc: string }> = {
    admin: { label: 'Admin', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30', desc: 'Operations & Governance' },
    trainer: { label: 'Trainer', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30', desc: 'Coaching & Scenario Creator' },
    employee: { label: 'Employee', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', desc: 'AI Practice & Simulator' },
    customer: { label: 'Customer', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30', desc: 'Support Assistance' },
  };

  const navItems = [
    { id: 'landing', label: 'Overview', icon: Bot, color: 'text-white' },
    { id: 'customer', label: 'Customer Support', icon: Headphones, color: 'text-[#00D4FF]' },
    { id: 'admin', label: 'Admin Portal', icon: Shield, color: 'text-purple-400' },
    { id: 'trainer', label: 'Trainer Hub', icon: GraduationCap, color: 'text-purple-300' },
    { id: 'employee', label: 'AI Simulator', icon: Sparkles, color: 'text-[#00E5B0]' },
  ];

  const handleNavClick = (viewId: string) => {
    setCurrentView(viewId);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#071225]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Brand & Tagline */}
        <div className="flex items-center gap-4 sm:gap-6">
          <button
            onClick={() => handleNavClick('landing')}
            className="flex items-center gap-2.5 sm:gap-3 group text-left transition-all"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-[#4F8CFF] to-[#7C5CFF] p-0.5 shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-[#0B1630] rounded-[10px] flex items-center justify-center">
                <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-[#00D4FF]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  SERVEX AI
                </span>
                <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-[#00E5B0] bg-[#00E5B0]/10 border border-[#00E5B0]/30 px-1.5 py-0.2 rounded">
                  Enterprise
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium hidden md:block">
                Customer Support · Coaching · RAG Policies
              </p>
            </div>
          </button>

          {/* Desktop & Laptop Navigation links (Hidden on mobile) */}
          <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-white/10">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-white/10 text-white font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: Quick Switcher, Notifications & User Info */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Quick Role Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#0B1630] border border-white/10 text-xs font-medium text-slate-300 hover:border-white/20 transition-all shadow-inner"
              title="Switch role instantly to test all modules"
            >
              <Layers className="w-3.5 h-3.5 text-[#4F8CFF]" />
              <span className="hidden sm:inline text-slate-400">Role:</span>
              <span className="font-semibold text-white capitalize text-[11px] sm:text-xs">{currentUser.role}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-[#0B1630] border border-white/10 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-1.5 border-b border-white/5">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Switch Test Persona
                  </p>
                  <p className="text-xs text-slate-500">
                    Explore different role privileges:
                  </p>
                </div>
                {(['admin', 'trainer', 'employee', 'customer'] as UserRole[]).map(role => (
                  <button
                    key={role}
                    onClick={() => {
                      onSwitchRole(role);
                      setShowRoleMenu(false);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-start gap-2.5 transition-colors ${
                      currentUser.role === role ? 'bg-white/5 text-white font-semibold' : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="w-2 h-2 rounded-full mt-1.5 bg-[#4F8CFF]" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="capitalize text-xs text-white">{role}</span>
                        {currentUser.role === role && (
                          <span className="text-[9px] text-[#00E5B0] bg-[#00E5B0]/10 px-1 rounded">Active</span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500">{roleLabels[role].desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg bg-[#0B1630] border border-white/10 text-slate-300 hover:text-white hover:border-white/20 transition-all"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-extrabold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-[#0B1630] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-3 border-b border-white/10 flex items-center justify-between">
                  <span className="text-xs font-bold text-white">System Notifications</span>
                  <span className="text-[11px] text-slate-400">
                    {unreadCount} unread
                  </span>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => onMarkNotificationRead(n.id)}
                        className={`p-3 transition-colors cursor-pointer hover:bg-white/5 ${
                          !n.read ? 'bg-blue-500/5' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold text-slate-200">
                            {n.title}
                          </p>
                          <span className="text-[10px] text-slate-500 whitespace-nowrap">
                            {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                          {n.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile / Organization (Laptop & Desktop) */}
          <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-white/10">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow">
              {currentUser.name.charAt(0)}
            </div>
            <div className="text-left text-xs">
              <p className="font-semibold text-white leading-tight">{currentUser.name}</p>
              <p className="text-[10px] text-slate-400 leading-tight truncate max-w-[120px]">
                {organization.name}
              </p>
            </div>
          </div>

          {/* Accounts switch button */}
          <button
            onClick={onOpenAuth}
            className="hidden sm:inline-block text-xs font-medium text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-white/5 transition-colors border border-white/10"
          >
            Accounts
          </button>

          {/* Mobile Hamburger Menu Toggle Button (Visible on mobile, hidden on desktop) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-[#0B1630] border border-white/10 text-slate-300 hover:text-white transition-colors"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>
      </div>

      {/* Mobile Slide-down Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#071225] px-4 py-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">Navigation</span>
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.color}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">Viewing</span>}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-[11px]">
                {currentUser.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-white leading-tight">{currentUser.name}</p>
                <p className="text-[10px] text-slate-400 leading-tight capitalize">{currentUser.role} · {organization.name}</p>
              </div>
            </div>
            <button
              onClick={() => {
                onOpenAuth();
                setIsMobileMenuOpen(false);
              }}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-medium"
            >
              Switch User
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
