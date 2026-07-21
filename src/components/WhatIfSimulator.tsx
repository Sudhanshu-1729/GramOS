import React, { useState, useEffect } from 'react';
import GlassCard from './ui/GlassCard';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { Sliders, Bot, ShieldCheck, ShieldAlert } from 'lucide-react';
import * as api from '../services/api';

interface WhatIfSimulatorProps {
  businessId?: string;
  isBackendOnline?: boolean;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  businessId = '00000000-0000-0000-0000-000000000001',
  isBackendOnline = false
}) => {
  // Simulator Parameters
  const [loanAmount, setLoanAmount] = useState(500000);
  const [rainfall, setRainfall] = useState(0); // % change from normal
  const [milkPrice, setMilkPrice] = useState(42); // ₹ per litre
  const [feedInflation, setFeedInflation] = useState(5); // % inflation rate
  const [herdSize, setHerdSize] = useState(45);
  const [retailShare, setRetailShare] = useState(20); // % sold directly to retail
  const [otherExpenses, setOtherExpenses] = useState(45000);
  const [hasSubvention, setHasSubvention] = useState(true);

  // API stress test state
  const [apiSimData, setApiSimData] = useState<any>(null);
  const [isLoadingSim, setIsLoadingSim] = useState(false);


  // Recalculated Output Metrics
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [monthlySurplus, setMonthlySurplus] = useState(0);
  const [dscr, setDscr] = useState(0);
  const [defaultRisk, setDefaultRisk] = useState(0);
  const [simulatedCreditScore, setSimulatedCreditScore] = useState(720);

  // Recalculate function
  useEffect(() => {
    // 1. Calculate Daily Milk Yield (avg 12 litres per cow per day)
    const dailyProduction = herdSize * 12;
    // Price premium for direct retail: ₹15 extra per litre
    const retailPrice = milkPrice + 15;
    
    // Average monthly revenue: cooperative + retail
    const monthlyCoopVol = dailyProduction * 30 * (1 - retailShare / 100);
    const monthlyRetailVol = dailyProduction * 30 * (retailShare / 100);
    
    // Climate impact factor on production (dry weather drops yield by up to 20%)
    const climateProductionFactor = rainfall < 0 ? (1 + (rainfall / 100) * 0.3) : (1 + (rainfall / 100) * 0.05);
    
    const calculatedRevenue = (
      (monthlyCoopVol * milkPrice) + (monthlyRetailVol * retailPrice)
    ) * climateProductionFactor;

    // 2. Feed Costs (base ₹2,200 per cow per month)
    // Dry weather increases feed cost by 35% due to green fodder scarcity
    const weatherFeedImpact = rainfall < 0 ? (1 + (rainfall / -100) * 0.4) : (1 - (rainfall / 100) * 0.1);
    const baseFeedCost = herdSize * 2400 * (1 + feedInflation / 100) * weatherFeedImpact;
    
    // Monthly Debt EMI (simple interest calculation for dashboard)
    const rate = hasSubvention ? 0.085 : 0.115; // 8.5% with subsidy vs 11.5% market rate
    const yearlyEmi = (loanAmount * rate) + (loanAmount / 5); // 5 year term amortized
    const monthlyEmi = yearlyEmi / 12;

    const calculatedExpenses = baseFeedCost + otherExpenses + monthlyEmi;
    const calculatedSurplus = calculatedRevenue - calculatedExpenses;

    // Debt Service Coverage Ratio
    const calculatedDscr = monthlyEmi > 0 ? (calculatedSurplus + monthlyEmi) / monthlyEmi : 5;

    // Default Risk (0% to 100%)
    let riskFactor = 15; // base risk
    if (calculatedDscr < 1.0) riskFactor += 50;
    else if (calculatedDscr < 1.3) riskFactor += 25;
    else if (calculatedDscr < 1.8) riskFactor += 10;
    
    if (rainfall < -15) riskFactor += 15;
    if (feedInflation > 15) riskFactor += 10;
    if (loanAmount > 700000) riskFactor += 10;
    
    // Direct retail buffers risk
    riskFactor = Math.max(2, Math.min(98, riskFactor - (retailShare * 0.15)));

    // Credit score adjustments
    let score = 750 + (calculatedSurplus > 80000 ? 40 : calculatedSurplus > 40000 ? 15 : -30);
    score = score + (rainfall < -10 ? -25 : 15);
    score = score - (riskFactor * 1.5);
    score = Math.max(300, Math.min(900, Math.round(score)));

    setMonthlyRevenue(Math.round(calculatedRevenue));
    setMonthlyExpenses(Math.round(calculatedExpenses));
    setMonthlySurplus(Math.round(calculatedSurplus));
    setDscr(Math.round(calculatedDscr * 100) / 100);
    setDefaultRisk(Math.round(riskFactor));
    setSimulatedCreditScore(score);
  }, [loanAmount, rainfall, milkPrice, feedInflation, herdSize, retailShare, otherExpenses, hasSubvention]);

  // Trigger simulation call when variables shift
  useEffect(() => {
    if (!isBackendOnline) {
      setApiSimData(null);
      return;
    }

    const runSim = async () => {
      setIsLoadingSim(true);
      try {
        const response = await api.runSimulation(businessId, {
          rainfall_change_percent: rainfall,
          mandi_price_change_percent: (milkPrice - 42) * 2.3, // map change relative to base (42)
          loan_applied_amount: loanAmount,
          interest_rate_percent: hasSubvention ? 8.5 : 11.5,
          subsidy_amount: hasSubvention ? loanAmount * 0.03 : 0.0,
          inventory_change_percent: (herdSize - 45) * 2,
        });
        if (response) {
          setApiSimData(response);
        }
      } catch (e) {
        console.warn("Simulation call failed:", e);
      } finally {
        setIsLoadingSim(false);
      }
    };

    const timer = setTimeout(runSim, 450);
    return () => clearTimeout(timer);
  }, [businessId, isBackendOnline, rainfall, milkPrice, loanAmount, herdSize, hasSubvention]);

  // Sync simulation outputs when apiSimData is loaded
  useEffect(() => {
    if (apiSimData) {
      setMonthlySurplus(Math.round(apiSimData.simulated_net_cash_flow_30d));
      const baseRev = monthlyRevenue || 180000;
      const ratio = apiSimData.simulated_net_cash_flow_30d / (apiSimData.original_net_cash_flow_30d || 1.0);
      setMonthlyRevenue(Math.round(baseRev * (ratio > 0 ? Math.min(1.4, ratio) : 0.8)));
      setMonthlyExpenses(Math.round(baseRev * (ratio > 0 ? Math.min(1.4, ratio) : 0.8) - apiSimData.simulated_net_cash_flow_30d));
      
      const parsedDscr = apiSimData.simulated_net_cash_flow_30d > 0 ? (apiSimData.simulated_net_cash_flow_30d + 20000) / 20000 : 0.85;
      setDscr(Math.round(parsedDscr * 100) / 100);
      
      const prob = apiSimData.simulated_risk_level === 'LOW' ? 8 : apiSimData.simulated_risk_level === 'MEDIUM' ? 24 : apiSimData.simulated_risk_level === 'HIGH' ? 45 : 78;
      setDefaultRisk(prob);
      
      setSimulatedCreditScore(Math.round(300 + (apiSimData.simulated_health_score / 100) * 600));
    }
  }, [apiSimData]);


  // Generate 5-year forecast array based on current parameters
  const getForecastData = () => {
    const years = ['Yr 1', 'Yr 2', 'Yr 3', 'Yr 4', 'Yr 5'];
    let currentRev = monthlyRevenue * 12;
    let currentExp = monthlyExpenses * 12;
    
    return years.map((y, idx) => {
      // compound annual growth rates (CAGR)
      const growthRate = 0.08 + (retailShare * 0.001); // direct marketing compounds growth
      const expenseInflation = 0.05 + (feedInflation * 0.001);

      currentRev = currentRev * (1 + growthRate);
      currentExp = currentExp * (1 + expenseInflation);
      
      return {
        year: y,
        Revenue: Math.round(currentRev / 100000), // in Lakhs
        Expenses: Math.round(currentExp / 100000),
        Cashflow: Math.round((currentRev - currentExp) / 100000)
      };
    });
  };

  const formattedLakhs = (val: number) => {
    return `₹${(val / 100000).toFixed(2)}L`;
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Slider Controls */}
      <GlassCard className="xl:col-span-1 p-5 space-y-5" intensity="normal">
        <div className="flex items-center justify-between w-full mb-2">
          <div className="flex items-center gap-2 text-zinc-200">
            <Sliders size={18} className="text-emerald-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Simulation Variables</h3>
          </div>
          {isLoadingSim && (
            <span className="text-[9px] font-mono text-emerald-400 animate-pulse uppercase">● recalculating...</span>
          )}
        </div>

        {/* Loan Amount */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-400">Term Loan Amount</span>
            <span className="font-mono font-bold text-zinc-100">{formattedLakhs(loanAmount)}</span>
          </div>
          <input
            type="range"
            min="100000"
            max="1000000"
            step="50000"
            value={loanAmount}
            onChange={(e) => setLoanAmount(Number(e.target.value))}
            className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>

        {/* Herd Size */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-400">Herd Size (Cows)</span>
            <span className="font-mono font-bold text-zinc-100">{herdSize} Head</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            step="5"
            value={herdSize}
            onChange={(e) => setHerdSize(Number(e.target.value))}
            className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>

        {/* Rainfall */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-400">Rainfall Variance</span>
            <span className={`font-mono font-bold ${
              rainfall < 0 ? 'text-rose-400' : rainfall > 0 ? 'text-emerald-400' : 'text-zinc-100'
            }`}>
              {rainfall > 0 ? `+${rainfall}%` : `${rainfall}%`} {rainfall < 0 ? '(Deficit)' : rainfall > 0 ? '(Surplus)' : '(Normal)'}
            </span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            step="5"
            value={rainfall}
            onChange={(e) => setRainfall(Number(e.target.value))}
            className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>

        {/* Milk Price */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-400">Base Milk Price (Cooperative)</span>
            <span className="font-mono font-bold text-zinc-100">₹{milkPrice}/Litre</span>
          </div>
          <input
            type="range"
            min="30"
            max="60"
            step="1"
            value={milkPrice}
            onChange={(e) => setMilkPrice(Number(e.target.value))}
            className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>

        {/* Feed Cost Inflation */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-400">Cattle Feed Inflation</span>
            <span className={`font-mono font-bold ${feedInflation > 15 ? 'text-red-400' : 'text-zinc-100'}`}>
              {feedInflation}% p.a.
            </span>
          </div>
          <input
            type="range"
            min="-10"
            max="30"
            step="2"
            value={feedInflation}
            onChange={(e) => setFeedInflation(Number(e.target.value))}
            className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>

        {/* Direct Retail Share */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-400">Direct Retail Route</span>
            <span className="font-mono font-bold text-zinc-100">{retailShare}% sales volume</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={retailShare}
            onChange={(e) => setRetailShare(Number(e.target.value))}
            className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>

        {/* Subsidized Scheme Switcher */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <span className="text-xs text-zinc-400">Apply NABARD AHIDF Subvention (3%)</span>
          <button
            onClick={() => setHasSubvention(!hasSubvention)}
            className={`
              w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none
              ${hasSubvention ? 'bg-emerald-600' : 'bg-zinc-800'}
            `}
          >
            <div className={`
              w-4 h-4 rounded-full bg-white transition-transform duration-200
              ${hasSubvention ? 'translate-x-6' : 'translate-x-0'}
            `} />
          </button>
        </div>
      </GlassCard>

      {/* Recalculated Dashboard Outputs */}
      <div className="xl:col-span-2 space-y-6">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Cashflow card */}
          <GlassCard className="p-4 border-white/[0.04]" intensity="normal">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Net Cashflow / mo</div>
            <div className={`text-xl font-bold mt-2 font-mono ${
              monthlySurplus > 40000 ? 'text-emerald-400' : monthlySurplus > 10000 ? 'text-zinc-100' : 'text-rose-400'
            }`}>
              ₹{monthlySurplus.toLocaleString('en-IN')}
            </div>
            <div className="text-[9px] text-zinc-500 mt-1">Revenues - Operating - Debt EMI</div>
          </GlassCard>

          {/* DSCR card */}
          <GlassCard className="p-4 border-white/[0.04]" intensity="normal">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">DSCR Coverage</div>
            <div className={`text-xl font-bold mt-2 font-mono ${
              dscr > 1.75 ? 'text-emerald-400' : dscr > 1.25 ? 'text-zinc-100' : 'text-rose-400'
            }`}>
              {dscr}x
            </div>
            <div className="text-[9px] text-zinc-500 mt-1">Threshold: &gt;1.25x required</div>
          </GlassCard>

          {/* Probability of Default */}
          <GlassCard className="p-4 border-white/[0.04]" intensity="normal">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Default Risk (PD)</div>
            <div className={`text-xl font-bold mt-2 font-mono ${
              defaultRisk > 40 ? 'text-rose-400' : defaultRisk > 15 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {defaultRisk}%
            </div>
            <div className="text-[9px] text-zinc-500 mt-1">AI calculated default index</div>
          </GlassCard>

          {/* Credit Score */}
          <GlassCard className="p-4 border-white/[0.04]" intensity="normal">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">AI Credit Score</div>
            <div className={`text-xl font-bold mt-2 font-mono ${
              simulatedCreditScore > 750 ? 'text-emerald-400' : simulatedCreditScore > 650 ? 'text-zinc-100' : 'text-rose-400'
            }`}>
              {simulatedCreditScore}
            </div>
            <div className="text-[9px] text-zinc-500 mt-1">Alternate cashflow scoring</div>
          </GlassCard>
        </div>

        {/* Recharts dynamic 5 Year Forecast */}
        <GlassCard className="p-5 border-white/[0.04]" intensity="normal">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">5-Year Growth Outlook (₹ Lakhs)</h4>
            <div className="text-[10px] text-zinc-500">Compounded with variables</div>
          </div>
          
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={getForecastData()} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="simRevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="simSurGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="year" stroke="#71717a" fontSize={10} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                  labelStyle={{ color: '#a1a1aa', fontSize: '11px', fontWeight: 'bold' }}
                />
                <Legend iconType="circle" fontSize={10} wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="Revenue" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#simRevGrad)" />
                <Area type="monotone" dataKey="Cashflow" name="Net Surplus" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#simSurGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
export default WhatIfSimulator;
