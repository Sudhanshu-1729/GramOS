import React, { useState } from 'react';
import type { CreditMemoData } from '../data/mockData';
import { ShieldAlert, CheckCircle, ArrowLeft, Download, Printer } from 'lucide-react';
import Button from './ui/Button';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface CreditMemoProps {
  memo: CreditMemoData;
  onBack: () => void;
}

export const CreditMemo: React.FC<CreditMemoProps> = ({ memo, onBack }) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      alert(`RuralOS PDF Engine: "${memo.id}.pdf" generated and saved successfully.`);
    }, 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
            background: white !important;
            color: black !important;
          }
          .print-section, .print-section * {
            visibility: visible;
          }
          .print-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            box-shadow: none !important;
            border: none !important;
          }
          .control-bar-memo {
            display: none !important;
          }
        }
      `}</style>

      {/* Control bar */}
      <div className="flex items-center justify-between control-bar-memo">
        <Button onClick={onBack} variant="outline" size="sm" className="gap-2">
          <ArrowLeft size={14} /> Back to Boardroom
        </Button>

        <div className="flex gap-2">
          <Button onClick={handleDownload} variant="primary" size="sm" className="gap-2" disabled={downloading}>
            <Download size={14} /> {downloading ? 'Compiling PDF...' : 'Download PDF'}
          </Button>
          <Button onClick={() => window.print()} variant="outline" size="sm" className="gap-2">
            <Printer size={14} /> Print Memo
          </Button>
        </div>
      </div>

      {/* Official Document Sheet */}
      <div className="bg-white text-zinc-950 p-8 rounded-2xl shadow-xl border border-zinc-200 dark:border-transparent font-sans print-section">
        
        {/* Document Header */}
        <div className="border-b-2 border-zinc-900 pb-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs uppercase tracking-widest font-mono text-zinc-500">Official Credit Memorandum</div>
              <h1 className="text-3xl font-extrabold font-display text-zinc-900 mt-1">RuralOS AI-Credit Engine</h1>
              <p className="text-xs text-zinc-500 font-mono mt-1">Document Reference: {memo.id}</p>
            </div>
            
            <div className="text-right">
              <span className={`inline-block text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${
                memo.recommendation.includes('APPROVED')
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  : 'bg-red-100 text-red-800 border-red-200'
              }`}>
                {memo.recommendation}
              </span>
              <div className="text-xs text-zinc-500 mt-2 font-mono">Evaluation Date: {memo.date}</div>
            </div>
          </div>
        </div>

        {/* Fact Sheet Metadata */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-b border-zinc-200 text-xs">
          <div>
            <span className="text-zinc-500 uppercase font-semibold">Borrower Name</span>
            <div className="font-bold text-zinc-900 mt-1">{memo.borrower}</div>
          </div>
          <div>
            <span className="text-zinc-500 uppercase font-semibold">Enterprise Entity</span>
            <div className="font-bold text-zinc-900 mt-1">{memo.business}</div>
          </div>
          <div>
            <span className="text-zinc-500 uppercase font-semibold">Proposed Credit Line</span>
            <div className="font-bold text-zinc-900 mt-1">{memo.proposedLoan}</div>
          </div>
          <div>
            <span className="text-zinc-500 uppercase font-semibold">Geography</span>
            <div className="font-bold text-zinc-900 mt-1">{memo.district}, {memo.state}</div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="py-6 border-b border-zinc-200">
          <h3 className="text-xs uppercase font-bold tracking-wider text-zinc-500 mb-2">1. Executive Appraisal Summary</h3>
          <p className="text-xs text-zinc-800 leading-relaxed font-sans">
            {memo.executiveSummary}
          </p>
        </div>

        {/* Financial Metrics and Ratios */}
        <div className="py-6 border-b border-zinc-200">
          <h3 className="text-xs uppercase font-bold tracking-wider text-zinc-500 mb-3">2. Financial Metrics &amp; Coverage Ratios</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-zinc-50 p-4 rounded-xl border border-zinc-150">
            <div>
              <span className="text-[10px] text-zinc-500 font-semibold block">Debt Service Coverage (DSCR)</span>
              <span className={`text-sm font-bold font-mono mt-1 block ${
                memo.recommendation.includes('APPROVED') ? 'text-emerald-800' : 'text-red-800'
              }`}>{memo.financialAnalysis.dscr}</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 font-semibold block">Debt to Equity</span>
              <span className="text-sm font-bold text-zinc-800 font-mono mt-1 block">{memo.financialAnalysis.debtEquity}</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 font-semibold block">Net Margin</span>
              <span className="text-sm font-bold text-zinc-800 font-mono mt-1 block">{memo.financialAnalysis.netMargin}</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 font-semibold block">Reported Revenue</span>
              <span className="text-sm font-bold text-zinc-800 font-mono mt-1 block">{memo.financialAnalysis.annualRevenue}</span>
            </div>
          </div>
        </div>

        {/* Risk Appraisal and Mitigations */}
        <div className="py-6 border-b border-zinc-200">
          <h3 className="text-xs uppercase font-bold tracking-wider text-zinc-500 mb-3">3. Risk Identification &amp; Mitigations</h3>
          <div className="space-y-3">
            {memo.riskFactors.map((rf, idx) => (
              <div key={idx} className="flex items-start gap-3 bg-zinc-50/40 p-3 rounded-lg border border-zinc-150">
                <ShieldAlert size={14} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-zinc-900 block">{rf.factor}</span>
                  <p className="text-zinc-600 mt-0.5 leading-relaxed">{rf.mitigation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5 Year Cashflow Projections */}
        <div className="py-6 border-b border-zinc-200">
          <h3 className="text-xs uppercase font-bold tracking-wider text-zinc-500 mb-3">4. 5-Year Cashflow Forecast (₹ Lakhs)</h3>
          <div className="h-[180px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={memo.forecastData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid stroke="#e4e4e7" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="year" stroke="#71717a" fontSize={9} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={9} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#1c1917" strokeWidth={1.5} fillOpacity={0.05} fill="#1c1917" />
                <Area type="monotone" dataKey="cashflow" name="Net Surplus" stroke={memo.recommendation.includes('APPROVED') ? '#059669' : '#dc2626'} strokeWidth={1.5} fillOpacity={0.1} fill={memo.recommendation.includes('APPROVED') ? '#059669' : '#dc2626'} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Consolidated Consensus */}
        <div className="pt-6">
          <div className="flex flex-col md:flex-row md:justify-between items-start md:items-end gap-6">
            <div className="flex items-center gap-2">
              <CheckCircle size={18} className="text-emerald-600" />
              <div className="text-xs">
                <span className="font-bold text-zinc-900 block">AI Verification Consolidated</span>
                <span className="text-zinc-500">Boardroom Consensus at {memo.aiConfidence} confidence</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 text-xs text-center border-t border-zinc-200 pt-4 w-full md:w-auto">
              <div className="px-4">
                <div className="italic font-serif text-zinc-700">RuralOS_System</div>
                <div className="h-0.5 bg-zinc-200 w-24 mx-auto my-1" />
                <span className="text-[9px] text-zinc-400 font-mono">Consensus Audit Key</span>
              </div>
              <div className="px-4">
                <div className="italic font-serif text-zinc-700">Bank_Manager</div>
                <div className="h-0.5 bg-zinc-200 w-24 mx-auto my-1" />
                <span className="text-[9px] text-zinc-400 font-mono">Authorized Signatory</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
export default CreditMemo;
