/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { LandingPage } from './components/LandingPage.tsx';
import { CustomerSupportChat } from './components/CustomerSupportChat.tsx';
import { AdminPortal } from './components/AdminPortal.tsx';
import { TrainerPortal } from './components/TrainerPortal.tsx';
import { EmployeePortal } from './components/EmployeePortal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { AppNotification, Organization, User, UserRole } from './types/index.ts';
import { api } from './services/api.ts';
import { Bot, Shield, Sparkles, Headphones, Layers, CheckCircle } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('landing');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [organization, setOrganization] = useState<Organization>({
    id: 'org_servex_demo',
    name: 'ServeX Enterprises',
    createdAt: new Date().toISOString(),
    settings: {
      aiTone: 'empathetic',
      escalationThreshold: 'medium',
      autoEscalateFrustration: true,
      maxChatTurnsBeforeEscalation: 5,
      fallbackMessage:
        "I want to make sure you receive 100% accurate information according to our verified policies. Let me connect you directly with a senior customer support specialist who can assist further.",
    },
  });

  const [currentUser, setCurrentUser] = useState<User>({
    id: 'user_admin',
    name: 'Sarah Vance',
    email: 'sarah.vance@servex.demo',
    role: 'admin',
    organizationId: 'org_servex_demo',
    department: 'Customer Operations & Governance',
    createdAt: new Date().toISOString(),
  });

  useEffect(() => {
    // Load initial user, org, and notifications
    loadInitialState();
  }, []);

  const loadInitialState = async () => {
    try {
      const [userRes, notifRes, settingsRes] = await Promise.all([
        api.getCurrentUser(),
        api.getNotifications(),
        api.getSettings(),
      ]);

      if (userRes.user) setCurrentUser(userRes.user);
      if (notifRes.notifications) setNotifications(notifRes.notifications);
      if (settingsRes.organization) setOrganization(settingsRes.organization);
    } catch (e) {
      console.error('Failed to load initial state:', e);
    }
  };

  const handleSwitchRole = async (role: UserRole) => {
    const roleProfiles: Record<UserRole, { email: string; name: string; dept: string }> = {
      admin: { email: 'sarah.vance@servex.demo', name: 'Sarah Vance', dept: 'Operations & Governance' },
      trainer: { email: 'marcus.sterling@servex.demo', name: 'Marcus Sterling', dept: 'Quality & Enablement' },
      employee: { email: 'elena.rostova@servex.demo', name: 'Elena Rostova', dept: 'Support Specialist' },
      customer: { email: 'david.miller@example.com', name: 'David Miller', dept: 'External Customer' },
    };

    const profile = roleProfiles[role];
    try {
      const res = await api.login(profile.email);
      setCurrentUser(res.user);
    } catch (e) {
      setCurrentUser(prev => ({
        ...prev,
        role,
        name: profile.name,
        email: profile.email,
        department: profile.dept,
      }));
    }

    // Auto-navigate to appropriate view for convenient exploration
    if (role === 'admin') setCurrentView('admin');
    else if (role === 'trainer') setCurrentView('trainer');
    else if (role === 'employee') setCurrentView('employee');
    else if (role === 'customer') setCurrentView('customer');
  };

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#071225] text-slate-100 flex flex-col font-sans selection:bg-[#4F8CFF]/30 selection:text-white">
      
      {/* Top Banner Navigation */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        currentUser={currentUser}
        onSwitchRole={handleSwitchRole}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        organization={organization}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'landing' && <LandingPage onNavigate={setCurrentView} />}
        {currentView === 'customer' && <CustomerSupportChat />}
        {currentView === 'admin' && (
          <AdminPortal
            organization={organization}
            onUpdateOrg={setOrganization}
          />
        )}
        {currentView === 'trainer' && <TrainerPortal />}
        {currentView === 'employee' && <EmployeePortal />}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#0B1630] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#4F8CFF] to-[#7C5CFF] flex items-center justify-center text-white">
              <Bot className="w-4 h-4 text-[#00D4FF]" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-white">SERVEX AI</span>
              <p className="text-[11px] text-slate-400">
                AI-Powered Customer Service & Employee Coaching Platform
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-[#00E5B0]" />
              <span>3 Pillars: 24/7 AI Support · AI Employee Coaching · Policy RAG</span>
            </div>
            <span>·</span>
            <span>Zero Hallucination Protocol</span>
            <span>·</span>
            <span>Enterprise Security SOC-2</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSwitchRole('admin')}
              className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-[11px] text-slate-300 transition-colors"
            >
              Admin View
            </button>
            <button
              onClick={() => handleSwitchRole('trainer')}
              className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-[11px] text-slate-300 transition-colors"
            >
              Trainer View
            </button>
            <button
              onClick={() => handleSwitchRole('employee')}
              className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-[11px] text-slate-300 transition-colors"
            >
              Simulator View
            </button>
            <button
              onClick={() => handleSwitchRole('customer')}
              className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-[11px] text-slate-300 transition-colors"
            >
              Customer Chat
            </button>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSelectUser={u => setCurrentUser(u)}
      />
    </div>
  );
}
