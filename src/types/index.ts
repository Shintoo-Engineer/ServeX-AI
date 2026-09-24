export type UserRole = 'admin' | 'trainer' | 'employee' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId: string;
  department?: string;
  avatar?: string;
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  plan?: 'enterprise' | 'growth' | 'starter';
  primaryColor?: string;
  settings: OrgSettings;
  createdAt?: string;
}

export interface OrgSettings {
  aiTone: 'professional' | 'empathetic' | 'concise' | 'formal';
  escalationThreshold: 'low' | 'medium' | 'strict';
  sentimentAlerts?: boolean;
  businessHours?: string;
  fallbackMessage: string;
  feedbackEnabled?: boolean;
  autoEscalateFrustration: boolean;
  maxChatTurnsBeforeEscalation?: number;
}

export interface DocumentChunk {
  id: string;
  docId: string;
  title: string;
  content: string;
  chunkIndex: number;
  keywords: string[];
}

export interface CompanyDocument {
  id: string;
  organizationId: string;
  title: string;
  filename: string;
  type: 'PDF' | 'DOCX' | 'TXT' | 'POLICY';
  category: 'refund' | 'shipping' | 'return' | 'warranty' | 'cancellation' | 'general';
  version: string;
  uploadedBy: string;
  uploadedAt: string;
  status: 'indexed' | 'indexing' | 'error';
  chunkCount: number;
  rawContent: string;
  summary: string;
}

export type SentimentType = 'positive' | 'neutral' | 'frustrated' | 'angry' | 'urgent';
export type PriorityLevel = 'low' | 'normal' | 'high' | 'critical';
export type ConversationStatus = 'active' | 'escalated' | 'resolved';

export interface SupportMessage {
  id: string;
  conversationId: string;
  sender: 'customer' | 'assistant' | 'agent' | 'system';
  senderName: string;
  text: string;
  timestamp: string;
  intent?: string;
  sentiment?: SentimentType;
  citedDocs?: { docId: string; title: string; excerpt: string }[];
  isEscalationNotice?: boolean;
}

export interface SupportConversation {
  id: string;
  organizationId: string;
  customerName: string;
  customerEmail: string;
  status: ConversationStatus;
  priority: PriorityLevel;
  intent: string;
  sentiment: SentimentType;
  messages: SupportMessage[];
  assignedAgent?: string;
  createdAt: string;
  updatedAt: string;
  escalationReason?: string;
  aiSummary?: string;
  rating?: number;
  feedbackComment?: string;
  resolvedAt?: string;
}

export interface TrainingScenario {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  customerPersonality: 'angry' | 'confused' | 'impatient' | 'polite' | 'skeptical';
  customerProblem: string;
  customerOpeningMessage: string;
  expectedResolution: string;
  applicablePolicy: string;
  evaluationCriteria: string[];
  timesPracticed: number;
  avgScore: number;
}

export interface TrainingMessage {
  id: string;
  sender: 'ai_customer' | 'employee' | 'system';
  text: string;
  timestamp: string;
}

export interface EvaluationMetric {
  name: string;
  score: number; // 0 - 100
  feedback: string;
}

export interface EvaluationResult {
  overallScore: number;
  communication: number;
  empathy: number;
  policyAdherence: number;
  problemSolving: number;
  professionalism: number;
  summaryFeedback: string;
  strengths: string[];
  areasForImprovement: string[];
  policyNote: string;
  coachingTip: string;
  evaluatedAt: string;
}

export interface TrainingSession {
  id: string;
  scenarioId: string;
  scenarioTitle: string;
  employeeId: string;
  employeeName: string;
  status: 'in_progress' | 'completed' | 'evaluated';
  messages: TrainingMessage[];
  evaluation?: EvaluationResult;
  startedAt: string;
  completedAt?: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  actor: string;
  actorRole: string;
  target: string;
  timestamp: string;
  ip?: string;
  status: 'success' | 'warning' | 'alert';
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'escalation' | 'feedback' | 'training' | 'system';
  priority: 'low' | 'normal' | 'high';
  read: boolean;
  timestamp: string;
  link?: string;
}
