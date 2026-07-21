// Rich mock database supporting multiple applicant profiles and interactive dashboards

export interface BusinessNode {
  id: string;
  label: string;
  type: 'asset' | 'liability' | 'revenue' | 'supplier' | 'customer' | 'risk';
  value: string;
  trend?: string;
  status?: 'healthy' | 'warning' | 'critical';
  details: string;
  x: number;
  y: number;
}

export interface AiAgent {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: 'analyzing' | 'approved' | 'escalated' | 'ready';
  confidence: number;
  reasoning: string;
  evidence: string;
  recommendation: string;
}

export interface CreditMemoData {
  id: string;
  date: string;
  borrower: string;
  business: string;
  district: string;
  state: string;
  proposedLoan: string;
  purpose: string;
  aiConfidence: string;
  riskRating: string;
  recommendation: string;
  executiveSummary: string;
  financialAnalysis: {
    dscr: string;
    debtEquity: string;
    netMargin: string;
    annualRevenue: string;
    annualSurplus: string;
  };
  riskFactors: { factor: string; mitigation: string }[];
  forecastData: { year: string; revenue: number; expenses: number; cashflow: number }[];
}

export interface CreditProfile {
  id: string;
  name: string;
  sector: string;
  location: string;
  loanAmount: string;
  dscr: string;
  creditScore: number;
  riskRating: string;
  status: string;
  nodes: BusinessNode[];
  connections: { from: string; to: string }[];
  agents: AiAgent[];
  debate: { agent: string; text: string }[];
  memo: CreditMemoData;
}

export const creditProfiles: CreditProfile[] = [
  // PROFILE 1: RAMESH KUMAR (DAIRY FARM - LOW-MEDIUM RISK)
  {
    id: 'ramesh',
    name: 'Ramesh Kumar',
    sector: 'Dairy & Husbandry',
    location: 'Pune, Maharashtra',
    loanAmount: '₹5,00,000',
    dscr: '1.82x',
    creditScore: 785,
    riskRating: 'Low-Medium',
    status: 'Consensus Approved',
    nodes: [
      { id: 'twin-root', label: 'Ramesh Dairy Farm', type: 'asset', value: 'Valuation: ₹24.5L', status: 'healthy', details: 'Core dairy farm. Pune, Maharashtra. Operating 45 hybrid cows.', x: 400, y: 250 },
      { id: 'asset-cows', label: 'Hybrid Cows (45)', type: 'asset', value: '₹14.2L', status: 'healthy', details: 'High-yield crossbreeds with RFID livestock tags active.', x: 250, y: 150 },
      { id: 'asset-chilling', label: 'Bulk Milk Chiller', type: 'asset', value: '₹4.5L', status: 'healthy', details: '1000-liter grid-connected chilling unit with diesel generator backup.', x: 200, y: 260 },
      { id: 'asset-land', label: 'Leased Land (5 Ac)', type: 'asset', value: '₹3.0L/yr', status: 'healthy', details: 'Fodder cultivation plots under 7-year long lease.', x: 270, y: 370 },
      { id: 'liab-kcc', label: 'KCC Crop Loan', type: 'liability', value: '₹1.5L', status: 'warning', details: 'Active Kisan Credit Card loan with SBI. Repayment due in 4 months.', x: 550, y: 140 },
      { id: 'liab-term', label: 'Milking Term Loan', type: 'liability', value: '₹3.2L', status: 'healthy', details: 'Milking equipment term loan balance. Consistent EMI repayment.', x: 600, y: 240 },
      { id: 'rev-coop', label: 'Cooperative Milk Sales', type: 'revenue', value: '₹1.8L/mo', status: 'healthy', details: 'Fortnightly deposits from Gokul Dairy Cooperative.', x: 520, y: 360 },
      { id: 'rev-retail', label: 'Direct Retail Sales', type: 'revenue', value: '₹45K/mo', status: 'healthy', details: 'Delivery of branded A2 milk packets directly to nearby tea shops.', x: 450, y: 440 },
      { id: 'sup-feed', label: 'Kamdhenu Cattle Feed', type: 'supplier', value: '₹95K/mo', status: 'warning', details: 'Main compound feed supplier. Feed price index inflated by 12% in Q2.', x: 120, y: 180 },
      { id: 'cust-gokul', label: 'Gokul Coop Society', type: 'customer', value: '80% volume', status: 'healthy', details: 'Off-take buyer society. Payments go directly to linked SBI bank account.', x: 680, y: 370 },
      { id: 'risk-monsoon', label: 'Monsoon Delay Risk', type: 'risk', value: 'Moderate', status: 'warning', details: 'Late rains could raise feed cost by 20% due to local dry grass deficits.', x: 500, y: 50 }
    ],
    connections: [
      { from: 'twin-root', to: 'asset-cows' },
      { from: 'twin-root', to: 'asset-chilling' },
      { from: 'twin-root', to: 'asset-land' },
      { from: 'twin-root', to: 'liab-kcc' },
      { from: 'twin-root', to: 'liab-term' },
      { from: 'twin-root', to: 'rev-coop' },
      { from: 'twin-root', to: 'rev-retail' },
      { from: 'asset-cows', to: 'sup-feed' },
      { from: 'rev-coop', to: 'cust-gokul' },
      { from: 'risk-monsoon', to: 'twin-root' }
    ],
    agents: [
      { id: 'cfo', name: 'CFO Agent', role: 'Financial Analysis', avatar: '💼', status: 'approved', confidence: 94, reasoning: 'Debt Service Coverage Ratio (DSCR) is solid at 1.82x. Net profit margin is resilient at 24% despite feed cost spikes. Project IRR is projected at 22% over 5 years.', evidence: 'Verifiable milk ledger deposits match bank statement cash inflows with 99.4% precision.', recommendation: 'Approve term loan of ₹5,00,000. Structure monthly repayments with a 3-month moratorium.' },
      { id: 'credit', name: 'Credit Officer', role: 'Credit Risk Scoring', avatar: '📊', status: 'approved', confidence: 92, reasoning: 'Alternative AI credit score calculated at 785/900. Repayment history on previous equipment loan is pristine (100% on-time EMI). Collateral coverage is sufficient.', evidence: 'CIBIL score is 710, but cashflow-based behavioral scoring adjusts it upwards.', recommendation: 'Authorize standard pricing tier. Waive security deposit requirements under CGTMSE.' },
      { id: 'risk', name: 'Risk Officer', role: 'Operational Risk & KYC', avatar: '🛡️', status: 'approved', confidence: 89, reasoning: 'Identity, business registry, and land lease verify successfully. No litigation flags found in local district court registries.', evidence: 'Geotagged site photos verify 45 cattle units and chilling equipment on-site.', recommendation: 'Approve subject to quarterly veterinary auditor visits and chiller telemetry checkups.' },
      { id: 'climate', name: 'Climate Analyst', role: 'Environmental Risk', avatar: '🌦️', status: 'approved', confidence: 85, reasoning: 'Pune region is showing moderate rainfall deficits, but applicant has dedicated fodder irrigation from solar borewells.', evidence: 'Sentinel-2 NDVI satellite indices confirm high crop health on fodder lease plots.', recommendation: 'Require mandatory livestock climate insurance (already bundled in the loan package).' },
      { id: 'market', name: 'Market Analyst', role: 'Commodity Prices', avatar: '📈', status: 'approved', confidence: 91, reasoning: 'State dairy cooperative has announced a support price hike of ₹2/litre. Urban direct delivery demand is expanding at 15% YoY.', evidence: 'Wholesale local market milk prices rose from ₹38/L to ₹42/L over the last two quarters.', recommendation: 'Approve, leveraging the fixed off-take price contract with Gokul Coop.' },
      { id: 'fraud', name: 'Fraud Investigator', role: 'Authenticity Check', avatar: '🔍', status: 'ready', confidence: 98, reasoning: 'Biometric verification of borrower matches Aadhaar. Livestock tags match national NDDB records.', evidence: 'Zero match in local blacklists or cooperative loan default registries.', recommendation: 'Zero risk of identity fraud. Disbursal coordinates are clear.' },
      { id: 'scheme', name: 'Scheme Advisor', role: 'Government Subsidies', avatar: '🏛️', status: 'ready', confidence: 95, reasoning: 'Applicant is eligible for the Animal Husbandry Infrastructure Development Fund (AHIDF) which offers a 3% interest subvention.', evidence: 'Scheme criteria matches dairy development entrepreneur category.', recommendation: 'Route application through AHIDF portal to reduce borrower interest rate from 11.5% to 8.5%.' },
      { id: 'planner', name: 'Financial Planner', role: 'Personal Wealth & Goals', avatar: '🎯', status: 'ready', confidence: 88, reasoning: 'Household debt-to-income ratio is stable at 38%. Emergency savings reserve is active (₹75,000 in fixed deposit).', evidence: 'Cooperative deposits display a consistent savings rate of 12% over 18 months.', recommendation: 'Structure an automatic Sweep-in deposit on Gokul payment dates.' },
      { id: 'doc', name: 'Doc Verification', role: 'OCR Document Agent', avatar: '📄', status: 'approved', confidence: 97, reasoning: 'Milk ledger records, tax reports, utility bills, and veterinary certificates have been parsed. Document clarity was 98.6%.', evidence: 'Digital signature on cooperative statement matches Gokul society official key.', recommendation: 'All core documentation verified. Metadata pushed to credit registry.' },
      { id: 'growth', name: 'Growth Advisor', role: 'Business Expansion', avatar: '🚀', status: 'ready', confidence: 86, reasoning: 'Post-loan herd expansion (adding 10 cows) will push chiller utilization to 85%, maximizing equipment ROI.', evidence: 'Local cooperative capacity allows additional daily supply intake of up to 400 litres.', recommendation: 'Recommend approval. Borrower should pursue direct market milk delivery to capture premium margins.' }
    ],
    debate: [
      { agent: 'doc', text: 'Parsed all uploaded documents. Milk cooperative slips match 18-month bank statements. KYC verified. 97% OCR confidence.' },
      { agent: 'cfo', text: 'Cashflows look resilient. Average monthly surplus is ₹85,000. Debt Service Coverage Ratio is 1.82x, which easily supports the proposed term loan.' },
      { agent: 'climate', text: 'Checked local satellite radar. Although Pune has dry pockets, Ramesh has solar borewell irrigation. Fodder cultivation indices look healthy.' },
      { agent: 'risk', text: 'Geotags check out. Real-time cows counts verified. My concern was cattle health, but veterinary certificates indicate full vaccination compliance.' },
      { agent: 'fraud', text: 'No duplicate loans found. Aadhaar biometric matches NDDB database registry. Zero fraud flags.' },
      { agent: 'market', text: 'Local demand is high. Cooperative off-take price is locked at ₹41/litre. Fodder inflation has cooled by 4%.' },
      { agent: 'scheme', text: 'We should apply the AHIDF interest subvention. It cuts the net interest rate to 8.5%, saving Ramesh ₹42,000 over the loan tenure.' },
      { agent: 'credit', text: 'With the subvention, credit score improves further. Cashflow risk is minimal. I recommend Approval of ₹5,00,000 with a 3-month moratorium.' }
    ],
    memo: {
      id: "MEMO-2026-8942",
      date: "July 20, 2026",
      borrower: "Ramesh Kumar",
      business: "Ramesh Dairy & Fodder Farm",
      district: "Pune",
      state: "Maharashtra",
      proposedLoan: "₹5,00,000",
      purpose: "Purchase of 10 hybrid cows and automatic milking equipment",
      aiConfidence: "93%",
      riskRating: "Low-Medium",
      recommendation: "APPROVED WITH INTEREST SUBVENTION",
      executiveSummary: "Applicant Ramesh Kumar operates an established dairy enterprise with 45 cattle and bulk chilling capacity. He is requesting a term loan of ₹5.00L to expand herd size. Alternative AI scoring and cashflow analysis indicate robust liquidity and stable margins, with strong off-take security through Gokul cooperative contract.",
      financialAnalysis: {
        dscr: "1.82x (Threshold > 1.25x)",
        debtEquity: "0.22x",
        netMargin: "24.1%",
        annualRevenue: "₹27,00,000",
        annualSurplus: "₹6,80,000"
      },
      riskFactors: [
        { factor: "Cattle Disease", mitigation: "Comprehensive cattle insurance bundled. Full vaccination schedule certified by local veterinary agency." },
        { factor: "Monsoon Deficit", mitigation: "Solar powered borewell and drip irrigation system covers fodder acreage." },
        { factor: "Feed Cost Inflation", mitigation: "Long-term lease on fodder land allows 70% self-reliance on green feeds." }
      ],
      forecastData: [
        { year: 'Yr 1', revenue: 22.1, expenses: 16.8, cashflow: 5.3 },
        { year: 'Yr 2', revenue: 27.0, expenses: 20.2, cashflow: 6.8 },
        { year: 'Yr 3', revenue: 32.5, expenses: 23.4, cashflow: 9.1 },
        { year: 'Yr 4', revenue: 35.0, expenses: 24.8, cashflow: 10.2 },
        { year: 'Yr 5', revenue: 38.0, expenses: 26.5, cashflow: 11.5 },
      ]
    }
  },

  // PROFILE 2: SUNITA DEVI (ORGANIC WHEAT FARM - CRITICAL RECONCILIATION RISK)
  {
    id: 'sunita',
    name: 'Sunita Devi',
    sector: 'Organic Wheat Farming',
    location: 'Churu, Rajasthan',
    loanAmount: '₹3,00,000',
    dscr: '1.08x',
    creditScore: 610,
    riskRating: 'High (Climate Distress)',
    status: 'Escalated / Moratorium Requested',
    nodes: [
      { id: 'twin-root', label: 'Sunita Agro Farm', type: 'asset', value: 'Valuation: ₹8.2L', status: 'critical', details: 'Wheat crop farming. Located in Churu, Rajasthan. High soil moisture deficits.', x: 400, y: 250 },
      { id: 'asset-fields', label: 'Wheat Fields (3 Ac)', type: 'asset', value: '₹5.5L', status: 'warning', details: 'Owned rain-fed crop fields. No river canal connections.', x: 250, y: 150 },
      { id: 'liab-sbi', label: 'SBI Crop Loan', type: 'liability', value: '₹1.2L', status: 'critical', details: 'KCC credit line in default status due to crop heat failure.', x: 550, y: 140 },
      { id: 'rev-wheat', label: 'Wheat Sales (Mandi)', type: 'revenue', value: '₹12K/mo', status: 'critical', details: 'Highly volatile spot price payouts at regional Mandi traders.', x: 520, y: 360 },
      { id: 'sup-seed', label: 'Rajasthan Fertilizer Co', type: 'supplier', value: '₹32K/yr', status: 'healthy', details: 'Certified seeds and organic manure supplier.', x: 120, y: 180 },
      { id: 'risk-drought', label: 'Severe Drought Flag', type: 'risk', value: 'Extreme Impact', status: 'critical', details: 'Sentinel-2 reports 45% moisture deficit in surface soil layer.', x: 500, y: 50 }
    ],
    connections: [
      { from: 'twin-root', to: 'asset-fields' },
      { from: 'twin-root', to: 'liab-sbi' },
      { from: 'twin-root', to: 'rev-wheat' },
      { from: 'asset-fields', to: 'sup-seed' },
      { from: 'risk-drought', to: 'twin-root' }
    ],
    agents: [
      { id: 'cfo', name: 'CFO Agent', role: 'Financial Analysis', avatar: '💼', status: 'escalated', confidence: 60, reasoning: 'Historical cash flows are down by 48% due to wheat crop blight. Debt Service Coverage Ratio has breached warning limits at 1.08x.', evidence: 'Mandi transaction registers show zero deposits for 90 days.', recommendation: 'Reject expansion request. Restructure existing ₹1.2L KCC loan into long-term moratorium.' },
      { id: 'credit', name: 'Credit Officer', role: 'Credit Risk Scoring', avatar: '📊', status: 'escalated', confidence: 64, reasoning: 'Alternative credit score dropped to 610/900. High probability of default (42%) predicted based on soil moisture registers.', evidence: 'Existing SBI crop loan is 45 days overdue.', recommendation: 'Freeze disbursement. Apply interest subvention restructures first.' },
      { id: 'risk', name: 'Risk Officer', role: 'Operational Risk & KYC', avatar: '🛡️', status: 'escalated', confidence: 70, reasoning: 'Applicant KYC is verified but agricultural plot is classified as drought-distressed under State notification.', evidence: 'Geotagged ground photos indicate withered seedbed rows.', recommendation: 'Escalate to regional agricultural directorate for distress packages.' },
      { id: 'climate', name: 'Climate Analyst', role: 'Environmental Risk', avatar: '🌦️', status: 'escalated', confidence: 96, reasoning: 'Sentinel-2 NDVI vegetation profiles have plummeted below 0.32. Surface soil moisture is critical at -42% variance.', evidence: 'Satellite weather station registers zero rainfall in Churu region for 75 days.', recommendation: 'Declare climate crop default. Activate PM-FBY crop insurance guarantee immediately.' },
      { id: 'market', name: 'Market Analyst', role: 'Commodity Prices', avatar: '📈', status: 'approved', confidence: 80, reasoning: 'Wheat spot prices are high due to global deficits, but applicant has negligible volume to trade.', evidence: 'Mandi rates at ₹2,400/quintal (up 18%).', recommendation: 'Focus resources on saving secondary mustard fodder crops.' },
      { id: 'fraud', name: 'Fraud Investigator', role: 'Authenticity Check', avatar: '🔍', status: 'ready', confidence: 95, reasoning: 'Biometric records match land registry. No identity fraud indicated.', evidence: 'Aadhaar logs matching successfully.', recommendation: 'No fraud indicators. Distress is verified and genuine.' },
      { id: 'scheme', name: 'Scheme Advisor', role: 'Government Subsidies', avatar: '🏛️', status: 'ready', confidence: 92, reasoning: 'Sunita is eligible for direct state disaster compensation and PM-KISAN dryland support subventions.', evidence: 'Drought declarations matching regional criteria.', recommendation: 'Request SBI branch to convert KCC into a restructured loan, waiving interest penalties under RBI crop failure guidelines.' },
      { id: 'planner', name: 'Financial Planner', role: 'Personal Wealth & Goals', avatar: '🎯', status: 'ready', confidence: 62, reasoning: 'Household savings reserves have fallen to zero. Alternate income from handicraft works is keeping food supply stable.', evidence: 'Digital wallet records show direct cash support transactions.', recommendation: 'Setup direct benefit transfer routing to protect primary household expenses.' },
      { id: 'doc', name: 'Doc Verification', role: 'OCR Document Agent', avatar: '📄', status: 'approved', confidence: 94, reasoning: 'Mandi receipts and KCC loan accounts parsed. Document scans contain soil testing reports.', evidence: 'State crop insurance ID verifies active status.', recommendation: 'All documents parsed. Climate metadata pushed to credit registry.' },
      { id: 'growth', name: 'Growth Advisor', role: 'Business Expansion', avatar: '🚀', status: 'escalated', confidence: 55, reasoning: 'Expansion is unviable under dryland constraints without micro-drip irrigation structures.', evidence: 'Drilling reports indicate water table depletion.', recommendation: 'Recommend switching 50% acreage to low-moisture pulses or organic horticulture.' }
    ],
    debate: [
      { agent: 'climate', text: 'Satellite alerts confirm Churu has not received rainfall in 75 days. Soil moisture is down by 45%. Any crop expansion will fail.' },
      { agent: 'cfo', text: 'Agreed. DSCR has dropped to 1.08x. Sunita cannot service a new ₹3,00,000 term loan. Repayment capacity is zero.' },
      { agent: 'doc', text: 'Verified KCC loan details. Sunita has ₹1.2L outstanding which is currently 45 days past due.' },
      { agent: 'scheme', text: 'Instead of new lending, we should convert the active ₹1.2L loan under the Prime Minister Crop Insurance (PM-FBY) distress clause.' },
      { agent: 'risk', text: 'Identity is clean, but the physical location is red-flagged. I recommend formal Escalation of the credit file for restructuring.' },
      { agent: 'credit', text: 'Consensus reached. We reject the ₹3.0L term request, apply a 6-month moratorium on outstanding debt, and dispatch crop insurance compensation.' }
    ],
    memo: {
      id: "MEMO-2026-4412",
      date: "July 20, 2026",
      borrower: "Sunita Devi",
      business: "Sunita Agro & Wheat Farm",
      district: "Churu",
      state: "Rajasthan",
      proposedLoan: "₹3,00,000",
      purpose: "Expansion of wheat fields acreage (Climate-Distressed)",
      aiConfidence: "89%",
      riskRating: "HIGH RISK (CLIMATE)",
      recommendation: "REJECT / RESTRL REPAYMENT PLAN",
      executiveSummary: "Appraisal request for crop expansion is REJECTED. Remote sensing satellite imagery confirms severe moisture deficit and soil dryness. Applicant has active SBI crop debt in default. Multi-agent boardroom consensus recommends shifting support to debt restructures and crop insurance payout channels.",
      financialAnalysis: {
        dscr: "1.08x (Deficit)",
        debtEquity: "0.85x",
        netMargin: "4.8%",
        annualRevenue: "₹3,20,000",
        annualSurplus: "₹32,000"
      },
      riskFactors: [
        { factor: "Drought Blight", mitigation: "Declare crop failure. Activate PM-FBY state crop insurance reserves." },
        { factor: "SBI Debt Default", mitigation: "Restructure outstanding ₹1.2L into 3-year term with a 6-month interest moratorium." },
        { factor: "Water table loss", mitigation: "Reject dryland wheat funding. Require solar micro-drip pump integration before refinancing." }
      ],
      forecastData: [
        { year: 'Yr 1', revenue: 3.2, expenses: 2.8, cashflow: 0.4 },
        { year: 'Yr 2', revenue: 3.0, expenses: 2.9, cashflow: 0.1 },
        { year: 'Yr 3', revenue: 4.8, expenses: 3.4, cashflow: 1.4 },
        { year: 'Yr 4', revenue: 5.5, expenses: 3.8, cashflow: 1.7 },
        { year: 'Yr 5', revenue: 6.2, expenses: 4.0, cashflow: 2.2 },
      ]
    }
  },

  // PROFILE 3: VIGNESH RAO (COLD STORAGE MSME - RESILIENT GREEN ENERGY - LOW RISK)
  {
    id: 'vignesh',
    name: 'Vignesh Rao',
    sector: 'Solar Cold Storage MSME',
    location: 'Chikkaballapur, Karnataka',
    loanAmount: '₹8,50,000',
    dscr: '2.14x',
    creditScore: 840,
    riskRating: 'Very Low (Green Infra)',
    status: 'Consensus Approved',
    nodes: [
      { id: 'twin-root', label: 'Rao Cold Agri-Hub', type: 'asset', value: 'Valuation: ₹42.0L', status: 'healthy', details: 'Solar-powered cold storage warehouse serving local vegetable farmers in Chikkaballapur.', x: 400, y: 250 },
      { id: 'asset-solar', label: 'Solar Array (25 kW)', type: 'asset', value: '₹12.0L', status: 'healthy', details: 'Roof-mounted solar panels grid-linked with 40 kWh net-meter batteries.', x: 250, y: 150 },
      { id: 'asset-compressor', label: 'Cold Storage Vaults', type: 'asset', value: '₹18.5L', status: 'healthy', details: 'Triple modular chilling vaults, active telemetry sensors.', x: 200, y: 260 },
      { id: 'liab-sidbi', label: 'SIDBI Green Credit', type: 'liability', value: '₹4.5L', status: 'healthy', details: 'Outstanding green infra loan. Highly subsidized interest rate (6.8%).', x: 550, y: 140 },
      { id: 'rev-rent', label: 'Cold Storage Rentals', type: 'revenue', value: '₹3.4L/mo', status: 'healthy', details: 'Subscription deposits paid by local farmer producer groups (FPOs).', x: 520, y: 360 },
      { id: 'sup-grid', label: 'Bescom Electricity', type: 'supplier', value: '₹14K/mo', status: 'healthy', details: 'Grid backup. Solar battery reduces energy dependency by 85%.', x: 120, y: 180 },
      { id: 'cust-fpo', label: 'Growers FPO Coop', type: 'customer', value: '120 active farmers', status: 'healthy', details: 'Long-term service contract with 120 local tomato and potato growers.', x: 680, y: 370 }
    ],
    connections: [
      { from: 'twin-root', to: 'asset-solar' },
      { from: 'twin-root', to: 'asset-compressor' },
      { from: 'twin-root', to: 'liab-sidbi' },
      { from: 'twin-root', to: 'rev-rent' },
      { from: 'asset-solar', to: 'sup-grid' },
      { from: 'rev-rent', to: 'cust-fpo' }
    ],
    agents: [
      { id: 'cfo', name: 'CFO Agent', role: 'Financial Analysis', avatar: '💼', status: 'approved', confidence: 97, reasoning: 'Resilient rental revenues yield a DSCR of 2.14x. Clean operational margin at 38%. Solar array utility savings offset grid inflation risks.', evidence: 'Verified bank deposits match warehouse lease contracts with 100% precision.', recommendation: 'Approve loan of ₹8,50,000. Apply standard monthly EMI schedule.' },
      { id: 'credit', name: 'Credit Officer', role: 'Credit Risk Scoring', avatar: '📊', status: 'approved', confidence: 95, reasoning: 'Alternate cashflow credit score stands at 840/900. Zero defaults in past 5 years. Strong asset backing with solar machinery valuations.', evidence: 'CIBIL report is 765. Alternate data adds 75 points due to battery grid feed credits.', recommendation: 'Waive margin requirements, apply premium tier interest subvention.' },
      { id: 'risk', name: 'Risk Officer', role: 'Operational Risk & KYC', avatar: '🛡️', status: 'approved', confidence: 94, reasoning: 'Operational risk is low due to solar backing. Battery backup supports 36 hours of chilling autonomy during grid failures.', evidence: 'Real-time temperature telemetry logs show zero fluctuations above 4°C.', recommendation: 'Approve term credit. Setup direct auto-debit on rent deposits.' },
      { id: 'climate', name: 'Climate Analyst', role: 'Environmental Risk', avatar: '🌦️', status: 'approved', confidence: 98, reasoning: 'This is a climate-adaptive asset. Helps farmers avoid distress-selling crop spoilage during heat waves. Highly eligible for green finance credits.', evidence: 'Mitigates 12.4 tonnes of carbon emissions annually.', recommendation: 'Classify under Green Finance category, triggering priority sector subventions.' },
      { id: 'market', name: 'Market Analyst', role: 'Commodity Prices', avatar: '📈', status: 'approved', confidence: 92, reasoning: 'Regional horticulture harvests are stable. Tomato storage demand has increased storage rates by 12% in Chikkaballapur.', evidence: 'Local mandi arrivals are up 15% YoY.', recommendation: 'Approve, FPO long-term contract hedges market storage price changes.' },
      { id: 'fraud', name: 'Fraud Investigator', role: 'Authenticity Check', avatar: '🔍', status: 'ready', confidence: 99, reasoning: 'Company registration and MSME Udyam details verified. Solar subsidy certifications are genuine.', evidence: 'GST and tax registry verify positive active status.', recommendation: 'Zero risk profile.' },
      { id: 'scheme', name: 'Scheme Advisor', role: 'Government Subsidies', avatar: '🏛️', status: 'ready', confidence: 96, reasoning: 'Vignesh is eligible for the NABARD Warehouse Infrastructure Fund (WIF) and PMKSY cold chain subsidy.', evidence: 'FPO integration matches central criteria.', recommendation: 'Route through WIF to claim a 35% capital subsidy grant on vault equipment.' },
      { id: 'planner', name: 'Financial Planner', role: 'Personal Wealth & Goals', avatar: '🎯', status: 'ready', confidence: 90, reasoning: 'Strong corporate cash balance. Reinvestment surplus of ₹18,000/mo is routed to equipment maintenance reserves.', evidence: 'Separate escrow account verified.', recommendation: 'Link direct payouts to automated sweep accounts.' },
      { id: 'doc', name: 'Doc Verification', role: 'OCR Document Agent', avatar: '📄', status: 'approved', confidence: 98, reasoning: 'Lease contracts, solar net-metering bills, and MSME registrations verified.', evidence: 'OCR clarity verified at 99.2%.', recommendation: 'Documentation complete.' },
      { id: 'growth', name: 'Growth Advisor', role: 'Business Expansion', avatar: '🚀', status: 'ready', confidence: 91, reasoning: 'Adding 3 new multi-commodity cold vaults will double FPO tenant intake capacity, increasing profits by 45%.', evidence: 'Market surveys show a backlog of 35 vegetable growers waiting for storage allocations.', recommendation: 'Highly recommend approval to capture unmet regional chilling demand.' }
    ],
    debate: [
      { agent: 'doc', text: 'MSME registration and Udyam certifications are fully verified. Lease contracts with Growers FPO are locked.' },
      { agent: 'cfo', text: 'DSCR is exceptional at 2.14x. Solar energy offsets operational expenses, ensuring high profit stability.' },
      { agent: 'climate', text: 'This warehouse is a prime green asset. Solar net-meter batteries prevent crop spoilage and support priority sector goals.' },
      { agent: 'scheme', text: 'We can utilize the Warehouse Infrastructure Fund. This triggers a 35% capital equipment subsidy, reducing loan exposure.' },
      { agent: 'credit', text: 'Excellent score of 840/900. I recommend immediate Approval of the term loan of ₹8,50,000.' }
    ],
    memo: {
      id: "MEMO-2026-9081",
      date: "July 20, 2026",
      borrower: "Vignesh Rao",
      business: "Rao Solar Cold Storage MSME",
      district: "Chikkaballapur",
      state: "Karnataka",
      proposedLoan: "₹8,50,000",
      purpose: "Installation of modular refrigeration vaults & grid battery solar array",
      aiConfidence: "97%",
      riskRating: "Very Low",
      recommendation: "APPROVED WITH WIF ESCROW STATUS",
      executiveSummary: "Applicant Vignesh Rao operates a highly sustainable solar-powered cold storage warehouse serving local vegetable grower groups. Term loan of ₹8.50L will fund vault expansions. Cashflow coverage is extremely healthy (2.14x DSCR) with strong margin protection via zero-utility solar batteries. Recommended for direct green priority credit lines.",
      financialAnalysis: {
        dscr: "2.14x (Extremely Strong)",
        debtEquity: "0.15x",
        netMargin: "38.2%",
        annualRevenue: "₹40,80,000",
        annualSurplus: "₹15,50,000"
      },
      riskFactors: [
        { factor: "Crop Yield Failures", mitigation: "Warehouse stores multi-commodity items (onions, potatoes, carrots) mitigating single-crop fluctuations." },
        { factor: "Grid Outages", mitigation: "25 kW Solar panels backed by 40 kWh battery banks ensure 36 hours of cooling runtime without grid connection." }
      ],
      forecastData: [
        { year: 'Yr 1', revenue: 40.8, expenses: 25.3, cashflow: 15.5 },
        { year: 'Yr 2', revenue: 48.0, expenses: 28.5, cashflow: 19.5 },
        { year: 'Yr 3', revenue: 56.5, expenses: 31.8, cashflow: 24.7 },
        { year: 'Yr 4', revenue: 64.0, expenses: 34.2, cashflow: 29.8 },
        { year: 'Yr 5', revenue: 72.0, expenses: 37.0, cashflow: 35.0 },
      ]
    }
  }
];

export const sampleGovernmentSchemes = [
  { id: 'kcc', title: 'Kisan Credit Card (KCC)', subvention: '3% Interest Subvention', netRate: '4.0% p.a.', eligibility: '98% Match', purpose: 'Short-term credit for crop cultivation and cattle maintenance', maxLimit: '₹3,00,000', status: 'Active / Subsidized' },
  { id: 'ahidf', title: 'Animal Husbandry Infrastructure Fund (AHIDF)', subvention: '3% Interest Subvention', netRate: '8.5% p.a. (Market: 11.5%)', eligibility: '94% Match', purpose: 'Setting up dairy processing, feed manufacturing, or chilling plants', maxLimit: 'Up to 90% project cost', status: 'Eligible - Apply Now' },
  { id: 'pm-kisan', title: 'PM-KISAN Samman Nidhi', subvention: 'Direct Benefit Transfer', netRate: '₹6,000/year (Fixed)', eligibility: '100% Match', purpose: 'Income support to all landholding farmer families', maxLimit: 'N/A', status: 'Disbursed' },
  { id: 'cgtmse', title: 'Credit Guarantee Scheme (CGTMSE)', subvention: 'Collateral-free Guarantee', netRate: 'Fee: 0.75% p.a.', eligibility: '90% Match', purpose: 'Collateral-free business credit lines for agricultural MSMEs', maxLimit: '₹5,00,00,000', status: 'Eligible for Integration' }
];

export const sampleMarketTrends = {
  commodityPrices: [
    { date: 'Jan', milk: 38.2, feed: 24.1 },
    { date: 'Feb', milk: 38.5, feed: 24.5 },
    { date: 'Mar', milk: 39.0, feed: 25.2 },
    { date: 'Apr', milk: 40.2, feed: 25.0 },
    { date: 'May', milk: 41.5, feed: 24.8 },
    { date: 'Jun', milk: 42.0, feed: 24.5 },
    { date: 'Jul', milk: 42.5, feed: 24.4 },
  ],
  weatherForecast: [
    { day: 'Mon', temp: '32°C', condition: 'Sunny / Scattered Clouds', precip: '10%' },
    { day: 'Tue', temp: '30°C', condition: 'Moderate Showers', precip: '60%' },
    { day: 'Wed', temp: '29°C', condition: 'Thundershowers', precip: '80%' },
    { day: 'Thu', temp: '31°C', condition: 'Humid / Rain clears', precip: '30%' },
    { day: 'Fri', temp: '33°C', condition: 'Clear / Optimal Fodder cutting', precip: '5%' },
  ]
};

export const nabardMetrics = {
  financialInclusion: [
    { state: 'Maharashtra', penetration: 82, creditGap: 18, risk: 24, gapValue: '₹4,500 Cr', msmeVol: '₹4,204 Cr', activeSubv: '₹1,842 Cr' },
    { state: 'Uttar Pradesh', penetration: 68, creditGap: 32, risk: 38, gapValue: '₹9,800 Cr', msmeVol: '₹3,400 Cr', activeSubv: '₹1,550 Cr' },
    { state: 'Madhya Pradesh', penetration: 72, creditGap: 28, risk: 34, gapValue: '₹5,100 Cr', msmeVol: '₹2,600 Cr', activeSubv: '₹1,240 Cr' },
    { state: 'Karnataka', penetration: 79, creditGap: 21, risk: 21, gapValue: '₹3,100 Cr', msmeVol: '₹2,800 Cr', activeSubv: '₹1,120 Cr' },
    { state: 'Rajasthan', penetration: 64, creditGap: 36, risk: 42, gapValue: '₹7,200 Cr', msmeVol: '₹2,100 Cr', activeSubv: '₹920 Cr' },
    { state: 'Bihar', penetration: 55, creditGap: 45, risk: 40, gapValue: '₹8,400 Cr', msmeVol: '₹1,900 Cr', activeSubv: '₹710 Cr' },
    { state: 'Gujarat', penetration: 84, creditGap: 16, risk: 18, gapValue: '₹2,900 Cr', msmeVol: '₹3,200 Cr', activeSubv: '₹1,440 Cr' },
  ],
  schemeEffectiveness: [
    { name: 'KCC (Credit Card)', disbursal: 85, impact: 91 },
    { name: 'RIDF (Agri Infra)', disbursal: 72, impact: 88 },
    { name: 'AHIDF (Husbandry)', disbursal: 60, impact: 94 },
    { name: 'SHG Bank Linkage', disbursal: 92, impact: 95 },
  ]
};
