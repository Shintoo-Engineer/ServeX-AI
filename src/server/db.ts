import {
  CompanyDocument,
  DocumentChunk,
  Organization,
  SupportConversation,
  TrainingScenario,
  TrainingSession,
  User,
  AuditLogEntry,
  AppNotification
} from '../types/index.ts';
import { RagEngine } from './rag.ts';

export const initialOrganization: Organization = {
  id: 'org_servex_demo',
  name: 'ServeX Demo Enterprises',
  plan: 'enterprise',
  settings: {
    aiTone: 'empathetic',
    escalationThreshold: 'medium',
    sentimentAlerts: true,
    businessHours: '24/7 Global AI + 08:00-20:00 EST Human Ops',
    fallbackMessage: "I want to make sure I give you accurate information. I don't have enough verified information in our company policies to answer this specific question, so I'll connect you directly with a support specialist.",
    feedbackEnabled: true,
    autoEscalateFrustration: true,
  }
};

export const initialUsers: User[] = [
  {
    id: 'user_admin',
    name: 'Sarah Vance',
    email: 'admin@servex.demo',
    role: 'admin',
    organizationId: initialOrganization.id,
    department: 'Customer Experience Operations',
    createdAt: '2026-01-15T09:00:00Z',
  },
  {
    id: 'user_trainer',
    name: 'Marcus Sterling',
    email: 'trainer@servex.demo',
    role: 'trainer',
    organizationId: initialOrganization.id,
    department: 'Quality & Enablement Coaching',
    createdAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 'user_employee',
    name: 'Elena Rostova',
    email: 'employee@servex.demo',
    role: 'employee',
    organizationId: initialOrganization.id,
    department: 'Tier-1 Customer Support',
    createdAt: '2026-03-01T08:30:00Z',
  },
];

export const initialDocuments: CompanyDocument[] = [
  {
    id: 'doc_refund_policy',
    organizationId: initialOrganization.id,
    title: 'ServeX Standard Refund Policy v3.2',
    filename: 'refund_policy_v3.2.pdf',
    type: 'PDF',
    category: 'refund',
    version: '3.2',
    uploadedBy: 'Sarah Vance',
    uploadedAt: '2026-08-10T14:20:00Z',
    status: 'indexed',
    chunkCount: 3,
    summary: 'Rules for customer refunds, timeline (5-7 business days), acceptable conditions, and non-refundable categories.',
    rawContent: `SERVEX GLOBAL REFUND POLICY
Document ID: POL-REF-2026-01
Last Revised: August 2026

1. ELIGIBILITY & TIMEFRAME
Customers are eligible to request a refund within thirty (30) calendar days of delivery. Items must be in their original condition, unworn or unused, with tags attached and in their original packaging. 

2. PROCESSING TIMELINE
Once a return is received and inspected at our distribution fulfillment center, the refund decision will be communicated via email within 48 hours. Approved refunds are automatically credited back to the original method of payment within five (5) to seven (7) business days. Billing cycles may affect when the funds reflect on bank statements.

3. DAMAGED OR DEFECTIVE MERCHANDISE
If an item arrives damaged, defective, or incorrect, the customer is entitled to an immediate replacement or full refund. The customer must notify support within 48 hours of delivery and provide photographic evidence of both the shipping container and the damaged item. In such cases, all return shipping fees are completely covered by ServeX.

4. NON-REFUNDABLE ITEMS
Gift cards, downloadable software products, personalized bespoke merchandise, and expedited shipping fees are strictly non-refundable once fulfillment has occurred.`
  },
  {
    id: 'doc_shipping_policy',
    organizationId: initialOrganization.id,
    title: 'Global Shipping & Delivery Guidelines',
    filename: 'shipping_guidelines_2026.docx',
    type: 'DOCX',
    category: 'shipping',
    version: '2.4',
    uploadedBy: 'Sarah Vance',
    uploadedAt: '2026-08-12T11:00:00Z',
    status: 'indexed',
    chunkCount: 2,
    summary: 'Delivery timelines, standard vs express freight, tracking number generation, and international customs.',
    rawContent: `SERVEX LOGISTICS & SHIPPING PROTOCOL
Document ID: POL-SHP-2026-03

1. DISPATCH & TRACKING
Orders placed before 2:00 PM EST Monday through Friday are dispatched on the same business day. Tracking information is sent automatically via email and SMS within twenty-four (24) hours of carrier pickup.

2. DOMESTIC SHIPPING TIERS
- Standard Freight: 3 to 5 business days delivery across all contiguous states. Free for orders above $50.
- Express Courier: 1 to 2 business days guaranteed. Flat rate $14.99.
- Overnight Priority: Next business day delivery if ordered before 12:00 PM EST. Flat rate $29.99.

3. DELAYED OR MISSING PARCELS
If tracking has not updated for more than four (4) consecutive business days, the parcel is flagged as "Carrier Investigation". Support agents will initiate a tracer with FedEx/UPS and can reissue the shipment if the carrier fails to confirm delivery within 72 hours.`
  },
  {
    id: 'doc_cancellation_policy',
    organizationId: initialOrganization.id,
    title: 'Order Modification & Cancellation Policy',
    filename: 'cancellation_protocol.txt',
    type: 'TXT',
    category: 'cancellation',
    version: '1.8',
    uploadedBy: 'Sarah Vance',
    uploadedAt: '2026-08-15T09:30:00Z',
    status: 'indexed',
    chunkCount: 2,
    summary: '60-minute cancellation window, post-dispatch return workflow, address change protocols.',
    rawContent: `ORDER CANCELLATION AND MODIFICATION POLICY
Document ID: POL-CAN-2026-04

1. CANCELLATION WINDOW
Customers may cancel or alter their order details within sixty (60) minutes of order confirmation by visiting their account dashboard or requesting through ServeX AI Support.

2. POST-WINDOW CANCELLATION
Once an order enters the automated warehouse picking queue (usually 60 minutes after placement), the system locks modifications to avoid inventory desynchronization. In this state, the order cannot be canceled in transit. Once the customer receives the parcel, they may refuse delivery or initiate a standard return using our pre-paid return label.

3. RECIPIENT ADDRESS CHANGES
Address adjustments can only be executed before warehouse staging. If the carrier has already received the package, an address intercept fee of $12 may be assessed by the carrier.`
  },
  {
    id: 'doc_security_guidelines',
    organizationId: initialOrganization.id,
    title: 'Support Security & Escalation Manual',
    filename: 'security_escalation_sop.pdf',
    type: 'PDF',
    category: 'general',
    version: '4.0',
    uploadedBy: 'Sarah Vance',
    uploadedAt: '2026-09-01T16:45:00Z',
    status: 'indexed',
    chunkCount: 2,
    summary: 'Sensitive escalation criteria, fraud triggers, legal threats, and human-in-the-loop handoff SOP.',
    rawContent: `INTERNAL SUPPORT ESCALATION & SECURITY PROTOCOL
Document ID: SOP-SEC-2026-09
Confidential - For ServeX Support Operations

1. MANDATORY ESCALATION TRIGGERS
The AI agent and human Tier-1 employees must immediately escalate conversations to the Human Supervisor Queue under any of the following conditions:
- Customer explicitly states "speak to a human", "talk to agent", or repeats requests for a supervisor.
- Customer sentiment is flagged as "ANGRY" or "URGENT" across two consecutive turns.
- Allegations of credit card fraud, stolen accounts, or unauthorized charges.
- Any mention of legal counsel, lawsuits, regulatory complaints (FTC, BBB), or media outreach.
- High-value order discrepancies exceeding $500 total value.
- System low-confidence score when no verified policy chunk matches the user query.

2. HUMAN HANDOFF DATA PACKAGE
When escalating, the system must deliver: Customer Name/Email, Conversation History, Intent, Detected Sentiment, AI Summary, Verified Citations, and Reason for Escalation.`
  }
];

export const ragEngineInstance = new RagEngine();

// Index initial docs
let allChunks: DocumentChunk[] = [];
for (const doc of initialDocuments) {
  const chunks = ragEngineInstance.chunkText({
    id: doc.id,
    title: doc.title,
    content: doc.rawContent,
  });
  allChunks = allChunks.concat(chunks);
}
ragEngineInstance.setChunks(allChunks);

export const initialConversations: SupportConversation[] = [
  {
    id: 'conv_demo_01',
    organizationId: initialOrganization.id,
    customerName: 'David Miller',
    customerEmail: 'david.miller@example.com',
    status: 'resolved',
    priority: 'normal',
    intent: 'REFUND_STATUS',
    sentiment: 'neutral',
    createdAt: '2026-09-23T14:10:00Z',
    updatedAt: '2026-09-23T14:15:30Z',
    resolvedAt: '2026-09-23T14:15:30Z',
    rating: 5,
    feedbackComment: 'Super fast answer and clear timeframe on my refund! Very helpful.',
    aiSummary: 'Customer inquired about delay on approved refund. AI provided the 5-7 business days policy window. Customer satisfied.',
    messages: [
      {
        id: 'msg_01',
        conversationId: 'conv_demo_01',
        sender: 'customer',
        senderName: 'David Miller',
        text: "My refund hasn't arrived. What should I do?",
        timestamp: '2026-09-23T14:10:12Z',
        intent: 'REFUND_STATUS',
        sentiment: 'frustrated',
      },
      {
        id: 'msg_02',
        conversationId: 'conv_demo_01',
        sender: 'assistant',
        senderName: 'ServeX AI Support',
        text: "I'm sorry for the delay. According to our verified refund policy, approved refunds are normally processed and credited back to your original payment method within 5 to 7 business days. If your refund was approved longer than 7 business days ago, I can escalate this directly to our support team with your order number to track down the transaction.",
        timestamp: '2026-09-23T14:10:15Z',
        citedDocs: [
          {
            docId: 'doc_refund_policy',
            title: 'ServeX Standard Refund Policy v3.2',
            excerpt: 'Approved refunds are automatically credited back to the original method of payment within five (5) to seven (7) business days.',
          }
        ],
      },
      {
        id: 'msg_03',
        conversationId: 'conv_demo_01',
        sender: 'customer',
        senderName: 'David Miller',
        text: 'Thank you. It was only approved 3 days ago, so I will wait a couple more days.',
        timestamp: '2026-09-23T14:12:00Z',
        intent: 'ACKNOWLEDGEMENT',
        sentiment: 'positive',
      },
      {
        id: 'msg_04',
        conversationId: 'conv_demo_01',
        sender: 'assistant',
        senderName: 'ServeX AI Support',
        text: "You're very welcome, David! Please feel free to reach back out if you need anything else. Have a wonderful day!",
        timestamp: '2026-09-23T14:12:03Z',
      }
    ]
  },
  {
    id: 'conv_demo_02',
    organizationId: initialOrganization.id,
    customerName: 'Samantha Reed',
    customerEmail: 's.reed@techcorp.io',
    status: 'escalated',
    priority: 'high',
    intent: 'DAMAGED_ITEM_REFUND',
    sentiment: 'angry',
    createdAt: '2026-09-23T16:00:00Z',
    updatedAt: '2026-09-23T16:04:12Z',
    escalationReason: 'Customer is highly frustrated due to shattered merchandise and demanded a supervisor.',
    aiSummary: 'Customer received shattered monitor screen. Wants instant reimbursement. Escalated to human support queue.',
    messages: [
      {
        id: 'msg_10',
        conversationId: 'conv_demo_02',
        sender: 'customer',
        senderName: 'Samantha Reed',
        text: 'This product arrived completely shattered! The box looks crushed. I need an immediate replacement or full refund right now!',
        timestamp: '2026-09-23T16:00:22Z',
        intent: 'DAMAGED_GOODS',
        sentiment: 'angry',
      },
      {
        id: 'msg_11',
        conversationId: 'conv_demo_02',
        sender: 'assistant',
        senderName: 'ServeX AI Support',
        text: "I am truly sorry to hear that your item arrived damaged. Under our damaged merchandise policy, you are 100% entitled to an immediate replacement or full refund without paying return fees. We just need a quick photo of the damaged package and item.",
        timestamp: '2026-09-23T16:00:25Z',
        citedDocs: [
          {
            docId: 'doc_refund_policy',
            title: 'ServeX Standard Refund Policy v3.2',
            excerpt: 'If an item arrives damaged, defective, or incorrect, the customer is entitled to an immediate replacement or full refund.',
          }
        ]
      },
      {
        id: 'msg_12',
        conversationId: 'conv_demo_02',
        sender: 'customer',
        senderName: 'Samantha Reed',
        text: 'I already threw out the outer box! Do not give me robotic answers. Connect me to a real person immediately!',
        timestamp: '2026-09-23T16:03:50Z',
        intent: 'HUMAN_ESCALATION_REQUEST',
        sentiment: 'angry',
      },
      {
        id: 'msg_13',
        conversationId: 'conv_demo_02',
        sender: 'system',
        senderName: 'System Escalation Engine',
        text: 'Conversation escalated to Human Support Queue. Reason: Customer requested human agent with angry sentiment.',
        timestamp: '2026-09-23T16:04:12Z',
        isEscalationNotice: true,
      }
    ]
  },
  {
    id: 'conv_demo_03',
    organizationId: initialOrganization.id,
    customerName: 'Robert Vance',
    customerEmail: 'rvance@refrigeration.com',
    status: 'active',
    priority: 'normal',
    intent: 'SHIPPING_TIMELINE',
    sentiment: 'neutral',
    createdAt: '2026-09-23T17:30:00Z',
    updatedAt: '2026-09-23T17:31:00Z',
    aiSummary: 'Customer checking standard shipping delivery window.',
    messages: [
      {
        id: 'msg_20',
        conversationId: 'conv_demo_03',
        sender: 'customer',
        senderName: 'Robert Vance',
        text: 'How long does standard domestic shipping take once ordered?',
        timestamp: '2026-09-23T17:30:10Z',
        intent: 'SHIPPING_TIMELINE',
        sentiment: 'neutral',
      },
      {
        id: 'msg_21',
        conversationId: 'conv_demo_03',
        sender: 'assistant',
        senderName: 'ServeX AI Support',
        text: 'Standard domestic freight takes 3 to 5 business days across contiguous states, and orders placed before 2:00 PM EST dispatch same-day. Shipping is also complimentary on orders over $50!',
        timestamp: '2026-09-23T17:30:14Z',
        citedDocs: [
          {
            docId: 'doc_shipping_policy',
            title: 'Global Shipping & Delivery Guidelines',
            excerpt: 'Standard Freight: 3 to 5 business days delivery across all contiguous states.',
          }
        ]
      }
    ]
  }
];

export const initialTrainingScenarios: TrainingScenario[] = [
  {
    id: 'scen_01',
    title: 'Damaged Premium Item with Demanding Customer',
    description: 'A customer received a high-value item cracked in transit. They are angry, refusing standard paperwork, and demanding an immediate refund.',
    category: 'Refund & Defect Handling',
    difficulty: 'hard',
    customerPersonality: 'angry',
    customerProblem: 'Customer ordered an expensive wireless espresso machine ($380). Box was crushed and front display is broken. Customer wants money back right this second.',
    customerOpeningMessage: 'My $380 espresso machine just arrived and the entire digital display is cracked! The box looked like someone dropped a truck on it. I want an instant refund on my card right now!',
    expectedResolution: 'Express sincere empathy, validate the customer’s frustration, explain that damaged goods qualify for 100% free expedited replacement or full refund, calmly request a photo of the cracked item for carrier claims, and avoid escalating unprompted.',
    applicablePolicy: 'ServeX Standard Refund Policy v3.2 - Section 3 (Damaged or Defective Merchandise)',
    evaluationCriteria: [
      'Empathetic opening acknowledging customer frustration',
      'Clear explanation of 100% protection guarantee under damaged item policy',
      'Diplomatically requesting required photo proof without sounding accusatory',
      'Maintaining calm and de-escalating heightened emotion',
      'Explaining the 5-7 business day refund or instant replacement option'
    ],
    timesPracticed: 18,
    avgScore: 84
  },
  {
    id: 'scen_02',
    title: 'Post 60-Minute Cancellation Request',
    description: 'Customer placed an order 3 hours ago and wants to cancel it because they entered the wrong delivery address.',
    category: 'Order Management',
    difficulty: 'medium',
    customerPersonality: 'impatient',
    customerProblem: 'Customer missed the 60-minute cancellation window. Order is already packed in warehouse staging. Customer is anxious about delivery to old apartment.',
    customerOpeningMessage: 'Hey, I ordered order #SX-8821 three hours ago and I just realized I put my previous apartment address! Cancel it right now before it ships!',
    expectedResolution: 'Acknowledge the address mistake with urgency, explain the 60-minute warehouse pickup window gracefully, offer to coordinate with carrier logistics for an address intercept or guide them through free returns once delivered.',
    applicablePolicy: 'Order Modification & Cancellation Policy - Section 1 & 2',
    evaluationCriteria: [
      'Fast acknowledgment of address urgency',
      'Polite explanation of warehouse automation cutoff',
      'Proactive solutions (carrier intercept inquiry or return label setup)',
      'Reassurance regarding customer funds and package safety'
    ],
    timesPracticed: 24,
    avgScore: 89
  },
  {
    id: 'scen_03',
    title: 'Suspicious Account Charge / Fraud Claim',
    description: 'Customer claims someone placed an unauthorized $450 order on their credit card through ServeX.',
    category: 'Security & Escalation',
    difficulty: 'expert',
    customerPersonality: 'skeptical',
    customerProblem: 'Customer saw a charge on their statement they don’t recognize. Customer is skeptical and wondering if their account was compromised.',
    customerOpeningMessage: 'I have a $450 charge on my Chase card from SERVEX ONLINE that I never made! Who gave you permission to charge my card? Is this a scam?',
    expectedResolution: 'Strict adherence to security SOP: Do NOT ask for full card numbers, express urgency, immediately flag the order for security hold, explain safety verification steps, and smoothly escalate to the Fraud & Security Supervisor.',
    applicablePolicy: 'Support Security & Escalation Manual - Section 1',
    evaluationCriteria: [
      'Never asking for sensitive credentials or full card digits',
      'Validating the severity of unauthorized financial charges',
      'Promptly initiating security hold on the pending transaction',
      'Clean handoff to specialized fraud investigation team'
    ],
    timesPracticed: 12,
    avgScore: 92
  }
];

export const initialTrainingSessions: TrainingSession[] = [
  {
    id: 'sess_demo_01',
    scenarioId: 'scen_01',
    scenarioTitle: 'Damaged Premium Item with Demanding Customer',
    employeeId: 'user_employee',
    employeeName: 'Elena Rostova',
    status: 'evaluated',
    startedAt: '2026-09-22T10:15:00Z',
    completedAt: '2026-09-22T10:22:00Z',
    messages: [
      {
        id: 'tmsg_1',
        sender: 'ai_customer',
        text: 'My $380 espresso machine just arrived and the entire digital display is cracked! The box looked like someone dropped a truck on it. I want an instant refund on my card right now!',
        timestamp: '2026-09-22T10:15:10Z',
      },
      {
        id: 'tmsg_2',
        sender: 'employee',
        text: "I am so sorry to hear that, and I completely understand how upsetting it is to anticipate a new espresso machine only to receive it damaged! You are 100% protected under our policy. We can issue a full refund to your card (which takes 5-7 business days) or send you a brand new replacement via priority overnight shipping today. Could you please snap a quick photo of the cracked screen and the box so I can process this immediately for you?",
        timestamp: '2026-09-22T10:17:30Z',
      },
      {
        id: 'tmsg_3',
        sender: 'ai_customer',
        text: "Okay, I appreciate that you're taking it seriously. I really wanted the machine for this weekend's party. If you can actually overnight a replacement today, that works better than waiting a week for a refund. Where do I send the photo?",
        timestamp: '2026-09-22T10:18:45Z',
      },
      {
        id: 'tmsg_4',
        sender: 'employee',
        text: "You can reply directly to our confirmation email with the photo attached, or upload it right here. Once attached, I will immediately release the priority replacement so it arrives in time for your weekend event! I'll also email you a pre-paid return label for the damaged unit.",
        timestamp: '2026-09-22T10:20:15Z',
      },
      {
        id: 'tmsg_5',
        sender: 'ai_customer',
        text: "Sent! Thank you so much Elena, you made a stressful situation much easier.",
        timestamp: '2026-09-22T10:21:40Z',
      }
    ],
    evaluation: {
      overallScore: 94,
      communication: 96,
      empathy: 95,
      policyAdherence: 98,
      problemSolving: 92,
      professionalism: 96,
      summaryFeedback: "Outstanding de-escalation! Elena acknowledged the emotional distress immediately, clearly explained the damaged item guarantee, offered both options (refund vs express replacement), and turned a hostile customer into a delighted brand advocate.",
      strengths: [
        "Immediate emotional validation without becoming defensive",
        "Clear presentation of both replacement and refund avenues",
        "Effortless guidance for the required photo documentation"
      ],
      areasForImprovement: [
        "Could explicitly mention that the return shipping label has no cost to customer earlier in the turn."
      ],
      policyNote: "Fully compliant with ServeX Refund Policy v3.2 Section 3.",
      coachingTip: "Keep using dual-option framing (Refund vs Immediate Replacement) when handling damaged goods. It gives frustrated customers agency.",
      evaluatedAt: '2026-09-22T10:22:15Z'
    }
  }
];

export const initialAuditLogs: AuditLogEntry[] = [
  {
    id: 'log_01',
    action: 'POLICY_UPLOAD',
    actor: 'Sarah Vance',
    actorRole: 'admin',
    target: 'refund_policy_v3.2.pdf',
    timestamp: '2026-08-10T14:20:00Z',
    status: 'success',
  },
  {
    id: 'log_02',
    action: 'VECTOR_INDEXING_COMPLETED',
    actor: 'ServeX RAG Engine',
    actorRole: 'system',
    target: '7 chunks vectorized & indexed',
    timestamp: '2026-08-10T14:20:05Z',
    status: 'success',
  },
  {
    id: 'log_03',
    action: 'HUMAN_ESCALATION_TRIGGERED',
    actor: 'AI Escalation Engine',
    actorRole: 'system',
    target: 'Conversation #conv_demo_02 (Samantha Reed)',
    timestamp: '2026-09-23T16:04:12Z',
    status: 'alert',
  },
  {
    id: 'log_04',
    action: 'TRAINING_SCENARIO_CREATED',
    actor: 'Marcus Sterling',
    actorRole: 'trainer',
    target: 'Damaged Premium Item with Demanding Customer',
    timestamp: '2026-09-18T11:00:00Z',
    status: 'success',
  },
  {
    id: 'log_05',
    action: 'EMPLOYEE_SIMULATION_EVALUATED',
    actor: 'AI Coach Evaluator',
    actorRole: 'system',
    target: 'Elena Rostova (Score: 94%)',
    timestamp: '2026-09-22T10:22:15Z',
    status: 'success',
  }
];

export const initialNotifications: AppNotification[] = [
  {
    id: 'notif_01',
    title: 'High Priority Escalation',
    message: 'Customer Samantha Reed requires human assistance regarding damaged freight.',
    type: 'escalation',
    priority: 'high',
    read: false,
    timestamp: '2026-09-23T16:04:15Z',
    link: '/admin/escalations',
  },
  {
    id: 'notif_02',
    title: '5-Star Customer Feedback',
    message: 'David Miller rated conversation 5/5: "Super fast answer and clear timeframe!"',
    type: 'feedback',
    priority: 'normal',
    read: false,
    timestamp: '2026-09-23T14:15:35Z',
    link: '/admin/conversations',
  },
  {
    id: 'notif_03',
    title: 'Training Assessment Completed',
    message: 'Elena Rostova scored 94% on Damaged Item De-escalation scenario.',
    type: 'training',
    priority: 'normal',
    read: true,
    timestamp: '2026-09-22T10:22:20Z',
    link: '/trainer/assessments',
  }
];

// In-Memory Database store
class DatabaseStore {
  public organization: Organization = { ...initialOrganization };
  public users: User[] = [...initialUsers];
  public documents: CompanyDocument[] = [...initialDocuments];
  public conversations: SupportConversation[] = [...initialConversations];
  public trainingScenarios: TrainingScenario[] = [...initialTrainingScenarios];
  public trainingSessions: TrainingSession[] = [...initialTrainingSessions];
  public auditLogs: AuditLogEntry[] = [...initialAuditLogs];
  public notifications: AppNotification[] = [...initialNotifications];

  public addAuditLog(action: string, actor: string, actorRole: string, target: string, status: 'success' | 'warning' | 'alert' = 'success') {
    const entry: AuditLogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      action,
      actor,
      actorRole,
      target,
      timestamp: new Date().toISOString(),
      status
    };
    this.auditLogs.unshift(entry);
    if (this.auditLogs.length > 100) this.auditLogs.pop();
  }

  public addNotification(title: string, message: string, type: 'escalation' | 'feedback' | 'training' | 'system', priority: 'low' | 'normal' | 'high' = 'normal', link?: string) {
    const notif: AppNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title,
      message,
      type,
      priority,
      read: false,
      timestamp: new Date().toISOString(),
      link
    };
    this.notifications.unshift(notif);
  }
}

export const db = new DatabaseStore();
