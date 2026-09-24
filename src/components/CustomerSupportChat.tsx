import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  User,
  ShieldAlert,
  Sparkles,
  BookOpen,
  Star,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Headphones,
  Paperclip,
  CheckCircle2,
  HelpCircle,
  MessageSquare,
  RefreshCw,
  Clock,
  Shield,
  ThumbsUp
} from 'lucide-react';
import { api } from '../services/api.ts';
import { SupportConversation, SupportMessage, SentimentType } from '../types/index.ts';

export const CustomerSupportChat: React.FC = () => {
  const [conversation, setConversation] = useState<SupportConversation | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState('David Miller');
  const [customerEmail, setCustomerEmail] = useState('david.miller@example.com');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [expandedCitationIndex, setExpandedCitationIndex] = useState<number | null>(null);
  const [isResolvedConfirmed, setIsResolvedConfirmed] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const initialSuggestedPrompts = [
    "My refund hasn't arrived yet. What should I do?",
    "Where is my order #SX-8821 and how do I track it?",
    "I received a damaged package with cracked glass!",
    "Can I cancel an order placed 20 minutes ago?",
    "I want to speak with a human support specialist."
  ];

  // Dynamic context-aware follow-up chips based on conversation state
  const getFollowUpChips = () => {
    if (!conversation || conversation.messages.length === 0) return [];

    const lastMsg = conversation.messages[conversation.messages.length - 1];
    const isEscalated = conversation.status === 'escalated';
    const isResolved = conversation.status === 'resolved' || isResolvedConfirmed;

    if (isResolved) {
      return [
        "Actually, I have another question about my order",
        "How long do I have to make future returns?",
        "Start a brand new inquiry"
      ];
    }

    if (isEscalated) {
      return [
        "Here is my order number: #SX-8821",
        "Can I upload photos of the damaged item?",
        "What is the average response time for a specialist?",
        "Nevermind, my question is resolved now!"
      ];
    }

    const intent = conversation.intent || '';
    if (intent.includes('REFUND')) {
      return [
        "Does the 5-7 business days include weekends?",
        "What if I paid with PayPal or debit card?",
        "Where do I download the pre-paid shipping label?",
        "My issue is resolved, thank you!"
      ];
    } else if (intent.includes('SHIPPING') || intent.includes('TRACK')) {
      return [
        "Can I redirect my shipment to a pickup locker?",
        "What if the courier marked it delivered but I don't see it?",
        "How do I upgrade to overnight shipping next time?",
        "This completely answers my question!"
      ];
    } else if (intent.includes('DAMAGE')) {
      return [
        "How do I submit the photos for inspection?",
        "Can you send the replacement before I mail back the broken item?",
        "What if the item is out of stock?",
        "Got it, issue resolved!"
      ];
    } else if (intent.includes('CANCEL')) {
      return [
        "Can I change the shipping address instead of canceling?",
        "Will the temporary authorization drop immediately?",
        "My issue is resolved, thank you!"
      ];
    }

    return [
      "Can you clarify the policy on this?",
      "Does this apply to international orders?",
      "I'd like to connect to a human agent",
      "That solves my problem, thank you!"
    ];
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || loading) return;

    if (text === "Start a brand new inquiry") {
      handleStartNewChat();
      return;
    }

    // Check if the user is saying their query is resolved
    if (/resolved|solved|all good|that solves|answers my question/i.test(text) && conversation) {
      handleMarkResolved();
      return;
    }

    setInputMessage('');
    setLoading(true);

    try {
      const res = await api.sendSupportChat({
        conversationId: conversation?.id,
        customerName,
        customerEmail,
        message: text,
      });

      setConversation(res.conversation);
      if (res.conversation.status === 'resolved') {
        setIsResolvedConfirmed(true);
      }
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkResolved = async () => {
    if (!conversation) return;
    try {
      await api.resolveConversation(conversation.id, 'Customer confirmed issue resolved in chat.');
      setConversation(prev => prev ? { ...prev, status: 'resolved' } : null);
      setIsResolvedConfirmed(true);
      setShowFeedbackModal(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReopenConversation = async () => {
    if (!conversation) return;
    try {
      await api.reopenConversation(conversation.id);
      setConversation(prev => prev ? { ...prev, status: 'active' } : null);
      setIsResolvedConfirmed(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!conversation) return;
    try {
      await api.submitFeedback(conversation.id, rating, feedbackComment);
      setFeedbackSubmitted(true);
      setShowFeedbackModal(false);
    } catch (err) {
      console.error('Feedback submit error:', err);
    }
  };

  const handleStartNewChat = () => {
    setConversation(null);
    setIsResolvedConfirmed(false);
    setFeedbackSubmitted(false);
    setShowFeedbackModal(false);
  };

  const getSentimentBadge = (sentiment?: SentimentType) => {
    switch (sentiment) {
      case 'angry':
        return <span className="text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded">Tone: Frustrated / Angry</span>;
      case 'frustrated':
        return <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">Tone: Frustrated</span>;
      case 'urgent':
        return <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded">Tone: Urgent</span>;
      case 'positive':
        return <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">Tone: Satisfied</span>;
      default:
        return <span className="text-[10px] font-semibold text-slate-400 bg-slate-500/10 border border-slate-500/20 px-2 py-0.5 rounded">Tone: Inquiring</span>;
    }
  };

  const isResolved = conversation?.status === 'resolved' || isResolvedConfirmed;
  const isEscalated = conversation?.status === 'escalated';

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
      
      {/* Header bar: Responsive on mobile, tablet & desktop */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-white/10 mb-3 sm:mb-4 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#4F8CFF] to-[#7C5CFF] flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white">ServeX Customer Support AI</h2>
              {/* Dynamic Resolution Status Indicator */}
              <span className={`flex items-center gap-1 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                isResolved
                  ? 'text-[#00E5B0] bg-[#00E5B0]/10 border-[#00E5B0]/30'
                  : isEscalated
                  ? 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                  : 'text-[#00D4FF] bg-blue-500/10 border-blue-500/30'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  isResolved ? 'bg-[#00E5B0]' : isEscalated ? 'bg-amber-400 animate-pulse' : 'bg-[#00D4FF] animate-pulse'
                }`} />
                <span>
                  {isResolved ? 'Query Resolved' : isEscalated ? 'Human Specialist Alerted' : 'Communicating · Active'}
                </span>
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 line-clamp-1 sm:line-clamp-none">
              Grounded in verified policies · Continuous support until your inquiry is 100% resolved
            </p>
          </div>
        </div>

        {/* Quick Header Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-white/5">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-white truncate max-w-[120px]">{customerName}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {conversation && (
              <button
                onClick={handleStartNewChat}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-slate-300 transition-colors border border-white/10"
                title="Start a new chat session"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Box Container: Responsive height across viewport sizes */}
      <div className="glass-panel rounded-2xl border border-white/10 shadow-2xl flex flex-col h-[65vh] sm:h-[620px] max-h-[750px] overflow-hidden relative">
        
        {/* Messages Scroll Area */}
        <div
          ref={chatContainerRef}
          className="flex-1 p-3 sm:p-5 overflow-y-auto space-y-3 sm:space-y-4 scroll-smooth"
        >
          
          {/* Welcome Greeting */}
          <div className="flex items-start gap-2.5 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#4F8CFF]/20 border border-[#4F8CFF]/30 flex items-center justify-center text-[#4F8CFF] shrink-0 mt-0.5">
              <Bot className="w-4 h-4" />
            </div>
            <div className="max-w-[88%] sm:max-w-[80%] bg-[#0B1630] border border-white/10 rounded-2xl rounded-tl-sm p-3.5 sm:p-4 text-xs text-slate-200 leading-relaxed shadow-md">
              <p className="font-bold text-white mb-1">Hello! Welcome to ServeX AI Support.</p>
              <p className="text-slate-300">
                I can assist you with your orders, refunds, cancellations, warranties, and shipping timelines using our verified company policies. Feel free to ask questions and follow up continuously until everything is completely solved for you!
              </p>
            </div>
          </div>

          {/* Active Conversation Messages */}
          {conversation?.messages.map((msg: SupportMessage, idx: number) => {
            const isUser = msg.sender === 'customer';
            const isSystem = msg.sender === 'system';
            const isAgent = msg.sender === 'agent';

            if (isSystem) {
              return (
                <div key={msg.id || idx} className="p-3 my-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2 animate-in fade-in duration-200">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <span className="font-bold">Human Specialist Queue Notification: </span>
                    <span>{msg.text}</span>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={msg.id || idx}
                className={`flex items-start gap-2.5 sm:gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    isUser
                      ? 'bg-gradient-to-tr from-indigo-600 to-blue-600 text-white'
                      : isAgent
                      ? 'bg-purple-600 text-white'
                      : 'bg-[#4F8CFF]/20 border border-[#4F8CFF]/30 text-[#4F8CFF]'
                  }`}
                >
                  {isUser ? <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : isAgent ? <Headphones className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                </div>

                <div
                  className={`max-w-[88%] sm:max-w-[82%] rounded-2xl p-3 sm:p-4 text-xs leading-relaxed shadow-md ${
                    isUser
                      ? 'bg-gradient-to-br from-[#4F8CFF] to-[#3B82F6] text-white rounded-tr-sm'
                      : isAgent
                      ? 'bg-gradient-to-br from-purple-950/80 to-[#101B35] border border-purple-500/30 text-purple-100 rounded-tl-sm'
                      : 'bg-[#0B1630] border border-white/10 text-slate-200 rounded-tl-sm'
                  }`}
                >
                  {/* Sender & timestamp header */}
                  <div className="flex items-center justify-between gap-3 mb-1.5 pb-1 border-b border-white/10">
                    <span className="font-bold text-[11px] text-white">
                      {isUser ? customerName : msg.senderName || 'ServeX AI Support'}
                    </span>
                    <div className="flex items-center gap-2">
                      {msg.sentiment && getSentimentBadge(msg.sentiment)}
                      <span className="text-[10px] text-slate-400">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {/* Message body */}
                  <div className="whitespace-pre-wrap break-words">{msg.text}</div>

                  {/* Policy Grounding Citations */}
                  {msg.citedDocs && msg.citedDocs.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-white/10">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#00E5B0] mb-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Verified Company Policy Sources:</span>
                      </div>
                      <div className="space-y-1.5">
                        {msg.citedDocs.map((doc, cIdx) => (
                          <div
                            key={cIdx}
                            className="bg-[#101B35] border border-white/5 rounded-lg p-2 text-[11px]"
                          >
                            <div className="flex items-center justify-between text-slate-300 font-semibold">
                              <span>{doc.title}</span>
                              <span className="text-[9px] text-[#00D4FF] bg-blue-500/10 px-1.5 py-0.5 rounded">
                                RAG Grounded
                              </span>
                            </div>
                            <p className="text-slate-400 mt-1 italic">
                              "{doc.excerpt}"
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Intent tag */}
                  {msg.intent && (
                    <div className="mt-2 flex items-center justify-end">
                      <span className="text-[9px] text-slate-400 font-mono">
                        Intent: {msg.intent}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Loading indicator */}
          {loading && (
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#4F8CFF]/20 border border-[#4F8CFF]/30 flex items-center justify-center text-[#4F8CFF]">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-[#0B1630] border border-white/10 rounded-2xl rounded-tl-sm px-4 py-2.5 text-xs text-slate-300 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4F8CFF] animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#7C5CFF] animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#00D4FF] animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] text-slate-400 ml-1">
                  Cross-referencing verified policies & synthesizing response...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Dynamic Follow-up Suggestions & Continuous Resolution Controls */}
        <div className="p-2 sm:p-3 bg-[#0B1630]/90 border-t border-white/5 space-y-2">
          
          {/* Proactive Resolution Status Bar */}
          {conversation && conversation.messages.length >= 2 && (
            <div className="px-2 py-1.5 rounded-xl bg-[#101B35] border border-white/5 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs">
                {isResolved ? (
                  <span className="flex items-center gap-1.5 text-[#00E5B0] font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Your inquiry was marked resolved!</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <HelpCircle className="w-3.5 h-3.5 text-[#00D4FF]" />
                    <span>Has this completely answered your question?</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {!isResolved ? (
                  <>
                    <button
                      onClick={handleMarkResolved}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-[#00E5B0] border border-emerald-500/40 text-[11px] font-bold transition-colors flex items-center gap-1"
                    >
                      <CheckCircle className="w-3 h-3" />
                      <span>Yes, Issue Resolved</span>
                    </button>
                    <button
                      onClick={() => handleSendMessage("I still need more clarification on this policy")}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-[11px] font-medium transition-colors"
                    >
                      Need More Help
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleReopenConversation}
                    className="px-2.5 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-[#00D4FF] border border-blue-500/40 text-[11px] font-bold transition-colors flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Re-open / Ask More</span>
                  </button>
                )}

                <button
                  onClick={() => setShowFeedbackModal(true)}
                  className="px-2 py-1 rounded-lg text-[11px] text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 transition-colors flex items-center gap-1"
                >
                  <Star className="w-3 h-3 fill-amber-400" />
                  <span>Rate</span>
                </button>
              </div>
            </div>
          )}

          {/* Quick Contextual Follow-up Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mr-1 hidden sm:inline">
              Suggested:
            </span>
            {(conversation ? getFollowUpChips() : initialSuggestedPrompts).map((prompt, pIdx) => (
              <button
                key={pIdx}
                onClick={() => handleSendMessage(prompt)}
                disabled={loading}
                className="px-2.5 py-1 rounded-lg bg-[#101B35] hover:bg-blue-600/20 border border-white/10 hover:border-blue-500/30 text-slate-300 hover:text-white text-[11px] text-left transition-colors flex items-center gap-1 group whitespace-nowrap overflow-hidden text-ellipsis max-w-[260px] sm:max-w-none"
              >
                <span className="truncate">{prompt}</span>
                <ArrowRight className="w-2.5 h-2.5 text-[#4F8CFF] shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </button>
            ))}
          </div>

        </div>

        {/* Input Bar: Touch-friendly & sticky */}
        <div className="p-2 sm:p-3 bg-[#071225] border-t border-white/10">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              placeholder="Ask anything or follow up till resolved (e.g. 'Can I change my address?', 'What about PayPal?')..."
              className="flex-1 bg-[#0B1630] border border-white/15 focus:border-[#4F8CFF] focus:outline-none rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 transition-colors shadow-inner"
              disabled={loading}
            />
            
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="px-3 sm:px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#4F8CFF] to-[#7C5CFF] text-white disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/20 flex items-center gap-1.5 shrink-0"
              aria-label="Send message"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-xs font-semibold">Send</span>
            </button>
          </form>
        </div>

      </div>

      {/* Customer Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#0B1630] border border-white/10 rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl relative">
            <h3 className="text-base font-bold text-white mb-1">Rate Your Support Experience</h3>
            <p className="text-xs text-slate-400 mb-4">
              Your feedback is used to evaluate AI accuracy and continually coach our team.
            </p>

            <div className="flex items-center justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-125 transition-transform"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                    }`}
                  />
                </button>
              ))}
            </div>

            <textarea
              value={feedbackComment}
              onChange={e => setFeedbackComment(e.target.value)}
              placeholder="Tell us what you liked or how we can improve..."
              className="w-full bg-[#101B35] border border-white/15 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 h-24 mb-4"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowFeedbackModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleFeedbackSubmit}
                className="px-5 py-2 rounded-xl bg-[#4F8CFF] hover:bg-blue-600 text-xs font-semibold text-white shadow-lg shadow-blue-500/20 transition-colors"
              >
                Submit Rating
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
