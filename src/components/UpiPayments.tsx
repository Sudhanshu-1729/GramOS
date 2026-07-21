import React, { useState } from 'react';
import GlassCard from './ui/GlassCard';
import Button from './ui/Button';
import { QrCode, ArrowUpRight, CheckCircle2, ShieldCheck, Wallet, RefreshCw, Smartphone, Plus } from 'lucide-react';

export const UpiPayments: React.FC = () => {
  const [qrAmount, setQrAmount] = useState('2,500');
  const [qrPurpose, setQrPurpose] = useState('Milk Supply Batch #90A');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showQrCode, setShowQrCode] = useState(true);
  
  // Sweep-in details
  const [sweepPercentage, setSweepPercentage] = useState(20);
  const [isLinked, setIsLinked] = useState(true);

  // Transactions list
  const [transactions, setTransactions] = useState([
    { id: 'TXN-9024', payer: 'Gokul Milk Coop', vpa: 'gokul@okaxis', amount: '₹34,200', date: 'Today, 10:15 AM', status: 'settled', sweepAmount: '₹6,840' },
    { id: 'TXN-9023', payer: 'Chitale Dairy Collector', vpa: 'chitale@ybl', amount: '₹12,400', date: 'Yesterday, 4:30 PM', status: 'settled', sweepAmount: '₹2,480' },
    { id: 'TXN-9022', payer: 'Direct Retail Tea Shop', vpa: 'laxmitea@paytm', amount: '₹4,500', date: 'July 18, 2026', status: 'settled', sweepAmount: '₹900' },
  ]);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setShowQrCode(true);
    }, 800);
  };

  const handleLinkNewId = () => {
    const vpa = prompt('Enter UPI ID to link (e.g. name@okaxis):');
    if (vpa) {
      alert(`UPI ID "${vpa}" linked and verified with SBI Bank API.`);
    }
  };

  const handleSimulatePayment = () => {
    const rawAmt = Number(qrAmount.replace(/,/g, ''));
    if (isNaN(rawAmt) || rawAmt <= 0) {
      alert('Please enter a valid amount.');
      return;
    }
    
    const newTxn = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      payer: 'Walk-in Retail Buyer',
      vpa: 'retailer@okhdfc',
      amount: `₹${rawAmt.toLocaleString('en-IN')}`,
      date: 'Just Now',
      status: 'settled',
      sweepAmount: `₹${Math.round(rawAmt * (sweepPercentage / 100)).toLocaleString('en-IN')}`
    };

    setTransactions(prev => [newTxn, ...prev]);
    alert(`Payment of ₹${rawAmt.toLocaleString('en-IN')} received. Auto-swept ₹${newTxn.sweepAmount} to SBA term loan account.`);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      
      {/* Dynamic QR Generator Panel */}
      <GlassCard className="xl:col-span-1 p-5 space-y-5" intensity="normal">
        <div className="flex items-center gap-2 text-zinc-200">
          <QrCode size={18} className="text-emerald-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider">Dynamic QR Generator</h3>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold block">Billing Amount (₹)</label>
            <input
              type="text"
              value={qrAmount}
              onChange={(e) => setQrAmount(e.target.value)}
              className="w-full bg-zinc-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-zinc-100"
              placeholder="e.g. 5,000"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold block">Purpose Reference</label>
            <input
              type="text"
              value={qrPurpose}
              onChange={(e) => setQrPurpose(e.target.value)}
              className="w-full bg-zinc-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-zinc-100"
              placeholder="e.g. Fodder Sales"
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" variant="primary" className="flex-1 text-xs" disabled={isGenerating}>
              {isGenerating ? 'Generating...' : 'Refresh QR Code'}
            </Button>
            <Button type="button" variant="outline" className="text-xs" onClick={handleSimulatePayment}>
              Simulate Payout
            </Button>
          </div>
        </form>

        {/* QR Display frosting box */}
        {showQrCode && (
          <div className="flex flex-col items-center justify-center p-6 bg-zinc-950/40 border border-white/5 rounded-2xl relative overflow-hidden">
            {/* High Tech Scan Scanning Lines */}
            <div className="absolute inset-x-0 top-0 h-0.5 bg-emerald-500/50 animate-bounce" />

            {/* Custom SVG QR mockup */}
            <div className="w-40 h-40 bg-white p-3 rounded-xl border border-zinc-200 flex flex-col justify-between items-center relative">
              <svg viewBox="0 0 100 100" className="w-full h-full text-zinc-900">
                {/* QR corner anchors */}
                <rect x="0" y="0" width="25" height="25" fill="currentColor" />
                <rect x="2" y="2" width="21" height="21" fill="white" />
                <rect x="6" y="6" width="13" height="13" fill="currentColor" />
                
                <rect x="75" y="0" width="25" height="25" fill="currentColor" />
                <rect x="77" y="2" width="21" height="21" fill="white" />
                <rect x="81" y="6" width="13" height="13" fill="currentColor" />

                <rect x="0" y="75" width="25" height="25" fill="currentColor" />
                <rect x="2" y="77" width="21" height="21" fill="white" />
                <rect x="6" y="81" width="13" height="13" fill="currentColor" />

                {/* Simulated QR code bits */}
                <path d="M35,10 h10 v10 h-10 Z M55,10 h10 v5 h-10 Z M35,30 h5 v5 h-5 Z M50,30 h15 v5 h-15 Z M30,50 h10 v15 h-10 Z M65,50 h10 v10 h-10 Z M45,65 h15 v5 h-15 Z M70,70 h5 v10 h-5 Z" fill="currentColor" />
                <path d="M40,40 h15 v5 h-15 Z M60,35 h5 v15 h-5 Z M50,60 h5 v5 h-5 Z M65,70 h5 v5 h-5 Z M80,30 h10 v15 h-10 Z M30,80 h10 v10 h-10 Z M45,80 h20 v5 h-20 Z" fill="currentColor" />
                
                {/* Center logo node */}
                <rect x="42" y="42" width="16" height="16" rx="4" fill="white" stroke="#10b981" strokeWidth="2" />
                <text x="50" y="52" fill="#10b981" fontSize="10" fontWeight="bold" textAnchor="middle">₹</text>
              </svg>
            </div>
            
            <div className="text-center mt-3 space-y-1">
              <span className="text-[10px] font-mono text-zinc-500">Scan via BHIM UPI, PhonePe, GPay</span>
              <div className="text-sm font-bold text-zinc-200">Amount: ₹{qrAmount}</div>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Sweep-in & Account Config Panel */}
      <div className="xl:col-span-2 space-y-6">
        
        {/* UPI Auto Sweep Settings */}
        <GlassCard className="p-5 space-y-4" intensity="normal">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-zinc-200">
              <RefreshCw size={18} className="text-emerald-400 animate-spin-slow" />
              <h3 className="text-sm font-bold uppercase tracking-wider">Predictive Loan Repayment Sweep</h3>
            </div>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-bold uppercase">Active</span>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            Link your incoming UPI milk collections directly to your active SBI Term Loan. A custom percentage is auto-swept to pay down outstanding interest, continuously increasing your **AI Credit Score**.
          </p>

          <div className="space-y-4 pt-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-zinc-500">Auto-Sweep Ratio</span>
              <span className="text-emerald-400 font-mono">{sweepPercentage}% of incoming payout</span>
            </div>

            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={sweepPercentage}
                onChange={(e) => setSweepPercentage(Number(e.target.value))}
                className="flex-1 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <span className="text-xs font-mono font-bold text-zinc-300 w-8 text-right">{sweepPercentage}%</span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs pt-2">
              <div className="bg-zinc-900/40 p-3 rounded-xl border border-white/5">
                <span className="text-zinc-500">Linked Bank Acc</span>
                <div className="font-bold text-zinc-200 mt-1 flex items-center gap-1.5">
                  <Wallet size={12} className="text-emerald-400" />
                  State Bank of India (*8920)
                </div>
              </div>
              <div className="bg-zinc-900/40 p-3 rounded-xl border border-white/5">
                <span className="text-zinc-500">Active UPI VPA</span>
                <div className="font-bold text-zinc-200 mt-1 flex items-center gap-1.5">
                  <Smartphone size={12} className="text-emerald-400" />
                  rameshdairy@okaxis
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* UPI Transaction History */}
        <GlassCard className="p-5" intensity="normal">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Recent UPI Payout Settlement Log</h3>
            <span className="text-[10px] text-zinc-500">Auto-split Settlements</span>
          </div>

          <div className="space-y-3">
            {transactions.map((t, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 bg-zinc-900/25 border border-white/[0.03] rounded-xl text-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-emerald-400">
                    <ArrowUpRight size={14} />
                  </div>
                  <div>
                    <span className="font-bold text-zinc-200 block">{t.payer}</span>
                    <span className="text-[9px] text-zinc-500 font-mono">{t.vpa} • {t.date}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-zinc-200">{t.amount}</div>
                  <div className="text-[9px] text-emerald-400 font-semibold mt-0.5">Auto-swept: {t.sweepAmount}</div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

    </div>
  );
};
export default UpiPayments;
