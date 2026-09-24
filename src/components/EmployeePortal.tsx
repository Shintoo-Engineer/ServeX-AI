import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  GraduationCap,
  Play,
  RotateCcw,
  Send,
  User,
  Bot,
  CheckCircle2,
  AlertCircle,
  Award,
  BookOpen,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Clock,
  Layers,
  HeartHandshake
} from 'lucide-react';
import { api } from '../services/api.ts';
import {
  EvaluationResult,
  TrainingScenario,
  TrainingSession,
  TrainingMessage
} from '../types/index.ts';

export const EmployeePortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'simulator' | 'assessments'>('simulator');
  const [scenarios, setScenarios] = useState<TrainingScenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<TrainingScenario | null>(null);
  const [activeSession, setActiveSession] = useState<TrainingSession | null>(null);
  const [employeeInput, setEmployeeInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [pastSessions, setPastSessions] = useState<TrainingSession[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages, loading]);

  const loadData = async () => {
    try {
      const [scenRes, sessRes] = await Promise.all([
        api.getScenarios(),
        api.getTrainingSessions(),
      ]);
      setScenarios(scenRes.scenarios);
      if (scenRes.scenarios.length > 0 && !selectedScenario) {
        setSelectedScenario(scenRes.scenarios[0]);
      }
      setPastSessions(sessRes.sessions.filter(s => s.status === 'evaluated'));
    } catch (e) {
      console.error(e);
    }
  };

  const handleStartSession = async (scenario: TrainingScenario) => {
    try {
      setLoading(true);
      const res = await api.startTrainingSession(scenario.id, 'user_employee', 'Elena Rostova');
      setSelectedScenario(scenario);
      setActiveSession(res.session);
      setActiveTab('simulator');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmployeeReply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeSession || !employeeInput.trim() || loading) return;

    const text = employeeInput;
    setEmployeeInput('');
    setLoading(true);

    try {
      const res = await api.sendTrainingReply(activeSession.id, text);
      setActiveSession(res.session);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluateSession = async () => {
    if (!activeSession) return;
    setEvaluating(true);

    try {
      const res = await api.evaluateTrainingSession(activeSession.id);
      setActiveSession(res.session);
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Employee Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Support Agent Enablement</span>
            <span className="text-[10px] text-[#00E5B0] bg-[#00E5B0]/10 border border-[#00E5B0]/30 px-2 py-0.5 rounded">
              Elena Rostova (Tier-1)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            AI Customer Simulator & Practice Arena
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Roleplay against realistic customer temperaments · Instant AI evaluation on 5 core dimensions
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'simulator' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-white/5'
            }`}
          >
            Live Simulator
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'dashboard' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-white/5'
            }`}
          >
            My Competency Dashboard
          </button>
          <button
            onClick={() => setActiveTab('assessments')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'assessments' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white bg-white/5'
            }`}
          >
            Past Evaluations ({pastSessions.length})
          </button>
        </div>
      </div>

      {/* TAB 1: LIVE SIMULATOR (CORE KILLER FEATURE) */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Scenario Selector & Guide (Left) */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Scenarios Catalog */}
            <div className="glass-panel rounded-2xl p-4 border border-white/10 space-y-3">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Select Training Scenario</span>
              
              <div className="space-y-2">
                {scenarios.map(scen => (
                  <div
                    key={scen.id}
                    onClick={() => handleStartSession(scen)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      selectedScenario?.id === scen.id && activeSession
                        ? 'bg-emerald-950/40 border-emerald-500 shadow-md'
                        : 'bg-[#0B1630] border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white">{scen.title}</span>
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        scen.difficulty === 'hard' || scen.difficulty === 'expert' ? 'bg-red-500/20 text-red-400' :
                        scen.difficulty === 'medium' ? 'bg-amber-500/20 text-amber-300' :
                        'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {scen.difficulty}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mb-2">
                      {scen.customerProblem}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>Persona: <strong className="text-slate-300 capitalize">{scen.customerPersonality}</strong></span>
                      <span className="text-[#00E5B0] font-semibold flex items-center gap-1">
                        <Play className="w-3 h-3" /> Practice
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Applicable Policy Reference Cheat Sheet */}
            {selectedScenario && (
              <div className="glass-panel rounded-2xl p-4 border border-white/10 text-xs">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#00D4FF]" />
                  Applicable Company Policy
                </span>
                <p className="text-slate-300 font-semibold mt-2">{selectedScenario.applicablePolicy}</p>
                <div className="mt-3 pt-3 border-t border-white/10 text-[11px] text-slate-400 space-y-1.5">
                  <span className="font-bold text-slate-300">Expected Resolution Goal:</span>
                  <p>{selectedScenario.expectedResolution}</p>
                </div>
              </div>
            )}

          </div>

          {/* Chat Arena & Simulation (Right) */}
          <div className="lg:col-span-8 flex flex-col space-y-4">
            
            {activeSession ? (
              <div className="glass-panel rounded-2xl border border-white/10 shadow-2xl flex flex-col h-[650px] overflow-hidden">
                
                {/* Simulation Header */}
                <div className="p-4 border-b border-white/10 bg-[#0B1630]/70 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold text-xs">
                      AI
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">{selectedScenario?.title}</h3>
                        <span className="text-[10px] text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded capitalize">
                          Persona: {selectedScenario?.customerPersonality}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Interactive Training Session · Respond professionally to de-escalate
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleEvaluateSession}
                      disabled={evaluating || activeSession.messages.length < 2}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>{evaluating ? 'Grading Rubric...' : 'Conclude & Evaluate'}</span>
                    </button>
                  </div>
                </div>

                {/* Conversation Body */}
                <div className="flex-1 p-5 overflow-y-auto space-y-4">
                  {activeSession.messages.map((m: TrainingMessage, idx: number) => {
                    const isEmployee = m.sender === 'employee';

                    return (
                      <div
                        key={m.id || idx}
                        className={`flex items-start gap-3 ${isEmployee ? 'flex-row-reverse' : ''}`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            isEmployee
                              ? 'bg-gradient-to-tr from-emerald-600 to-teal-600 text-white'
                              : 'bg-purple-500/20 border border-purple-500/30 text-purple-300'
                          }`}
                        >
                          {isEmployee ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                        </div>

                        <div
                          className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed shadow-md ${
                            isEmployee
                              ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-tr-sm'
                              : 'bg-[#0B1630] border border-white/10 text-slate-200 rounded-tl-sm'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3 mb-1 pb-1 border-b border-white/10 text-[10px] text-slate-300">
                            <span className="font-bold">
                              {isEmployee ? 'Elena Rostova (You)' : `Simulated Customer (${selectedScenario?.customerPersonality})`}
                            </span>
                            <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>

                          <div className="whitespace-pre-wrap">{m.text}</div>
                        </div>
                      </div>
                    );
                  })}

                  {loading && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                        <Bot className="w-4 h-4 animate-spin" />
                      </div>
                      <div className="bg-[#0B1630] border border-white/10 rounded-2xl rounded-tl-sm px-4 py-2.5 text-xs text-purple-300 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                        <span className="text-[11px] text-slate-400">
                          AI Customer is formulating natural reaction...
                        </span>
                      </div>
                    </div>
                  )}

                  <div ref={chatEndRef} />
                </div>

                {/* Input Bar */}
                <div className="p-3 bg-[#071225] border-t border-white/10">
                  <form onSubmit={handleSendEmployeeReply} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={employeeInput}
                      onChange={e => setEmployeeInput(e.target.value)}
                      placeholder="Type your response to the customer (show empathy, explain policy, offer concrete next steps)..."
                      className="flex-1 bg-[#0B1630] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 shadow-inner"
                      disabled={loading || evaluating || activeSession.status === 'evaluated'}
                    />
                    <button
                      type="submit"
                      disabled={loading || evaluating || !employeeInput.trim() || activeSession.status === 'evaluated'}
                      className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white shadow-lg shadow-emerald-500/20"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>

              </div>
            ) : (
              <div className="glass-panel rounded-2xl border border-white/10 p-12 text-center h-[550px] flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Ready to Practice with AI Customer Simulator?</h3>
                <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
                  Choose a scenario on the left to start a realistic practice conversation. The AI simulates angry, impatient, or confused customer behaviors so you can refine policy adherence and empathy before taking live tickets.
                </p>
                {scenarios.length > 0 && (
                  <button
                    onClick={() => handleStartSession(scenarios[0])}
                    className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    <span>Start: {scenarios[0].title}</span>
                  </button>
                )}
              </div>
            )}

            {/* EVALUATION RESULT CARD POPUP IF EVALUATED */}
            {activeSession?.evaluation && (
              <div className="glass-panel rounded-2xl p-6 border border-emerald-500/40 shadow-2xl animate-in fade-in duration-300 space-y-5">
                <div className="flex items-start justify-between pb-4 border-b border-white/10">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">AI Evaluation Report</span>
                      <span className="text-[10px] bg-emerald-500/20 text-[#00E5B0] px-2 py-0.5 rounded font-bold">
                        Simulation Completed
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white mt-1">Rubric Performance Assessment</h3>
                    <p className="text-xs text-slate-400">{activeSession.scenarioTitle}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-4xl font-extrabold text-[#00E5B0]">
                      {activeSession.evaluation.overallScore}%
                    </span>
                    <p className="text-[10px] text-slate-400">Overall Score</p>
                  </div>
                </div>

                {/* 5-Dimension Sub-scores */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
                  <div className="p-3 rounded-xl bg-[#0B1630] border border-white/5">
                    <span className="text-[10px] text-slate-400">Communication</span>
                    <p className="text-lg font-bold text-white mt-1">{activeSession.evaluation.communication}%</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0B1630] border border-white/5">
                    <span className="text-[10px] text-slate-400">Empathy</span>
                    <p className="text-lg font-bold text-[#00E5B0] mt-1">{activeSession.evaluation.empathy}%</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0B1630] border border-white/5">
                    <span className="text-[10px] text-slate-400">Policy Adherence</span>
                    <p className="text-lg font-bold text-[#00D4FF] mt-1">{activeSession.evaluation.policyAdherence}%</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0B1630] border border-white/5">
                    <span className="text-[10px] text-slate-400">Problem Solving</span>
                    <p className="text-lg font-bold text-purple-300 mt-1">{activeSession.evaluation.problemSolving}%</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0B1630] border border-white/5">
                    <span className="text-[10px] text-slate-400">Professionalism</span>
                    <p className="text-lg font-bold text-indigo-300 mt-1">{activeSession.evaluation.professionalism}%</p>
                  </div>
                </div>

                {/* Summary Feedback */}
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                  <span className="font-bold text-emerald-200">AI Quality Coach Assessment:</span>
                  <p className="text-slate-200 mt-1 leading-relaxed">{activeSession.evaluation.summaryFeedback}</p>
                </div>

                {/* Strengths & Improvements */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-[#0B1630] border border-white/5">
                    <span className="font-bold text-[#00E5B0] flex items-center gap-1.5 mb-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Key Strengths Demonstrated
                    </span>
                    <ul className="space-y-1.5 text-slate-300">
                      {activeSession.evaluation.strengths.map((str, idx) => (
                        <li key={idx}>· {str}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0B1630] border border-white/5">
                    <span className="font-bold text-amber-300 flex items-center gap-1.5 mb-2">
                      <AlertCircle className="w-4 h-4" />
                      Coaching Recommendation
                    </span>
                    <ul className="space-y-1.5 text-slate-300">
                      {activeSession.evaluation.areasForImprovement.map((area, idx) => (
                        <li key={idx}>· {area}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200">
                  <strong>Practical Tip for Live Tickets: </strong>
                  <span>{activeSession.evaluation.coachingTip}</span>
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* TAB 2: MY COMPETENCY DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass-panel rounded-2xl p-4 border border-white/10">
              <span className="text-[11px] text-slate-400">Total Simulations Practiced</span>
              <p className="text-2xl font-bold text-white mt-1">18 sessions</p>
            </div>
            <div className="glass-panel rounded-2xl p-4 border border-white/10">
              <span className="text-[11px] text-slate-400">Overall Average Score</span>
              <p className="text-2xl font-bold text-[#00E5B0] mt-1">94.5%</p>
            </div>
            <div className="glass-panel rounded-2xl p-4 border border-white/10">
              <span className="text-[11px] text-slate-400">Policy Adherence Index</span>
              <p className="text-2xl font-bold text-[#00D4FF] mt-1">98%</p>
            </div>
            <div className="glass-panel rounded-2xl p-4 border border-white/10">
              <span className="text-[11px] text-slate-400">Customer Empathy Index</span>
              <p className="text-2xl font-bold text-purple-300 mt-1">95%</p>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-white/10">
            <h3 className="text-sm font-bold text-white mb-2">My Skill Growth Radar</h3>
            <p className="text-xs text-slate-400 mb-6">Continuous measurement across simulated customer interactions</p>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Communication (Clarity, Tone, Structure)</span>
                  <span className="font-bold text-white">96%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[96%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Customer Empathy (Validation, Active Listening)</span>
                  <span className="font-bold text-white">95%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-[#00E5B0] w-[95%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Policy Compliance (Zero-Invention Guarantee)</span>
                  <span className="font-bold text-white">98%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-[#00D4FF] w-[98%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Problem Solving (Next-Steps, Actionability)</span>
                  <span className="font-bold text-white">92%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-400 w-[92%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PAST ASSESSMENTS */}
      {activeTab === 'assessments' && (
        <div className="space-y-4">
          <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0B1630] text-slate-400 uppercase text-[10px] font-bold border-b border-white/10">
                <tr>
                  <th className="p-3.5">Scenario Title</th>
                  <th className="p-3.5">Date Practiced</th>
                  <th className="p-3.5">Overall Rubric</th>
                  <th className="p-3.5">Empathy</th>
                  <th className="p-3.5">Policy Score</th>
                  <th className="p-3.5">Coach Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {pastSessions.map(sess => (
                  <tr key={sess.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3.5 font-bold text-white">{sess.scenarioTitle}</td>
                    <td className="p-3.5 text-slate-400">{new Date(sess.startedAt).toLocaleDateString()}</td>
                    <td className="p-3.5 font-extrabold text-[#00E5B0] text-sm">{sess.evaluation?.overallScore}%</td>
                    <td className="p-3.5 text-slate-300">{sess.evaluation?.empathy}%</td>
                    <td className="p-3.5 text-slate-300">{sess.evaluation?.policyAdherence}%</td>
                    <td className="p-3.5 text-slate-400 max-w-xs truncate">{sess.evaluation?.summaryFeedback}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
