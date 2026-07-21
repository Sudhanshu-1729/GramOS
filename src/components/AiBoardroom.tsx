import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AiAgent } from '../data/mockData';
import { Play, RotateCcw, Award, CheckCircle, FileText, Bot, ShieldCheck, ShieldAlert } from 'lucide-react';
import GlassCard from './ui/GlassCard';
import Button from './ui/Button';
import * as api from '../services/api';

interface AiBoardroomProps {
  businessId?: string;
  isBackendOnline?: boolean;
  agents: AiAgent[];
  debate: { agent: string; text: string }[];
  consensusConfidence: number;
  riskRating: string;
  status: string;
  onGenerateMemo: () => void;
  onUpdateDebateData?: (data: { agents: any[], debate: any[], consensusConfidence: number, riskRating: string, status: string }) => void;
}

export const AiBoardroom: React.FC<AiBoardroomProps> = ({
  businessId = '00000000-0000-0000-0000-000000000001',
  isBackendOnline = false,
  agents,
  debate,
  consensusConfidence,
  riskRating,
  status,
  onGenerateMemo,
  onUpdateDebateData
}) => {
  const [selectedAgent, setSelectedAgent] = useState<AiAgent>(agents[0]);
  const [debateStep, setDebateStep] = useState(0);
  const [isDebating, setIsDebating] = useState(false);
  const [activeDebateLog, setActiveDebateLog] = useState<typeof debate>([]);
  const [isLoadingDebate, setIsLoadingDebate] = useState(false);


  // Sync selected agent when the profile changes
  useEffect(() => {
    if (agents && agents.length > 0) {
      setSelectedAgent(agents[0]);
    }
    setDebateStep(0);
    setActiveDebateLog([]);
    setIsDebating(false);
  }, [agents, debate]);

  // Simulation effect for debate steps
  useEffect(() => {
    let interval: any;
    if (isDebating && debateStep < debate.length) {
      interval = setTimeout(() => {
        const nextStep = debateStep + 1;
        setDebateStep(nextStep);
        setActiveDebateLog(debate.slice(0, nextStep));
        
        // Auto-select agent currently speaking
        const currentSpeakerId = debate[debateStep].agent;
        const matchingAgent = agents.find(a => a.id === currentSpeakerId);
        if (matchingAgent) {
          setSelectedAgent(matchingAgent);
        }
      }, 2000);
    } else if (debateStep >= debate.length) {
      setIsDebating(false);
    }
    return () => clearTimeout(interval);
  }, [isDebating, debateStep, debate, agents]);

  const startDebate = async () => {
    setDebateStep(0);
    setActiveDebateLog([]);
    
    if (isBackendOnline && onUpdateDebateData) {
      setIsLoadingDebate(true);
      try {
        const response = await api.runBoardroomEvaluation(businessId, 500000, 24);
        if (response) {
          const backendOpinions = response.agent_opinions.map((o: any) => {
            const avatarMap: Record<string, string> = {
              'Chief Financial Officer (CFO)': '💼',
              'Credit Officer': '📊',
              'Climate & Climate-Risk Analyst': '🌦️',
              'Risk Analyst': '🛡️',
              'Fraud Investigator': '🔍',
              'Market Analyst': '📈',
              'Scheme Advisor': '🏛️',
              'Financial Planner': '🎯',
              'Doc Verification': '📄',
              'Growth Advisor': '🚀'
            };
            const idMap: Record<string, string> = {
              'Chief Financial Officer (CFO)': 'cfo',
              'Credit Officer': 'credit',
              'Climate & Climate-Risk Analyst': 'climate',
              'Risk Analyst': 'risk',
              'Fraud Investigator': 'fraud',
              'Market Analyst': 'market',
              'Scheme Advisor': 'scheme',
              'Financial Planner': 'planner',
              'Doc Verification': 'doc',
              'Growth Advisor': 'growth'
            };
            const roleMap: Record<string, string> = {
              'Chief Financial Officer (CFO)': 'Financial Analysis',
              'Credit Officer': 'Credit Risk Scoring',
              'Climate & Climate-Risk Analyst': 'Environmental Risk',
              'Risk Analyst': 'Operational Risk & KYC',
              'Fraud Investigator': 'Authenticity Check',
              'Market Analyst': 'Commodity Prices',
              'Scheme Advisor': 'Government Subsidies',
              'Financial Planner': 'Personal Wealth & Goals',
              'Doc Verification': 'OCR Document Agent',
              'Growth Advisor': 'Business Expansion'
            };

            return {
              id: idMap[o.agent] || o.agent.toLowerCase().split(' ')[0],
              name: o.agent,
              role: roleMap[o.agent] || o.agent,
              avatar: avatarMap[o.agent] || '🤖',
              status: o.decision.toLowerCase() === 'approve' ? 'approved' : o.decision.toLowerCase() === 'reject' ? 'escalated' : 'ready',
              confidence: o.metrics_evaluated?.confidence_level || 90,
              reasoning: o.reasoning,
              evidence: Object.entries(o.metrics_evaluated || {}).map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`).join(', '),
              recommendation: `Status: ${o.decision}`
            };
          });

          const idMap: Record<string, string> = {
            'Chief Financial Officer (CFO)': 'cfo',
            'Credit Officer': 'credit',
            'Climate & Climate-Risk Analyst': 'climate',
            'Risk Analyst': 'risk',
            'Fraud Investigator': 'fraud',
            'Market Analyst': 'market',
            'Scheme Advisor': 'scheme',
            'Financial Planner': 'planner',
            'Doc Verification': 'doc',
            'Growth Advisor': 'growth'
          };
          const backendDebate = response.agent_opinions.map((o: any) => ({
            agent: idMap[o.agent] || o.agent.toLowerCase().split(' ')[0],
            text: o.reasoning
          }));

          onUpdateDebateData({
            agents: backendOpinions,
            debate: backendDebate,
            consensusConfidence: Math.round(backendOpinions.reduce((acc: number, a: any) => acc + a.confidence, 0) / backendOpinions.length),
            riskRating: response.final_decision === 'REJECT' ? 'High Risk' : 'Low-Medium Risk',
            status: response.final_decision === 'APPROVE' ? 'Consensus Approved' : response.final_decision === 'REFER' ? 'Refer to Human Auditor' : 'Consensus Rejected'
          });
        }
      } catch (err) {
        console.warn("Failed to run boardroom debate on backend:", err);
      } finally {
        setIsLoadingDebate(false);
      }
    }
    
    setIsDebating(true);
  };

  const skipDebate = () => {
    setIsDebating(false);
    setDebateStep(debate.length);
    setActiveDebateLog(debate);
    setSelectedAgent(agents.find(a => a.id === 'credit') || agents[0]);
  };

  const isApproved = status.toLowerCase().includes('approved');

  return (
    <div className="w-full space-y-6">
      {/* Boardroom Header */}
      <GlassCard className="p-6 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-white/[0.05]" intensity="high">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400">
              <Bot size={28} className="animate-pulse" />
            </div>
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                Multi-Agent AI Boardroom
                <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">10 Active Agents</span>
              </h2>
              <p className="text-sm text-zinc-400">Collaborative credit appraisal for agricultural expansions</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isDebating && debateStep < debate.length ? (
              <Button onClick={startDebate} variant="primary" className="gap-2" disabled={isLoadingDebate}>
                <Play size={16} className={isLoadingDebate ? "animate-spin" : ""} />
                {isLoadingDebate ? "Running LangGraph Debate..." : "Play Debate Simulation"}
              </Button>
            ) : isDebating ? (
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs text-emerald-400 font-mono mr-2">Debating (Step {debateStep}/{debate.length})</span>
                <Button onClick={skipDebate} variant="ghost" size="sm">
                  Skip to Consensus
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button onClick={startDebate} variant="outline" size="sm" className="gap-1">
                  <RotateCcw size={14} /> Replay
                </Button>
                <Button onClick={onGenerateMemo} variant="primary" className="gap-2 shadow-lg shadow-emerald-500/10">
                  <FileText size={16} /> Generate Credit Memo
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Consensus Gauge */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t border-white/5">
          <div className="flex flex-col justify-between p-4 bg-zinc-900/40 rounded-xl border border-white/5">
            <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Consensus Status</div>
            <div className={`text-xl font-bold flex items-center gap-2 mt-2 ${
              isApproved ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {isApproved ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
              {status}
            </div>
            <div className="text-xs text-zinc-400 mt-1">Consensus dynamically calibrated.</div>
          </div>

          <div className="flex flex-col justify-between p-4 bg-zinc-900/40 rounded-xl border border-white/5">
            <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Board Agreement Strength</div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold font-mono text-zinc-100">{consensusConfidence}%</span>
              <span className="text-xs text-zinc-400">Confidence Match</span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-2">
              <div className={`h-full ${
                isApproved ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-red-500 to-orange-400'
              }`} style={{ width: `${consensusConfidence}%` }} />
            </div>
          </div>

          <div className="flex flex-col justify-between p-4 bg-zinc-900/40 rounded-xl border border-white/5">
            <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Appraisal Risk Class</div>
            <div className={`text-xl font-bold mt-2 ${
              isApproved ? 'text-zinc-200' : 'text-red-400'
            }`}>{riskRating}</div>
            <div className="text-xs text-zinc-400 mt-1">Includes remote sensing and NDVI filters.</div>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Board Members list */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Select board member</h3>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 max-h-[500px] overflow-y-auto pr-1">
            {agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent)}
                className={`
                  flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200
                  ${selectedAgent.id === agent.id
                    ? 'bg-emerald-500/10 border-emerald-500/30 shadow-glass-sm'
                    : 'bg-zinc-950/20 hover:bg-zinc-900/40 border-white/5'
                  }
                `}
              >
                <div className="text-2xl bg-zinc-900 dark:bg-zinc-800 p-2 rounded-xl border border-white/5">
                  {agent.avatar}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold truncate text-zinc-200">{agent.name}</div>
                  <div className="text-[10px] text-zinc-500 truncate">{agent.role}</div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-mono font-bold text-emerald-400">{agent.confidence}%</span>
                  <span className={`w-1.5 h-1.5 rounded-full mt-1 ${
                    agent.status === 'approved' ? 'bg-emerald-500' : 
                    agent.status === 'escalated' ? 'bg-red-500' : 'bg-amber-500'
                  }`} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Agent Insights */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedAgent.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <GlassCard className="p-6 relative overflow-hidden" intensity="normal">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full" />

                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl bg-zinc-900/60 p-3 rounded-2xl border border-white/5 shadow-inner">
                      {selectedAgent.avatar}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-zinc-100">{selectedAgent.name}</h3>
                      <p className="text-xs text-zinc-400">{selectedAgent.role}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Agent Confidence</div>
                    <div className="text-3xl font-extrabold font-mono text-emerald-400">{selectedAgent.confidence}%</div>
                  </div>
                </div>

                <div className="mt-6 space-y-5">
                  <div>
                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Reasoning Protocol</h4>
                    <p className="text-sm text-zinc-300 bg-zinc-950/40 p-4 rounded-xl border border-white/5 leading-relaxed">
                      {selectedAgent.reasoning}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Empirical Evidence</h4>
                      <div className="text-xs text-zinc-400 bg-zinc-950/20 p-3 rounded-lg border border-white/[0.03] min-h-[60px] flex items-center gap-2">
                        <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                        <span>{selectedAgent.evidence}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Agent Recommendation</h4>
                      <div className="text-xs text-zinc-200 bg-emerald-500/5 p-3 rounded-lg border border-emerald-500/10 min-h-[60px] flex items-center gap-2">
                        <Award size={14} className="text-emerald-400 shrink-0" />
                        <span>{selectedAgent.recommendation}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </AnimatePresence>

          {/* Dialogue timeline */}
          <GlassCard className="p-6" intensity="normal">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-4">Boardroom Dialogue Feed</h3>
            
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
              {activeDebateLog.map((log, index) => {
                const speaker = agents.find(a => a.id === log.agent);
                if (!speaker) return null;
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-3 items-start text-xs bg-zinc-950/20 p-3 rounded-xl border border-white/[0.02]"
                  >
                    <span className="text-lg p-1.5 bg-zinc-900 rounded-lg border border-white/5 leading-none">{speaker.avatar}</span>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-300">{speaker.name}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">({speaker.role})</span>
                      </div>
                      <p className="text-zinc-400 leading-relaxed">{log.text}</p>
                    </div>
                  </motion.div>
                );
              })}

              {activeDebateLog.length === 0 && !isDebating && (
                <div className="py-8 text-center text-zinc-500 italic">
                  Start the simulation to watch the 10 AI agents review, debate, and consensus-score this credit application.
                </div>
              )}

              {isDebating && (
                <div className="flex gap-2 items-center text-xs text-emerald-400 italic bg-emerald-950/10 p-3 rounded-xl border border-emerald-950/30">
                  <span className="flex h-1.5 w-1.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  <span>AI Boardroom debate in progress... evaluating credit logs...</span>
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
export default AiBoardroom;
