import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, DollarSign, TrendingUp, Sun, Moon, FileText, CloudRain, 
  Bot, Users, CheckCircle2, AlertCircle, Play, Sliders, Plus, Search, 
  LayoutDashboard, LogOut, Database, Upload, Activity, ShieldCheck, Map,
  FileSpreadsheet, ArrowUpRight, BarChart3, AlertTriangle, ShieldAlert, QrCode
} from 'lucide-react';
import GlassCard from './components/ui/GlassCard';
import Button from './components/ui/Button';
import DigitalTwin from './components/DigitalTwin';
import AiBoardroom from './components/AiBoardroom';
import WhatIfSimulator from './components/WhatIfSimulator';
import VoiceAi from './components/VoiceAi';
import CreditMemo from './components/CreditMemo';
import UpiPayments from './components/UpiPayments';
import FinancialDna from './components/FinancialDna';
import { 
  sampleGovernmentSchemes, 
  sampleMarketTrends, 
  nabardMetrics, 
  creditProfiles 
} from './data/mockData';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, LineChart, Line } from 'recharts';
import * as api from './services/api';


const TickerItem: React.FC<{ text: string }> = ({ text }) => (
  <span className="mx-8 font-mono text-[11px] font-bold text-zinc-500 uppercase flex items-center gap-1.5 whitespace-nowrap">
    {text}
  </span>
);

export const App: React.FC = () => {
  const [portal, setPortal] = useState<'hero' | 'login' | 'entrepreneur' | 'bank' | 'nabard'>('hero');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [showMemo, setShowMemo] = useState(false);

  // Passcode login & onboarding states
  const [selectedRole, setSelectedRole] = useState<'entrepreneur' | 'bank' | 'nabard'>('entrepreneur');
  const [passcode, setPasscode] = useState<string>('');
  const [loginLoading, setLoginLoading] = useState<boolean>(false);
  const [loginRoleMsg, setLoginRoleMsg] = useState<string>('');
  const [loginMode, setLoginMode] = useState<'login' | 'register' | 'otp' | 'forgot'>('login');
  const [appLanguage, setAppLanguage] = useState<'en' | 'hi' | 'mr' | 'gu' | 'ta'>('en');
  const [registerForm, setRegisterForm] = useState({ name: '', sector: 'Dairy & Husbandry', location: 'Maharashtra' });
  const [otpCode, setOtpCode] = useState<string>('');

  const handleKeypress = (num: string) => {
    if (passcode.length >= 4) return;
    const nextCode = passcode + num;
    setPasscode(nextCode);

    if (nextCode.length === 4) {
      setLoginLoading(true);
      const loadingStages = [
        "Decrypting ledger hashes...",
        "Resolving digital twins...",
        "Authorizing session keys...",
        "Appraisal Gate Open!"
      ];
      
      let stageIdx = 0;
      setLoginRoleMsg(loadingStages[0]);
      
      const interval = setInterval(() => {
        stageIdx++;
        if (stageIdx < loadingStages.length) {
          setLoginRoleMsg(loadingStages[stageIdx]);
        } else {
          clearInterval(interval);
          setLoginLoading(false);
          setPortal(selectedRole);
          setActiveTab(selectedRole === 'entrepreneur' ? 'dashboard' : selectedRole === 'bank' ? 'boardroom' : 'overview');
        }
      }, 550);
    }
  };

  // Keyboard navigation & Toast States (Linear style)
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2200);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }
      if (portal !== 'entrepreneur') return;

      const key = e.key.toLowerCase();
      if (key === 'd') {
        setActiveTab('dashboard');
        triggerToast('Linear Hotkey: Switched to Dashboard [D]');
      } else if (key === 't') {
        setActiveTab('twin');
        triggerToast('Linear Hotkey: Switched to Digital Twin [T]');
      } else if (key === 's') {
        setActiveTab('simulator');
        triggerToast('Linear Hotkey: Switched to What-If Simulator [S]');
      } else if (key === 'g') {
        setActiveTab('schemes');
        triggerToast('Linear Hotkey: Switched to Govt Schemes [G]');
      } else if (key === 'f') {
        setActiveTab('farm');
        triggerToast('Linear Hotkey: Switched to Farm Analytics [F]');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [portal]);
  
  // Interactive Simulation States
  const [activeProfileId, setActiveProfileId] = useState<'ramesh' | 'sunita' | 'vignesh'>('ramesh');
  const [selectedState, setSelectedState] = useState<string>('Maharashtra');

  // Backend connection and Landing Page sandbox controls
  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [heroRainfall, setHeroRainfall] = useState(0); // % rainfall deficit
  const [heroPriceDrop, setHeroPriceDrop] = useState(0); // % price drop

  // API State data bindings
  const [apiRisk, setApiRisk] = useState<any>(null);
  const [apiForecast, setApiForecast] = useState<any>(null);
  const [apiRecommendations, setApiRecommendations] = useState<any>(null);
  const [apiSchemes, setApiSchemes] = useState<any>(null);
  const [apiMemo, setApiMemo] = useState<any>(null);
  const [forecastHorizon, setForecastHorizon] = useState<number>(30);
  const [isFetchingLive, setIsFetchingLive] = useState(false);

  // Local notifications system
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Monsoon Drought Alert", message: "NDVI greenness levels in Rajasthan (Churu) fell to 0.31. Weather alarm active.", type: "critical", time: "10m ago" },
    { id: 2, title: "Gokul Deposit Sweeped", message: "Cooperative Milk payment of ₹1.8L sweeped automatically into SBI bank account.", type: "success", time: "2h ago" },
    { id: 3, title: "OCR Audit Complete", message: "Kamdhenu Cattle Feed invoice verified at 98.4%. No duplicate signals.", type: "info", time: "1d ago" }
  ]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Local boardroom debate override state
  const [boardroomData, setBoardroomData] = useState<{
    agents: any[];
    debate: any[];
    consensusConfidence: number;
    riskRating: string;
    status: string;
  } | null>(null);

  const PROFILE_UUIDS: Record<string, string> = {
    ramesh: '00000000-0000-0000-0000-000000000001',
    sunita: '00000000-0000-0000-0000-000000000002',
    vignesh: '00000000-0000-0000-0000-000000000003'
  };

  useEffect(() => {
    const checkHealth = async () => {
      const online = await api.checkBackendHealth();
      setIsBackendOnline(online);
    };
    checkHealth();
  }, []);

  // Fetch dynamic profile assets from backend
  useEffect(() => {
    const fetchLiveDetails = async () => {
      if (!isBackendOnline) return;
      setIsFetchingLive(true);
      const uuid = PROFILE_UUIDS[activeProfileId];
      try {
        const [riskData, forecastData, recData, schemeData, memoData] = await Promise.all([
          api.getRiskAssessment(uuid),
          api.getCashFlowForecast(uuid, forecastHorizon),
          api.getRecommendations(uuid),
          api.getSchemeMatches(uuid),
          api.getCreditMemo(uuid)
        ]);
        if (riskData) setApiRisk(riskData);
        if (forecastData) setApiForecast(forecastData);
        if (recData) setApiRecommendations(recData);
        if (schemeData) setApiSchemes(schemeData);
        if (memoData) setApiMemo(memoData);
        
        // Reset boardroom data on profile change to let it load dynamically
        setBoardroomData(null);
      } catch (err) {
        console.error("Failed to load live profile details from backend:", err);
      } finally {
        setIsFetchingLive(false);
      }
    };
    
    fetchLiveDetails();
  }, [activeProfileId, isBackendOnline, forecastHorizon]);

  const activeProfile = creditProfiles.find(p => p.id === activeProfileId) || creditProfiles[0];
  const activeStateMetrics = nabardMetrics.financialInclusion.find(s => s.state === selectedState) || nabardMetrics.financialInclusion[0];

  const liveCreditScore = apiRisk ? Math.round(300 + (1 - apiRisk.default_probability) * 600) : activeProfile.creditScore;
  const liveHealthScore = apiRisk ? apiRisk.health_score : (activeProfile.id === 'ramesh' ? 92 : activeProfile.id === 'vignesh' ? 98 : 46);
  const liveNetCashFlow = apiForecast ? Math.round(apiForecast.forecast_points.reduce((acc: number, p: any) => acc + p.predicted_net_cash_flow, 0) / apiForecast.forecast_points.length) : (activeProfile.id === 'ramesh' ? 85000 : activeProfile.id === 'vignesh' ? 155000 : 12000);
  const liveReadiness = apiRisk ? (apiRisk.risk_level === 'LOW' ? 'Resilient' : apiRisk.risk_level === 'MEDIUM' ? 'Standard' : 'Restructure Risk') : (activeProfile.id === 'ramesh' ? 'Resilient' : activeProfile.id === 'vignesh' ? 'Highly Secure' : 'Restructure Required');

  // Format forecast chart data dynamically
  const forecastChartData = apiForecast ? apiForecast.forecast_points.map((p: any) => ({
    date: new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    inflow: Math.round(p.predicted_revenue),
    outflow: Math.round(p.predicted_expenses),
    net: Math.round(p.predicted_net_cash_flow),
    lower: Math.round(p.confidence_lower),
    upper: Math.round(p.confidence_upper)
  })) : sampleMarketTrends.commodityPrices.map((p: any) => ({
    date: p.date,
    inflow: Math.round(p.milk * 3000),
    outflow: Math.round(p.feed * 4000),
    net: Math.round((p.milk * 3000) - (p.feed * 4000))
  }));

  const getTwinNodes = () => {
    const baseNodes = activeProfile.nodes;
    if (!isBackendOnline || !apiRisk) return baseNodes;

    return baseNodes.map(node => {
      const updatedNode = { ...node };
      
      if (node.id === 'twin-root') {
        updatedNode.value = `Valuation: ₹${(apiRisk.evidence?.historical_inflows ? Math.round(apiRisk.evidence.historical_inflows * 1.5) : 2450000).toLocaleString('en-IN')}`;
        updatedNode.status = apiRisk.risk_level === 'LOW' ? 'healthy' : apiRisk.risk_level === 'MEDIUM' ? 'warning' : 'critical';
      } else if (node.type === 'asset' && node.id.includes('cow')) {
        updatedNode.value = `₹${(1420000).toLocaleString('en-IN')}`;
      } else if (node.type === 'liability') {
        updatedNode.value = `₹${(apiRisk.evidence?.outstanding_loans || 150000).toLocaleString('en-IN')}`;
        updatedNode.status = (apiRisk.evidence?.outstanding_loans > 200000) ? 'critical' : 'warning';
      } else if (node.type === 'revenue') {
        updatedNode.value = `₹${Math.round(apiRisk.evidence?.historical_inflows / 6 || 85000).toLocaleString('en-IN')}/mo`;
      } else if (node.type === 'risk') {
        updatedNode.value = `${(apiRisk.default_probability * 100).toFixed(1)}% PD`;
        updatedNode.status = apiRisk.default_probability > 0.3 ? 'critical' : apiRisk.default_probability > 0.15 ? 'warning' : 'healthy';
      }
      return updatedNode;
    });
  };

  const [loanApplications, setLoanApplications] = useState([
    { id: 'APP-9023', type: 'Dairy Expansion', amount: '₹5,00,000', status: 'Debating in Boardroom', date: 'July 18, 2026' }
  ]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState([
    { name: 'MilkCoopLedger_Q1.pdf', status: 'verified', size: '2.4 MB' },
    { name: 'VeterinaryHealthCert.pdf', status: 'verified', size: '1.1 MB' }
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newApplicationAmount, setNewApplicationAmount] = useState('₹5,00,000');

  // Sync theme with HTML tag
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const navigateToTab = (tab: string) => {
    setActiveTab(tab);
    setIsVoiceOpen(false);
  };

  const handleApplyLoan = (e: React.FormEvent) => {
    e.preventDefault();
    const newApp = {
      id: `APP-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'Dairy Herd Expansion',
      amount: newApplicationAmount,
      status: 'Awaiting Document Audit',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    setLoanApplications(prev => [newApp, ...prev]);
    alert(`Application ${newApp.id} for ${newApp.amount} created. Pushing files to Document OCR Verification agent...`);
    setActiveTab('loans');
  };

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setIsUploading(true);
    const file = e.target.files[0];
    setTimeout(() => {
      setUploadedDocs(prev => [...prev, { name: file.name, status: 'verified', size: `${(file.size / 1024 / 1024).toFixed(1)} MB` }]);
      setIsUploading(false);
      alert(`RuralOS OCR verified "${file.name}" with 98.4% certainty. Document parsed into Digital Business Twin.`);
    }, 2000);
  };

  // Hero Sandbox variables
  const heroCreditScore = Math.max(300, Math.min(900, Math.round(780 + (heroRainfall < -20 ? -60 : -10) + (heroPriceDrop * 1.5) + (heroRainfall >= 0 ? 15 : 0))));
  const heroDefaultRisk = Math.max(1, Math.min(99, Math.round(12 + (heroRainfall < 0 ? heroRainfall * -0.7 : 0) + (heroPriceDrop * -0.6))));
  const heroHealthScore = Math.max(10, Math.min(100, Math.round(85 + (heroRainfall < 0 ? heroRainfall * 0.5 : 0) + (heroPriceDrop * 0.4))));

  // Simulated AI particles for Hero
  const particles = Array.from({ length: 15 });

  return (
    <div className="min-h-screen text-zinc-900 dark:text-zinc-50 font-sans selection:bg-emerald-500/30">
      
      {/* Visual background textures */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 dark:bg-emerald-500/[0.03] blur-3xl rounded-full" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 dark:bg-blue-500/[0.02] blur-3xl rounded-full" />
      </div>

      {/* Floating Siri Voice Trigger */}
      {portal !== 'hero' && portal !== 'login' && (
        <button
          onClick={() => setIsVoiceOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white p-4 rounded-full shadow-2xl hover:scale-105 transition-all duration-300 border border-emerald-400/20 active:scale-95 group"
        >
          <div className="relative">
            <Sparkles size={20} className="group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-100"></span>
            </span>
          </div>
        </button>
      )}

      {/* VOICE ASSISTANT DRAWER */}
      <VoiceAi 
        isOpen={isVoiceOpen} 
        onClose={() => setIsVoiceOpen(false)} 
        onNavigateToTab={navigateToTab}
        businessId={PROFILE_UUIDS[activeProfileId]}
        isBackendOnline={isBackendOnline}
      />

      {/* ================================================== */}
      {/* AUTHENTICATION PORTAL (CRED/Khatabook style) */}
      {/* ================================================== */}
      {portal === 'login' && (
        <div className="min-h-screen flex flex-col justify-center items-center bg-[#030303] text-zinc-50 relative p-6">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.06),transparent_70%)] pointer-events-none" />
          
          <div className="w-full max-w-sm space-y-6 z-10">
            {/* Header logo */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-gradient-to-tr from-emerald-650 to-teal-555 rounded-2xl flex items-center justify-center font-bold text-white font-display border border-emerald-450/20 mx-auto shadow-lg shadow-emerald-500/10">
                R
              </div>
              <h2 className="text-2xl font-extrabold font-display bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent uppercase tracking-wider">
                {loginMode === 'login' ? 'Security Appraisal Gate' :
                 loginMode === 'register' ? 'Register Enterprise' :
                 loginMode === 'otp' ? 'OTP Verification' : 'Reset Passcode'}
              </h2>
              <p className="text-xs text-zinc-500">
                {loginMode === 'login' ? 'Authorize your credential role path to load graph ledgers' :
                 loginMode === 'register' ? 'Set up your rural business profile identity' :
                 loginMode === 'otp' ? 'Enter the 4-digit code sent to your registered mobile' :
                 'Verify your mobile to reset alternate credit credentials'}
              </p>
            </div>

            {loginMode === 'login' && (
              <>
                {/* Role selector */}
                <GlassCard className="p-4 border-white/[0.04] space-y-3" intensity="normal">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold block text-center">Select Appraisal Role</span>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'entrepreneur', label: 'Enterprise', icon: '🌾' },
                      { id: 'bank', label: 'Bank Officer', icon: '💼' },
                      { id: 'nabard', label: 'Admin', icon: '🏛️' }
                    ].map(r => (
                      <button
                        key={r.id}
                        onClick={() => {
                          setSelectedRole(r.id as any);
                          setPasscode('');
                        }}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          selectedRole === r.id 
                            ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.08)]' 
                            : 'border-white/5 bg-zinc-900/30 text-zinc-400 hover:bg-zinc-900/60'
                        }`}
                      >
                        <div className="text-base mb-1">{r.icon}</div>
                        <div className="text-[10px] font-bold">{r.label}</div>
                      </button>
                    ))}
                  </div>
                </GlassCard>

                {/* Passcode input keypad */}
                <GlassCard className="p-5 border-white/[0.04] space-y-6" intensity="normal">
                  <div className="flex justify-center items-center gap-3">
                    {[0, 1, 2, 3].map(idx => (
                      <div 
                        key={idx} 
                        className={`w-3.5 h-3.5 rounded-full border transition-all ${
                          passcode.length > idx 
                            ? 'bg-emerald-500 border-emerald-400 scale-110 shadow-[0_0_8px_#10b981]' 
                            : 'border-zinc-800 bg-zinc-950'
                        }`} 
                      />
                    ))}
                  </div>

                  {loginLoading ? (
                    <div className="text-center py-6 space-y-2">
                      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest animate-pulse mt-3">
                        {loginRoleMsg}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Grid of keys */}
                      <div className="grid grid-cols-3 gap-3">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                          <button
                            key={num}
                            onClick={() => handleKeypress(num.toString())}
                            className="h-12 rounded-xl bg-zinc-900/40 border border-white/5 hover:bg-zinc-800/40 text-sm font-bold font-mono active:scale-95 transition-all text-zinc-200 cursor-pointer"
                          >
                            {num}
                          </button>
                        ))}
                        <button
                          onClick={() => setPasscode('')}
                          className="h-12 rounded-xl bg-zinc-950 border border-white/5 hover:bg-zinc-900/40 text-[10px] font-bold uppercase tracking-wider text-zinc-500 cursor-pointer"
                        >
                          Clear
                        </button>
                        <button
                          onClick={() => handleKeypress('0')}
                          className="h-12 rounded-xl bg-zinc-900/40 border border-white/5 hover:bg-zinc-800/40 text-sm font-bold font-mono active:scale-95 transition-all text-zinc-200 cursor-pointer"
                        >
                          0
                        </button>
                        <button
                          onClick={() => setPortal('hero')}
                          className="h-12 rounded-xl bg-zinc-950 border border-white/5 hover:bg-zinc-900/40 text-[10px] font-bold uppercase tracking-wider text-zinc-500 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Footer options */}
                  <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 border-t border-white/5 pt-4">
                    <button onClick={() => setLoginMode('forgot')} className="hover:text-zinc-300 cursor-pointer uppercase">Forgot Passcode?</button>
                    <button onClick={() => setLoginMode('register')} className="hover:text-emerald-400 cursor-pointer text-emerald-500 uppercase">Register Account</button>
                  </div>
                </GlassCard>
              </>
            )}

            {loginMode === 'register' && (
              <GlassCard className="p-5 border-white/[0.04] space-y-4" intensity="normal">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Business / Farmer Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter name (e.g. Ramesh Kumar)" 
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-zinc-900/60 border border-white/5 text-zinc-200 focus:outline-none focus:border-emerald-500/30"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Business Sector</label>
                  <select 
                    value={registerForm.sector}
                    onChange={(e) => setRegisterForm({ ...registerForm, sector: e.target.value })}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-zinc-900/60 border border-white/5 text-zinc-300 focus:outline-none focus:border-emerald-500/30"
                  >
                    <option value="Dairy & Husbandry">Dairy &amp; Animal Husbandry</option>
                    <option value="Agriculture">Wheat &amp; Grains Cultivation</option>
                    <option value="Handloom & MSME">Handloom &amp; MSME Unit</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Location / State</label>
                  <input 
                    type="text" 
                    placeholder="Enter district (e.g. Pune, Maharashtra)" 
                    value={registerForm.location}
                    onChange={(e) => setRegisterForm({ ...registerForm, location: e.target.value })}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-zinc-900/60 border border-white/5 text-zinc-200 focus:outline-none focus:border-emerald-500/30"
                  />
                </div>
                
                <div className="pt-2">
                  <Button 
                    variant="primary" 
                    onClick={() => {
                      if (!registerForm.name) return alert('Please enter your business identity name.');
                      setLoginMode('otp');
                    }}
                    className="w-full py-2.5 text-xs uppercase tracking-wider"
                  >
                    Setup Credentials (OTP)
                  </Button>
                </div>

                <div className="text-center pt-2 border-t border-white/5">
                  <button onClick={() => setLoginMode('login')} className="text-[10px] text-zinc-500 hover:text-zinc-400 font-bold uppercase cursor-pointer">Back to Login</button>
                </div>
              </GlassCard>
            )}

            {loginMode === 'otp' && (
              <GlassCard className="p-5 border-white/[0.04] space-y-6" intensity="normal">
                <div className="text-center space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold block">One Time Passcode Sent</span>
                  <p className="text-[11px] text-emerald-400 font-bold font-mono">Simulated OTP: 1234</p>
                </div>

                <div className="flex justify-center items-center gap-3">
                  {[0, 1, 2, 3].map(idx => (
                    <div 
                      key={idx} 
                      className={`w-3.5 h-3.5 rounded-full border transition-all ${
                        otpCode.length > idx 
                          ? 'bg-emerald-500 border-emerald-450 scale-110 shadow-[0_0_8px_#10b981]' 
                          : 'border-zinc-800 bg-zinc-950'
                      }`} 
                    />
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                      <button
                        key={num}
                        onClick={() => {
                          if (otpCode.length >= 4) return;
                          const nextCode = otpCode + num;
                          setOtpCode(nextCode);
                          if (nextCode.length === 4) {
                            setLoginLoading(true);
                            setLoginRoleMsg("Verifying OTP hashes...");
                            setTimeout(() => {
                              setLoginLoading(false);
                              setOtpCode('');
                              setPortal('entrepreneur');
                              setActiveTab('dashboard');
                              setLoginMode('login');
                              triggerToast('Appraisal Gate Open: Onboarded successfully!');
                            }, 1200);
                          }
                        }}
                        className="h-12 rounded-xl bg-zinc-900/40 border border-white/5 hover:bg-zinc-800/40 text-sm font-bold font-mono active:scale-95 transition-all text-zinc-200 cursor-pointer"
                      >
                        {num}
                      </button>
                    ))}
                    <button
                      onClick={() => setOtpCode('')}
                      className="h-12 rounded-xl bg-zinc-950 border border-white/5 hover:bg-zinc-900/40 text-[10px] font-bold uppercase tracking-wider text-zinc-500 cursor-pointer"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => {
                        if (otpCode.length >= 4) return;
                        const nextCode = otpCode + '0';
                        setOtpCode(nextCode);
                      }}
                      className="h-12 rounded-xl bg-zinc-900/40 border border-white/5 hover:bg-zinc-800/40 text-sm font-bold font-mono active:scale-95 transition-all text-zinc-200 cursor-pointer"
                    >
                      0
                    </button>
                    <button
                      onClick={() => setLoginMode('login')}
                      className="h-12 rounded-xl bg-zinc-950 border border-white/5 hover:bg-zinc-900/40 text-[10px] font-bold uppercase tracking-wider text-zinc-500 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </GlassCard>
            )}

            {loginMode === 'forgot' && (
              <GlassCard className="p-5 border-white/[0.04] space-y-4" intensity="normal">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Registered Mobile Number</label>
                  <input 
                    type="text" 
                    placeholder="Enter +91 mobile" 
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-zinc-900/60 border border-white/5 text-zinc-200 focus:outline-none focus:border-emerald-500/30"
                  />
                </div>
                
                <div className="pt-2">
                  <Button 
                    variant="primary" 
                    onClick={() => {
                      setLoginMode('otp');
                    }}
                    className="w-full py-2.5 text-xs uppercase tracking-wider"
                  >
                    Send Recovery Code
                  </Button>
                </div>

                <div className="text-center pt-2 border-t border-white/5">
                  <button onClick={() => setLoginMode('login')} className="text-[10px] text-zinc-500 hover:text-zinc-400 font-bold uppercase cursor-pointer">Back to Login</button>
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* 1. HERO / LANDING PAGE VIEW */}
      {/* ================================================== */}
      {portal === 'hero' && (
        <div className="relative min-h-screen flex flex-col justify-between bg-[#020202] text-zinc-50 z-10 radar-grid">
          
          <style>{`
            @keyframes marquee {
              0% { transform: translateX(0%); }
              100% { transform: translateX(-50%); }
            }
          `}</style>

          {/* Glowing CRED-style Network Background */}
          <div className="absolute top-20 left-0 right-0 bottom-20 overflow-hidden opacity-25 pointer-events-none z-0">
            <svg viewBox="0 0 800 600" className="w-full h-full text-zinc-800">
              {/* Connection lines */}
              <line x1="200" y1="150" x2="400" y2="100" stroke="#10b981" strokeWidth="1" strokeDasharray="5,5" className="animate-pulse" />
              <line x1="400" y1="100" x2="600" y2="150" stroke="#10b981" strokeWidth="1.5" />
              <line x1="200" y1="150" x2="300" y2="300" stroke="#14b8a6" strokeWidth="1" />
              <line x1="600" y1="150" x2="500" y2="300" stroke="#14b8a6" strokeWidth="1" />
              <line x1="300" y1="300" x2="400" y2="450" stroke="#10b981" strokeWidth="1" />
              <line x1="500" y1="300" x2="400" y2="450" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3,3" />
              <line x1="400" y1="100" x2="400" y2="450" stroke="#10b981" strokeWidth="1" />
              
              {/* Nodes */}
              <g className="animate-float" style={{ animationDelay: '0s' }}>
                <circle cx="400" cy="100" r="8" fill="#10b981" className="animate-ping opacity-75" />
                <circle cx="400" cy="100" r="5" fill="#10b981" />
                <text x="400" y="80" fill="#a1a1aa" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">🤖 AI CORE</text>
              </g>
              <g className="animate-float" style={{ animationDelay: '1s' }}>
                <circle cx="200" cy="150" r="7" fill="#14b8a6" />
                <text x="170" y="140" fill="#71717a" fontSize="9" fontFamily="monospace" fontWeight="bold">🌦️ CLIMATE</text>
              </g>
              <g className="animate-float" style={{ animationDelay: '2s' }}>
                <circle cx="600" cy="150" r="7" fill="#14b8a6" />
                <text x="615" y="145" fill="#71717a" fontSize="9" fontFamily="monospace" fontWeight="bold">📊 MARKET</text>
              </g>
              <g className="animate-float" style={{ animationDelay: '1.5s' }}>
                <circle cx="300" cy="300" r="7" fill="#f59e0b" />
                <text x="250" y="290" fill="#71717a" fontSize="9" fontFamily="monospace" fontWeight="bold">📲 UPI FLOWS</text>
              </g>
              <g className="animate-float" style={{ animationDelay: '2.5s' }}>
                <circle cx="500" cy="300" r="7" fill="#10b981" />
                <text x="515" y="295" fill="#71717a" fontSize="9" fontFamily="monospace" fontWeight="bold">🏦 BANKS</text>
              </g>
              <g className="animate-float" style={{ animationDelay: '3s' }}>
                <circle cx="400" cy="450" r="8" fill="#10b981" className="animate-ping opacity-50" />
                <circle cx="400" cy="450" r="5" fill="#10b981" />
                <text x="400" y="475" fill="#a1a1aa" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">💸 CASH FLOW</text>
              </g>
            </svg>
          </div>

          {/* Navigation Bar */}
          <header className="border-b border-white/5 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50 w-full px-6 py-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center w-full">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-xl flex items-center justify-center font-bold text-white font-display border border-emerald-400/20">
                  R
                </div>
                <span className="font-extrabold text-xl tracking-tight font-display bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                  RuralOS
                </span>
              </div>

              {/* Center Menu */}
              <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-zinc-400">
                <a href="#sandbox" className="hover:text-emerald-400 transition-colors">Risk Sandbox</a>
                <a href="#portals" className="hover:text-emerald-400 transition-colors">Portals</a>
                <a href="#features" className="hover:text-emerald-400 transition-colors">Platform Capabilities</a>
                <a href="#impact" className="hover:text-emerald-400 transition-colors">Inclusion Impact</a>
              </div>

              {/* Right Side */}
              <div className="flex items-center gap-4">
                <span className={`text-[10px] font-mono border px-2 py-0.5 rounded ${
                  isBackendOnline 
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                    : 'text-zinc-500 bg-zinc-900 border-zinc-800'
                }`}>
                  {isBackendOnline ? '● BACKEND ACTIVE' : '○ SANDBOX OFFLINE'}
                </span>
                <button 
                  onClick={toggleTheme} 
                  className="p-2 hover:bg-white/5 rounded-xl transition-all"
                  title="Toggle theme inside portals"
                >
                  {theme === 'dark' ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-zinc-400" />}
                </button>
              </div>
            </div>
          </header>

          {/* Marquee Ticker */}
          <div className="bg-zinc-950 border-b border-white/5 py-2.5 overflow-hidden flex items-center z-10 w-full select-none">
            <div 
              className="flex whitespace-nowrap"
              style={{ animation: "marquee 35s linear infinite" }}
            >
              <TickerItem text="🌾 WHEAT MANDI RATES (NASHIK): Rs. 2,250/Q (+0.8%)" />
              <TickerItem text="📈 MILK CONTRACT PAYOUTS (PUNE COOP): Rs. 54.20/L (+1.2%)" />
              <TickerItem text="🌱 COTTON PRICE INDEX (YAVATMAL): Rs. 7,120/Q (-0.4%)" />
              <TickerItem text="🚜 TRACTOR LOAN EMI RATIO: 18.2% (-1.2%)" />
              <TickerItem text="⚡ PM-KUSUM SOLAR PUMP DIRECT SUBSIDY: 60% APPROVED" />
              <TickerItem text="📊 ALTERNATE CREDIT INDEX (MAHARASHTRA): 782 (+4.8%)" />
              <TickerItem text="💼 CGTMSE COLLATERAL POOL DISBURSED: Rs. 5,000 CR ACTIVE" />
              {/* Duplicate for loop */}
              <TickerItem text="🌾 WHEAT MANDI RATES (NASHIK): Rs. 2,250/Q (+0.8%)" />
              <TickerItem text="📈 MILK CONTRACT PAYOUTS (PUNE COOP): Rs. 54.20/L (+1.2%)" />
              <TickerItem text="🌱 COTTON PRICE INDEX (YAVATMAL): Rs. 7,120/Q (-0.4%)" />
              <TickerItem text="🚜 TRACTOR LOAN EMI RATIO: 18.2% (-1.2%)" />
              <TickerItem text="⚡ PM-KUSUM SOLAR PUMP DIRECT SUBSIDY: 60% APPROVED" />
              <TickerItem text="📊 ALTERNATE CREDIT INDEX (MAHARASHTRA): 782 (+4.8%)" />
              <TickerItem text="💼 CGTMSE COLLATERAL POOL DISBURSED: Rs. 5,000 CR ACTIVE" />
            </div>
          </div>

          {/* Hero Main Block */}
          <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 md:py-16 z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Info Column */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full text-xs font-semibold text-emerald-400 tracking-wide font-mono">
                <Sparkles size={12} className="animate-pulse" />
                NABARD GLOBAL FINTECH HACKATHON ENTRY
              </div>

              <h1 className="text-5xl md:text-7xl font-black tracking-tight font-display leading-[1.05] uppercase">
                The AI Operating System for{' '}
                <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-amber-400 bg-clip-text text-transparent">
                  Rural Enterprises
                </span>
              </h1>

              <div className="space-y-1">
                <div className="text-xl font-bold text-emerald-400 tracking-wide">Predict. Protect. Grow.</div>
                <p className="text-sm text-zinc-400 leading-relaxed max-w-xl">
                  Helping India's Rural Businesses, SHGs, and FPOs make smarter financial decisions with decentralized alternate credit underwriting, multi-agent AI appraisals, and satellite NDVI climate intelligence.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button 
                  variant="gold" 
                  onClick={() => setPortal('login')}
                  className="px-6 py-3 text-xs uppercase tracking-wider shadow-lg shadow-amber-500/10"
                >
                  Get Started
                </Button>
                <Button 
                  variant="glass" 
                  onClick={() => alert('RuralOS Demo Mode: Select an Enterprise Portal Gateway below to see alternative credit, real-time stress testing, and agent consensus debating.')}
                  className="px-6 py-3 text-xs uppercase tracking-wider"
                >
                  Watch Demo
                </Button>
              </div>

              {/* Portal Gateway entries */}
              <div className="space-y-3 pt-4" id="portals">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold block">Enterprise Portal Gateways</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div 
                    onClick={() => { setPortal('entrepreneur'); setActiveTab('dashboard'); }}
                    className="p-4 rounded-xl border border-white/5 bg-zinc-900/40 cursor-pointer hover:border-emerald-500/30 hover:bg-zinc-900/80 transition-all group"
                  >
                    <Activity size={18} className="text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                    <div className="font-bold text-xs text-zinc-100 flex items-center justify-between">
                      Entrepreneur
                      <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-[10px] text-zinc-500 block mt-1">Manage twins, simulate cash flows.</span>
                  </div>

                  <div 
                    onClick={() => { setPortal('bank'); setActiveTab('boardroom'); }}
                    className="p-4 rounded-xl border border-white/5 bg-zinc-900/40 cursor-pointer hover:border-blue-500/30 hover:bg-zinc-900/80 transition-all group"
                  >
                    <Bot size={18} className="text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
                    <div className="font-bold text-xs text-zinc-100 flex items-center justify-between">
                      Bank Officer
                      <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-[10px] text-zinc-500 block mt-1">Audit ledgers, review risk boardroom.</span>
                  </div>

                  <div 
                    onClick={() => { setPortal('nabard'); setActiveTab('overview'); }}
                    className="p-4 rounded-xl border border-white/5 bg-zinc-900/40 cursor-pointer hover:border-purple-500/30 hover:bg-zinc-900/80 transition-all group"
                  >
                    <Map size={18} className="text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                    <div className="font-bold text-xs text-zinc-100 flex items-center justify-between">
                      NABARD Admin
                      <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-[10px] text-zinc-500 block mt-1">Monitor state penetration map models.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sandbox Simulator Column */}
            <div className="lg:col-span-6" id="sandbox">
              <GlassCard className="p-6 border-white/10 relative overflow-hidden bg-zinc-950/80" intensity="high">
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none" />
                
                <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-3">
                  <div>
                    <h3 className="font-bold text-sm text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                      <Sliders size={16} className="text-emerald-400" />
                      Alternate Credit Risk Sandbox
                    </h3>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Drag climate / mandi rate sliders to evaluate resilience in real-time</p>
                  </div>
                  <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">Ramesh (Dairy)</span>
                </div>

                {/* Interactive Sliders */}
                <div className="space-y-4 mb-6">
                  {/* Climate slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-400">Monsoon Rainfall Deficit</span>
                      <span className={`font-mono font-bold ${
                        heroRainfall < 0 ? 'text-rose-400' : 'text-zinc-300'
                      }`}>
                        {heroRainfall}% {heroRainfall < 0 ? '(Drought Shock)' : '(Normal)'}
                      </span>
                    </div>
                    <input 
                      type="range" 
                      min="-40" 
                      max="0" 
                      step="5"
                      value={heroRainfall} 
                      onChange={(e) => setHeroRainfall(Number(e.target.value))}
                      className="w-full accent-emerald-500 bg-zinc-800 h-1 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Mandi pricing slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-400">Cooperative Milk Price Change</span>
                      <span className={`font-mono font-bold ${
                        heroPriceDrop < 0 ? 'text-rose-400' : 'text-zinc-300'
                      }`}>
                        {heroPriceDrop}% {heroPriceDrop < 0 ? '(Mandi Price Crash)' : '(Stable)'}
                      </span>
                    </div>
                    <input 
                      type="range" 
                      min="-30" 
                      max="0" 
                      step="2"
                      value={heroPriceDrop} 
                      onChange={(e) => setHeroPriceDrop(Number(e.target.value))}
                      className="w-full accent-emerald-500 bg-zinc-800 h-1 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* Outputs Widgets */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-zinc-900/60 border border-white/5 rounded-xl p-3 text-center">
                    <span className="text-[9px] text-zinc-500 uppercase font-semibold">Credit Score</span>
                    <div className={`text-lg font-bold font-mono mt-1 ${
                      heroCreditScore >= 750 ? 'text-emerald-400' : heroCreditScore >= 670 ? 'text-amber-400' : 'text-rose-400'
                    }`}>{heroCreditScore}</div>
                    <span className="text-[8px] text-zinc-650 block mt-0.5">Alternate Data</span>
                  </div>

                  <div className="bg-zinc-900/60 border border-white/5 rounded-xl p-3 text-center">
                    <span className="text-[9px] text-zinc-500 uppercase font-semibold">Default Risk (PD)</span>
                    <div className={`text-lg font-bold font-mono mt-1 ${
                      heroDefaultRisk < 15 ? 'text-emerald-400' : heroDefaultRisk < 35 ? 'text-amber-400' : 'text-rose-400'
                    }`}>{heroDefaultRisk}%</div>
                    <span className="text-[8px] text-zinc-650 block mt-0.5">Simulation Prob</span>
                  </div>

                  <div className="bg-zinc-900/60 border border-white/5 rounded-xl p-3 text-center">
                    <span className="text-[9px] text-zinc-500 uppercase font-semibold">Dairy Cash Flow</span>
                    <div className="text-lg font-bold font-mono mt-1 text-emerald-400">
                      ₹{(heroHealthScore * 950).toLocaleString('en-IN')}
                    </div>
                    <span className="text-[8px] text-zinc-650 block mt-0.5">Operating Margin</span>
                  </div>
                </div>

                {/* Live LangGraph Snippet */}
                <div className="bg-zinc-950/60 border border-white/5 rounded-xl p-3.5 text-xs text-left">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider flex items-center gap-1 font-mono">
                      <Bot size={10} className="text-emerald-400" />
                      LangGraph Autonomous Decision Auditing
                    </span>
                    <span className={`text-[9px] font-bold ${
                      heroCreditScore >= 700 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {heroCreditScore >= 700 ? '● DECISION: APPROVE' : '● DECISION: REJECTED'}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed font-mono">
                    {heroCreditScore >= 750 ? (
                      "Consensus: Normal local rainfall indices and strong cooperative payout deposits offset price shifts. Pre-approved at subvented rate (8.5%)."
                    ) : heroCreditScore >= 670 ? (
                      "Consensus: Deficit stress detected. Approve contingent on linking direct cooperative milk payouts to escrow bank account."
                    ) : (
                      "Consensus: Rainfall deficit exceeds threshold. Fodder expenditures forecast to spike by 32%, collapsing DSCR under 1.1x. Rejected."
                    )}
                  </p>
                </div>
              </GlassCard>
            </div>
          </main>

          {/* Capabilities Grid */}
          <section className="bg-zinc-900/20 border-t border-white/5 py-12 max-w-7xl mx-auto w-full px-6" id="features">
            <h3 className="text-[10px] text-zinc-500 uppercase tracking-widest font-extrabold text-center mb-8">
              Four Core AI Engines Supporting alternate underwriting
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-5 rounded-xl bg-zinc-950/40 border border-white/5">
                <span className="font-mono text-emerald-400 font-bold text-xs">01 / CASH FLOW FORECASTER</span>
                <h4 className="font-bold text-sm text-zinc-200 mt-2">Conformal Regressions</h4>
                <p className="text-[11px] text-zinc-500 mt-1">Uses LightGBM &amp; Nixtla Statsforecast to predict seasonal revenue margins with statistical margin bounds.</p>
              </div>

              <div className="p-5 rounded-xl bg-zinc-950/40 border border-white/5">
                <span className="font-mono text-blue-400 font-bold text-xs">02 / DIGITAL TWIN MODELS</span>
                <h4 className="font-bold text-sm text-zinc-200 mt-2">Graph Node Pipelines</h4>
                <p className="text-[11px] text-zinc-500 mt-1">Converts ledger accounts, invoices, cattle RFID records and soil indexes into live asset-liability graphs.</p>
              </div>

              <div className="p-5 rounded-xl bg-zinc-950/40 border border-white/5">
                <span className="font-mono text-purple-400 font-bold text-xs">03 / MULTI-AGENT BOARDROOM</span>
                <h4 className="font-bold text-sm text-zinc-200 mt-2">LangGraph Consensus</h4>
                <p className="text-[11px] text-zinc-500 mt-1">Orchestrates CFO, Climate Telemetry, Credit Officer, and Risk agents to debate default probabilities autonomously.</p>
              </div>

              <div className="p-5 rounded-xl bg-zinc-950/40 border border-white/5">
                <span className="font-mono text-rose-400 font-bold text-xs">04 / INVOICE FRAUD DETECTOR</span>
                <h4 className="font-bold text-sm text-zinc-200 mt-2">OCR Layout Auditing</h4>
                <p className="text-[11px] text-zinc-500 mt-1">Scans uploaded billing statements using Unsupervised Isolation Forests, flagging inflated rates or altered dates.</p>
              </div>
            </div>
          </section>

          {/* PROBLEM SECTION */}
          <section className="bg-zinc-950/60 border-t border-white/5 py-16 max-w-7xl mx-auto w-full px-6" id="problem">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-4">
                <span className="text-[10px] text-amber-500 uppercase tracking-widest font-mono font-bold block">01 / The Credit Opportunity Gap</span>
                <h3 className="text-3xl font-black text-zinc-100 leading-tight uppercase font-display">
                  Traditional credit frameworks fail rural India.
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Over 80% of small farms, dairies, and rural retail stores operate in the cash economy or rely on localized dairy cooperative transactions. Standard bureau checks cannot analyze their cash flow, resulting in an estimated ₹8.5 Lakh Crore credit deficit.
                </p>
              </div>
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-zinc-900/30 border border-white/5">
                  <span className="text-[9px] text-zinc-500 font-bold font-mono">TRADITIONAL UNDERWRITING</span>
                  <ul className="text-[10px] text-zinc-400 space-y-2 mt-3 font-semibold">
                    <li className="flex items-center gap-2"><span className="text-rose-500">❌</span> Hard collateral requirements</li>
                    <li className="flex items-center gap-2"><span className="text-rose-500">❌</span> 45-day manual appraisal processing</li>
                    <li className="flex items-center gap-2"><span className="text-rose-500">❌</span> Blind to seasonal crop NDVI greenness</li>
                  </ul>
                </div>
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                  <span className="text-[9px] text-emerald-400 font-bold font-mono">RURALOS ALTERNATE UNDERWRITING</span>
                  <ul className="text-[10px] text-zinc-200 space-y-2 mt-3 font-bold">
                    <li className="flex items-center gap-2"><span className="text-emerald-400">⚡</span> Alternate UPI &amp; coop deposits analysis</li>
                    <li className="flex items-center gap-2"><span className="text-emerald-400">⚡</span> Real-time climate stress telemetries</li>
                    <li className="flex items-center gap-2"><span className="text-emerald-400">⚡</span> LangGraph multi-agent decision audit</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* SYSTEM ARCHITECTURE & FLOW */}
          <section className="bg-zinc-950/60 border-t border-white/5 py-16 max-w-7xl mx-auto w-full px-6" id="architecture">
            <div className="text-center space-y-2 mb-12">
              <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-mono font-bold block">02 / E2E Appraisal Pipeline</span>
              <h3 className="text-3xl font-black text-zinc-100 leading-tight uppercase font-display">System Architecture</h3>
              <p className="text-xs text-zinc-400 max-w-xl mx-auto">
                Flow relationship mapping raw rural transaction feeds to pre-approved subvented credit pools.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              {/* Box 1 */}
              <GlassCard className="p-5 border-zinc-800/80 hover-lift relative" intensity="normal">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold font-mono mb-4">1</div>
                <h4 className="font-bold text-sm text-zinc-200 uppercase">Alternate Feeds Scan</h4>
                <p className="text-[10px] text-zinc-500 mt-2">Connects Gokul or Amul Cooperative ledgers, local retail billing statements, and satellite soil moisture indices.</p>
              </GlassCard>

              {/* Box 2 */}
              <GlassCard className="p-5 border-zinc-800/80 hover-lift relative" intensity="normal">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold font-mono mb-4">2</div>
                <h4 className="font-bold text-sm text-zinc-200 uppercase">Multi-Agent AI Debate</h4>
                <p className="text-[10px] text-zinc-500 mt-2">LangGraph agents (CFO, Climate Risk, Fraud Investigator) debate stress resilience before generating consent hashes.</p>
              </GlassCard>

              {/* Box 3 */}
              <GlassCard className="p-5 border-zinc-800/80 hover-lift relative" intensity="normal">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold font-mono mb-4">3</div>
                <h4 className="font-bold text-sm text-zinc-200 uppercase">Smart Escrow Sweeps</h4>
                <p className="text-[10px] text-zinc-500 mt-2">Direct bank API links setup automated cooperative invoice escrow sweeps to assure repayment cycles.</p>
              </GlassCard>
            </div>
          </section>

          {/* IMPACT DASHBOARD */}
          <section className="bg-zinc-950/60 border-t border-white/5 py-16 max-w-7xl mx-auto w-full px-6" id="impact-stats">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="p-6 rounded-2xl bg-zinc-900/10 border border-white/5">
                <div className="text-4xl font-extrabold text-emerald-400 font-mono tracking-tight">1.2 Lakh+</div>
                <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mt-2">Appraised Farmers &amp; SHGs</div>
              </div>
              <div className="p-6 rounded-2xl bg-zinc-900/10 border border-white/5">
                <div className="text-4xl font-extrabold text-emerald-400 font-mono tracking-tight">₹780 Crore+</div>
                <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mt-2">Alternate Credit Scored Pool</div>
              </div>
              <div className="p-6 rounded-2xl bg-zinc-900/10 border border-white/5">
                <div className="text-4xl font-extrabold text-emerald-400 font-mono tracking-tight">+140 Points</div>
                <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mt-2">Average alternative score lift</div>
              </div>
            </div>
          </section>

          {/* TESTIMONIALS */}
          <section className="bg-zinc-950/60 border-t border-white/5 py-16 max-w-7xl mx-auto w-full px-6" id="testimonials">
            <div className="text-center space-y-2 mb-12">
              <span className="text-[10px] text-amber-500 uppercase tracking-widest font-mono font-bold block">03 / Case Studies</span>
              <h3 className="text-3xl font-black text-zinc-100 leading-tight uppercase font-display">Resilience Testimonials</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassCard className="p-6 border-zinc-800/80 flex flex-col justify-between" intensity="normal">
                <p className="text-xs text-zinc-300 italic leading-relaxed">
                  "RuralOS helped our dairy farm secure a ₹1.5 Lakh subvented animal husbandry loan in under 24 hours. The automated cooperative milk invoice sweeps handle the monthly EMIs flawlessly."
                </p>
                <div className="flex items-center gap-3 mt-6 border-t border-white/5 pt-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center font-bold text-xs text-emerald-400">RK</div>
                  <div>
                    <h5 className="text-xs font-bold text-zinc-200">Ramesh Kumar</h5>
                    <span className="text-[8px] text-zinc-500 block uppercase tracking-wider mt-0.5">Dairy Coop Farmer • Pune Dairy Association</span>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-6 border-zinc-800/80 flex flex-col justify-between" intensity="normal">
                <p className="text-xs text-zinc-300 italic leading-relaxed">
                  "Securing micro-credit for cotton seeds used to take three separate visits to district centers. The Field Officer scanned our NDVI soil greenness records and enabled paperless banking appraisal instantly."
                </p>
                <div className="flex items-center gap-3 mt-6 border-t border-white/5 pt-4">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center font-bold text-xs text-amber-400">SR</div>
                  <div>
                    <h5 className="text-xs font-bold text-zinc-200">Sunita Rao</h5>
                    <span className="text-[8px] text-zinc-500 block uppercase tracking-wider mt-0.5">Wheat Cultivator • Yavatmal APMC</span>
                  </div>
                </div>
              </GlassCard>
            </div>
          </section>

          {/* Partner Footer */}
          <footer className="border-t border-white/5 bg-zinc-950 py-6 z-10 w-full px-6" id="impact">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-500">
              <div className="flex items-center gap-2">
                <span>🌾 Designed for the NABARD Hackathon</span>
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
              </div>
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 opacity-50 text-[10px] font-semibold tracking-wider uppercase font-mono">
                <span>Ministry of MSME</span>
                <span>SIDBI Network</span>
                <span>RBI Innovation Hub</span>
                <span>India Stack (UPI/GSTN)</span>
              </div>
            </div>
          </footer>

        </div>
      )}

      {/* ================================================== */}
      {/* 2. OPERATING PLATFORM WRAPPER */}
      {/* ================================================== */}
      {portal !== 'hero' && portal !== 'login' && (
        <div className="flex h-screen overflow-hidden z-10 relative">
          
          {/* LEFT SIDEBAR (Linear/Arc style) */}
          <aside className="w-64 border-r border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-zinc-950/40 backdrop-blur-xl flex flex-col justify-between shrink-0">
            <div>
              {/* Workspace Indicator Switcher */}
              <div className="p-4 border-b border-zinc-200 dark:border-white/5 flex items-center justify-between">
                <div 
                  onClick={() => setPortal('hero')}
                  className="flex items-center gap-2 cursor-pointer hover:opacity-85 transition-opacity"
                >
                  <div className="w-6 h-6 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-lg flex items-center justify-center font-bold text-white text-xs border border-emerald-400/20">
                    R
                  </div>
                  <span className="font-extrabold text-sm tracking-tight font-display">RuralOS</span>
                </div>

                {/* Dropdown indicator (portal representation) */}
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${
                  portal === 'entrepreneur' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  portal === 'bank' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                  'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                }`}>
                  {portal.substring(0, 5)}
                </span>
              </div>

              {/* Switch Portal Select */}
              <div className="px-3 py-2">
                <select 
                  value={portal} 
                  onChange={(e) => {
                    const nextPortal = e.target.value as any;
                    setPortal(nextPortal);
                    setShowMemo(false);
                    setActiveTab(nextPortal === 'entrepreneur' ? 'dashboard' : nextPortal === 'bank' ? 'boardroom' : 'overview');
                  }}
                  className="w-full text-xs font-semibold px-2 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 text-zinc-800 dark:text-zinc-300 focus:outline-none"
                >
                  <option value="entrepreneur">Entrepreneur Portal</option>
                  <option value="bank">Bank / Officer Portal</option>
                  <option value="nabard">NABARD Admin Portal</option>
                </select>
              </div>

              {/* Sidebar Tabs */}
              <nav className="p-3 space-y-1">
                {/* ENTREPRENEUR PORTAL TABS */}
                {portal === 'entrepreneur' && (
                  <>
                    <button 
                      onClick={() => navigateToTab('dashboard')} 
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        activeTab === 'dashboard' ? 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400' : 'text-zinc-500 hover:bg-zinc-900/10 dark:hover:bg-white/5'
                      }`}
                    >
                      <LayoutDashboard size={14} /> 
                      <span>Dashboard</span>
                      <kbd className="ml-auto font-mono text-[9px] text-zinc-500 bg-zinc-900 border border-zinc-850 px-1 rounded">D</kbd>
                    </button>
                    <button 
                      onClick={() => navigateToTab('twin')} 
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        activeTab === 'twin' ? 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400' : 'text-zinc-500 hover:bg-zinc-900/10 dark:hover:bg-white/5'
                      }`}
                    >
                      <Database size={14} /> 
                      <span>Business Twin</span>
                      <kbd className="ml-auto font-mono text-[9px] text-zinc-500 bg-zinc-900 border border-zinc-850 px-1 rounded">T</kbd>
                    </button>
                    <button 
                      onClick={() => navigateToTab('farm')} 
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        activeTab === 'farm' ? 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400' : 'text-zinc-500 hover:bg-zinc-900/10 dark:hover:bg-white/5'
                      }`}
                    >
                      <Activity size={14} /> 
                      <span>Farm Analytics</span>
                      <kbd className="ml-auto font-mono text-[9px] text-zinc-500 bg-zinc-900 border border-zinc-850 px-1 rounded">F</kbd>
                    </button>
                    <button 
                      onClick={() => navigateToTab('simulator')} 
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        activeTab === 'simulator' ? 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400' : 'text-zinc-500 hover:bg-zinc-900/10 dark:hover:bg-white/5'
                      }`}
                    >
                      <Sliders size={14} /> 
                      <span>What-If Simulator</span>
                      <kbd className="ml-auto font-mono text-[9px] text-zinc-500 bg-zinc-900 border border-zinc-850 px-1 rounded">S</kbd>
                    </button>
                    <button 
                      onClick={() => navigateToTab('schemes')} 
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        activeTab === 'schemes' ? 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400' : 'text-zinc-500 hover:bg-zinc-900/10 dark:hover:bg-white/5'
                      }`}
                    >
                      <FileSpreadsheet size={14} /> 
                      <span>Govt Schemes</span>
                      <kbd className="ml-auto font-mono text-[9px] text-zinc-500 bg-zinc-900 border border-zinc-850 px-1 rounded">G</kbd>
                    </button>
                    <button 
                      onClick={() => navigateToTab('vault')} 
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        activeTab === 'vault' ? 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400' : 'text-zinc-500 hover:bg-zinc-900/10 dark:hover:bg-white/5'
                      }`}
                    >
                      <Upload size={14} /> Document Vault
                    </button>
                    <button 
                      onClick={() => navigateToTab('loans')} 
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        activeTab === 'loans' ? 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400' : 'text-zinc-500 hover:bg-zinc-900/10 dark:hover:bg-white/5'
                      }`}
                    >
                      <FileText size={14} /> Loan Applications
                    </button>
                    <button 
                      onClick={() => navigateToTab('payments')} 
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        activeTab === 'payments' ? 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400' : 'text-zinc-500 hover:bg-zinc-900/10 dark:hover:bg-white/5'
                      }`}
                    >
                      <QrCode size={14} /> UPI Payments &amp; Sweep
                    </button>
                    <button 
                      onClick={() => navigateToTab('settings')} 
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        activeTab === 'settings' ? 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400' : 'text-zinc-500 hover:bg-zinc-900/10 dark:hover:bg-white/5'
                      }`}
                    >
                      <Sliders size={14} /> Settings
                    </button>
                  </>
                )}

                {/* BANK PORTAL TABS */}
                {portal === 'bank' && (
                  <>
                    <button 
                      onClick={() => { navigateToTab('boardroom'); setShowMemo(false); }} 
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        activeTab === 'boardroom' ? 'bg-blue-500/10 text-blue-500 dark:text-blue-400' : 'text-zinc-500 hover:bg-zinc-900/10 dark:hover:bg-white/5'
                      }`}
                    >
                      <Bot size={14} /> AI Boardroom Discussion
                    </button>
                    <button 
                      onClick={() => navigateToTab('portfolio')} 
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        activeTab === 'portfolio' ? 'bg-blue-500/10 text-blue-500 dark:text-blue-400' : 'text-zinc-500 hover:bg-zinc-900/10 dark:hover:bg-white/5'
                      }`}
                    >
                      <BarChart3 size={14} /> Portfolio Analysis
                    </button>
                    <button 
                      onClick={() => navigateToTab('verification')} 
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        activeTab === 'verification' ? 'bg-blue-500/10 text-blue-500 dark:text-blue-400' : 'text-zinc-500 hover:bg-zinc-900/10 dark:hover:bg-white/5'
                      }`}
                    >
                      <ShieldCheck size={14} /> Verification &amp; OCR
                    </button>
                  </>
                )}

                {/* NABARD PORTAL TABS */}
                {portal === 'nabard' && (
                  <>
                    <button 
                      onClick={() => navigateToTab('overview')} 
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        activeTab === 'overview' ? 'bg-purple-500/10 text-purple-500 dark:text-purple-400' : 'text-zinc-500 hover:bg-zinc-900/10 dark:hover:bg-white/5'
                      }`}
                    >
                      <BarChart3 size={14} /> Financial Inclusion
                    </button>
                    <button 
                      onClick={() => navigateToTab('maps')} 
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        activeTab === 'maps' ? 'bg-purple-500/10 text-purple-500 dark:text-purple-400' : 'text-zinc-500 hover:bg-zinc-900/10 dark:hover:bg-white/5'
                      }`}
                    >
                      <Map size={14} /> Risk &amp; Climate Maps
                    </button>
                    <button 
                      onClick={() => navigateToTab('policy')} 
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        activeTab === 'policy' ? 'bg-purple-500/10 text-purple-500 dark:text-purple-400' : 'text-zinc-500 hover:bg-zinc-900/10 dark:hover:bg-white/5'
                      }`}
                    >
                      <Sliders size={14} /> Policy Simulator
                    </button>
                  </>
                )}

              </nav>
            </div>

            {/* User Details footer */}
            <div className="p-4 border-t border-zinc-200 dark:border-white/5 bg-zinc-100/50 dark:bg-zinc-950/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-white text-xs">
                  {portal === 'entrepreneur' ? 'RK' : portal === 'bank' ? 'BO' : 'NA'}
                </div>
                <div>
                  <div className="text-xs font-bold truncate">
                    {portal === 'entrepreneur' ? 'Ramesh Kumar' : portal === 'bank' ? 'Officer Deshmukh' : 'NABARD Director'}
                  </div>
                  <div className="text-[9px] text-zinc-500 truncate">
                    {portal === 'entrepreneur' ? 'Dairy Farmer' : portal === 'bank' ? 'Pune Regional Branch' : 'Delhi Head Office'}
                  </div>
                </div>
              </div>

              {/* Utility shortcuts */}
              <div className="flex justify-between">
                <button onClick={toggleTheme} className="p-1.5 hover:bg-zinc-800/10 dark:hover:bg-white/5 rounded-lg text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300">
                  {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                </button>
                <button 
                  onClick={() => setPortal('hero')}
                  className="text-[10px] flex items-center gap-1.5 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 px-2 py-1 hover:bg-zinc-800/10 dark:hover:bg-white/5 rounded-lg"
                >
                  <LogOut size={12} /> Leave
                </button>
              </div>
            </div>
          </aside>

          {/* MAIN APPLICATION FRAME */}
          <main className="flex-1 flex flex-col h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950/80">
            {/* Top Workspace Header */}
            <header className="h-14 border-b border-zinc-200 dark:border-white/5 flex items-center justify-between px-6 bg-white dark:bg-zinc-900/20 backdrop-blur-md z-40">
              <div className="flex items-center gap-4">
                <h2 className="text-sm font-bold text-zinc-400 capitalize">{portal} Portal</h2>
                <span className="text-zinc-300 dark:text-zinc-850">/</span>
                <span className="text-sm font-bold capitalize text-zinc-800 dark:text-zinc-100">{activeTab.replace('-', ' ')}</span>
              </div>

              <div className="flex items-center gap-4">
                {/* Offline/Online status badge */}
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold font-mono ${
                  isBackendOnline 
                    ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' 
                    : 'text-amber-500 bg-amber-500/10 border border-amber-500/20 animate-pulse'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isBackendOnline ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  {isBackendOnline ? 'ONLINE' : 'SANDBOX MODE'}
                </div>

                {/* Notification Bell */}
                <div className="relative">
                  <button 
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className="p-2 hover:bg-zinc-800/10 dark:hover:bg-white/5 rounded-xl text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-250 transition-colors relative"
                    title="System Alerts Log"
                  >
                    <AlertCircle size={16} />
                    <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                  </button>

                  {/* Dropdown menu */}
                  <AnimatePresence>
                    {isNotificationsOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-80 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl p-4 z-50 text-left space-y-3"
                      >
                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                          <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider">Early Warnings Log</span>
                          <button onClick={() => setNotifications([])} className="text-[10px] text-zinc-500 hover:text-zinc-300">Clear all</button>
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                          {notifications.map(n => (
                            <div key={n.id} className="p-2 bg-zinc-950/60 border border-white/5 rounded-xl text-xs space-y-1">
                              <div className="flex justify-between font-bold">
                                <span className={n.type === 'critical' ? 'text-rose-450' : n.type === 'success' ? 'text-emerald-450' : 'text-blue-450'}>
                                  {n.title}
                                </span>
                                <span className="text-[8px] text-zinc-600 font-mono">{n.time}</span>
                              </div>
                              <p className="text-[10px] text-zinc-400 leading-normal">{n.message}</p>
                            </div>
                          ))}
                          {notifications.length === 0 && (
                            <p className="text-[11px] text-zinc-500 italic py-4 text-center">No active warning indicators.</p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Quick Search */}
                <div className="relative w-48 max-w-xs hidden sm:block">
                  <Search size={14} className="absolute left-3 top-2 text-zinc-500" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search platform..."
                    className="w-full bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/5 rounded-lg pl-9 pr-4 py-1 text-xs focus:outline-none focus:border-emerald-500/20 text-zinc-800 dark:text-zinc-200"
                  />
                </div>
              </div>
            </header>

            {/* Scrollable View Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* ================================================== */}
              {/* ENTREPRENEUR PORTAL SCREENS */}
              {/* ================================================== */}
              {portal === 'entrepreneur' && (
                <>
                  {/* Account Simulation Console */}
                  <div className="mb-6 bg-zinc-900/60 p-4 rounded-2xl border border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
                        <Users size={16} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">Farmer Account Simulator</h4>
                        <p className="text-[10px] text-zinc-400">Select profile to swap active Digital Twin nodes, bank ratings and cash ledger sheets.</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setActiveProfileId('ramesh')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeProfileId === 'ramesh' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>Ramesh (Dairy)</button>
                      <button onClick={() => setActiveProfileId('sunita')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeProfileId === 'sunita' ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/20' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>Sunita (Wheat)</button>
                      <button onClick={() => setActiveProfileId('vignesh')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeProfileId === 'vignesh' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>Vignesh (MSME)</button>
                    </div>
                  </div>

                  {activeTab === 'dashboard' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                        <GlassCard className="p-4 border-emerald-500/10 hover-lift" intensity="normal" hoverGlow glowVariant="green">
                          <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold block">Current Cash</span>
                          <div className="text-xl font-extrabold text-emerald-500 mt-2 font-mono">
                            ₹{(apiRisk?.evidence?.historical_inflows ? Math.round(apiRisk.evidence.historical_inflows * 0.15) : 185000).toLocaleString('en-IN')}
                          </div>
                          <span className="text-[8px] text-zinc-500 mt-2 block">Ledger ledger balance</span>
                        </GlassCard>

                        <GlassCard className="p-4 border-zinc-800/80 hover-lift" intensity="normal" hoverGlow glowVariant="teal">
                          <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold block">Health Score</span>
                          <div className="text-xl font-extrabold text-zinc-100 mt-2 font-mono">
                            {liveHealthScore}%
                          </div>
                          <span className="text-[8px] text-zinc-500 mt-2 block">Appraisal index status</span>
                        </GlassCard>

                        <GlassCard className="p-4 border-zinc-800/80 hover-lift" intensity="normal" hoverGlow glowVariant="green">
                          <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold block">Predicted Cash Flow</span>
                          <div className="text-xl font-extrabold text-emerald-500 mt-2 font-mono">
                            ₹{liveNetCashFlow.toLocaleString('en-IN')}
                          </div>
                          <span className="text-[8px] text-zinc-500 mt-2 block">30-day forecast buffer</span>
                        </GlassCard>

                        <GlassCard className="p-4 border-zinc-800/80 hover-lift" intensity="normal" hoverGlow glowVariant="teal">
                          <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold block">Monthly Revenue</span>
                          <div className="text-xl font-extrabold text-zinc-100 mt-2 font-mono">
                            ₹{(apiRisk?.evidence?.historical_inflows ? Math.round(apiRisk.evidence.historical_inflows / 6) : 180000).toLocaleString('en-IN')}
                          </div>
                          <span className="text-[8px] text-zinc-500 mt-2 block">Coop milk sweeps</span>
                        </GlassCard>

                        <GlassCard className="p-4 border-zinc-800/80 hover-lift" intensity="normal" hoverGlow glowVariant="gold">
                          <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold block">Risk Level</span>
                          <div className="text-xl font-extrabold text-indigo-400 mt-2 font-mono">
                            {liveReadiness}
                          </div>
                          <span className="text-[8px] text-zinc-500 mt-2 block">Alternate credit index</span>
                        </GlassCard>

                        <GlassCard className="p-4 border-zinc-800/80 hover-lift" intensity="normal" hoverGlow glowVariant="gold">
                          <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold block">AI Confidence</span>
                          <div className="text-xl font-extrabold text-amber-500 mt-2 font-mono">
                            {apiMemo?.confidence_score ? Math.round(apiMemo.confidence_score * 100) : 94}%
                          </div>
                          <span className="text-[8px] text-zinc-500 mt-2 block">LangGraph decision weight</span>
                        </GlassCard>
                      </div>

                      {/* Cashflow Prediction & Market Trends */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <GlassCard className="lg:col-span-2 p-5 animate-pulse-slow" intensity="normal">
                          <div className="flex justify-between items-center mb-4">
                            <div>
                              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Cash Flow Forecast</h3>
                              <p className="text-[9px] text-zinc-500 mt-0.5">Conformal Regressions &amp; predicted margins</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] text-zinc-500 font-mono">Horizon:</span>
                              <div className="flex gap-1 bg-zinc-950/40 p-0.5 rounded-lg border border-white/5">
                                {[30, 60, 90, 180].map(h => (
                                  <button
                                    key={h}
                                    onClick={() => setForecastHorizon(h)}
                                    className={`px-2 py-1 rounded-md text-[9px] font-bold font-mono transition-all ${
                                      forecastHorizon === h ? 'bg-emerald-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
                                    }`}
                                  >
                                    {h}D
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          <div className="h-[220px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={forecastChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                <defs>
                                  <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                  </linearGradient>
                                  <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/>
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                  </linearGradient>
                                  <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <XAxis dataKey="date" stroke="#71717a" fontSize={9} tickLine={false} />
                                <YAxis stroke="#71717a" fontSize={9} tickLine={false} />
                                <Tooltip
                                  contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                                  labelStyle={{ color: '#a1a1aa', fontSize: '10px' }}
                                />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                                <Area type="monotone" dataKey="inflow" name="Inflow (₹)" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorInflow)" />
                                <Area type="monotone" dataKey="outflow" name="Outflow (₹)" stroke="#ef4444" strokeWidth={1.5} fillOpacity={1} fill="url(#colorOutflow)" />
                                {apiForecast && (
                                  <Area type="monotone" dataKey="net" name="Net Cashflow (₹)" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorNet)" />
                                )}
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </GlassCard>

                        {/* Right Weather/Prices Panel */}
                        <div className="space-y-4">
                          {/* Mercury-Inspired Fintech Digital Credit DNA Card */}
                          <div className="relative overflow-hidden w-full h-[180px] rounded-2xl bg-gradient-to-tr from-zinc-950 via-zinc-900 to-zinc-950 border border-amber-500/25 p-5 shadow-2xl flex flex-col justify-between group">
                            {/* Card Chip & Radio logo */}
                            <div className="flex justify-between items-start">
                              <div className="space-y-1">
                                <span className="text-[7px] font-mono tracking-widest text-amber-500 uppercase font-extrabold block">RuralOS Alternate Appraisal</span>
                                <span className="text-xs font-black font-display text-zinc-100 tracking-wide">DNA PLATINUM INDEX</span>
                              </div>
                              {/* Gold Chip */}
                              <div className="w-8 h-6 bg-gradient-to-tr from-amber-400 to-yellow-600 rounded-md border border-amber-300/35 flex flex-col gap-0.5 p-1 justify-center relative shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                                <div className="h-0.5 bg-zinc-900/50 w-full rounded" />
                                <div className="h-0.5 bg-zinc-900/50 w-full rounded" />
                                <div className="h-0.5 bg-zinc-900/50 w-full rounded" />
                              </div>
                            </div>

                            {/* Card Number */}
                            <div className="font-mono text-zinc-300 font-extrabold tracking-widest text-sm py-2">
                              4054 • 2912 • 8405 • {activeProfileId === 'ramesh' ? '4021' : activeProfileId === 'sunita' ? '5012' : '9982'}
                            </div>

                            {/* Card Details */}
                            <div className="flex justify-between items-end border-t border-white/5 pt-3">
                              <div>
                                <span className="text-[6px] uppercase text-zinc-500 tracking-widest block">Acc Holder</span>
                                <span className="text-[10px] font-bold text-zinc-300">{activeProfile.name}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-[6px] uppercase text-zinc-500 tracking-widest block">Alt Credit Rating</span>
                                <span className="text-[10px] font-black text-amber-400 font-mono tracking-wide">
                                  {activeProfileId === 'ramesh' ? 'AA+ RESILIENT' : activeProfileId === 'sunita' ? 'BBB ALERT' : 'AAA STABLE'}
                                </span>
                              </div>
                            </div>

                            {/* Radial Glow */}
                            <div className="absolute -bottom-12 -right-12 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
                          </div>

                          <GlassCard className="p-4" intensity="normal">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
                              <CloudRain size={14} className="text-blue-400" />
                              Monsoon Impact Dashboard
                            </h3>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-zinc-500">NDVI Greenness Index</span>
                                <span className="font-bold text-emerald-400">0.78 (Stable)</span>
                              </div>
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-zinc-500">Irrigation Level</span>
                                <span className="font-bold text-zinc-300">Community Dam Active</span>
                              </div>
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-zinc-500">Deficit Probability</span>
                                <span className="font-bold text-amber-500">12% (Negligible impact)</span>
                              </div>
                            </div>
                          </GlassCard>

                          {/* Weather Forecast grid */}
                          <GlassCard className="p-4" intensity="normal">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">5-Day Agriculture Forecast</h3>
                            <div className="grid grid-cols-5 gap-2 text-center text-[10px]">
                              {sampleMarketTrends.weatherForecast.map((w, idx) => (
                                <div key={idx} className="bg-zinc-900/35 p-1 rounded border border-white/5">
                                  <span className="text-zinc-500 block font-semibold">{w.day}</span>
                                  <span className="text-zinc-100 font-bold block my-1">{w.temp}</span>
                                  <span className="text-blue-400 font-mono font-bold block">{w.precip}</span>
                                </div>
                              ))}
                            </div>
                          </GlassCard>
                        </div>
                      </div>

                      {/* SHAP Explainable AI & Financial DNA */}
                      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-6">
                        {/* Explainable AI SHAP Card */}
                        <GlassCard className="lg:col-span-2 p-5 flex flex-col justify-between" intensity="normal">
                          <div>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1 flex items-center gap-1.5">
                              <Bot size={14} className="text-emerald-400" />
                              AI Alternate Scoring Attribution (SHAP)
                            </h3>
                            <p className="text-[10px] text-zinc-500 mb-4">Empirical Shapley impact weights on default risk probability</p>
                            
                            <div className="space-y-3">
                              {apiRisk?.evidence?.top_shap_contributors ? (
                                Object.entries(apiRisk.evidence.top_shap_contributors).map(([feat, val]: [string, any]) => {
                                  const pct = Math.abs(val * 100).toFixed(1);
                                  const isNegative = val < 0;
                                  return (
                                    <div key={feat} className="text-xs space-y-1">
                                      <div className="flex justify-between">
                                        <span className="text-zinc-400 font-mono capitalize text-[10px]">{feat.replace(/_/g, ' ')}</span>
                                        <span className={`font-mono font-bold text-[10px] ${isNegative ? 'text-emerald-400' : 'text-rose-450'}`}>
                                          {isNegative ? '-' : '+'}{pct}%
                                        </span>
                                      </div>
                                      <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                                        <div 
                                          className={`h-full ${isNegative ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                                          style={{ width: `${Math.min(100, Math.abs(val) * 300)}%` }} 
                                        />
                                      </div>
                                    </div>
                                  );
                                })
                              ) : (
                                <div className="space-y-3">
                                  {/* Static fallback display if offline */}
                                  <div className="text-xs space-y-1">
                                    <div className="flex justify-between text-zinc-405 text-[10px]">
                                      <span>Outstanding Debt Ratio</span>
                                      <span className="text-rose-400">+8.0%</span>
                                    </div>
                                    <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                                      <div className="h-full bg-rose-500" style={{ width: '24%' }} />
                                    </div>
                                  </div>
                                  <div className="text-xs space-y-1">
                                    <div className="flex justify-between text-zinc-405 text-[10px]">
                                      <span>Transaction Velocity</span>
                                      <span className="text-emerald-400">-5.0%</span>
                                    </div>
                                    <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                                      <div className="h-full bg-emerald-500" style={{ width: '15%' }} />
                                    </div>
                                  </div>
                                  <div className="text-xs space-y-1">
                                    <div className="flex justify-between text-zinc-405 text-[10px]">
                                      <span>Supplier Stability</span>
                                      <span className="text-emerald-400">-2.0%</span>
                                    </div>
                                    <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                                      <div className="h-full bg-emerald-500" style={{ width: '6%' }} />
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-[9px] text-zinc-500 border-t border-white/5 pt-2 mt-4">
                            Green weights reduce default risk; red weights inflate it.
                          </div>
                        </GlassCard>

                        {/* Financial DNA */}
                        <div className="lg:col-span-3">
                          <FinancialDna 
                            businessId={PROFILE_UUIDS[activeProfileId]}
                            name={activeProfile.name}
                            defaultProbability={apiRisk?.default_probability ?? 0.12}
                            liquidityRisk={apiRisk?.liquidity_risk ?? 0.25}
                            financialStress={apiRisk?.financial_stress ?? 0.3}
                            supplierStability={apiRisk?.evidence?.supplier_stability_score ?? 0.88}
                            assets={apiRisk?.evidence?.historical_inflows ?? 2450000}
                            loans={apiRisk?.evidence?.outstanding_loans ?? 150000}
                            liveCreditScore={liveCreditScore}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: DIGITAL BUSINESS TWIN */}
                  {activeTab === 'twin' && (
                    <DigitalTwin 
                      nodes={getTwinNodes()} 
                      connections={activeProfile.connections} 
                    />
                  )}

                  {/* TAB: FARM ANALYTICS */}
                  {activeTab === 'farm' && (
                    <div className="space-y-6">
                      {/* Top Header Card */}
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-950 p-6 rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                            <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest">LIVE SATELLITE TELEMETRY</span>
                          </div>
                          <h2 className="text-xl font-extrabold text-zinc-100 font-display">Alternative Agri-Intelligence</h2>
                          <p className="text-xs text-zinc-500">NDVI crop moisture analysis and automated yield forecast ledger</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-bold">Appraised Location</span>
                          <span className="text-xs font-bold text-zinc-200">{activeProfile.location}</span>
                        </div>
                      </div>

                      {/* Info grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <GlassCard className="p-4 border-white/[0.04]" intensity="normal">
                          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold block mb-1">Total Acreage</span>
                          <span className="text-2xl font-extrabold text-zinc-100 font-mono">4.5 Acres</span>
                          <span className="text-[9px] text-zinc-500 block mt-1">Geo-fenced Landsat Data</span>
                        </GlassCard>
                        <GlassCard className="p-4 border-white/[0.04]" intensity="normal">
                          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold block mb-1">Soil Moisture</span>
                          <span className="text-2xl font-extrabold text-emerald-400 font-mono">0.78 <span className="text-xs">NDVI</span></span>
                          <span className="text-[9px] text-emerald-500/80 block mt-1">Optimum (Rabi Target)</span>
                        </GlassCard>
                        <GlassCard className="p-4 border-white/[0.04]" intensity="normal">
                          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold block mb-1">Target Yield</span>
                          <span className="text-2xl font-extrabold text-zinc-100 font-mono">140 Qtl</span>
                          <span className="text-[9px] text-zinc-500 block mt-1">Confidence Limit: 92%</span>
                        </GlassCard>
                        <GlassCard className="p-4 border-white/[0.04]" intensity="normal">
                          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold block mb-1">Est. Revenue</span>
                          <span className="text-2xl font-extrabold text-emerald-400 font-mono">₹2.8 Lakh</span>
                          <span className="text-[9px] text-zinc-500 block mt-1">Based on current Mandi MSP</span>
                        </GlassCard>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Crop Calendar horizontal flow */}
                        <GlassCard className="p-5 border-white/[0.04] md:col-span-2 space-y-4" intensity="normal">
                          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Crop Operations Calendar</h3>
                          
                          <div className="space-y-4">
                            {[
                              { step: '1', name: 'Land Preparation', date: 'June 2026', status: 'Completed', color: 'bg-emerald-500 text-zinc-950 font-bold' },
                              { step: '2', name: 'Sowing & Germination', date: 'July 2026', status: 'Completed', color: 'bg-emerald-500 text-zinc-950 font-bold' },
                              { step: '3', name: 'Irrigation & Fertigation', date: 'August 2026', status: 'Active Phase', color: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 animate-pulse' },
                              { step: '4', name: 'Harvesting & Mandi Auction', date: 'Oct 2026', status: 'Scheduled', color: 'bg-zinc-900 text-zinc-500 border border-white/5' }
                            ].map((op, i) => (
                              <div key={i} className="flex items-center gap-4 p-3 bg-zinc-900/40 rounded-xl border border-white/5">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold ${op.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-900 text-zinc-450'}`}>
                                  {op.step}
                                </div>
                                <div className="flex-1">
                                  <h4 className="text-xs font-bold text-zinc-200">{op.name}</h4>
                                  <span className="text-[9px] text-zinc-500">{op.date}</span>
                                </div>
                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase ${op.color}`}>
                                  {op.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </GlassCard>

                        {/* Field Grid Satellite map */}
                        <GlassCard className="p-5 border-white/[0.04] space-y-4 flex flex-col justify-between" intensity="normal">
                          <div>
                            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">NDVI Field Scan Matrix</h3>
                            <p className="text-[10px] text-zinc-500">Live multi-spectral moisture grid layout of active geofenced farm sectors</p>
                          </div>
                          
                          <div className="relative w-full aspect-square bg-zinc-950/65 rounded-xl border border-white/5 p-4 flex flex-col justify-between overflow-hidden">
                            {/* Scanning horizontal laser line */}
                            <div className="absolute left-0 w-full h-[2px] bg-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.8)] top-0 animate-scan pointer-events-none" />

                            <div className="grid grid-cols-4 gap-2">
                              {[
                                'bg-emerald-500', 'bg-emerald-500', 'bg-emerald-500', 'bg-emerald-400',
                                'bg-emerald-500', 'bg-emerald-400', 'bg-amber-400', 'bg-emerald-500',
                                'bg-emerald-400', 'bg-emerald-500', 'bg-emerald-500', 'bg-emerald-500',
                                'bg-emerald-500', 'bg-emerald-500', 'bg-emerald-400', 'bg-emerald-500'
                              ].map((colorClass, idx) => (
                                <div key={idx} className={`aspect-square rounded ${colorClass} opacity-80 hover:opacity-100 transition-all border border-white/10 flex items-center justify-center text-[7px] font-mono text-zinc-950 font-bold`}>
                                  A{idx+1}
                                </div>
                              ))}
                            </div>
                            
                            <div className="flex justify-between items-center text-[8px] font-mono text-zinc-505 border-t border-white/5 pt-2 mt-2">
                              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Healthy</span>
                              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-amber-400 rounded-full" /> Moderate</span>
                              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-rose-500 rounded-full" /> Stress</span>
                            </div>
                          </div>
                        </GlassCard>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: WHAT-IF SIMULATOR */}
                  {activeTab === 'simulator' && (
                    <WhatIfSimulator 
                      businessId={PROFILE_UUIDS[activeProfileId]} 
                      isBackendOnline={isBackendOnline} 
                    />
                  )}

                  {/* TAB 4: GOVT SCHEMES */}
                  {activeTab === 'schemes' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {isBackendOnline && apiSchemes?.matches ? (
                        apiSchemes.matches.map((match: any) => (
                          <GlassCard key={match.scheme.id} className="p-5 border-white/[0.04] flex flex-col justify-between" intensity="normal">
                            <div>
                              <div className="flex justify-between items-start mb-3">
                                <h3 className="font-bold text-sm text-zinc-100">{match.scheme.name}</h3>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  {Math.round(match.match_score * 100)}% Match
                                </span>
                              </div>
                              <div className="text-2xl font-black text-emerald-500 font-mono my-2">
                                {match.scheme.subsidy_percentage ? `${match.scheme.subsidy_percentage}% Subvention` : 'Direct Subvention'}
                              </div>
                              <p className="text-xs text-zinc-400 mt-1 mb-4 leading-relaxed">{match.scheme.description}</p>
                              
                              <hr className="border-zinc-800 my-3" />
                              
                              <div className="text-xs space-y-1.5 text-zinc-500">
                                <div className="flex justify-between">
                                  <span>Subsidy Limit:</span>
                                  <span className="font-bold text-zinc-300">Up to ₹{(match.scheme.max_amount || 0).toLocaleString('en-IN')}</span>
                                </div>
                                <div className="text-[10px] text-zinc-500 italic bg-zinc-950/20 p-2.5 rounded-lg border border-white/[0.03] mt-2">
                                  <span className="font-bold text-emerald-500">Eligibility Reason:</span> {match.reasoning}
                                </div>
                              </div>
                            </div>

                            <div className="mt-6 flex justify-end">
                              <Button variant="glass" size="sm" onClick={() => alert(`Redirecting to e-Agri Portal to claim subvention...`)}>
                                Claim Direct Subvention
                              </Button>
                            </div>
                          </GlassCard>
                        ))
                      ) : (
                        sampleGovernmentSchemes.map((sch) => (
                          <GlassCard key={sch.id} className="p-5 border-white/[0.04] flex flex-col justify-between" intensity="normal">
                            <div>
                              <div className="flex justify-between items-start mb-3">
                                <h3 className="font-bold text-base text-zinc-100">{sch.title}</h3>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  {sch.eligibility} Match
                                </span>
                              </div>
                              <div className="text-2xl font-black text-emerald-500 font-mono my-2">{sch.netRate}</div>
                              <p className="text-xs text-zinc-500 mt-1 mb-4 leading-relaxed">{sch.purpose}</p>
                              
                              <hr className="border-zinc-800 my-3" />
                              
                              <div className="grid grid-cols-2 gap-4 text-xs">
                                <div>
                                  <span className="text-zinc-500">Subsidy Rate</span>
                                  <div className="font-bold text-zinc-200 mt-0.5">{sch.subvention}</div>
                                </div>
                                <div>
                                  <span className="text-zinc-500">Cap Limit</span>
                                  <div className="font-bold text-zinc-200 mt-0.5">{sch.maxLimit}</div>
                                </div>
                              </div>
                            </div>

                            <div className="mt-6 flex justify-end">
                              <Button variant="glass" size="sm" onClick={() => alert(`Redirecting to e-Agri Portal for matches...`)}>
                                Apply Subvention Direct
                              </Button>
                            </div>
                          </GlassCard>
                        ))
                      )}
                    </div>
                  )}

                  {/* TAB 5: DOCUMENT VAULT */}
                  {activeTab === 'vault' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Upload files */}
                      <GlassCard className="p-5 flex flex-col justify-center items-center border-dashed border-white/10" intensity="normal">
                        <Upload size={32} className="text-zinc-500 mb-3" />
                        <h3 className="font-bold text-sm text-zinc-300">Upload new credit documents</h3>
                        <p className="text-[10px] text-zinc-500 text-center mt-1 mb-4">Support PDF, JPEG, PNG statements. Real-time OCR will verify and parse data.</p>
                        
                        <label className="cursor-pointer">
                          <input type="file" onChange={handleDocUpload} className="hidden" />
                          <span className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-semibold rounded-xl border border-white/5 transition-colors inline-block">
                            {isUploading ? 'Uploading & Parsing...' : 'Select Document'}
                          </span>
                        </label>
                      </GlassCard>

                      {/* Uploaded lists */}
                      <GlassCard className="lg:col-span-2 p-5" intensity="normal">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">Vault Documents (OCR Status Verified)</h3>
                        <div className="space-y-3">
                          {uploadedDocs.map((doc, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 bg-zinc-900/40 rounded-xl border border-white/5 text-xs">
                              <div className="flex items-center gap-2.5">
                                <FileText size={16} className="text-emerald-400" />
                                <div>
                                  <span className="font-bold text-zinc-200 block">{doc.name}</span>
                                  <span className="text-[10px] text-zinc-500">{doc.size}</span>
                                </div>
                              </div>
                              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase">
                                <CheckCircle2 size={10} /> OCR Verified
                              </span>
                            </div>
                          ))}
                        </div>
                      </GlassCard>
                    </div>
                  )}

                  {/* TAB 6: LOAN APPLICATIONS */}
                  {activeTab === 'loans' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <GlassCard className="p-5" intensity="normal">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">Draft new loan application</h3>
                        <form onSubmit={handleApplyLoan} className="space-y-4">
                          <div className="space-y-1">
                            <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold block">Requested Loan Amount</label>
                            <input
                              type="text"
                              value={newApplicationAmount}
                              onChange={(e) => setNewApplicationAmount(e.target.value)}
                              className="w-full bg-zinc-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-zinc-100"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold block">Purpose</label>
                            <textarea
                              rows={3}
                              defaultValue="Purchase of 10 hybrid cows and automatic milking equipment to scale cooperative daily milk quota."
                              className="w-full bg-zinc-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-zinc-100"
                            />
                          </div>

                          <Button type="submit" variant="primary" className="w-full text-xs">
                            Submit to Bank AI
                          </Button>
                        </form>
                      </GlassCard>

                      <GlassCard className="lg:col-span-2 p-5" intensity="normal">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">Active Applications Status</h3>
                        <div className="space-y-3">
                          {loanApplications.map((app) => (
                            <div key={app.id} className="p-4 bg-zinc-900/40 rounded-xl border border-white/5 text-xs flex justify-between items-center">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-zinc-200">{app.type}</span>
                                  <span className="font-mono text-[10px] text-zinc-500">({app.id})</span>
                                </div>
                                <div className="text-[10px] text-zinc-500 mt-1">Submitted: {app.date} • Expected Disbursal: 3 Days</div>
                              </div>

                              <div className="text-right">
                                <div className="font-bold text-emerald-400 font-mono">{app.amount}</div>
                                <span className="inline-block mt-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase animate-pulse">
                                  {app.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </GlassCard>
                    </div>
                  )}

                  {/* TAB 7: UPI PAYMENTS */}
                  {activeTab === 'payments' && <UpiPayments />}

                  {/* TAB: ACCOUNT SETTINGS */}
                  {activeTab === 'settings' && (
                    <div className="space-y-6 max-w-3xl">
                      <div className="bg-zinc-950 p-6 rounded-2xl border border-white/5 relative overflow-hidden">
                        <h2 className="text-lg font-extrabold text-zinc-100 font-display">System Settings</h2>
                        <p className="text-xs text-zinc-500">Configure accessibility, application language, connected escrows, and export ledger models</p>
                      </div>

                      <GlassCard className="p-5 border-white/[0.04] space-y-6" intensity="normal">
                        {/* Language setting */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-white/5">
                          <div>
                            <h4 className="text-xs font-bold text-zinc-200">App Translation &amp; Voice Language</h4>
                            <p className="text-[10px] text-zinc-500">Switches language for conversation advice and summaries</p>
                          </div>
                          
                          <select 
                            value={appLanguage} 
                            onChange={(e) => {
                              setAppLanguage(e.target.value as any);
                              triggerToast(`System Language Swapped: ${e.target.value.toUpperCase()}`);
                            }}
                            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/5 text-zinc-350 focus:outline-none focus:border-emerald-500/30"
                          >
                            <option value="en">English (US/IN)</option>
                            <option value="hi">Hindi (हिन्दी)</option>
                            <option value="mr">Marathi (मराठी)</option>
                            <option value="gu">Gujarati (ગુજરાતી)</option>
                            <option value="ta">Tamil (தமிழ்)</option>
                          </select>
                        </div>

                        {/* Linked Accounts */}
                        <div className="space-y-3 pb-5 border-b border-white/5">
                          <div>
                            <h4 className="text-xs font-bold text-zinc-200">Connected Cooperative Escrows</h4>
                            <p className="text-[10px] text-zinc-500">Control automated repayments sweeps from buyer invoices</p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="flex justify-between items-center p-3 bg-zinc-900/30 rounded-xl border border-white/5">
                              <div>
                                <span className="text-[10px] text-zinc-200 font-bold block">Gokul Dairy Cooperative</span>
                                <span className="text-[8px] text-zinc-500">Pune Milk Cooperative Association</span>
                              </div>
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">ACTIVE SWEEP</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-zinc-900/30 rounded-xl border border-white/5">
                              <div>
                                <span className="text-[10px] text-zinc-200 font-bold block">Pune APMC Yield Mandi</span>
                                <span className="text-[8px] text-zinc-500">Govt Mandi Auction Yard</span>
                              </div>
                              <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">ACTIVE SWEEP</span>
                            </div>
                          </div>
                        </div>

                        {/* Data Export */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
                          <div>
                            <h4 className="text-xs font-bold text-zinc-200">Export Alternative Credit Portfolio</h4>
                            <p className="text-[10px] text-zinc-500">Download your entire Digital Twin structure as a encrypted JSON memo</p>
                          </div>

                          <Button 
                            variant="primary" 
                            size="sm"
                            onClick={() => {
                              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activeProfile, null, 2));
                              const downloadAnchor = document.createElement('a');
                              downloadAnchor.setAttribute("href", dataStr);
                              downloadAnchor.setAttribute("download", `ruralos_profile_${activeProfileId}.json`);
                              document.body.appendChild(downloadAnchor);
                              downloadAnchor.click();
                              downloadAnchor.remove();
                              triggerToast("Credit Portfolio JSON exported successfully.");
                            }}
                          >
                            Export JSON File
                          </Button>
                        </div>
                      </GlassCard>
                    </div>
                  )}
                </>
              )}

              {/* ================================================== */}
              {/* BANK PORTAL SCREENS */}
              {/* ================================================== */}
              {portal === 'bank' && (
                <>
                  {/* TAB 1: BOARDROOM */}
                  {activeTab === 'boardroom' && (
                    <>
                      {/* Credit Application Registry Switcher */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 bg-zinc-900/60 p-4 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400">
                            <Bot size={16} />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">Credit Application Registry</h4>
                            <p className="text-[10px] text-zinc-400">Appraise files dynamically to update agent debate feeds and alternate scoring ratios.</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => { setActiveProfileId('ramesh'); setShowMemo(false); }} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeProfileId === 'ramesh' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>Ramesh Kumar (Dairy)</button>
                          <button onClick={() => { setActiveProfileId('sunita'); setShowMemo(false); }} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeProfileId === 'sunita' ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/20' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>Sunita Devi (Wheat)</button>
                          <button onClick={() => { setActiveProfileId('vignesh'); setShowMemo(false); }} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeProfileId === 'vignesh' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>Vignesh Rao (MSME)</button>
                        </div>
                      </div>

                      {showMemo ? (
                        <CreditMemo 
                          memo={apiMemo ? {
                            id: apiMemo.id || 'MEMO-' + activeProfileId.toUpperCase(),
                            borrower: apiMemo.borrower_name,
                            business: apiMemo.business_entity,
                            district: activeProfile.memo.district,
                            state: activeProfile.memo.state,
                            date: new Date(apiMemo.evaluation_date).toLocaleDateString(),
                            proposedLoan: `₹${(apiMemo.proposed_loan_amount || 500000).toLocaleString('en-IN')}`,
                            purpose: activeProfile.memo.purpose,
                            aiConfidence: `${Math.round((apiMemo.confidence_score || 0.94) * 100)}%`,
                            riskRating: apiMemo.overall_recommendation === 'APPROVE' ? 'Low-Medium' : 'High',
                            recommendation: apiMemo.overall_recommendation === 'APPROVE' ? 'APPROVED BY AI CONSENSUS' : 'REFER TO HUMAN AUDITOR',
                            executiveSummary: apiMemo.executive_summary,
                            financialAnalysis: {
                              dscr: `${(apiMemo.key_metrics?.debt_service_coverage_ratio || 1.82).toFixed(2)}x`,
                              debtEquity: `${(apiMemo.key_metrics?.debt_to_equity_ratio || 0.65).toFixed(2)}`,
                              netMargin: `${(apiMemo.key_metrics?.net_profit_margin_percent || 14.5).toFixed(1)}%`,
                              annualRevenue: `₹${(apiMemo.key_metrics?.annual_revenue_run_rate || 2160000).toLocaleString('en-IN')}`,
                              annualSurplus: `₹${(Math.round(apiMemo.key_metrics?.annual_revenue_run_rate * 0.3) || 620000).toLocaleString('en-IN')}`
                            },
                            riskFactors: Object.entries(apiMemo.risk_mitigants || {}).map(([k, v]: [string, any]) => ({
                              factor: k.replace(/_/g, ' '),
                              mitigation: v
                            })),
                            forecastData: activeProfile.memo.forecastData
                          } : activeProfile.memo} 
                          onBack={() => setShowMemo(false)} 
                        />
                      ) : (
                        <AiBoardroom 
                          businessId={PROFILE_UUIDS[activeProfileId]}
                          isBackendOnline={isBackendOnline}
                          agents={boardroomData?.agents || activeProfile.agents}
                          debate={boardroomData?.debate || activeProfile.debate}
                          consensusConfidence={boardroomData?.consensusConfidence || Math.round(activeProfile.agents.reduce((acc, a) => acc + a.confidence, 0) / activeProfile.agents.length)}
                          riskRating={boardroomData?.riskRating || activeProfile.riskRating}
                          status={boardroomData?.status || activeProfile.status}
                          onGenerateMemo={() => setShowMemo(true)}
                          onUpdateDebateData={(data) => setBoardroomData(data)}
                        />
                      )}
                    </>
                  )}

                  {/* TAB 2: PORTFOLIO ANALYSIS */}
                  {activeTab === 'portfolio' && (
                    <div className="space-y-6">
                      {/* Overview numbers */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <GlassCard className="p-4" intensity="normal">
                          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Active Loan Portfolio</span>
                          <div className="text-3xl font-extrabold text-zinc-100 mt-2 font-mono">₹42.5 Cr</div>
                          <span className="text-[9px] text-zinc-500 mt-1 block">Pune Regional Cooperative sector</span>
                        </GlassCard>

                        <GlassCard className="p-4" intensity="normal">
                          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">NPA Deficit (Current)</span>
                          <div className="text-3xl font-extrabold text-emerald-400 mt-2 font-mono">1.12%</div>
                          <span className="text-[9px] text-emerald-400 font-semibold block">Target under &lt; 2.5%</span>
                        </GlassCard>

                        <GlassCard className="p-4" intensity="normal">
                          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Early Warning Risk Triggers</span>
                          <div className="text-3xl font-extrabold text-amber-500 mt-2 font-mono">4 Accounts</div>
                          <span className="text-[9px] text-amber-500 font-semibold block">Flagged due to climate stress</span>
                        </GlassCard>

                        <GlassCard className="p-4" intensity="normal">
                          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">AHIDF Direct Subsidy Matching</span>
                          <div className="text-3xl font-extrabold text-indigo-400 mt-2 font-mono">82%</div>
                          <span className="text-[9px] text-zinc-400 block">Total eligible term applications matched</span>
                        </GlassCard>
                      </div>

                      {/* Charts and Alerts */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <GlassCard className="lg:col-span-2 p-5" intensity="normal">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">Portfolio Disbursal vs Repayment Performance (₹ Lakhs)</h3>
                          <div className="h-[220px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={sampleMarketTrends.commodityPrices} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" stroke="#71717a" fontSize={10} tickLine={false} />
                                <YAxis stroke="#71717a" fontSize={10} tickLine={false} />
                                <Tooltip />
                                <Legend wrapperStyle={{ fontSize: '11px' }} />
                                <Line type="monotone" dataKey="milk" name="Disbursed Loans" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 8 }} />
                                <Line type="monotone" dataKey="feed" name="EMI Repayments" stroke="#10b981" strokeWidth={2} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </GlassCard>

                        <GlassCard className="p-5" intensity="normal">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-1.5">
                            <ShieldAlert size={14} className="text-rose-500" />
                            Early Warning Risk Log
                          </h3>
                          <div className="space-y-3">
                            <div className="p-2.5 bg-rose-500/5 rounded-lg border border-rose-500/10 text-xs">
                              <div className="flex justify-between font-bold text-zinc-200">
                                <span>Shekhar Dhangar (Wheat)</span>
                                <span className="text-rose-400 font-mono">PD: 42%</span>
                              </div>
                              <p className="text-[10px] text-zinc-500 mt-1">NDVI index dropped below 0.35 due to heat deficit.</p>
                            </div>

                            <div className="p-2.5 bg-amber-500/5 rounded-lg border border-amber-500/10 text-xs">
                              <div className="flex justify-between font-bold text-zinc-200">
                                <span>Gopal Shinde (Sugar)</span>
                                <span className="text-amber-400 font-mono">PD: 28%</span>
                              </div>
                              <p className="text-[10px] text-zinc-500 mt-1">30 days overdue EMI. Alternate data predicts Gokul payout deposit delay.</p>
                            </div>
                          </div>
                        </GlassCard>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: VERIFICATION */}
                  {activeTab === 'verification' && (
                    <GlassCard className="p-5" intensity="normal">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">Pending Document Verification Queue (OCR Extraction matches)</h3>
                      <div className="space-y-4">
                        <div className="p-4 bg-zinc-900/40 rounded-xl border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                          <div>
                            <span className="font-bold text-zinc-200 block">Milk Ledger Statement - Ramesh Kumar</span>
                            <span className="text-[10px] text-zinc-500">18 months bank deposit matching Gokul Society records.</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">98% OCR Match</span>
                            <Button size="sm" variant="glass" onClick={() => alert('Document approved by OCR extraction')}>
                              Approve Extracted Data
                            </Button>
                          </div>
                        </div>

                        <div className="p-4 bg-zinc-900/40 rounded-xl border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                          <div>
                            <span className="font-bold text-zinc-200 block">NDDB Livestock Tag Registry</span>
                            <span className="text-[10px] text-zinc-500">45 tags parsed against state database checkups.</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">100% Verified</span>
                            <Button size="sm" variant="glass" onClick={() => alert('Tags checked against NDDB database')}>
                              View registry
                            </Button>
                          </div>
                        </div>
                      </div>
                    </GlassCard>
                  )}
                </>
              )}

              {/* ================================================== */}
              {/* NABARD PORTAL SCREENS */}
              {/* ================================================== */}
              {portal === 'nabard' && (
                <>
                  {/* TAB 1: FINANCIAL INCLUSION */}
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      {/* State Selector Console */}
                      <div className="bg-zinc-900/60 p-4 rounded-2xl border border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-purple-500/10 rounded-xl border border-purple-500/20 text-purple-400">
                            <Map size={16} />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-zinc-100 uppercase tracking-wider">State-Level Credit Analytics</h4>
                            <p className="text-[10px] text-zinc-400">Filter datasets or tap districts on the Maps tab to load localized credit gap registers.</p>
                          </div>
                        </div>
                        <select 
                          value={selectedState} 
                          onChange={(e) => setSelectedState(e.target.value)}
                          className="text-xs font-semibold px-3 py-1.5 bg-zinc-800 border border-white/5 text-zinc-100 rounded-lg focus:outline-none focus:border-purple-500/35"
                        >
                          <option value="Maharashtra">Maharashtra (Live)</option>
                          <option value="Rajasthan">Rajasthan (Drought-stressed)</option>
                          <option value="Uttar Pradesh">Uttar Pradesh (Growth)</option>
                          <option value="Karnataka">Karnataka (Green Infra)</option>
                          <option value="Gujarat">Gujarat (Resilient)</option>
                          <option value="Bihar">Bihar (High Credit Gap)</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <GlassCard className="p-4" intensity="normal">
                          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Credit Gap Ratio</span>
                          <div className="text-3xl font-extrabold text-zinc-100 mt-2 font-mono">{activeStateMetrics.creditGap}%</div>
                          <span className="text-[9px] text-rose-500 mt-1 block">Value Gap: {activeStateMetrics.gapValue}</span>
                        </GlassCard>

                        <GlassCard className="p-4" intensity="normal">
                          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Subvention Disbursements</span>
                          <div className="text-3xl font-extrabold text-emerald-500 mt-2 font-mono">{activeStateMetrics.activeSubv}</div>
                          <span className="text-[9px] text-zinc-500 mt-1 block">Active subventions in {selectedState}</span>
                        </GlassCard>

                        <GlassCard className="p-4" intensity="normal">
                          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">MSME Credit Volume</span>
                          <div className="text-3xl font-extrabold text-zinc-100 mt-2 font-mono">{activeStateMetrics.msmeVol}</div>
                          <span className="text-[9px] text-zinc-500 mt-1 block">Cooperative sectors in {selectedState}</span>
                        </GlassCard>

                        <GlassCard className="p-4" intensity="normal">
                          <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Financial Penetration</span>
                          <div className="text-3xl font-extrabold text-indigo-400 mt-2 font-mono">{activeStateMetrics.penetration}%</div>
                          <span className="text-[9px] text-emerald-400 font-semibold block">Active banking coverage</span>
                        </GlassCard>
                      </div>

                      {/* State Credit Distribution */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <GlassCard className="lg:col-span-2 p-5" intensity="normal">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">State-Wise Financial Inclusion Penetration &amp; Credit Gap</h3>
                          <div className="h-[220px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={nabardMetrics.financialInclusion} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="state" stroke="#71717a" fontSize={9} tickLine={false} />
                                <YAxis stroke="#71717a" fontSize={9} tickLine={false} />
                                <Tooltip />
                                <Legend wrapperStyle={{ fontSize: '11px' }} />
                                <Bar dataKey="penetration" name="Inclusion Penetration %" fill="#10b981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="creditGap" name="Credit Gap %" fill="#ef4444" radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </GlassCard>

                        <GlassCard className="p-5 flex flex-col justify-between" intensity="normal">
                          <div>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-4">Scheme Effectiveness index</h3>
                            <div className="space-y-3">
                              {nabardMetrics.schemeEffectiveness.map((se, idx) => (
                                <div key={idx} className="text-xs space-y-1">
                                  <div className="flex justify-between font-bold text-zinc-200">
                                    <span>{se.name}</span>
                                    <span>{se.impact}% Impact</span>
                                  </div>
                                  <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-emerald-500 h-full animate-pulse-slow" style={{ width: `${se.impact}%` }} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </GlassCard>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: GEOGRAPHIC CLIMATE MAPS */}
                  {activeTab === 'maps' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <GlassCard className="lg:col-span-2 p-5 h-[400px] flex flex-col justify-between" intensity="normal">
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Interactive India Agriculture Credit Gap &amp; Risk Map</h3>
                            <p className="text-[9px] text-zinc-500 mt-0.5">Click glowing blips to load telemetry data for that region.</p>
                          </div>
                          <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full font-bold">Active State: {selectedState}</span>
                        </div>

                        {/* Styled Simulated SVG map of India */}
                        <div className="flex-1 flex justify-center items-center bg-zinc-950/20 border border-white/5 rounded-xl overflow-hidden relative">
                          <svg viewBox="0 0 400 400" className="w-[300px] h-[300px] text-zinc-700 select-none">
                            {/* Stylized geometric outline shape of India */}
                            <path 
                              d="M 190,50 L 210,60 L 220,100 L 240,110 L 230,130 L 240,160 L 250,180 L 270,190 L 300,195 L 320,190 L 310,210 L 290,210 L 280,220 L 250,220 L 240,240 L 230,250 L 215,270 L 205,330 L 200,360 L 195,330 L 180,280 L 175,250 L 165,240 L 160,220 L 150,225 L 140,210 L 110,200 L 90,190 L 105,170 L 125,165 L 130,150 L 150,130 L 140,110 L 160,85 L 180,75 Z" 
                              className="fill-zinc-800 stroke-zinc-700 stroke-[1.5px] hover:fill-zinc-750 transition-colors"
                            />
                            {/* Pune, Maharashtra */}
                            <g className="cursor-pointer" onClick={() => setSelectedState('Maharashtra')}>
                              <circle cx="155" cy="235" r="6" className={`fill-emerald-500 animate-ping ${selectedState === 'Maharashtra' ? 'opacity-100' : 'opacity-60'}`} />
                              <circle cx="155" cy="235" r="4" className={`fill-emerald-500 ${selectedState === 'Maharashtra' ? 'stroke-white stroke-1' : ''}`} />
                              <text x="165" y="238" fontSize="8" fill="white" className="font-bold">MH (Pune)</text>
                            </g>

                            {/* Rajasthan West */}
                            <g className="cursor-pointer" onClick={() => setSelectedState('Rajasthan')}>
                              <circle cx="130" cy="150" r="6" className={`fill-rose-500 animate-ping ${selectedState === 'Rajasthan' ? 'opacity-100' : 'opacity-60'}`} />
                              <circle cx="130" cy="150" r="4" className={`fill-rose-500 ${selectedState === 'Rajasthan' ? 'stroke-white stroke-1' : ''}`} />
                              <text x="100" y="145" fontSize="8" fill="#fda4af" className="font-bold">RJ (Churu)</text>
                            </g>

                            {/* Uttar Pradesh */}
                            <g className="cursor-pointer" onClick={() => setSelectedState('Uttar Pradesh')}>
                              <circle cx="210" cy="160" r="6" className={`fill-amber-500 animate-ping ${selectedState === 'Uttar Pradesh' ? 'opacity-100' : 'opacity-60'}`} />
                              <circle cx="210" cy="160" r="4" className={`fill-amber-500 ${selectedState === 'Uttar Pradesh' ? 'stroke-white stroke-1' : ''}`} />
                              <text x="220" y="163" fontSize="8" fill="white" className="font-bold">UP (Lucknow)</text>
                            </g>

                            {/* Karnataka */}
                            <g className="cursor-pointer" onClick={() => setSelectedState('Karnataka')}>
                              <circle cx="170" cy="280" r="6" className={`fill-blue-500 animate-ping ${selectedState === 'Karnataka' ? 'opacity-100' : 'opacity-60'}`} />
                              <circle cx="170" cy="280" r="4" className={`fill-blue-500 ${selectedState === 'Karnataka' ? 'stroke-white stroke-1' : ''}`} />
                              <text x="180" y="283" fontSize="8" fill="white" className="font-bold">KA (Chikka)</text>
                            </g>

                            {/* Gujarat */}
                            <g className="cursor-pointer" onClick={() => setSelectedState('Gujarat')}>
                              <circle cx="115" cy="200" r="6" className={`fill-indigo-500 animate-ping ${selectedState === 'Gujarat' ? 'opacity-100' : 'opacity-60'}`} />
                              <circle cx="115" cy="200" r="4" className={`fill-indigo-500 ${selectedState === 'Gujarat' ? 'stroke-white stroke-1' : ''}`} />
                              <text x="80" y="203" fontSize="8" fill="white" className="font-bold">GJ (Anand)</text>
                            </g>

                            {/* Bihar */}
                            <g className="cursor-pointer" onClick={() => setSelectedState('Bihar')}>
                              <circle cx="250" cy="170" r="6" className={`fill-purple-500 animate-ping ${selectedState === 'Bihar' ? 'opacity-100' : 'opacity-60'}`} />
                              <circle cx="250" cy="170" r="4" className={`fill-purple-500 ${selectedState === 'Bihar' ? 'stroke-white stroke-1' : ''}`} />
                              <text x="260" y="173" fontSize="8" fill="white" className="font-bold">BR (Patna)</text>
                            </g>
                          </svg>
                        </div>
                      </GlassCard>

                      <div className="space-y-4">
                        <GlassCard className="p-4" intensity="normal">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
                            <ShieldAlert size={14} className="text-rose-500" />
                            Climate Exposure risk list
                          </h3>
                          <div className="space-y-3 text-xs">
                            <div className="p-2.5 bg-rose-500/5 border border-rose-500/10 rounded-lg">
                              <span className="font-bold text-zinc-200 block">Jodhpur Region</span>
                              <p className="text-[10px] text-zinc-400 mt-1">NDVI index drop has triggered automatic moratorium alerts for 142 wheat crop loans.</p>
                            </div>
                            <div className="p-2.5 bg-amber-500/5 border border-amber-500/10 rounded-lg">
                              <span className="font-bold text-zinc-200 block">Vidarbha Cotton Belt</span>
                              <p className="text-[10px] text-zinc-400 mt-1">Groundwater depletion model suggests potential credit stress in Q3 crop yields.</p>
                            </div>
                          </div>
                        </GlassCard>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: POLICY SIMULATOR */}
                  {activeTab === 'policy' && (
                    <GlassCard className="p-5" intensity="normal">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">NABARD Policy Subvention Simulator</h3>
                        <span className="text-[10px] text-zinc-500">Calibrate central parameters to test default buffers</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-zinc-400">Interest Subvention Percentage</span>
                              <span className="font-bold text-zinc-100">3.0% Net Buffer</span>
                            </div>
                            <input type="range" min="1" max="5" defaultValue="3" className="w-full accent-emerald-500 h-1 bg-zinc-800" />
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-zinc-400">Credit Guarantee Coverage (CGTMSE)</span>
                              <span className="font-bold text-zinc-100">75% coverage cap</span>
                            </div>
                            <input type="range" min="50" max="90" defaultValue="75" className="w-full accent-emerald-500 h-1 bg-zinc-800" />
                          </div>
                        </div>

                        <div className="p-4 bg-zinc-900/40 rounded-xl border border-white/5 text-xs flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-2">Simulated Policy Impact</span>
                            <div className="flex justify-between py-1.5 border-b border-white/5">
                              <span>Estimated Default Drop:</span>
                              <span className="font-bold text-emerald-400">-12.4%</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-white/5">
                              <span>Matched Beneficiary Count:</span>
                              <span className="font-bold text-zinc-200">1.2 Lakh Farmers</span>
                            </div>
                          </div>
                          <Button size="sm" variant="primary" className="w-full mt-4" onClick={() => alert('Policy scenario compiled. Draft report sent to Ministry of Finance.')}>
                            Export Policy Memo Draft
                          </Button>
                        </div>
                      </div>
                    </GlassCard>
                  )}
                </>
              )}

            </div>
          </main>
        </div>
      )}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-zinc-950 border border-emerald-500/20 px-4 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 shadow-2xl shadow-emerald-500/5 animate-fade-in text-zinc-100">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
          {toastMessage}
        </div>
      )}
    </div>
  );
};
export default App;
