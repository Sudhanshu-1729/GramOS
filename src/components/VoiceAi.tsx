import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Send, Sparkles, X, ChevronRight, CornerDownRight } from 'lucide-react';
import GlassCard from './ui/GlassCard';
import * as api from '../services/api';

interface VoiceAiProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab?: (tabName: string) => void;
  businessId?: string;
  isBackendOnline?: boolean;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  reasoning?: string;
  action?: string;
}

export const VoiceAi: React.FC<VoiceAiProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
  businessId = '00000000-0000-0000-0000-000000000001',
  isBackendOnline = false
}) => {
  const [isListening, setIsListening] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Namaste! I am your RuralOS Multilingual Voice AI Copilot. Ask me about government subventions, risk stress tests, or your digital twin in Hindi or English.',
    }
  ]);

  // Simulated AI response function
  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInputVal('');

    if (isBackendOnline) {
      try {
        const response = await api.queryVoiceAssistant(businessId, text, 'hi');
        if (response) {
          let aiAction = "Multilingual voice parsing executed.";
          const query = text.toLowerCase();
          if (query.includes('scheme') || query.includes('subsidy')) {
            aiAction = "Opened Government Schemes Explorer.";
            if (onNavigateToTab) onNavigateToTab('schemes');
          } else if (query.includes('twin') || query.includes('business')) {
            aiAction = "Activated Digital Business Twin Visualizer.";
            if (onNavigateToTab) onNavigateToTab('twin');
          } else if (query.includes('simulator') || query.includes('what-if') || query.includes('monsoon')) {
            aiAction = "Opened What-If Simulator Panel.";
            if (onNavigateToTab) onNavigateToTab('simulator');
          }

          setMessages(prev => [...prev, {
            role: 'assistant',
            content: response.agent_text_response,
            reasoning: `Multilingual voice audio processed. original_transcript: "${response.original_transcript || text}"`,
            action: aiAction
          }]);
          return;
        }
      } catch (err) {
        console.warn("Backend voice service failed, falling back to local simulation.", err);
      }
    }

    // Generate responsive replies based on text (Local Fallback)
    setTimeout(() => {
      let aiContent = "";
      let aiReasoning = "";
      let aiAction = "";

      const query = text.toLowerCase();
      if (query.includes('scheme') || query.includes('subsidy')) {
        aiContent = "You qualify for the Animal Husbandry Infrastructure Development Fund (AHIDF) which reduces your term loan net rate to 8.5% p.a. through a 3% subvention. I can launch your application matches now.";
        aiReasoning = "Parsed government subsidy databases against Ramesh's asset registry. AHIDF criteria aligns with private individual dairy processor category.";
        aiAction = "Opened Government Schemes Explorer.";
        if (onNavigateToTab) onNavigateToTab('schemes');
      } else if (query.includes('twin') || query.includes('business')) {
        aiContent = "I have fetched your Digital Business Twin. Your dairy infrastructure is currently valued at ₹24.5L with a 1.82x DSCR buffer. The main risk vector is monsoon deficit which could push green fodder costs up by 15%.";
        aiReasoning = "Checked database nodes. Gokul coop payouts are active, verifying revenue streams. Satellite NDVI greenness profiles indicate minor moisture stress.";
        aiAction = "Activated Digital Business Twin Visualizer.";
        if (onNavigateToTab) onNavigateToTab('twin');
      } else if (query.includes('simulator') || query.includes('what-if') || query.includes('monsoon')) {
        aiContent = "Let's open the What-If Simulator. If Pune experiences a 20% rainfall deficit, your fodder expense will increase by ₹12,000/mo, adjusting your credit score down to 735. However, the Gokul contract remains a solid cash buffer.";
        aiReasoning = "Running Monte Carlo profit sensitivity against weather delta. Fodder yield declines, triggering supplementary concentrate feed buys.";
        aiAction = "Opened What-If Simulator Panel.";
        if (onNavigateToTab) onNavigateToTab('simulator');
      } else {
        aiContent = "Based on your alternate ledger deposits of ₹1.8L/mo, you are in a prime position to expand. Your loan readiness score is 92%. I recommend submitting the term loan application to Bank of India.";
        aiReasoning = "Aggregated ledger milk payouts and cross-referenced SBI and Bank of India agri-credit thresholds.";
        aiAction = "Loaded Credit Scoring Insights.";
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: aiContent,
        reasoning: aiReasoning,
        action: aiAction
      }]);
    }, 1500);
  };

  // Toggle voice recording simulations
  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      // Simulate recognized text input
      setTimeout(() => {
        handleSendMessage("Show me my business twin and evaluate climate risks");
      }, 500);
    } else {
      setIsListening(true);
    }
  };

  // Preset prompts
  const presets = [
    "Check government scheme eligibility",
    "Run monsoon deficit scenario",
    "Open dairy farm digital twin"
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-2xl"
        >
          <GlassCard className="h-[550px] flex flex-col justify-between border-white/10 overflow-hidden" intensity="high">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-zinc-950/20">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-emerald-400 animate-pulse" />
                <span className="text-sm font-bold text-zinc-100 uppercase tracking-wider">Voice AI Copilot</span>
              </div>
              <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 hover:bg-white/5 rounded-lg">
                <X size={16} />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((msg, index) => (
                <div key={index} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  {/* Chat bubble */}
                  <div className={`
                    max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed
                    ${msg.role === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-none shadow-md'
                      : 'bg-zinc-900/60 border border-white/5 text-zinc-200 rounded-bl-none shadow-sm'
                    }
                  `}>
                    {msg.content}
                  </div>

                  {/* AI Reasoning and Actions */}
                  {msg.role === 'assistant' && (msg.reasoning || msg.action) && (
                    <div className="mt-2 ml-2 pl-4 border-l border-emerald-500/30 space-y-1.5 max-w-[80%]">
                      {msg.reasoning && (
                        <div className="text-[10px] text-zinc-500 flex items-start gap-1">
                          <span className="font-mono text-emerald-400">AI Reasoning:</span>
                          <span className="leading-normal">{msg.reasoning}</span>
                        </div>
                      )}
                      {msg.action && (
                        <div className="text-[10px] text-emerald-400 flex items-center gap-1.5">
                          <CornerDownRight size={10} />
                          <span className="font-bold">System Action:</span>
                          <span>{msg.action}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Simulated Animated Waveform overlay during listening */}
            {isListening && (
              <div className="py-4 bg-zinc-900/10 border-t border-emerald-500/10 flex flex-col items-center justify-center space-y-3">
                <div className="flex items-center justify-center gap-1.5 h-10">
                  <div className="w-1.5 bg-emerald-500 rounded-full animate-wave h-4" style={{ animationDelay: '0.1s' }} />
                  <div className="w-1.5 bg-emerald-500 rounded-full animate-wave h-8" style={{ animationDelay: '0.3s' }} />
                  <div className="w-1.5 bg-emerald-400 rounded-full animate-wave h-10" style={{ animationDelay: '0.5s' }} />
                  <div className="w-1.5 bg-emerald-500 rounded-full animate-wave h-7" style={{ animationDelay: '0.2s' }} />
                  <div className="w-1.5 bg-emerald-500 rounded-full animate-wave h-3" style={{ animationDelay: '0.4s' }} />
                </div>
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest animate-pulse">Listening for voice triggers...</span>
              </div>
            )}

            {/* Presets and Controls */}
            <div className="p-6 border-t border-white/5 bg-zinc-950/40 space-y-4">
              {/* Presets */}
              <div className="flex flex-wrap gap-2">
                {presets.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => handleSendMessage(preset)}
                    className="text-[10px] font-medium px-2.5 py-1.5 rounded-lg bg-zinc-900/60 hover:bg-zinc-800/80 border border-white/5 text-zinc-400 hover:text-zinc-200 transition-colors"
                  >
                    {preset}
                  </button>
                ))}
              </div>

              {/* Text / Voice Inputs */}
              <div className="flex items-center gap-3">
                {/* Voice button */}
                <button
                  onClick={toggleListening}
                  className={`
                    p-3 rounded-xl border transition-all duration-300 text-white
                    ${isListening
                      ? 'bg-red-500 border-red-400 shadow-lg shadow-red-500/20'
                      : 'bg-emerald-600 hover:bg-emerald-500 border-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/10'
                    }
                  `}
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>

                {/* Form Input */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage(inputVal);
                  }}
                  className="flex-1 flex gap-2"
                >
                  <input
                    type="text"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    placeholder="Type a command or tap mic to talk..."
                    className="flex-1 bg-zinc-900 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500/30"
                  />
                  <button
                    type="submit"
                    className="p-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-xl border border-white/5 transition-colors"
                  >
                    <Send size={14} />
                  </button>
                </form>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
export default VoiceAi;
