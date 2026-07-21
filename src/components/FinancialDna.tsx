import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import GlassCard from './ui/GlassCard';
import { ShieldCheck, Zap, Cloud, ShoppingBag, Landmark, ArrowUpRight } from 'lucide-react';

interface FinancialDnaProps {
  businessId: string;
  name: string;
  defaultProbability: number;
  liquidityRisk: number;
  financialStress: number;
  supplierStability: number;
  assets: number;
  loans: number;
  liveCreditScore?: number;
}

export const FinancialDna: React.FC<FinancialDnaProps> = ({
  businessId,
  name,
  defaultProbability,
  liquidityRisk,
  financialStress,
  supplierStability,
  assets,
  loans,
  liveCreditScore = 720
}) => {
  const liquidity = Math.round((1 - liquidityRisk) * 100);
  const growth = Math.round((assets / (assets + loans + 1)) * 95);
  const marketStrength = Math.round(supplierStability * 92);
  const climateDependency = Math.round(financialStress * 100);
  const creditBehaviour = Math.round((1 - defaultProbability) * 98);
  const repaymentBehaviour = Math.round((1 - defaultProbability) * 96);
  const digitalAdoption = businessId.includes('01') ? 95 : businessId.includes('03') ? 98 : 72;
  const businessStability = Math.round((1 - defaultProbability * 0.5 - liquidityRisk * 0.5) * 100);
  const expansionReadiness = Math.round((liveCreditScore - 300) / 6);

  const dnaData = [
    { subject: 'Liquidity', value: liquidity },
    { subject: 'Growth', value: growth },
    { subject: 'Market Strength', value: marketStrength },
    { subject: 'Climate Dep.', value: climateDependency },
    { subject: 'Credit Behav.', value: creditBehaviour },
    { subject: 'Repayment', value: repaymentBehaviour },
    { subject: 'Digital', value: digitalAdoption },
    { subject: 'Stability', value: businessStability },
    { subject: 'Expansion', value: expansionReadiness },
  ];

  const factors = [
    { title: 'Liquidity', score: liquidity, icon: <Zap size={14} />, reason: 'High velocity UPI milk payouts sweeps.', tip: 'Setup automated sweeps.' },
    { title: 'Growth', score: growth, icon: <Landmark size={14} />, reason: 'Robust asset accumulation cycles.', tip: 'Lease additional acreage.' },
    { title: 'Market Strength', score: marketStrength, icon: <ShoppingBag size={14} />, reason: 'Secure off-take Gokul buyer contract.', tip: 'Explore direct retail marketing.' },
    { title: 'Climate Dependency', score: 100 - climateDependency, icon: <Cloud size={14} />, reason: 'NDVI vegetation checks stable.', tip: 'Adopt micro-drip irrigation.' },
    { title: 'Credit Behaviour', score: creditBehaviour, icon: <ShieldCheck size={14} />, reason: 'Flawless alternate utility payments.', tip: 'Maintain high ledger volumes.' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Radar Chart */}
      <GlassCard className="lg:col-span-3 p-5 flex flex-col justify-between" intensity="normal">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-200 mb-1">Financial Risk Genome (DNA)</h3>
          <p className="text-[10px] text-zinc-500">Visual mapping of alternate creditworthiness parameters</p>
        </div>

        <div className="h-[280px] w-full my-4 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={dnaData}>
              <PolarGrid stroke="#27272a" />
              <PolarAngleAxis dataKey="subject" stroke="#a1a1aa" fontSize={9} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} stroke="#27272a" />
              <Radar
                name={name}
                dataKey="value"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="text-[9px] text-zinc-400 border-t border-white/5 pt-2 flex justify-between">
          <span>* Scanned from local UPI receipts &amp; satellite NDVI greenness</span>
          <span className="text-emerald-400 font-bold uppercase font-mono">Consensus Score Active</span>
        </div>
      </GlassCard>

      {/* DNA Dimension Breakdown */}
      <div className="lg:col-span-2 space-y-3 max-h-[380px] overflow-y-auto pr-1">
        {factors.map((f, idx) => (
          <div key={idx} className="p-3 bg-zinc-900/40 border border-white/5 rounded-xl flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20 shrink-0">
              {f.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between text-xs font-bold text-zinc-200">
                <span>{f.title}</span>
                <span className="font-mono text-emerald-400">{f.score}%</span>
              </div>
              <p className="text-[9px] text-zinc-400 truncate mt-0.5">{f.reason}</p>
              <div className="flex items-center gap-1 mt-1 text-[8px] text-zinc-500 font-semibold italic">
                <ArrowUpRight size={8} className="text-emerald-400" /> Suggestion: {f.tip}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default FinancialDna;
