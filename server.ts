import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { db, ragEngineInstance } from './src/server/db.ts';
import {
  analyzeIntentAndSentiment,
  generateSupportResponse,
  simulateCustomerReply,
  evaluateEmployeeSession
} from './src/server/gemini.ts';
import { CompanyDocument, DocumentChunk, SupportMessage, TrainingMessage } from './src/types/index.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// -------------------------------------------------------------
// REST API ENDPOINTS
// -------------------------------------------------------------

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'ServeX AI Platform',
    timestamp: new Date().toISOString(),
    aiEngine: process.env.GEMINI_API_KEY ? 'gemini-3.8-flash (Active)' : 'heuristic-ai-fallback'
  });
});

// Auth endpoints
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    // If demo password used or standard demo login
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  db.addAuditLog('USER_LOGIN', user.name, user.role, `Logged in via ${email}`);
  res.json({
    token: `token_${user.id}_${Date.now()}`,
    user,
    organization: db.organization
  });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, organizationName, role } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'User with this email already exists' });
  }

  if (organizationName) {
    db.organization.name = organizationName;
  }

  const newUser = {
    id: `user_${Date.now()}`,
    name,
    email,
    role: (role || 'admin') as any,
    organizationId: db.organization.id,
    department: 'Operations',
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  db.addAuditLog('USER_REGISTERED', newUser.name, newUser.role, `Created organization ${db.organization.name}`);

  res.json({
    token: `token_${newUser.id}_${Date.now()}`,
    user: newUser,
    organization: db.organization
  });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.json({ user: db.users[0], organization: db.organization });
  }
  const tokenParts = authHeader.replace('Bearer ', '').split('_');
  const userId = tokenParts[1];
  const user = db.users.find(u => u.id === userId) || db.users[0];
  res.json({ user, organization: db.organization });
});

// Knowledge Base & Documents
app.get('/api/documents', (_req: Request, res: Response) => {
  res.json({
    documents: db.documents,
    totalChunks: ragEngineInstance.getChunks().length
  });
});

app.post('/api/documents/upload', (req: Request, res: Response) => {
  const { title, filename, type, category, content, summary, uploadedBy } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  const docId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const chunks = ragEngineInstance.chunkText({
    id: docId,
    title,
    content
  });

  const newDoc: CompanyDocument = {
    id: docId,
    organizationId: db.organization.id,
    title,
    filename: filename || `${title.toLowerCase().replace(/\s+/g, '_')}.txt`,
    type: type || 'TXT',
    category: category || 'general',
    version: '1.0',
    uploadedBy: uploadedBy || 'Sarah Vance',
    uploadedAt: new Date().toISOString(),
    status: 'indexed',
    chunkCount: chunks.length,
    rawContent: content,
    summary: summary || (content.substring(0, 140) + '...')
  };

  db.documents.unshift(newDoc);
  
  // Re-index all chunks
  const existingChunks = ragEngineInstance.getChunks();
  ragEngineInstance.setChunks([...existingChunks, ...chunks]);

  db.addAuditLog('DOCUMENT_UPLOADED', newDoc.uploadedBy, 'admin', `Uploaded & indexed ${newDoc.title} (${chunks.length} chunks)`);
  db.addNotification('New Policy Document Indexed', `${newDoc.title} was successfully vectorized into RAG knowledge base.`, 'system', 'normal');

  res.json({ document: newDoc, chunksCreated: chunks.length });
});

app.delete('/api/documents/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const docIndex = db.documents.findIndex(d => d.id === id);
  if (docIndex === -1) {
    return res.status(404).json({ error: 'Document not found' });
  }

  const removedDoc = db.documents.splice(docIndex, 1)[0];
  const remainingChunks = ragEngineInstance.getChunks().filter(c => c.docId !== id);
  ragEngineInstance.setChunks(remainingChunks);

  db.addAuditLog('DOCUMENT_DELETED', 'Admin', 'admin', `Deleted document ${removedDoc.title}`);
  res.json({ success: true, removed: removedDoc });
});

app.post('/api/documents/:id/reindex', (req: Request, res: Response) => {
  const { id } = req.params;
  const doc = db.documents.find(d => d.id === id);
  if (!doc) {
    return res.status(404).json({ error: 'Document not found' });
  }

  // Remove old chunks
  const filtered = ragEngineInstance.getChunks().filter(c => c.docId !== id);
  const newChunks = ragEngineInstance.chunkText({
    id: doc.id,
    title: doc.title,
    content: doc.rawContent
  });
  ragEngineInstance.setChunks([...filtered, ...newChunks]);
  doc.chunkCount = newChunks.length;
  doc.status = 'indexed';

  db.addAuditLog('DOCUMENT_REINDEXED', 'Admin', 'admin', `Re-indexed document ${doc.title}`);
  res.json({ success: true, chunkCount: newChunks.length });
});

// Customer Support Chat & Orchestration
app.post('/api/support/chat', async (req: Request, res: Response) => {
  try {
    const { conversationId, customerName, customerEmail, message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    let conversation = db.conversations.find(c => c.id === conversationId);
    const isNew = !conversation;

    if (!conversation) {
      conversation = {
        id: conversationId || `conv_${Date.now()}`,
        organizationId: db.organization.id,
        customerName: customerName || 'Guest Customer',
        customerEmail: customerEmail || 'guest@example.com',
        status: 'active',
        priority: 'normal',
        intent: 'INQUIRY',
        sentiment: 'neutral',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: []
      };
      db.conversations.unshift(conversation);
    }

    // If conversation was previously resolved, re-open it so the user can continue until fully resolved
    if (conversation.status === 'resolved') {
      conversation.status = 'active';
      db.addAuditLog('CONVERSATION_REOPENED', conversation.customerName, 'customer', `Re-opened ticket #${conversation.id} with new follow-up inquiry`);
    }

    // Step 1: Detect intent and sentiment
    const analysis = await analyzeIntentAndSentiment(message);
    conversation.intent = analysis.intent;
    conversation.sentiment = analysis.sentiment;
    if (analysis.urgency === 'critical' || analysis.urgency === 'high') {
      conversation.priority = analysis.urgency;
    }

    // Append customer message
    const custMsg: SupportMessage = {
      id: `msg_${Date.now()}_cust`,
      conversationId: conversation.id,
      sender: 'customer',
      senderName: conversation.customerName,
      text: message,
      timestamp: new Date().toISOString(),
      intent: analysis.intent,
      sentiment: analysis.sentiment
    };
    conversation.messages.push(custMsg);

    // Multi-turn context synthesis for RAG search
    const previousTurns = conversation.messages
      .filter(m => m.sender === 'customer' || m.sender === 'assistant')
      .slice(-4)
      .map(m => m.text)
      .join(' ');
    const combinedContextQuery = `${previousTurns} ${message}`;

    // Step 2: RAG Knowledge Retrieval with both direct query and context
    const directRetrieved = ragEngineInstance.retrieve(message, 3);
    const contextRetrieved = ragEngineInstance.retrieve(combinedContextQuery, 3);
    
    // Merge & deduplicate by chunk ID
    const chunkMap = new Map<string, { chunk: DocumentChunk; score: number }>();
    directRetrieved.forEach(item => chunkMap.set(item.chunk.id, item));
    contextRetrieved.forEach(item => {
      if (!chunkMap.has(item.chunk.id)) {
        chunkMap.set(item.chunk.id, item);
      }
    });
    const retrieved = Array.from(chunkMap.values()).sort((a, b) => b.score - a.score).slice(0, 3);

    // Step 3: Generate Grounded Response
    const responseResult = await generateSupportResponse({
      query: message,
      retrievedChunks: retrieved,
      conversationHistory: conversation.messages.map(m => ({ sender: m.sender, text: m.text })),
      orgSettings: db.organization.settings
    });

    // Check if immediate escalation rule is met
    const autoEscalate = db.organization.settings.autoEscalateFrustration && 
      (analysis.requiresHumanEscalation || analysis.sentiment === 'angry');

    if (autoEscalate && conversation.status !== 'escalated') {
      conversation.status = 'escalated';
      conversation.escalationReason = analysis.escalationReason || 'Automatic escalation due to frustrated customer tone or request';
      
      const escalationNoticeMsg: SupportMessage = {
        id: `msg_${Date.now()}_sys`,
        conversationId: conversation.id,
        sender: 'system',
        senderName: 'ServeX Escalation Engine',
        text: `Issue escalated to Human Support Specialist. Reason: ${conversation.escalationReason}`,
        timestamp: new Date().toISOString(),
        isEscalationNotice: true
      };
      conversation.messages.push(escalationNoticeMsg);

      db.addAuditLog('CONVERSATION_ESCALATED', 'AI Escalation Engine', 'system', `Conversation #${conversation.id} (${conversation.customerName})`, 'alert');
      db.addNotification('Customer Escalation Alert', `${conversation.customerName} requires human intervention: ${conversation.escalationReason}`, 'escalation', 'high', '/admin/escalations');
    } else if (responseResult.shouldEscalate && conversation.status !== 'escalated') {
      conversation.status = 'escalated';
      conversation.escalationReason = responseResult.escalationReason;
      db.addAuditLog('CONVERSATION_ESCALATED', 'RAG Guardrail', 'system', `Conversation #${conversation.id} - ${responseResult.escalationReason}`, 'warning');
      db.addNotification('Low Confidence Knowledge Escalation', `Conversation #${conversation.id} escalated because no policy covered the query.`, 'escalation', 'normal', '/admin/escalations');
    }

    const astMsg: SupportMessage = {
      id: `msg_${Date.now()}_ast`,
      conversationId: conversation.id,
      sender: 'assistant',
      senderName: 'ServeX AI Support',
      text: autoEscalate
        ? `${responseResult.text}\n\nI have also alerted our senior human customer specialist queue so a representative can step in if you need further manual approvals.`
        : responseResult.text,
      timestamp: new Date().toISOString(),
      citedDocs: responseResult.citedDocs
    };
    conversation.messages.push(astMsg);
    conversation.updatedAt = new Date().toISOString();

    res.json({
      conversation,
      assistantMessage: astMsg,
      escalated: conversation.status === 'escalated',
      analysis,
      sources: responseResult.citedDocs
    });
  } catch (err: any) {
    console.error('Support chat error:', err);
    res.status(500).json({ error: 'Internal server error processing support request' });
  }
});

// Human Agent & Escalations API
app.get('/api/conversations', (req: Request, res: Response) => {
  const { status, priority } = req.query;
  let list = [...db.conversations];
  if (status) {
    list = list.filter(c => c.status === status);
  }
  if (priority) {
    list = list.filter(c => c.priority === priority);
  }
  res.json({ conversations: list });
});

app.get('/api/conversations/:id', (req: Request, res: Response) => {
  const conv = db.conversations.find(c => c.id === req.params.id);
  if (!conv) {
    return res.status(404).json({ error: 'Conversation not found' });
  }
  res.json({ conversation: conv });
});

app.post('/api/conversations/:id/reply', (req: Request, res: Response) => {
  const { id } = req.params;
  const { text, agentName } = req.body;
  const conv = db.conversations.find(c => c.id === id);
  if (!conv) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  const replyMsg: SupportMessage = {
    id: `msg_${Date.now()}_agent`,
    conversationId: conv.id,
    sender: 'agent',
    senderName: agentName || 'Support Specialist',
    text,
    timestamp: new Date().toISOString()
  };

  conv.messages.push(replyMsg);
  conv.assignedAgent = agentName || 'Support Specialist';
  conv.updatedAt = new Date().toISOString();

  db.addAuditLog('HUMAN_AGENT_REPLY', agentName || 'Agent', 'employee', `Replied to conversation #${id}`);
  res.json({ conversation: conv, message: replyMsg });
});

app.post('/api/conversations/:id/escalate', (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;
  const conv = db.conversations.find(c => c.id === id);
  if (!conv) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  conv.status = 'escalated';
  conv.escalationReason = reason || 'Manually escalated by support staff';
  conv.priority = 'high';
  conv.updatedAt = new Date().toISOString();

  const notice: SupportMessage = {
    id: `msg_${Date.now()}_sys`,
    conversationId: conv.id,
    sender: 'system',
    senderName: 'System Escalation Engine',
    text: `Conversation escalated: ${conv.escalationReason}`,
    timestamp: new Date().toISOString(),
    isEscalationNotice: true
  };
  conv.messages.push(notice);

  db.addAuditLog('CONVERSATION_ESCALATED', 'Support Operator', 'admin', `Conversation #${id}`, 'alert');
  db.addNotification('Manual Case Escalation', `Conversation #${id} was prioritized and escalated.`, 'escalation', 'high');

  res.json({ conversation: conv });
});

app.post('/api/conversations/:id/resolve', (req: Request, res: Response) => {
  const { id } = req.params;
  const { note } = req.body;
  const conv = db.conversations.find(c => c.id === id);
  if (!conv) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  conv.status = 'resolved';
  conv.resolvedAt = new Date().toISOString();
  conv.updatedAt = new Date().toISOString();
  if (note) conv.aiSummary = note;

  db.addAuditLog('CONVERSATION_RESOLVED', conv.assignedAgent || 'System', 'admin', `Conversation #${id} marked as resolved`);
  res.json({ conversation: conv });
});

app.post('/api/conversations/:id/reopen', (req: Request, res: Response) => {
  const { id } = req.params;
  const conv = db.conversations.find(c => c.id === id);
  if (!conv) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  conv.status = 'active';
  conv.updatedAt = new Date().toISOString();
  db.addAuditLog('CONVERSATION_REOPENED', conv.customerName, 'customer', `Conversation #${id} reopened to continue communicating`);
  res.json({ conversation: conv });
});

app.post('/api/conversations/:id/feedback', (req: Request, res: Response) => {
  const { id } = req.params;
  const { rating, comment } = req.body;
  const conv = db.conversations.find(c => c.id === id);
  if (!conv) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  conv.rating = rating;
  conv.feedbackComment = comment;
  conv.updatedAt = new Date().toISOString();

  db.addAuditLog('CUSTOMER_FEEDBACK', conv.customerName, 'customer', `Rated conversation #${id} ${rating}/5`);
  if (rating <= 2) {
    db.addNotification('Low Satisfaction Rating Alert', `${conv.customerName} submitted a ${rating}-star rating: "${comment || 'No comment'}"`, 'feedback', 'high');
  }

  res.json({ success: true, conversation: conv });
});

// Training Scenarios & AI Simulator API
app.get('/api/training/scenarios', (_req: Request, res: Response) => {
  res.json({ scenarios: db.trainingScenarios });
});

app.post('/api/training/scenarios', (req: Request, res: Response) => {
  const {
    title,
    description,
    category,
    difficulty,
    customerPersonality,
    customerProblem,
    customerOpeningMessage,
    expectedResolution,
    applicablePolicy,
    evaluationCriteria
  } = req.body;

  if (!title || !customerProblem || !customerOpeningMessage) {
    return res.status(400).json({ error: 'Title, problem description, and opening message are required' });
  }

  const newScenario = {
    id: `scen_${Date.now()}`,
    title,
    description: description || customerProblem,
    category: category || 'General Support',
    difficulty: difficulty || 'medium',
    customerPersonality: customerPersonality || 'confused',
    customerProblem,
    customerOpeningMessage,
    expectedResolution: expectedResolution || 'Provide professional assistance following policies',
    applicablePolicy: applicablePolicy || 'Standard Operating Procedures',
    evaluationCriteria: Array.isArray(evaluationCriteria) && evaluationCriteria.length > 0
      ? evaluationCriteria
      : ['Clear communication', 'Empathy', 'Accurate policy adherence'],
    timesPracticed: 0,
    avgScore: 0
  };

  db.trainingScenarios.unshift(newScenario);
  db.addAuditLog('SCENARIO_CREATED', 'Trainer', 'trainer', `Created scenario "${newScenario.title}"`);
  db.addNotification('New Training Scenario Published', `"${newScenario.title}" is now available for employee practice.`, 'training', 'normal', '/employee/simulator');

  res.json({ scenario: newScenario });
});

// Start new training simulation session
app.post('/api/training/session', (req: Request, res: Response) => {
  const { scenarioId, employeeId, employeeName } = req.body;
  const scenario = db.trainingScenarios.find(s => s.id === scenarioId);
  if (!scenario) {
    return res.status(404).json({ error: 'Scenario not found' });
  }

  const session = {
    id: `sess_${Date.now()}`,
    scenarioId: scenario.id,
    scenarioTitle: scenario.title,
    employeeId: employeeId || 'user_employee',
    employeeName: employeeName || 'Elena Rostova',
    status: 'in_progress' as const,
    startedAt: new Date().toISOString(),
    messages: [
      {
        id: `tmsg_${Date.now()}_open`,
        sender: 'ai_customer' as const,
        text: scenario.customerOpeningMessage,
        timestamp: new Date().toISOString()
      }
    ]
  };

  db.trainingSessions.unshift(session);
  res.json({ session, scenario });
});

// Send employee response & get simulated AI customer reaction
app.post('/api/training/session/:id/reply', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const session = db.trainingSessions.find(s => s.id === id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const scenario = db.trainingScenarios.find(s => s.id === session.scenarioId);
    if (!scenario) {
      return res.status(404).json({ error: 'Associated scenario not found' });
    }

    // Add employee message
    const empMsg: TrainingMessage = {
      id: `tmsg_${Date.now()}_emp`,
      sender: 'employee',
      text,
      timestamp: new Date().toISOString()
    };
    session.messages.push(empMsg);

    // Call AI simulator
    const aiSimulatedReply = await simulateCustomerReply({
      scenario,
      messages: session.messages,
      latestEmployeeReply: text
    });

    const aiMsg: TrainingMessage = {
      id: `tmsg_${Date.now()}_ai`,
      sender: 'ai_customer',
      text: aiSimulatedReply,
      timestamp: new Date().toISOString()
    };
    session.messages.push(aiMsg);

    res.json({
      session,
      aiCustomerMessage: aiMsg
    });
  } catch (err: any) {
    console.error('Training simulation error:', err);
    res.status(500).json({ error: 'Error generating AI customer simulation reply' });
  }
});

// Conclude session & run comprehensive AI rubric evaluation
app.post('/api/training/session/:id/evaluate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const session = db.trainingSessions.find(s => s.id === id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const scenario = db.trainingScenarios.find(s => s.id === session.scenarioId);
    if (!scenario) {
      return res.status(404).json({ error: 'Scenario not found' });
    }

    const evaluation = await evaluateEmployeeSession({
      scenario,
      messages: session.messages
    });

    session.status = 'evaluated';
    session.evaluation = evaluation;
    session.completedAt = new Date().toISOString();

    // Update scenario statistics
    scenario.timesPracticed += 1;
    scenario.avgScore = scenario.avgScore === 0 
      ? evaluation.overallScore 
      : Math.round((scenario.avgScore * (scenario.timesPracticed - 1) + evaluation.overallScore) / scenario.timesPracticed);

    db.addAuditLog('TRAINING_EVALUATION', 'ServeX AI Evaluator', 'system', `${session.employeeName} scored ${evaluation.overallScore}% in "${scenario.title}"`);
    db.addNotification('Training Simulation Evaluated', `${session.employeeName} completed "${scenario.title}" with a score of ${evaluation.overallScore}%`, 'training', 'normal', `/employee/assessments`);

    res.json({ session, evaluation });
  } catch (err: any) {
    console.error('Evaluation error:', err);
    res.status(500).json({ error: 'Error generating employee evaluation' });
  }
});

app.get('/api/training/sessions', (_req: Request, res: Response) => {
  res.json({ sessions: db.trainingSessions });
});

// Analytics endpoints
app.get('/api/analytics/support', (_req: Request, res: Response) => {
  const total = db.conversations.length;
  const escalated = db.conversations.filter(c => c.status === 'escalated').length;
  const resolved = db.conversations.filter(c => c.status === 'resolved').length;
  const active = db.conversations.filter(c => c.status === 'active').length;

  const ratings = db.conversations.map(c => c.rating).filter(Boolean) as number[];
  const avgCsat = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : '4.8';

  res.json({
    metrics: {
      totalConversations: 24832 + total,
      aiResolved: 19420 + resolved,
      humanEscalated: 2530 + escalated,
      activeLive: 12 + active,
      avgResponseTime: '2.4s',
      csatPercentage: `${Math.round((Number(avgCsat) / 5) * 100)}%`,
      aiResolutionRate: '88.4%',
      highPriorityCases: db.conversations.filter(c => c.priority === 'high' || c.priority === 'critical').length
    },
    sentimentBreakdown: {
      positive: 62,
      neutral: 24,
      frustrated: 10,
      angry: 3,
      urgent: 1
    },
    topIntents: [
      { intent: 'REFUND_STATUS', count: 8420, percent: 34 },
      { intent: 'SHIPPING_TRACKING', count: 6210, percent: 25 },
      { intent: 'ORDER_CANCELLATION', count: 3970, percent: 16 },
      { intent: 'DAMAGED_GOODS', count: 2730, percent: 11 },
      { intent: 'GENERAL_FAQ', count: 2100, percent: 8 },
      { intent: 'SECURITY_ESCALATION', count: 1402, percent: 6 }
    ],
    resolutionTrend: [
      { date: 'Mon', aiHandled: 3200, humanHandled: 410 },
      { date: 'Tue', aiHandled: 3450, humanHandled: 380 },
      { date: 'Wed', aiHandled: 3900, humanHandled: 440 },
      { date: 'Thu', aiHandled: 3620, humanHandled: 390 },
      { date: 'Fri', aiHandled: 4100, humanHandled: 480 },
      { date: 'Sat', aiHandled: 2800, humanHandled: 220 },
      { date: 'Sun', aiHandled: 2350, humanHandled: 190 }
    ]
  });
});

app.get('/api/analytics/employees', (_req: Request, res: Response) => {
  res.json({
    metrics: {
      totalEmployees: 42,
      activeTraining: 38,
      avgCompetencyScore: '91%',
      simulationsCompletedThisMonth: 342,
      needsImprovementCount: 3
    },
    skillDistribution: {
      communication: 93,
      empathy: 89,
      policyAdherence: 95,
      problemSolving: 91,
      professionalism: 94
    },
    topPerformers: [
      { name: 'Elena Rostova', department: 'Tier-1 Support', score: 95, sessions: 18 },
      { name: 'James Chen', department: 'Tier-2 Technical', score: 94, sessions: 15 },
      { name: 'Aisha Al-Mansoor', department: 'VIP Concierge', score: 92, sessions: 21 },
      { name: 'Liam O’Connor', department: 'Logistics Handoff', score: 91, sessions: 14 }
    ],
    scenarioCompletionRates: db.trainingScenarios.map(s => ({
      title: s.title,
      difficulty: s.difficulty,
      timesPracticed: s.timesPracticed,
      avgScore: s.avgScore
    }))
  });
});

// Admin, Settings & Audit Logs
app.get('/api/admin/users', (_req: Request, res: Response) => {
  res.json({ users: db.users });
});

app.post('/api/admin/users', (req: Request, res: Response) => {
  const { name, email, role, department } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const newUser = {
    id: `user_${Date.now()}`,
    name,
    email,
    role: role || 'employee',
    organizationId: db.organization.id,
    department: department || 'Customer Support',
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  db.addAuditLog('USER_CREATED', 'Admin', 'admin', `Added user ${name} (${email}) as ${role}`);
  res.json({ user: newUser });
});

app.delete('/api/admin/users/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = db.users.findIndex(u => u.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  const removed = db.users.splice(index, 1)[0];
  db.addAuditLog('USER_DELETED', 'Admin', 'admin', `Removed user ${removed.name}`);
  res.json({ success: true, removed });
});

app.get('/api/admin/audit-logs', (_req: Request, res: Response) => {
  res.json({ auditLogs: db.auditLogs });
});

app.get('/api/notifications', (_req: Request, res: Response) => {
  res.json({ notifications: db.notifications });
});

app.post('/api/notifications/:id/read', (req: Request, res: Response) => {
  const notif = db.notifications.find(n => n.id === req.params.id);
  if (notif) notif.read = true;
  res.json({ success: true });
});

app.get('/api/admin/settings', (_req: Request, res: Response) => {
  res.json({
    organization: db.organization
  });
});

app.post('/api/admin/settings', (req: Request, res: Response) => {
  const { settings, name } = req.body;
  if (name) db.organization.name = name;
  if (settings) {
    db.organization.settings = {
      ...db.organization.settings,
      ...settings
    };
  }
  db.addAuditLog('SETTINGS_UPDATED', 'Sarah Vance', 'admin', 'Updated organizational AI & escalation thresholds');
  res.json({ organization: db.organization });
});

// -------------------------------------------------------------
// VITE MIDDLEWARE SETUP (Development & Full-Stack Serving)
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    // Serve static client build
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Mount Vite dev server middleware
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ServeX AI] Full-stack engine running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[ServeX AI] Failed to start server:', err);
});
