import React from 'react';
import {
  Bot,
  GraduationCap,
  FileCheck2,
  Users,
  ShieldAlert,
  BarChart3,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Headphones,
  Zap,
  Lock,
  Building,
  Layers,
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  MessageSquare
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (view: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen text-slate-100 overflow-hidden">
      
      {/* Hero Section */}
      <section className="relative pt-16 pb-24 lg:pt-24 lg:pb-32 px-4 sm:px-6 lg:px-8">
        {/* Glow backdrop effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-[#4F8CFF]/20 via-[#7C5CFF]/15 to-transparent blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-[#00D4FF]/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          
          {/* Tagline kicker */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#101B35] border border-[#4F8CFF]/30 text-xs font-semibold text-[#00D4FF] mb-8 shadow-lg shadow-blue-500/10 animate-in fade-in duration-500">
            <Sparkles className="w-3.5 h-3.5 text-[#00E5B0]" />
            <span>Every Customer Heard · Smart Support · Stronger People</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]">
            AI-Powered Customer Service & <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-[#4F8CFF] via-[#7C5CFF] to-[#00D4FF] bg-clip-text text-transparent">
              Employee Coaching Platform
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
            ServeX AI connects 24/7 autonomous support, verified policy-grounded RAG, intelligent human escalation, and realistic AI employee simulations into one unified enterprise ecosystem.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <button
              onClick={() => onNavigate('customer')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#4F8CFF] to-[#7C5CFF] text-white font-semibold text-sm shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <Headphones className="w-4 h-4" />
              <span>Test AI Customer Support</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => onNavigate('employee')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#0B1630] border border-white/15 text-slate-200 font-semibold text-sm hover:bg-white/5 hover:border-white/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <GraduationCap className="w-4 h-4 text-[#00E5B0]" />
              <span>Launch Employee Simulator</span>
            </button>
          </div>

          {/* Interactive Differentiator Callout */}
          <div className="mt-14 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#101B35]/90 via-[#0B1630]/90 to-[#101B35]/90 border border-white/10 shadow-2xl backdrop-blur-md max-w-4xl mx-auto text-left">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#4F8CFF]/15 border border-[#4F8CFF]/30 text-[#4F8CFF]">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Not Just Another Generic Chatbot</h4>
                  <p className="text-xs text-slate-400">
                    A dual-engine platform uniting live customer queries, company policy retrieval, human escalations, and continuous employee training.
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('admin')}
                className="text-xs font-semibold text-[#00D4FF] hover:text-white flex items-center gap-1 transition-colors whitespace-nowrap"
              >
                <span>View Admin & Knowledge Portal</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 3 Pillars Section */}
      <section className="py-20 border-t border-white/5 bg-[#0B1630]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#4F8CFF]">The Core Foundation</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
              The 3 Pillars of ServeX AI
            </h2>
            <p className="text-sm sm:text-base text-slate-400 mt-3">
              Designed from the ground up for enterprise customer operations teams requiring zero hallucination risks and continuous workforce elevation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Pillar 1 */}
            <div className="glass-panel rounded-2xl p-8 border border-white/10 hover:border-[#4F8CFF]/40 transition-all group relative overflow-hidden">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-[#4F8CFF] mb-6 group-hover:scale-110 transition-transform">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                24/7 AI Support
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                Handles routine customer inquiries instantly around the clock. Accurately determines customer intent, monitors sentiment, and grounds answers directly in verified knowledge.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00E5B0]" />
                  <span>Real-time sentiment & urgency classification</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00E5B0]" />
                  <span>Sub-3 second average response latency</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00E5B0]" />
                  <span>Seamless human supervisor handoff</span>
                </li>
              </ul>
            </div>

            {/* Pillar 2 */}
            <div className="glass-panel rounded-2xl p-8 border border-white/10 hover:border-[#7C5CFF]/40 transition-all group relative overflow-hidden">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-[#7C5CFF] mb-6 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                AI Employee Coaching
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                Simulates real customer personalities (angry, confused, impatient, demanding) in interactive sandbox scenarios to prepare support agents before facing real tickets.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00E5B0]" />
                  <span>Dynamic AI customer behavior & escalation simulation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00E5B0]" />
                  <span>5-Dimension rubric evaluation & scoring</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00E5B0]" />
                  <span>Actionable coaching tips and feedback</span>
                </li>
              </ul>
            </div>

            {/* Pillar 3 */}
            <div className="glass-panel rounded-2xl p-8 border border-white/10 hover:border-[#00D4FF]/40 transition-all group relative overflow-hidden">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-[#00D4FF] mb-6 group-hover:scale-110 transition-transform">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Policy-Grounded RAG
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                Uses company-uploaded PDF, DOCX, and TXT policy documents. Chunks, indexes, and retrieves verified paragraphs with citations rather than inventing responses.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00E5B0]" />
                  <span>Automated text chunking & keyword vector indexing</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00E5B0]" />
                  <span>Zero-invention guardrails with confidence check</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#00E5B0]" />
                  <span>Transparent source citations on every response</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* Architectural Flow Diagram */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-[#00D4FF]">System Design</span>
          <h2 className="text-3xl font-extrabold text-white mt-2">
            The Complete ServeX AI Ecosystem
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto mt-2">
            How incoming customer queries and employee skill development connect through our centralized policy knowledge base.
          </p>
        </div>

        {/* Visual Architecture Board */}
        <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl relative">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            
            {/* Left Column: Customer Support Flow */}
            <div className="bg-[#0B1630] rounded-2xl p-6 border border-blue-500/20 shadow-lg">
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Headphones className="w-4 h-4 text-[#4F8CFF]" />
                  <span>Customer Support Stream</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-[#4F8CFF] bg-blue-500/10 px-2 py-0.5 rounded">
                  External Facing
                </span>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-3 rounded-xl bg-[#101B35] border border-white/5 flex items-center justify-between">
                  <span className="font-medium text-slate-300">1. Customer Inquires</span>
                  <span className="text-slate-400 text-[11px]">Chat Widget / API</span>
                </div>
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[#4F8CFF] flex items-center justify-between font-semibold">
                  <span>2. Intent & Sentiment Classification</span>
                  <span className="text-[10px] bg-blue-500/20 px-1.5 py-0.5 rounded">Real-time</span>
                </div>
                <div className="p-3 rounded-xl bg-[#101B35] border border-white/5 flex items-center justify-between">
                  <span className="font-medium text-slate-300">3. Policy-Grounded RAG Search</span>
                  <span className="text-[#00E5B0] font-semibold text-[11px]">Vector Match</span>
                </div>
                <div className="p-3 rounded-xl bg-[#101B35] border border-white/5 flex items-center justify-between">
                  <span className="font-medium text-slate-300">4. Grounded AI Response or Escalation</span>
                  <span className="text-indigo-400 font-semibold text-[11px]">Confidence Check</span>
                </div>
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 flex items-center justify-between font-semibold">
                  <span>5. Human Escalation / Feedback Loop</span>
                  <span className="text-[10px] bg-purple-500/20 px-1.5 py-0.5 rounded">CSAT Capture</span>
                </div>
              </div>
            </div>

            {/* Right Column: Employee Coaching Flow */}
            <div className="bg-[#0B1630] rounded-2xl p-6 border border-emerald-500/20 shadow-lg">
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <GraduationCap className="w-4 h-4 text-[#00E5B0]" />
                  <span>Employee Coaching Stream</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-[#00E5B0] bg-emerald-500/10 px-2 py-0.5 rounded">
                  Internal Enablement
                </span>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-3 rounded-xl bg-[#101B35] border border-white/5 flex items-center justify-between">
                  <span className="font-medium text-slate-300">1. Trainer Configures Scenario</span>
                  <span className="text-slate-400 text-[11px]">Difficulty & Persona</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#00E5B0] flex items-center justify-between font-semibold">
                  <span>2. AI Customer Simulator Engages</span>
                  <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded">Dynamic Behavior</span>
                </div>
                <div className="p-3 rounded-xl bg-[#101B35] border border-white/5 flex items-center justify-between">
                  <span className="font-medium text-slate-300">3. Employee Practices Policy De-escalation</span>
                  <span className="text-cyan-400 font-semibold text-[11px]">Interactive</span>
                </div>
                <div className="p-3 rounded-xl bg-[#101B35] border border-white/5 flex items-center justify-between">
                  <span className="font-medium text-slate-300">4. 5-Metric AI Rubric Evaluation</span>
                  <span className="text-purple-300 font-semibold text-[11px]">Communication/Empathy</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[#00E5B0] flex items-center justify-between font-semibold">
                  <span>5. Coaching Analytics & Gap Remediation</span>
                  <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded">Actionable Insights</span>
                </div>
              </div>
            </div>

          </div>

          {/* Central Knowledge Core Badge */}
          <div className="mt-8 p-4 rounded-xl bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-purple-900/40 border border-white/15 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/10 text-[#00D4FF]">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-white">Central Knowledge & Policy Core</span>
                <p className="text-[11px] text-slate-300">Both customer agents and training simulations reference the identical company policy documents.</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('admin')}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              Manage Knowledge Base
            </button>
          </div>

        </div>
      </section>

      {/* Industries Grid */}
      <section className="py-20 border-t border-white/5 bg-[#071225]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#4F8CFF]">Versatile Enterprise Architecture</span>
            <h2 className="text-3xl font-extrabold text-white mt-2">
              Engineered For High-Stakes Industries
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Configurable policies adapt to complex regulatory, financial, and logistical environments.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'E-Commerce', desc: 'Returns, refunds & damaged goods' },
              { name: 'FinTech & Banking', desc: 'Transactions & strict compliance' },
              { name: 'SaaS Platforms', desc: 'Tiered SLAs & technical support' },
              { name: 'Logistics', desc: 'Freight tracking & carrier claims' },
              { name: 'Travel & Hospitality', desc: 'Bookings, waivers & itineraries' },
              { name: 'Healthcare Services', desc: 'Patient scheduling & intake' },
            ].map((ind, i) => (
              <div key={i} className="p-4 rounded-xl bg-[#0B1630] border border-white/10 text-center hover:border-blue-500/30 transition-all">
                <Building className="w-5 h-5 text-[#4F8CFF] mx-auto mb-2" />
                <h4 className="text-xs font-bold text-white">{ind.name}</h4>
                <p className="text-[10px] text-slate-400 mt-1">{ind.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 90-Day Implementation Plan */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-[#00E5B0]">Deployment Roadmap</span>
          <h2 className="text-3xl font-extrabold text-white mt-2">
            90-Day Enterprise Implementation
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#0B1630] border border-white/10">
            <span className="text-xs font-extrabold text-[#4F8CFF] uppercase">Month 1 · Foundation</span>
            <h3 className="text-base font-bold text-white mt-2 mb-3">Policy Ingestion & RAG Setup</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload PDF/DOCX policy documents, set vector chunking parameters, configure RBAC user roles, and customize escalation triggers.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-[#0B1630] border border-white/10">
            <span className="text-xs font-extrabold text-[#7C5CFF] uppercase">Month 2 · AI Core</span>
            <h3 className="text-base font-bold text-white mt-2 mb-3">Support Automation & Pilot</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Deploy customer-facing AI agent, activate intent/sentiment routing, connect live agent escalation queue, and verify CSAT feedback loops.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-[#0B1630] border border-white/10">
            <span className="text-xs font-extrabold text-[#00E5B0] uppercase">Month 3 · Coaching</span>
            <h3 className="text-base font-bold text-white mt-2 mb-3">Simulator & Quality Scale</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enable employee AI customer simulations, configure trainer rubrics, review competency growth analytics, and continuous improvement.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 text-center border-t border-white/10 bg-gradient-to-b from-[#0B1630] to-[#071225]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Transform Your Customer Operations
          </h2>
          <p className="text-slate-300 text-sm sm:text-base mb-8">
            Experience how ServeX AI keeps customers satisfied and turns support employees into top performers.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('customer')}
              className="px-6 py-3 rounded-xl bg-[#4F8CFF] text-white font-semibold text-sm hover:bg-blue-600 transition-colors shadow-lg cursor-pointer"
            >
              Test Customer Support Agent
            </button>
            <button
              onClick={() => onNavigate('admin')}
              className="px-6 py-3 rounded-xl bg-white/10 text-white font-semibold text-sm hover:bg-white/20 transition-colors cursor-pointer"
            >
              Open Admin Dashboard
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
