import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  ShieldAlert,
  BookOpen,
  FileText,
  Users,
  BarChart3,
  Sliders,
  FileSpreadsheet,
  Upload,
  Trash2,
  RefreshCw,
  Search,
  CheckCircle,
  Clock,
  Send,
  AlertCircle,
  Eye,
  Plus,
  Settings,
  Shield,
  HelpCircle,
  Activity,
  Layers,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api.ts';
import {
  CompanyDocument,
  DocumentChunk,
  OrgSettings,
  Organization,
  SupportConversation,
  User,
  AuditLogEntry
} from '../types/index.ts';
import { PolicyFileUploader } from './admin/PolicyFileUploader.tsx';

interface AdminPortalProps {
  organization: Organization;
  onUpdateOrg: (org: Organization) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ organization, onUpdateOrg }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'conversations' | 'escalations' | 'knowledge' | 'policies' | 'users' | 'analytics' | 'settings' | 'audit'>('dashboard');
  
  // Data states
  const [conversations, setConversations] = useState<SupportConversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<SupportConversation | null>(null);
  const [replyText, setReplyText] = useState('');
  const [agentNote, setAgentNote] = useState('');
  
  const [documents, setDocuments] = useState<CompanyDocument[]>([]);
  const [totalChunks, setTotalChunks] = useState(0);
  const [selectedDocChunks, setSelectedDocChunks] = useState<DocumentChunk[] | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // Upload modal inputs
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadFilename, setUploadFilename] = useState('');
  const [uploadType, setUploadType] = useState<'PDF' | 'DOCX' | 'TXT'>('PDF');
  const [uploadCategory, setUploadCategory] = useState<'refund' | 'shipping' | 'return' | 'warranty' | 'cancellation' | 'general'>('refund');
  const [uploadContent, setUploadContent] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'admin' | 'trainer' | 'employee'>('employee');
  const [newUserDept, setNewUserDept] = useState('Customer Support');

  // Analytics
  const [analytics, setAnalytics] = useState<any>(null);

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  // Settings
  const [settingsForm, setSettingsForm] = useState<OrgSettings>({ ...organization.settings });
  const [orgNameInput, setOrgNameInput] = useState(organization.name);
  const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const [convRes, docRes, userRes, anaRes, logRes] = await Promise.all([
        api.getConversations(),
        api.getDocuments(),
        api.getUsers(),
        api.getSupportAnalytics(),
        api.getAuditLogs(),
      ]);

      setConversations(convRes.conversations);
      if (convRes.conversations.length > 0 && !selectedConv) {
        setSelectedConv(convRes.conversations[0]);
      }
      setDocuments(docRes.documents);
      setTotalChunks(docRes.totalChunks);
      setUsers(userRes.users);
      setAnalytics(anaRes);
      setAuditLogs(logRes.auditLogs);
    } catch (e) {
      console.error('Error fetching admin data:', e);
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle || !uploadContent) return;
    setUploadLoading(true);

    try {
      await api.uploadDocument({
        title: uploadTitle,
        filename: uploadFilename || `${uploadTitle.toLowerCase().replace(/\s+/g, '_')}.${uploadType.toLowerCase()}`,
        type: uploadType,
        category: uploadCategory,
        content: uploadContent,
        uploadedBy: 'Sarah Vance',
      });

      setShowUploadModal(false);
      setUploadTitle('');
      setUploadFilename('');
      setUploadContent('');
      await loadAllData();
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDeleteDoc = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document from RAG index?')) return;
    try {
      await api.deleteDocument(id);
      await loadAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleReindexDoc = async (id: string) => {
    try {
      await api.reindexDocument(id);
      await loadAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAgentReply = async () => {
    if (!selectedConv || !replyText.trim()) return;
    try {
      const res = await api.replyToConversation(selectedConv.id, replyText, 'Sarah Vance (Ops)');
      setSelectedConv(res.conversation);
      setReplyText('');
      await loadAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleResolveConv = async () => {
    if (!selectedConv) return;
    try {
      const res = await api.resolveConversation(selectedConv.id, agentNote || 'Resolved by Sarah Vance');
      setSelectedConv(res.conversation);
      setAgentNote('');
      await loadAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleEscalateConv = async () => {
    if (!selectedConv) return;
    try {
      const res = await api.escalateConversation(selectedConv.id, 'Prioritized to Senior Operations Manager');
      setSelectedConv(res.conversation);
      await loadAllData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.updateSettings({
        name: orgNameInput,
        settings: settingsForm,
      });
      onUpdateOrg(res.organization);
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;
    try {
      await api.createUser({
        name: newUserName,
        email: newUserEmail,
        role: newUserRole,
        department: newUserDept,
      });
      setShowAddUserModal(false);
      setNewUserName('');
      setNewUserEmail('');
      await loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const escalatedConversations = conversations.filter(c => c.status === 'escalated');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Top Banner / Org Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#4F8CFF] uppercase tracking-wider">Enterprise Administration</span>
            <span className="text-[10px] text-[#00E5B0] bg-[#00E5B0]/10 border border-[#00E5B0]/30 px-2 py-0.5 rounded">
              Active Tenant
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            {organization.name}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Knowledge Vector Core · Support Orchestration · Multi-Tenant Governance
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#4F8CFF] to-[#7C5CFF] text-white text-xs font-semibold shadow-lg shadow-blue-500/20 hover:opacity-90 transition-opacity"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Policy Document</span>
          </button>
        </div>
      </div>

      {/* Responsive Mobile / Tablet Tab Switcher (Visible on mobile/tablet, hidden on desktop) */}
      <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-4 -mx-2 px-2">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'conversations', label: `Live Support (${conversations.length})`, icon: MessageSquare },
          { id: 'escalations', label: `Escalations (${escalatedConversations.length})`, icon: ShieldAlert, badge: escalatedConversations.length },
          { id: 'knowledge', label: `RAG Policies (${documents.length})`, icon: BookOpen },
          { id: 'policies', label: 'Governance', icon: FileText },
          { id: 'users', label: 'Staff', icon: Users },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          { id: 'settings', label: 'AI Settings', icon: Sliders },
        ].map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-[#0B1630] border border-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Layout: Sub-navigation & Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sidebar Nav (Desktop) */}
        <div className="hidden lg:block lg:col-span-3 space-y-4">
          <div className="glass-panel rounded-2xl p-2 border border-white/10 shadow-lg space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4" />
                <span>Executive Dashboard</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('conversations')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'conversations'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare className="w-4 h-4" />
                <span>Live Conversations</span>
              </div>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full">
                {conversations.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('escalations')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'escalations'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Human Escalations</span>
              </div>
              {escalatedConversations.length > 0 && (
                <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                  {escalatedConversations.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('knowledge')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'knowledge'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4" />
                <span>Knowledge Base (RAG)</span>
              </div>
              <span className="text-[10px] text-slate-400">
                {documents.length} docs
              </span>
            </button>

            <button
              onClick={() => setActiveTab('policies')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'policies'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4" />
                <span>Policy Governance</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'users'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4" />
                <span>Employees & Staff</span>
              </div>
              <span className="text-[10px] text-slate-400">
                {users.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'analytics'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BarChart3 className="w-4 h-4" />
                <span>Analytics & Insights</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'settings'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Sliders className="w-4 h-4" />
                <span>AI Configuration</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'audit'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-4 h-4" />
                <span>Audit Logs</span>
              </div>
            </button>
          </div>

          {/* Quick RAG stats card */}
          <div className="glass-panel rounded-2xl p-4 border border-white/10 text-xs">
            <span className="font-bold text-slate-200">Vector Knowledge Status</span>
            <div className="mt-3 space-y-2 text-slate-400">
              <div className="flex justify-between">
                <span>Vectorized Chunks:</span>
                <span className="font-bold text-[#00E5B0]">{totalChunks} chunks</span>
              </div>
              <div className="flex justify-between">
                <span>Search Accuracy:</span>
                <span className="font-bold text-white">99.4%</span>
              </div>
              <div className="flex justify-between">
                <span>RAG Retrieval Latency:</span>
                <span className="font-bold text-[#00D4FF]">~45ms</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Pane */}
        <div className="lg:col-span-9">
          
          {/* TAB 1: EXECUTIVE DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="glass-panel rounded-2xl p-4 border border-white/10">
                  <span className="text-[11px] font-semibold text-slate-400">Total Conversations</span>
                  <p className="text-2xl font-extrabold text-white mt-1">24,832</p>
                  <span className="text-[10px] text-[#00E5B0] font-semibold">+14.2% this month</span>
                </div>
                <div className="glass-panel rounded-2xl p-4 border border-white/10">
                  <span className="text-[11px] font-semibold text-slate-400">AI Resolved Rate</span>
                  <p className="text-2xl font-extrabold text-[#00D4FF] mt-1">88.4%</p>
                  <span className="text-[10px] text-slate-400 font-semibold">19,420 resolved solo</span>
                </div>
                <div className="glass-panel rounded-2xl p-4 border border-white/10">
                  <span className="text-[11px] font-semibold text-slate-400">Human Escalations</span>
                  <p className="text-2xl font-extrabold text-amber-400 mt-1">2,530</p>
                  <span className="text-[10px] text-slate-400 font-semibold">10.2% handoff rate</span>
                </div>
                <div className="glass-panel rounded-2xl p-4 border border-white/10">
                  <span className="text-[11px] font-semibold text-slate-400">Customer Satisfaction</span>
                  <p className="text-2xl font-extrabold text-[#00E5B0] mt-1">91%</p>
                  <span className="text-[10px] text-slate-400 font-semibold">Avg rating 4.8 / 5.0</span>
                </div>
              </div>

              {/* Secondary Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="glass-panel rounded-2xl p-4 border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400">Avg Response Time</span>
                    <p className="text-xl font-bold text-white mt-0.5">2.4 sec</p>
                  </div>
                  <Clock className="w-6 h-6 text-[#4F8CFF]" />
                </div>
                <div className="glass-panel rounded-2xl p-4 border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400">Active Live Chats</span>
                    <p className="text-xl font-bold text-[#00E5B0] mt-0.5">14 active</p>
                  </div>
                  <Activity className="w-6 h-6 text-[#00E5B0]" />
                </div>
                <div className="glass-panel rounded-2xl p-4 border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400">High Priority Cases</span>
                    <p className="text-xl font-bold text-red-400 mt-0.5">
                      {conversations.filter(c => c.priority === 'high' || c.priority === 'critical').length} cases
                    </p>
                  </div>
                  <ShieldAlert className="w-6 h-6 text-red-400" />
                </div>
              </div>

              {/* Resolution Trend Chart Simulation */}
              <div className="glass-panel rounded-2xl p-5 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white">Weekly Resolution Volume: AI vs. Human</h3>
                    <p className="text-xs text-slate-400">Breakdown of support tickets handled across the past 7 days</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1.5 text-[#4F8CFF]">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#4F8CFF]" />
                      AI Autonomous
                    </span>
                    <span className="flex items-center gap-1.5 text-purple-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                      Human Specialist
                    </span>
                  </div>
                </div>

                <div className="h-44 flex items-end gap-3 pt-6 border-b border-white/10">
                  {[
                    { day: 'Mon', ai: 78, human: 12 },
                    { day: 'Tue', ai: 82, human: 10 },
                    { day: 'Wed', ai: 85, human: 14 },
                    { day: 'Thu', ai: 80, human: 11 },
                    { day: 'Fri', ai: 88, human: 15 },
                    { day: 'Sat', ai: 68, human: 8 },
                    { day: 'Sun', ai: 60, human: 6 },
                  ].map((bar, bIdx) => (
                    <div key={bIdx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                      <div className="w-full flex items-end justify-center gap-1 h-full">
                        <div
                          style={{ height: `${bar.ai}%` }}
                          className="w-1/2 bg-gradient-to-t from-[#4F8CFF] to-[#00D4FF] rounded-t-md transition-all hover:brightness-110"
                          title={`AI Handled: ${bar.ai}%`}
                        />
                        <div
                          style={{ height: `${bar.human * 2}%` }}
                          className="w-1/2 bg-gradient-to-t from-[#7C5CFF] to-purple-400 rounded-t-md transition-all hover:brightness-110"
                          title={`Human Handled: ${bar.human}%`}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 mt-2">{bar.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sentiment & Intents */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Sentiment Distribution */}
                <div className="glass-panel rounded-2xl p-5 border border-white/10">
                  <h3 className="text-sm font-bold text-white mb-1">Customer Sentiment Breakdown</h3>
                  <p className="text-xs text-slate-400 mb-4">Signal detection across active conversations</p>
                  
                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#00E5B0]" />
                          Positive Sentiment
                        </span>
                        <span className="font-semibold text-white">62%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-[#00E5B0] w-[62%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-slate-400" />
                          Neutral Inquiry
                        </span>
                        <span className="font-semibold text-white">24%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-400 w-[24%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-400" />
                          Frustrated / Impatient
                        </span>
                        <span className="font-semibold text-white">10%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 w-[10%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-red-400" />
                          Angry / Critical Escalation
                        </span>
                        <span className="font-semibold text-white">4%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-red-400 w-[4%]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top Query Categories */}
                <div className="glass-panel rounded-2xl p-5 border border-white/10">
                  <h3 className="text-sm font-bold text-white mb-1">Top Query Intents</h3>
                  <p className="text-xs text-slate-400 mb-4">Most frequently matched company policies</p>
                  
                  <div className="space-y-2 text-xs">
                    {[
                      { intent: 'REFUND_STATUS', policy: 'ServeX Refund Policy v3.2', share: '34%' },
                      { intent: 'SHIPPING_TRACKING', policy: 'Global Logistics Guidelines', share: '25%' },
                      { intent: 'ORDER_CANCELLATION', policy: 'Cancellation Protocol (60m)', share: '16%' },
                      { intent: 'DAMAGED_GOODS', policy: 'Replacement & Defect SOP', share: '11%' },
                      { intent: 'SECURITY_ESCALATION', policy: 'Support Security Manual', share: '6%' },
                    ].map((item, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-[#0B1630] border border-white/5 flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-white">{item.intent}</span>
                          <p className="text-[10px] text-slate-400">{item.policy}</p>
                        </div>
                        <span className="text-xs font-bold text-[#4F8CFF] bg-blue-500/10 px-2 py-0.5 rounded">
                          {item.share}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2 & 3: LIVE CONVERSATIONS & ESCALATIONS */}
          {(activeTab === 'conversations' || activeTab === 'escalations') && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[700px]">
              
              {/* Left Column: Conversations List */}
              <div className="md:col-span-5 glass-panel rounded-2xl border border-white/10 p-3 flex flex-col overflow-hidden">
                <div className="p-2 border-b border-white/10 flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white">
                    {activeTab === 'escalations' ? 'Escalated Cases Queue' : 'All Conversations'}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {activeTab === 'escalations' ? escalatedConversations.length : conversations.length} tickets
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2">
                  {(activeTab === 'escalations' ? escalatedConversations : conversations).map(conv => (
                    <div
                      key={conv.id}
                      onClick={() => setSelectedConv(conv)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        selectedConv?.id === conv.id
                          ? 'bg-blue-600/20 border-blue-500 shadow-md'
                          : 'bg-[#0B1630] border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <span className="font-bold text-white">{conv.customerName}</span>
                        <div className="flex items-center gap-1">
                          {conv.status === 'escalated' && (
                            <span className="text-[9px] bg-red-500/20 text-red-400 font-bold px-1.5 py-0.5 rounded">
                              Escalated
                            </span>
                          )}
                          {conv.status === 'resolved' && (
                            <span className="text-[9px] bg-[#00E5B0]/20 text-[#00E5B0] font-bold px-1.5 py-0.5 rounded">
                              Resolved
                            </span>
                          )}
                          {conv.status === 'active' && (
                            <span className="text-[9px] bg-blue-500/20 text-blue-400 font-bold px-1.5 py-0.5 rounded">
                              Active
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-400 line-clamp-1 mb-1.5">
                        {conv.messages[conv.messages.length - 1]?.text || 'No messages'}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span className="font-mono text-[#00D4FF]">{conv.intent}</span>
                        <span>{new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Selected Conversation Detail & Human Response */}
              <div className="md:col-span-7 glass-panel rounded-2xl border border-white/10 flex flex-col overflow-hidden">
                {selectedConv ? (
                  <>
                    {/* Header info */}
                    <div className="p-4 border-b border-white/10 bg-[#0B1630]/60 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white">{selectedConv.customerName}</h3>
                          <span className="text-[11px] text-slate-400">({selectedConv.customerEmail})</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                          <span>Priority: <strong className="text-white uppercase">{selectedConv.priority}</strong></span>
                          <span>·</span>
                          <span>Sentiment: <strong className="text-amber-400 uppercase">{selectedConv.sentiment}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {selectedConv.status !== 'resolved' && (
                          <button
                            onClick={handleResolveConv}
                            className="px-2.5 py-1.5 rounded-lg bg-[#00E5B0]/20 border border-[#00E5B0]/40 text-[#00E5B0] text-xs font-semibold hover:bg-[#00E5B0]/30 transition-colors"
                          >
                            Mark Resolved
                          </button>
                        )}
                        {selectedConv.status !== 'escalated' && (
                          <button
                            onClick={handleEscalateConv}
                            className="px-2.5 py-1.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-semibold hover:bg-red-500/30 transition-colors"
                          >
                            Escalate
                          </button>
                        )}
                      </div>
                    </div>

                    {/* AI Escalation Warning Note if present */}
                    {selectedConv.escalationReason && (
                      <div className="p-3 bg-red-500/10 border-b border-red-500/20 flex items-start gap-2 text-xs text-red-300">
                        <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-red-200">Escalation Trigger: </strong>
                          <span>{selectedConv.escalationReason}</span>
                        </div>
                      </div>
                    )}

                    {/* Messages Body */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-3">
                      {selectedConv.messages.map((m, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl text-xs ${
                            m.sender === 'customer'
                              ? 'bg-[#101B35] border border-white/5 text-slate-200 mr-8'
                              : m.sender === 'agent'
                              ? 'bg-purple-950/40 border border-purple-500/30 text-purple-100 ml-8'
                              : m.sender === 'system'
                              ? 'bg-amber-950/30 border border-amber-500/20 text-amber-200'
                              : 'bg-blue-950/40 border border-blue-500/30 text-blue-100 ml-8'
                          }`}
                        >
                          <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1 pb-1 border-b border-white/5">
                            <span className="font-bold text-white capitalize">{m.senderName || m.sender}</span>
                            <span>{new Date(m.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <p className="whitespace-pre-wrap">{m.text}</p>
                          {m.citedDocs && m.citedDocs.length > 0 && (
                            <div className="mt-2 pt-1.5 border-t border-white/10 text-[10px] text-cyan-300">
                              Cited Policy: {m.citedDocs[0].title}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Agent Response Box */}
                    <div className="p-3 border-t border-white/10 bg-[#071225]">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                          placeholder="Type human agent response to customer..."
                          className="flex-1 bg-[#0B1630] border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                        <button
                          onClick={handleAgentReply}
                          className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Reply</span>
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-xs text-slate-500">
                    Select a conversation to inspect details
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 4: KNOWLEDGE BASE (RAG) */}
          {activeTab === 'knowledge' && (
            <div className="space-y-6">
              
              {/* Interactive File Upload & Processing Component for Admin RAG */}
              <PolicyFileUploader
                onDocumentUploaded={loadAllData}
                existingDocumentsCount={documents.length}
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-white/10">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">Indexed Policy Catalog ({documents.length} Active Documents)</h3>
                  <p className="text-xs text-slate-400">
                    Live vectorized corporate policy manuals, warranties, and return guidelines powering real-time RAG answers
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono bg-blue-500/10 text-[#00D4FF] border border-blue-500/20 px-2.5 py-1 rounded-lg">
                    Total Chunks: {totalChunks}
                  </span>
                </div>
              </div>

              {/* Documents List */}
              <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-[#0B1630] text-slate-400 uppercase text-[10px] font-bold border-b border-white/10">
                      <tr>
                        <th className="p-3.5">Document Title</th>
                        <th className="p-3.5">Category</th>
                        <th className="p-3.5">Format</th>
                        <th className="p-3.5">Chunks</th>
                        <th className="p-3.5">Uploaded By</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {documents.map(doc => (
                        <tr key={doc.id} className="hover:bg-white/5 transition-colors">
                          <td className="p-3.5 font-semibold text-white">
                            <div>{doc.title}</div>
                            <span className="text-[10px] text-slate-500">{doc.filename} · v{doc.version}</span>
                          </td>
                          <td className="p-3.5 capitalize">
                            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-medium">
                              {doc.category}
                            </span>
                          </td>
                          <td className="p-3.5 font-mono text-[11px] text-slate-400">{doc.type}</td>
                          <td className="p-3.5 font-bold text-[#00E5B0]">{doc.chunkCount}</td>
                          <td className="p-3.5 text-slate-400">{doc.uploadedBy}</td>
                          <td className="p-3.5">
                            <span className="inline-flex items-center gap-1 text-[10px] text-[#00E5B0] font-semibold">
                              <CheckCircle className="w-3 h-3" />
                              Indexed
                            </span>
                          </td>
                          <td className="p-3.5 text-right space-x-2">
                            <button
                              onClick={() => handleReindexDoc(doc.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                              title="Re-index document"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteDoc(doc.id)}
                              className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                              title="Delete document"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: POLICY GOVERNANCE */}
          {activeTab === 'policies' && (
            <div className="space-y-6">
              <div className="glass-panel rounded-2xl p-6 border border-white/10">
                <h3 className="text-base font-bold text-white mb-2">Automated Policy Enforcement Rules</h3>
                <p className="text-xs text-slate-400 mb-6">
                  Configure real-time safety guardrails and strictness criteria across all customer AI interactions.
                </p>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-[#0B1630] border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white">Refund 30-Day Window Enforcement</span>
                      <p className="text-[11px] text-slate-400">Strictly decline refund requests exceeding 30 calendar days from delivery date.</p>
                    </div>
                    <span className="text-[10px] font-bold text-[#00E5B0] bg-emerald-500/10 border border-emerald-500/30 px-2 py-1 rounded">Active</span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0B1630] border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white">Damaged Goods Instant Replacement Guarantee</span>
                      <p className="text-[11px] text-slate-400">Require photo proof before expediting free overnight parcel replacement.</p>
                    </div>
                    <span className="text-[10px] font-bold text-[#00E5B0] bg-emerald-500/10 border border-emerald-500/30 px-2 py-1 rounded">Active</span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0B1630] border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white">Warehouse 60-Minute Cancellation Cutoff</span>
                      <p className="text-[11px] text-slate-400">Once order is in picking stage, guide user to pre-paid return workflow.</p>
                    </div>
                    <span className="text-[10px] font-bold text-[#00E5B0] bg-emerald-500/10 border border-emerald-500/30 px-2 py-1 rounded">Active</span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0B1630] border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white">Financial Security Zero-Invention Rule</span>
                      <p className="text-[11px] text-slate-400">Never request credit card CVC or full passwords in chat; escalate fraud triggers immediately.</p>
                    </div>
                    <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 border border-purple-500/30 px-2 py-1 rounded">Strict Escalation</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: USERS & STAFF */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Organization Members</h3>
                  <p className="text-xs text-slate-400">Manage admins, quality trainers, and support agents</p>
                </div>
                <button
                  onClick={() => setShowAddUserModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Member</span>
                </button>
              </div>

              <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#0B1630] text-slate-400 uppercase text-[10px] font-bold border-b border-white/10">
                    <tr>
                      <th className="p-3.5">Name</th>
                      <th className="p-3.5">Email</th>
                      <th className="p-3.5">Role</th>
                      <th className="p-3.5">Department</th>
                      <th className="p-3.5">Added Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3.5 font-bold text-white">{u.name}</td>
                        <td className="p-3.5 font-mono text-slate-400">{u.email}</td>
                        <td className="p-3.5 capitalize font-semibold">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${
                            u.role === 'admin' ? 'bg-indigo-500/20 text-indigo-300' :
                            u.role === 'trainer' ? 'bg-purple-500/20 text-purple-300' :
                            'bg-emerald-500/20 text-emerald-300'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3.5 text-slate-400">{u.department || 'Support'}</td>
                        <td className="p-3.5 text-slate-500 text-[11px]">{new Date(u.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="glass-panel rounded-2xl p-6 border border-white/10">
                <h3 className="text-base font-bold text-white mb-1">Deep Support Operations Analytics</h3>
                <p className="text-xs text-slate-400 mb-6">Comprehensive metrics across AI automation, resolution times, and customer satisfaction</p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 rounded-xl bg-[#0B1630] border border-white/5">
                    <span className="text-[11px] text-slate-400">Total Customer Volume</span>
                    <p className="text-2xl font-bold text-white mt-1">24,832</p>
                    <span className="text-[10px] text-emerald-400">99.8% uptime SLA</span>
                  </div>
                  <div className="p-4 rounded-xl bg-[#0B1630] border border-white/5">
                    <span className="text-[11px] text-slate-400">First Contact Resolution</span>
                    <p className="text-2xl font-bold text-[#4F8CFF] mt-1">84.1%</p>
                    <span className="text-[10px] text-slate-400">+5.4% improvement</span>
                  </div>
                  <div className="p-4 rounded-xl bg-[#0B1630] border border-white/5">
                    <span className="text-[11px] text-slate-400">Cost Savings Estimate</span>
                    <p className="text-2xl font-bold text-[#00E5B0] mt-1">$48,200/mo</p>
                    <span className="text-[10px] text-slate-400">vs 100% human tier-1</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0B1630] border border-white/5">
                  <h4 className="text-xs font-bold text-white mb-2">Policy Retrieval Hit Rate</h4>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-[#00E5B0] w-[94%]" />
                    </div>
                    <span className="text-xs font-bold text-white">94.2%</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2">
                    Only 5.8% of queries lack verified policy context, triggering polite escalation handoff.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: AI CONFIGURATION & SETTINGS */}
          {activeTab === 'settings' && (
            <div className="glass-panel rounded-2xl p-6 border border-white/10">
              <h3 className="text-base font-bold text-white mb-1">AI Orchestration & Behavior Settings</h3>
              <p className="text-xs text-slate-400 mb-6">
                Adjust response persona, escalation sensitivities, and custom safety fallbacks.
              </p>

              <form onSubmit={handleSaveSettings} className="space-y-5 text-xs">
                
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Organization Name</label>
                  <input
                    type="text"
                    value={orgNameInput}
                    onChange={e => setOrgNameInput(e.target.value)}
                    className="w-full sm:w-80 bg-[#0B1630] border border-white/15 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">AI Brand Voice Tone</label>
                  <select
                    value={settingsForm.aiTone}
                    onChange={e => setSettingsForm({ ...settingsForm, aiTone: e.target.value as any })}
                    className="w-full sm:w-80 bg-[#0B1630] border border-white/15 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="empathetic">Empathetic & Supportive (Recommended)</option>
                    <option value="professional">Professional & Objective</option>
                    <option value="concise">Concise & Action-Oriented</option>
                    <option value="formal">Formal & Enterprise Strict</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Escalation Threshold Strictness</label>
                  <select
                    value={settingsForm.escalationThreshold}
                    onChange={e => setSettingsForm({ ...settingsForm, escalationThreshold: e.target.value as any })}
                    className="w-full sm:w-80 bg-[#0B1630] border border-white/15 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="low">Low (Resolve aggressively with AI)</option>
                    <option value="medium">Medium (Standard safety handoff)</option>
                    <option value="strict">Strict (Immediate handoff upon doubt)</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="autoEscalate"
                    checked={settingsForm.autoEscalateFrustration}
                    onChange={e => setSettingsForm({ ...settingsForm, autoEscalateFrustration: e.target.checked })}
                    className="w-4 h-4 rounded bg-[#0B1630] border-white/20 text-blue-600 focus:ring-0"
                  />
                  <label htmlFor="autoEscalate" className="text-slate-200">
                    Automatically escalate to human queue when customer sentiment is ANGRY
                  </label>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Custom Policy Fallback Message (Zero-Invention)</label>
                  <textarea
                    value={settingsForm.fallbackMessage}
                    onChange={e => setSettingsForm({ ...settingsForm, fallbackMessage: e.target.value })}
                    rows={3}
                    className="w-full bg-[#0B1630] border border-white/15 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">Displayed when query confidence is lower than threshold.</p>
                </div>

                <div className="pt-4 flex items-center gap-3">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-500/20 transition-colors"
                  >
                    Save Changes
                  </button>
                  {settingsSaved && (
                    <span className="text-xs text-[#00E5B0] font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Settings updated successfully!
                    </span>
                  )}
                </div>

              </form>
            </div>
          )}

          {/* TAB 9: AUDIT LOGS */}
          {activeTab === 'audit' && (
            <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-xl">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Compliance & Security Audit Trail</h3>
                  <p className="text-xs text-slate-400">Immutable record of document vectorizations, role changes, and system escalations</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#0B1630] text-slate-400 uppercase text-[10px] font-bold border-b border-white/10">
                    <tr>
                      <th className="p-3.5">Action</th>
                      <th className="p-3.5">Actor</th>
                      <th className="p-3.5">Role</th>
                      <th className="p-3.5">Target</th>
                      <th className="p-3.5">Timestamp</th>
                      <th className="p-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {auditLogs.map(log => (
                      <tr key={log.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-white text-[11px]">{log.action}</td>
                        <td className="p-3.5 text-slate-300">{log.actor}</td>
                        <td className="p-3.5 uppercase text-[10px] font-semibold text-slate-400">{log.actorRole}</td>
                        <td className="p-3.5 text-slate-400 text-[11px]">{log.target}</td>
                        <td className="p-3.5 text-slate-500 text-[10px]">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="p-3.5">
                          <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            log.status === 'alert' ? 'bg-red-500/20 text-red-400' :
                            log.status === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* UPLOAD DOCUMENT MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#0B1630] border border-white/10 rounded-2xl p-6 max-w-xl w-full shadow-2xl relative">
            <h3 className="text-base font-bold text-white mb-1">Upload & Vectorize Policy Document</h3>
            <p className="text-xs text-slate-400 mb-4">
              The document text will be cleaned, chunked into paragraphs, and indexed for semantic RAG retrieval.
            </p>

            <form onSubmit={handleUploadDocument} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Document Title</label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={e => setUploadTitle(e.target.value)}
                  placeholder="e.g. Return & Exchange Policy 2026"
                  required
                  className="w-full bg-[#101B35] border border-white/15 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Document Format</label>
                  <select
                    value={uploadType}
                    onChange={e => setUploadType(e.target.value as any)}
                    className="w-full bg-[#101B35] border border-white/15 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="PDF">PDF Document</option>
                    <option value="DOCX">Word (.DOCX)</option>
                    <option value="TXT">Plain Text (.TXT)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category</label>
                  <select
                    value={uploadCategory}
                    onChange={e => setUploadCategory(e.target.value as any)}
                    className="w-full bg-[#101B35] border border-white/15 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="refund">Refunds & Returns</option>
                    <option value="shipping">Logistics & Shipping</option>
                    <option value="cancellation">Order Cancellation</option>
                    <option value="warranty">Warranty & Defect</option>
                    <option value="general">General Support SOP</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-semibold">Policy Text Content</label>
                  <button
                    type="button"
                    onClick={() => {
                      setUploadTitle('International Customs & Tax Policy');
                      setUploadCategory('shipping');
                      setUploadContent(`INTERNATIONAL FREIGHT & CUSTOMS PROCEDURES
Document ID: POL-INT-2026-07

1. IMPORT DUTIES AND TAXES
All international packages are shipped Delivery Duty Unpaid (DDU). The recipient is strictly responsible for any import fees, customs tariffs, and local brokerage charges levied by their destination country.

2. CUSTOMS CLEARANCE DELAYS
Customs clearance normally takes 3 to 7 business days, but during peak seasons it may extend up to 14 days. If a shipment remains in customs for more than 10 business days without status change, our logistics team can submit an official customs tracer.

3. REFUSED INTERNATIONAL SHIPMENTS
If a customer refuses to pay import duties, the package will be returned to our warehouse. A $25 international handling and return fee will be deducted from any refund amount.`);
                    }}
                    className="text-[10px] text-[#00D4FF] hover:underline"
                  >
                    Insert Sample International Policy
                  </button>
                </div>
                <textarea
                  value={uploadContent}
                  onChange={e => setUploadContent(e.target.value)}
                  rows={8}
                  placeholder="Paste verified policy text here..."
                  required
                  className="w-full bg-[#101B35] border border-white/15 rounded-xl p-3 text-white text-xs font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadLoading}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-500/20 flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadLoading ? 'Indexing Chunks...' : 'Vectorize & Save'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD USER MODAL */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#0B1630] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
            <h3 className="text-base font-bold text-white mb-1">Add Team Member</h3>
            <p className="text-xs text-slate-400 mb-4">Provision access to ServeX AI workspace</p>

            <form onSubmit={handleAddUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={e => setNewUserName(e.target.value)}
                  required
                  placeholder="e.g. Liam Henderson"
                  className="w-full bg-[#101B35] border border-white/15 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Work Email</label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={e => setNewUserEmail(e.target.value)}
                  required
                  placeholder="e.g. liam@servex.demo"
                  className="w-full bg-[#101B35] border border-white/15 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Platform Role</label>
                  <select
                    value={newUserRole}
                    onChange={e => setNewUserRole(e.target.value as any)}
                    className="w-full bg-[#101B35] border border-white/15 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                  >
                    <option value="employee">Employee (Support Agent)</option>
                    <option value="trainer">Trainer (Coach)</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Department</label>
                  <input
                    type="text"
                    value={newUserDept}
                    onChange={e => setNewUserDept(e.target.value)}
                    className="w-full bg-[#101B35] border border-white/15 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-500/20"
                >
                  Create Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
