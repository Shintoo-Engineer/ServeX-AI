import {
  AppNotification,
  AuditLogEntry,
  CompanyDocument,
  OrgSettings,
  SupportConversation,
  TrainingScenario,
  TrainingSession,
  User,
} from '../types/index.ts';

const API_BASE = '/api';

export const api = {
  // Auth
  async login(email: string, password?: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Login failed');
    return res.json();
  },

  async register(data: { name: string; email: string; organizationName?: string; role?: string }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Registration failed');
    return res.json();
  },

  async getCurrentUser() {
    const res = await fetch(`${API_BASE}/auth/me`);
    return res.json();
  },

  // Documents & RAG
  async getDocuments(): Promise<{ documents: CompanyDocument[]; totalChunks: number }> {
    const res = await fetch(`${API_BASE}/documents`);
    return res.json();
  },

  async uploadDocument(docData: {
    title: string;
    filename?: string;
    type?: string;
    category?: string;
    content: string;
    summary?: string;
    uploadedBy?: string;
  }) {
    const res = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(docData),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Upload failed');
    return res.json();
  },

  async deleteDocument(id: string) {
    const res = await fetch(`${API_BASE}/documents/${id}`, { method: 'DELETE' });
    return res.json();
  },

  async reindexDocument(id: string) {
    const res = await fetch(`${API_BASE}/documents/${id}/reindex`, { method: 'POST' });
    return res.json();
  },

  // Customer Support
  async sendSupportChat(data: {
    conversationId?: string;
    customerName: string;
    customerEmail?: string;
    message: string;
  }) {
    const res = await fetch(`${API_BASE}/support/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Chat failed');
    return res.json();
  },

  async getConversations(status?: string, priority?: string): Promise<{ conversations: SupportConversation[] }> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (priority) params.append('priority', priority);
    const res = await fetch(`${API_BASE}/conversations?${params.toString()}`);
    return res.json();
  },

  async getConversation(id: string): Promise<{ conversation: SupportConversation }> {
    const res = await fetch(`${API_BASE}/conversations/${id}`);
    return res.json();
  },

  async replyToConversation(id: string, text: string, agentName?: string) {
    const res = await fetch(`${API_BASE}/conversations/${id}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, agentName }),
    });
    return res.json();
  },

  async escalateConversation(id: string, reason?: string) {
    const res = await fetch(`${API_BASE}/conversations/${id}/escalate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    return res.json();
  },

  async resolveConversation(id: string, note?: string) {
    const res = await fetch(`${API_BASE}/conversations/${id}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note }),
    });
    return res.json();
  },

  async reopenConversation(id: string) {
    const res = await fetch(`${API_BASE}/conversations/${id}/reopen`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    return res.json();
  },

  async submitFeedback(id: string, rating: number, comment?: string) {
    const res = await fetch(`${API_BASE}/conversations/${id}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating, comment }),
    });
    return res.json();
  },

  // Training & Simulator
  async getScenarios(): Promise<{ scenarios: TrainingScenario[] }> {
    const res = await fetch(`${API_BASE}/training/scenarios`);
    return res.json();
  },

  async createScenario(scenarioData: Partial<TrainingScenario>) {
    const res = await fetch(`${API_BASE}/training/scenarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scenarioData),
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Failed to create scenario');
    return res.json();
  },

  async startTrainingSession(scenarioId: string, employeeId?: string, employeeName?: string) {
    const res = await fetch(`${API_BASE}/training/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenarioId, employeeId, employeeName }),
    });
    return res.json();
  },

  async sendTrainingReply(sessionId: string, text: string) {
    const res = await fetch(`${API_BASE}/training/session/${sessionId}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    return res.json();
  },

  async evaluateTrainingSession(sessionId: string) {
    const res = await fetch(`${API_BASE}/training/session/${sessionId}/evaluate`, {
      method: 'POST',
    });
    return res.json();
  },

  async getTrainingSessions(): Promise<{ sessions: TrainingSession[] }> {
    const res = await fetch(`${API_BASE}/training/sessions`);
    return res.json();
  },

  // Analytics
  async getSupportAnalytics() {
    const res = await fetch(`${API_BASE}/analytics/support`);
    return res.json();
  },

  async getEmployeeAnalytics() {
    const res = await fetch(`${API_BASE}/analytics/employees`);
    return res.json();
  },

  // Admin & Audit
  async getUsers(): Promise<{ users: User[] }> {
    const res = await fetch(`${API_BASE}/admin/users`);
    return res.json();
  },

  async createUser(userData: { name: string; email: string; role: string; department?: string }) {
    const res = await fetch(`${API_BASE}/admin/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return res.json();
  },

  async deleteUser(id: string) {
    const res = await fetch(`${API_BASE}/admin/users/${id}`, { method: 'DELETE' });
    return res.json();
  },

  async getAuditLogs(): Promise<{ auditLogs: AuditLogEntry[] }> {
    const res = await fetch(`${API_BASE}/admin/audit-logs`);
    return res.json();
  },

  async getNotifications(): Promise<{ notifications: AppNotification[] }> {
    const res = await fetch(`${API_BASE}/notifications`);
    return res.json();
  },

  async markNotificationRead(id: string) {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, { method: 'POST' });
    return res.json();
  },

  async getSettings() {
    const res = await fetch(`${API_BASE}/admin/settings`);
    return res.json();
  },

  async updateSettings(data: { name?: string; settings?: Partial<OrgSettings> }) {
    const res = await fetch(`${API_BASE}/admin/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};
