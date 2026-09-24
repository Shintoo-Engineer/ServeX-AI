import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Sparkles,
  Users,
  Award,
  BookOpen,
  Plus,
  Play,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  TrendingUp,
  BarChart2,
  ChevronRight,
  Shield,
  Layers,
  Clock
} from 'lucide-react';
import { api } from '../services/api.ts';
import { TrainingScenario, TrainingSession, User } from '../types/index.ts';

interface TrainerPortalProps {
  onLaunchSimulationForScenario?: (scenarioId: string) => void;
}

export const TrainerPortal: React.FC<TrainerPortalProps> = ({ onLaunchSimulationForScenario }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'scenarios' | 'assessments' | 'employees'>('dashboard');
  const [scenarios, setScenarios] = useState<TrainingScenario[]>([]);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [selectedSession, setSelectedSession] = useState<TrainingSession | null>(null);

  // New Scenario Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Refund & Defect Handling');
  const [newDifficulty, setNewDifficulty] = useState<'easy' | 'medium' | 'hard' | 'expert'>('medium');
  const [newPersonality, setNewPersonality] = useState<'angry' | 'confused' | 'impatient' | 'polite' | 'skeptical'>('angry');
  const [newProblem, setNewProblem] = useState('');
  const [newOpeningMsg, setNewOpeningMsg] = useState('');
  const [newResolution, setNewResolution] = useState('');
  const [newPolicy, setNewPolicy] = useState('ServeX Standard Refund Policy v3.2');
  const [newCriteria, setNewCriteria] = useState('Empathetic greeting\nAdherence to 30-day window\nExplaining 5-7 business day credit timing');

  useEffect(() => {
    loadTrainerData();
  }, []);

  const loadTrainerData = async () => {
    try {
      const [scenRes, sessRes, userRes] = await Promise.all([
        api.getScenarios(),
        api.getTrainingSessions(),
        api.getUsers(),
      ]);
      setScenarios(scenRes.scenarios);
      setSessions(sessRes.sessions);
      setEmployees(userRes.users.filter(u => u.role === 'employee'));
      if (sessRes.sessions.length > 0 && !selectedSession) {
        setSelectedSession(sessRes.sessions[0]);
      }
    } catch (e) {
      console.error('Error loading trainer data:', e);
    }
  };

  const handleCreateScenario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newProblem || !newOpeningMsg) return;

    try {
      await api.createScenario({
        title: newTitle,
        category: newCategory,
        difficulty: newDifficulty,
        customerPersonality: newPersonality,
        customerProblem: newProblem,
        customerOpeningMessage: newOpeningMsg,
        expectedResolution: newResolution,
        applicablePolicy: newPolicy,
        evaluationCriteria: newCriteria.split('\n').filter(Boolean),
      });

      setShowCreateModal(false);
      setNewTitle('');
      setNewProblem('');
      setNewOpeningMsg('');
      setNewResolution('');
      await loadTrainerData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Quality & Enablement Hub</span>
            <span className="text-[10px] text-[#00E5B0] bg-[#00E5B0]/10 border border-[#00E5B0]/30 px-2 py-0.5 rounded">
              AI Simulation Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Support Workforce Coaching & Evaluation
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Train support agents against realistic AI personas · Standardized 5-dimension rubric scoring
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-500/20 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Scenario</span>
          </button>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-6 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
            activeTab === 'dashboard' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Coaching Overview
        </button>
        <button
          onClick={() => setActiveTab('scenarios')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
            activeTab === 'scenarios' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Simulation Scenarios ({scenarios.length})
        </button>
        <button
          onClick={() => setActiveTab('assessments')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
            activeTab === 'assessments' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Completed Evaluations ({sessions.length})
        </button>
        <button
          onClick={() => setActiveTab('employees')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
            activeTab === 'employees' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Employee Competency Roster ({employees.length})
        </button>
      </div>

      {/* TAB 1: COACHING OVERVIEW */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          
          {/* Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="glass-panel rounded-2xl p-4 border border-white/10">
              <span className="text-[11px] font-semibold text-slate-400">Total Enrolled Agents</span>
              <p className="text-2xl font-extrabold text-white mt-1">42</p>
              <span className="text-[10px] text-[#00E5B0] font-semibold">38 active this week</span>
            </div>
            <div className="glass-panel rounded-2xl p-4 border border-white/10">
              <span className="text-[11px] font-semibold text-slate-400">Average Rubric Score</span>
              <p className="text-2xl font-extrabold text-purple-400 mt-1">91.4%</p>
              <span className="text-[10px] text-[#00E5B0] font-semibold">+4.2% since onboarding</span>
            </div>
            <div className="glass-panel rounded-2xl p-4 border border-white/10">
              <span className="text-[11px] font-semibold text-slate-400">Completed Simulations</span>
              <p className="text-2xl font-extrabold text-[#00D4FF] mt-1">342</p>
              <span className="text-[10px] text-slate-400 font-semibold">Across 4 difficulty tiers</span>
            </div>
            <div className="glass-panel rounded-2xl p-4 border border-white/10">
              <span className="text-[11px] font-semibold text-slate-400">Needs Coaching Review</span>
              <p className="text-2xl font-extrabold text-amber-400 mt-1">3</p>
              <span className="text-[10px] text-slate-400 font-semibold">Scores below 80%</span>
            </div>
          </div>

          {/* 5-Dimension Competency Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="glass-panel rounded-2xl p-6 border border-white/10">
              <h3 className="text-sm font-bold text-white mb-1">Workforce Skill Radar Breakdown</h3>
              <p className="text-xs text-slate-400 mb-6">Aggregated performance across AI rubric evaluation dimensions</p>

              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span className="font-semibold text-white">1. Communication & Clarity</span>
                    <span className="font-bold text-purple-300">93%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 w-[93%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span className="font-semibold text-white">2. Customer Empathy & Emotional Validation</span>
                    <span className="font-bold text-[#00E5B0]">89%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 w-[89%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span className="font-semibold text-white">3. Policy Adherence & Grounding</span>
                    <span className="font-bold text-[#00D4FF]">95%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 w-[95%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span className="font-semibold text-white">4. Problem Solving & Next-Step Clarity</span>
                    <span className="font-bold text-amber-300">91%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-500 to-orange-400 w-[91%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span className="font-semibold text-white">5. Composure & Professionalism</span>
                    <span className="font-bold text-indigo-300">94%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 w-[94%]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Top Performers Table */}
            <div className="glass-panel rounded-2xl p-6 border border-white/10">
              <h3 className="text-sm font-bold text-white mb-1">Top Performing Support Agents</h3>
              <p className="text-xs text-slate-400 mb-4">Highest rubric scores across recent customer simulations</p>

              <div className="space-y-3">
                {[
                  { name: 'Elena Rostova', dept: 'Tier-1 Support', score: 95, sessions: 18 },
                  { name: 'James Chen', dept: 'Tier-2 Technical', score: 94, sessions: 15 },
                  { name: 'Aisha Al-Mansoor', dept: 'VIP Concierge', score: 92, sessions: 21 },
                  { name: 'Liam O’Connor', dept: 'Logistics Handoff', score: 91, sessions: 14 },
                ].map((emp, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#0B1630] border border-white/5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-white text-[11px]">
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-bold text-white">{emp.name}</span>
                        <p className="text-[10px] text-slate-400">{emp.dept} · {emp.sessions} practiced</p>
                      </div>
                    </div>
                    <span className="font-extrabold text-base text-[#00E5B0] bg-emerald-500/10 px-2 py-0.5 rounded">
                      {emp.score}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: SCENARIOS CATALOG */}
      {activeTab === 'scenarios' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scenarios.map(scen => (
              <div key={scen.id} className="glass-panel rounded-2xl p-5 border border-white/10 flex flex-col justify-between hover:border-purple-500/40 transition-all">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      scen.difficulty === 'hard' || scen.difficulty === 'expert'
                        ? 'bg-red-500/20 text-red-400'
                        : scen.difficulty === 'medium'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {scen.difficulty}
                    </span>
                    <span className="text-[10px] text-slate-400 capitalize">
                      Customer Tone: <strong className="text-white">{scen.customerPersonality}</strong>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-1.5">{scen.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4 line-clamp-3">
                    {scen.customerProblem}
                  </p>

                  <div className="p-2.5 rounded-xl bg-[#0B1630] border border-white/5 text-[11px] text-slate-400 mb-4">
                    <strong className="text-slate-200">Customer Opening: </strong>
                    <span className="italic">"{scen.customerOpeningMessage}"</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Practiced: <strong className="text-white">{scen.timesPracticed}x</strong></span>
                  <span className="text-purple-300 font-bold">Avg Score: {scen.avgScore}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ASSESSMENTS REVIEW */}
      {activeTab === 'assessments' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* List of Sessions */}
          <div className="md:col-span-5 glass-panel rounded-2xl border border-white/10 p-3 space-y-2">
            <div className="p-2 border-b border-white/10 flex justify-between items-center text-xs">
              <span className="font-bold text-white">Evaluated Sessions</span>
              <span className="text-slate-400">{sessions.length} records</span>
            </div>

            <div className="max-h-[600px] overflow-y-auto space-y-2">
              {sessions.map(sess => (
                <div
                  key={sess.id}
                  onClick={() => setSelectedSession(sess)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedSession?.id === sess.id
                      ? 'bg-purple-900/30 border-purple-500 shadow-md'
                      : 'bg-[#0B1630] border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-white">{sess.employeeName}</span>
                    <span className="font-extrabold text-sm text-[#00E5B0]">
                      {sess.evaluation?.overallScore || 0}%
                    </span>
                  </div>
                  <p className="text-[11px] text-purple-300 mb-1">{sess.scenarioTitle}</p>
                  <span className="text-[10px] text-slate-500">
                    {new Date(sess.startedAt).toLocaleDateString()} · {sess.messages.length} exchanges
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Session Detail & Rubric */}
          <div className="md:col-span-7 glass-panel rounded-2xl border border-white/10 p-6">
            {selectedSession?.evaluation ? (
              <div className="space-y-6">
                
                {/* Header */}
                <div className="flex items-start justify-between pb-4 border-b border-white/10">
                  <div>
                    <div className="text-xs text-purple-400 font-bold uppercase">Assessment Report</div>
                    <h3 className="text-lg font-bold text-white mt-0.5">{selectedSession.employeeName}</h3>
                    <p className="text-xs text-slate-400">{selectedSession.scenarioTitle}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-extrabold text-[#00E5B0]">
                      {selectedSession.evaluation.overallScore}%
                    </span>
                    <p className="text-[10px] text-slate-400">Weighted Rubric Score</p>
                  </div>
                </div>

                {/* Rubric Breakdown Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-[#0B1630] border border-white/5">
                    <span className="text-[10px] text-slate-400">Communication</span>
                    <p className="text-base font-bold text-white mt-0.5">{selectedSession.evaluation.communication}%</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#0B1630] border border-white/5">
                    <span className="text-[10px] text-slate-400">Empathy</span>
                    <p className="text-base font-bold text-[#00E5B0] mt-0.5">{selectedSession.evaluation.empathy}%</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#0B1630] border border-white/5">
                    <span className="text-[10px] text-slate-400">Policy Adherence</span>
                    <p className="text-base font-bold text-[#00D4FF] mt-0.5">{selectedSession.evaluation.policyAdherence}%</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#0B1630] border border-white/5">
                    <span className="text-[10px] text-slate-400">Problem Solving</span>
                    <p className="text-base font-bold text-purple-300 mt-0.5">{selectedSession.evaluation.problemSolving}%</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#0B1630] border border-white/5">
                    <span className="text-[10px] text-slate-400">Professionalism</span>
                    <p className="text-base font-bold text-indigo-300 mt-0.5">{selectedSession.evaluation.professionalism}%</p>
                  </div>
                </div>

                {/* AI Summary Feedback */}
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs">
                  <span className="font-bold text-purple-200">Coach Feedback Summary:</span>
                  <p className="text-slate-200 mt-1 leading-relaxed">{selectedSession.evaluation.summaryFeedback}</p>
                </div>

                {/* Strengths & Improvement */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-[#0B1630] border border-white/5">
                    <span className="font-bold text-[#00E5B0] flex items-center gap-1.5 mb-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Observed Strengths
                    </span>
                    <ul className="space-y-1.5 text-slate-300">
                      {selectedSession.evaluation.strengths.map((str, sIdx) => (
                        <li key={sIdx}>· {str}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0B1630] border border-white/5">
                    <span className="font-bold text-amber-300 flex items-center gap-1.5 mb-2">
                      <AlertCircle className="w-4 h-4" />
                      Growth Opportunity
                    </span>
                    <ul className="space-y-1.5 text-slate-300">
                      {selectedSession.evaluation.areasForImprovement.map((area, aIdx) => (
                        <li key={aIdx}>· {area}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Actionable Tip */}
                <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200">
                  <strong>Trainer Action Tip: </strong>
                  <span>{selectedSession.evaluation.coachingTip}</span>
                </div>

              </div>
            ) : (
              <div className="p-12 text-center text-xs text-slate-500">
                Select an evaluated session to view full rubric score
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 4: EMPLOYEES ROSTER */}
      {activeTab === 'employees' && (
        <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#0B1630] text-slate-400 uppercase text-[10px] font-bold border-b border-white/10">
              <tr>
                <th className="p-3.5">Employee Name</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Simulations Completed</th>
                <th className="p-3.5">Average Score</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {employees.map(emp => (
                <tr key={emp.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-3.5 font-bold text-white">{emp.name}</td>
                  <td className="p-3.5 font-mono text-slate-400">{emp.email}</td>
                  <td className="p-3.5 text-slate-400">{emp.department || 'Tier-1 Support'}</td>
                  <td className="p-3.5 font-bold text-white">18 sessions</td>
                  <td className="p-3.5 font-bold text-[#00E5B0]">94%</td>
                  <td className="p-3.5">
                    <span className="text-[10px] font-bold text-[#00E5B0] bg-emerald-500/10 px-2 py-0.5 rounded">
                      Qualified / Certified
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE SCENARIO MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#0B1630] border border-white/10 rounded-2xl p-6 max-w-xl w-full shadow-2xl relative">
            <h3 className="text-base font-bold text-white mb-1">Create Training Scenario</h3>
            <p className="text-xs text-slate-400 mb-4">Configure customer personality, problem, and evaluation rubric.</p>

            <form onSubmit={handleCreateScenario} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Scenario Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Expired 30-Day Return Demand"
                  required
                  className="w-full bg-[#101B35] border border-white/15 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Difficulty</label>
                  <select
                    value={newDifficulty}
                    onChange={e => setNewDifficulty(e.target.value as any)}
                    className="w-full bg-[#101B35] border border-white/15 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500"
                  >
                    <option value="easy">Easy (Polite Customer)</option>
                    <option value="medium">Medium (Impatient / Confused)</option>
                    <option value="hard">Hard (Angry / Demanding)</option>
                    <option value="expert">Expert (Legal Threat / Escalation)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Customer Personality</label>
                  <select
                    value={newPersonality}
                    onChange={e => setNewPersonality(e.target.value as any)}
                    className="w-full bg-[#101B35] border border-white/15 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500"
                  >
                    <option value="angry">Angry & Confrontational</option>
                    <option value="impatient">Impatient & In a Rush</option>
                    <option value="confused">Confused & Tech-Averse</option>
                    <option value="skeptical">Skeptical & Guarded</option>
                    <option value="polite">Polite & Cooperative</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Customer Problem Description</label>
                <textarea
                  value={newProblem}
                  onChange={e => setNewProblem(e.target.value)}
                  rows={2}
                  placeholder="Explain what happened to the customer..."
                  required
                  className="w-full bg-[#101B35] border border-white/15 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">AI Customer Opening Message</label>
                <input
                  type="text"
                  value={newOpeningMsg}
                  onChange={e => setNewOpeningMsg(e.target.value)}
                  placeholder="e.g. 'I want my money back! I bought this 45 days ago and it broke!'"
                  required
                  className="w-full bg-[#101B35] border border-white/15 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Applicable Policy Reference</label>
                <input
                  type="text"
                  value={newPolicy}
                  onChange={e => setNewPolicy(e.target.value)}
                  className="w-full bg-[#101B35] border border-white/15 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-500/20"
                >
                  Publish Scenario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
